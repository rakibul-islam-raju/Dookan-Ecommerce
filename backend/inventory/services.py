from decimal import Decimal, ROUND_HALF_UP

from django.db import transaction
from django.db.models import Sum
from django.utils import timezone

from inventory.models import (
    FinishedGoodsReceipt,
    Material,
    MaterialTransaction,
    ProductionBatch,
    VariantStockTransaction,
)


TWOPLACES = Decimal("0.01")


def _to_decimal(value):
    if isinstance(value, Decimal):
        return value.quantize(TWOPLACES, rounding=ROUND_HALF_UP)
    return Decimal(str(value)).quantize(TWOPLACES, rounding=ROUND_HALF_UP)


def _reference_details(reference_obj):
    if not reference_obj:
        return "", None
    return reference_obj._meta.label_lower, getattr(reference_obj, "id", None)


@transaction.atomic
def apply_variant_stock_transaction(
    variant,
    transaction_type,
    quantity,
    *,
    unit_cost=None,
    reference_obj=None,
    note="",
):
    variant = variant.__class__.objects.select_for_update().select_related(
        "product"
    ).get(pk=variant.pk)
    vendor = variant.product.vendor
    if vendor is None:
        raise ValueError("Variant product must belong to a vendor.")

    if transaction_type in {
        VariantStockTransaction.TYPE_PURCHASE_RECEIPT,
        VariantStockTransaction.TYPE_PRODUCTION_RECEIPT,
        VariantStockTransaction.TYPE_ADJUSTMENT_IN,
        VariantStockTransaction.TYPE_ORDER_CANCEL_RETURN,
    }:
        delta = quantity
    else:
        delta = -quantity

    new_balance = variant.stock_quantity + delta
    if new_balance < 0:
        raise ValueError("Stock cannot be negative.")

    variant.stock_quantity = new_balance
    update_fields = ["stock_quantity"]
    if unit_cost is not None and delta > 0:
        variant.cost_price = _to_decimal(unit_cost)
        update_fields.append("cost_price")
    variant.save(update_fields=update_fields)

    reference_type, reference_id = _reference_details(reference_obj)
    return VariantStockTransaction.objects.create(
        vendor=vendor,
        variant=variant,
        transaction_type=transaction_type,
        quantity_change=delta,
        unit_cost=_to_decimal(unit_cost) if unit_cost is not None else None,
        balance_after=new_balance,
        reference_type=reference_type,
        reference_id=reference_id,
        note=note,
    )


@transaction.atomic
def apply_material_transaction(
    material,
    transaction_type,
    quantity,
    *,
    unit_cost=None,
    reference_obj=None,
    note="",
):
    material = Material.objects.select_for_update().get(pk=material.pk)
    quantity = _to_decimal(quantity)
    vendor = material.vendor

    if transaction_type in {
        MaterialTransaction.TYPE_PURCHASE,
        MaterialTransaction.TYPE_ADJUSTMENT_IN,
        MaterialTransaction.TYPE_RETURN_FROM_BATCH,
    }:
        delta = quantity
    else:
        delta = -quantity

    new_quantity = material.current_quantity + delta
    if new_quantity < 0:
        raise ValueError("Material stock cannot be negative.")

    if delta > 0 and unit_cost is not None:
        unit_cost = _to_decimal(unit_cost)
        current_total_cost = material.current_quantity * material.weighted_average_cost
        incoming_total_cost = quantity * unit_cost
        total_quantity = material.current_quantity + quantity
        material.weighted_average_cost = (
            (current_total_cost + incoming_total_cost) / total_quantity
            if total_quantity > 0
            else Decimal("0.00")
        ).quantize(TWOPLACES, rounding=ROUND_HALF_UP)

    material.current_quantity = new_quantity
    material.save(update_fields=["current_quantity", "weighted_average_cost"])

    reference_type, reference_id = _reference_details(reference_obj)
    return MaterialTransaction.objects.create(
        vendor=vendor,
        material=material,
        transaction_type=transaction_type,
        quantity_change=delta,
        unit_cost=_to_decimal(unit_cost) if unit_cost is not None else None,
        balance_after=new_quantity,
        reference_type=reference_type,
        reference_id=reference_id,
        note=note,
    )


def calculate_receipt_unit_cost(quantity, supplier_unit_cost, landed_cost):
    quantity = Decimal(quantity)
    supplier_unit_cost = _to_decimal(supplier_unit_cost)
    landed_cost = _to_decimal(landed_cost)
    total_cost = (quantity * supplier_unit_cost) + landed_cost
    unit_cost = (total_cost / quantity).quantize(TWOPLACES, rounding=ROUND_HALF_UP)
    return unit_cost, total_cost.quantize(TWOPLACES, rounding=ROUND_HALF_UP)


@transaction.atomic
def post_finished_goods_receipt(receipt: FinishedGoodsReceipt):
    apply_variant_stock_transaction(
        receipt.variant,
        VariantStockTransaction.TYPE_PURCHASE_RECEIPT,
        receipt.quantity,
        unit_cost=receipt.unit_cost,
        reference_obj=receipt,
        note=receipt.note or "Finished goods receipt",
    )
    return receipt


def calculate_batch_cost(batch):
    from expenses.models import Expense

    material_total = (
        batch.materials.aggregate(total=Sum("total_cost"))["total"] or Decimal("0.00")
    )
    expense_total = (
        Expense.objects.filter(
            vendor=batch.vendor,
            production_batch=batch,
            is_active=True,
        ).aggregate(total=Sum("amount"))["total"]
        or Decimal("0.00")
    )
    total_output_quantity = (
        batch.outputs.aggregate(total=Sum("quantity"))["total"] or 0
    )
    total_cost = material_total + expense_total
    unit_cost = (
        (total_cost / total_output_quantity).quantize(TWOPLACES, rounding=ROUND_HALF_UP)
        if total_output_quantity
        else Decimal("0.00")
    )
    return {
        "material_cost": material_total.quantize(TWOPLACES, rounding=ROUND_HALF_UP),
        "expense_cost": expense_total.quantize(TWOPLACES, rounding=ROUND_HALF_UP),
        "total_cost": total_cost.quantize(TWOPLACES, rounding=ROUND_HALF_UP),
        "output_quantity": total_output_quantity,
        "unit_cost": unit_cost,
    }


@transaction.atomic
def complete_production_batch(batch: ProductionBatch):
    batch = ProductionBatch.objects.select_for_update().select_related("vendor").get(
        pk=batch.pk
    )

    if batch.vendor.inventory_mode != batch.vendor.INVENTORY_MODE_MANUFACTURING:
        raise ValueError("Production batches are only available for manufacturing vendors.")

    if batch.status == ProductionBatch.STATUS_COMPLETED:
        raise ValueError("Batch is already completed.")

    material_lines = list(batch.materials.select_related("material"))
    output_lines = list(batch.outputs.select_related("variant__product"))

    if not material_lines:
        raise ValueError("Batch must have at least one material line.")
    if not output_lines:
        raise ValueError("Batch must have at least one output line.")

    for line in material_lines:
        material = line.material
        if material.vendor_id != batch.vendor_id:
            raise ValueError("Batch material vendor mismatch.")
        if line.actual_quantity > material.current_quantity:
            raise ValueError(f"Insufficient material stock for {material.name}.")
        line.actual_unit_cost = material.weighted_average_cost
        line.total_cost = (
            _to_decimal(line.actual_quantity) * material.weighted_average_cost
        ).quantize(TWOPLACES, rounding=ROUND_HALF_UP)
        line.save(update_fields=["actual_unit_cost", "total_cost"])
        apply_material_transaction(
            material,
            MaterialTransaction.TYPE_ISSUE_TO_BATCH,
            line.actual_quantity,
            unit_cost=line.actual_unit_cost,
            reference_obj=batch,
            note=f"Issued to batch {batch.code}",
        )

    costing = calculate_batch_cost(batch)
    unit_cost = costing["unit_cost"]

    for output in output_lines:
        if output.variant.product.vendor_id != batch.vendor_id:
            raise ValueError("Batch output variant vendor mismatch.")
        output.unit_cost = unit_cost
        output.total_cost = (
            Decimal(output.quantity) * unit_cost
        ).quantize(TWOPLACES, rounding=ROUND_HALF_UP)
        output.save(update_fields=["unit_cost", "total_cost"])
        apply_variant_stock_transaction(
            output.variant,
            VariantStockTransaction.TYPE_PRODUCTION_RECEIPT,
            output.quantity,
            unit_cost=unit_cost,
            reference_obj=batch,
            note=f"Produced in batch {batch.code}",
        )

    batch.status = ProductionBatch.STATUS_COMPLETED
    batch.completed_at = timezone.now()
    if not batch.started_at:
        batch.started_at = batch.created_at
    batch.save(update_fields=["status", "completed_at", "started_at", "updated_at"])
    return batch

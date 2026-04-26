from decimal import Decimal

from django.utils import timezone
from rest_framework import serializers

from inventory.models import (
    FinishedGoodsReceipt,
    Material,
    MaterialCategory,
    MaterialTransaction,
    ProductionBatch,
    ProductionBatchMaterial,
    ProductionBatchOutput,
    VariantStockTransaction,
)
from inventory.services import (
    apply_material_transaction,
    calculate_batch_cost,
    calculate_receipt_unit_cost,
    complete_production_batch,
    post_finished_goods_receipt,
)


class MaterialCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialCategory
        fields = ["id", "name", "description"]
        read_only_fields = ["id"]


class MaterialSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True, default=None)

    class Meta:
        model = Material
        fields = [
            "id",
            "category",
            "category_name",
            "name",
            "sku",
            "unit",
            "reorder_level",
            "weighted_average_cost",
            "current_quantity",
            "is_active",
        ]
        read_only_fields = ["id", "weighted_average_cost", "current_quantity"]

    def create(self, validated_data):
        validated_data["vendor"] = self.context["vendor"]
        return super().create(validated_data)


class MaterialTransactionSerializer(serializers.ModelSerializer):
    material_name = serializers.CharField(source="material.name", read_only=True)
    material_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = MaterialTransaction
        fields = [
            "id",
            "material_id",
            "material",
            "material_name",
            "transaction_type",
            "quantity_change",
            "unit_cost",
            "balance_after",
            "reference_type",
            "reference_id",
            "note",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "material",
            "material_name",
            "balance_after",
            "reference_type",
            "reference_id",
            "created_at",
        ]

    def validate_transaction_type(self, value):
        allowed = {
            MaterialTransaction.TYPE_PURCHASE,
            MaterialTransaction.TYPE_ADJUSTMENT_IN,
            MaterialTransaction.TYPE_ADJUSTMENT_OUT,
        }
        if value not in allowed:
            raise serializers.ValidationError("Unsupported material transaction type.")
        return value

    def validate(self, attrs):
        vendor = self.context["vendor"]
        try:
            material = Material.objects.get(id=attrs["material_id"], vendor=vendor, is_active=True)
        except Material.DoesNotExist:
            raise serializers.ValidationError({"material_id": "Material not found."})

        attrs["material"] = material
        quantity_change = Decimal(attrs["quantity_change"])
        if quantity_change <= 0:
            raise serializers.ValidationError({"quantity_change": "Quantity must be greater than zero."})
        return attrs

    def create(self, validated_data):
        material = validated_data["material"]
        return apply_material_transaction(
            material,
            validated_data["transaction_type"],
            validated_data["quantity_change"],
            unit_cost=validated_data.get("unit_cost"),
            note=validated_data.get("note", ""),
        )


class ProductionBatchMaterialInputSerializer(serializers.ModelSerializer):
    material_name = serializers.CharField(source="material.name", read_only=True)

    class Meta:
        model = ProductionBatchMaterial
        fields = [
            "id",
            "material",
            "material_name",
            "planned_quantity",
            "actual_quantity",
            "actual_unit_cost",
            "total_cost",
        ]
        read_only_fields = ["id", "actual_unit_cost", "total_cost"]


class ProductionBatchOutputInputSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="variant.product.name", read_only=True)
    variant_name = serializers.CharField(source="variant.name", read_only=True)

    class Meta:
        model = ProductionBatchOutput
        fields = [
            "id",
            "variant",
            "product_name",
            "variant_name",
            "quantity",
            "unit_cost",
            "total_cost",
        ]
        read_only_fields = ["id", "unit_cost", "total_cost", "product_name", "variant_name"]


class ProductionBatchSerializer(serializers.ModelSerializer):
    materials = ProductionBatchMaterialInputSerializer(many=True)
    outputs = ProductionBatchOutputInputSerializer(many=True)
    costing = serializers.SerializerMethodField()

    class Meta:
        model = ProductionBatch
        fields = [
            "id",
            "code",
            "status",
            "started_at",
            "completed_at",
            "notes",
            "materials",
            "outputs",
            "costing",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "completed_at", "created_at", "updated_at", "costing"]

    def get_costing(self, obj):
        return {
            key: str(value) if isinstance(value, Decimal) else value
            for key, value in calculate_batch_cost(obj).items()
        }

    def validate(self, attrs):
        vendor = self.context["vendor"]
        materials = self.initial_data.get("materials", [])
        outputs = self.initial_data.get("outputs", [])

        if self.instance is None and not materials:
            raise serializers.ValidationError({"materials": "At least one material line is required."})
        if self.instance is None and not outputs:
            raise serializers.ValidationError({"outputs": "At least one output line is required."})

        material_ids = [item.get("material") for item in materials]
        if len(material_ids) != len(set(material_ids)):
            raise serializers.ValidationError({"materials": "Material lines must be unique per batch."})

        output_ids = [item.get("variant") for item in outputs]
        if len(output_ids) != len(set(output_ids)):
            raise serializers.ValidationError({"outputs": "Output variants must be unique per batch."})

        for item in materials:
            if not Material.objects.filter(
                id=item.get("material"),
                vendor=vendor,
                is_active=True,
            ).exists():
                raise serializers.ValidationError({"materials": "One or more materials are invalid for this vendor."})

        for item in outputs:
            if not self.context["variant_queryset"].filter(
                id=item.get("variant"),
                is_active=True,
            ).exists():
                raise serializers.ValidationError({"outputs": "One or more variants are invalid for this vendor."})

        return attrs

    def create(self, validated_data):
        materials_data = validated_data.pop("materials")
        outputs_data = validated_data.pop("outputs")
        batch = ProductionBatch.objects.create(vendor=self.context["vendor"], **validated_data)
        ProductionBatchMaterial.objects.bulk_create(
            [ProductionBatchMaterial(batch=batch, **item) for item in materials_data]
        )
        ProductionBatchOutput.objects.bulk_create(
            [ProductionBatchOutput(batch=batch, **item) for item in outputs_data]
        )
        return batch

    def update(self, instance, validated_data):
        if instance.status == ProductionBatch.STATUS_COMPLETED:
            raise serializers.ValidationError("Completed batches cannot be modified.")

        materials_data = validated_data.pop("materials", None)
        outputs_data = validated_data.pop("outputs", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if materials_data is not None:
            instance.materials.all().delete()
            ProductionBatchMaterial.objects.bulk_create(
                [ProductionBatchMaterial(batch=instance, **item) for item in materials_data]
            )

        if outputs_data is not None:
            instance.outputs.all().delete()
            ProductionBatchOutput.objects.bulk_create(
                [ProductionBatchOutput(batch=instance, **item) for item in outputs_data]
            )

        return instance


class ProductionBatchCompleteSerializer(serializers.Serializer):
    def save(self, **kwargs):
        return complete_production_batch(self.context["batch"])


class FinishedGoodsReceiptSerializer(serializers.ModelSerializer):
    variant_name = serializers.CharField(source="variant.name", read_only=True)
    product_name = serializers.CharField(source="variant.product.name", read_only=True)

    class Meta:
        model = FinishedGoodsReceipt
        fields = [
            "id",
            "variant",
            "variant_name",
            "product_name",
            "supplier_name",
            "reference",
            "received_at",
            "quantity",
            "supplier_unit_cost",
            "landed_cost",
            "unit_cost",
            "total_cost",
            "note",
            "created_at",
        ]
        read_only_fields = ["id", "unit_cost", "total_cost", "created_at", "variant_name", "product_name"]

    def validate_variant(self, value):
        vendor = self.context["vendor"]
        if value.product.vendor_id != vendor.id:
            raise serializers.ValidationError("Variant does not belong to the active vendor.")
        return value

    def validate_received_at(self, value):
        if value > timezone.now():
            raise serializers.ValidationError("Received time cannot be in the future.")
        return value

    def create(self, validated_data):
        unit_cost, total_cost = calculate_receipt_unit_cost(
            validated_data["quantity"],
            validated_data["supplier_unit_cost"],
            validated_data.get("landed_cost", Decimal("0.00")),
        )
        receipt = FinishedGoodsReceipt.objects.create(
            vendor=self.context["vendor"],
            unit_cost=unit_cost,
            total_cost=total_cost,
            **validated_data,
        )
        return post_finished_goods_receipt(receipt)


class VariantStockTransactionSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="variant.product.name", read_only=True)
    variant_name = serializers.CharField(source="variant.name", read_only=True)

    class Meta:
        model = VariantStockTransaction
        fields = [
            "id",
            "variant",
            "product_name",
            "variant_name",
            "transaction_type",
            "quantity_change",
            "unit_cost",
            "balance_after",
            "reference_type",
            "reference_id",
            "note",
            "created_at",
        ]


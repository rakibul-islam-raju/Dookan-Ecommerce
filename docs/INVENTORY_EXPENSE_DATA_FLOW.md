# Inventory + Expense Backend Data Flow

This document explains the backend flow from first setup to day-to-day inventory, expense, and order operations.

## Current deployment model

- This backend now assumes a single business vendor per deployment.
- `Vendor` is the operational business account for the deployment.
- `SiteConfig` remains platform-level configuration for the software owner.
- Storefront and Meta tracking switches are controlled from `Vendor`, not `SiteConfig`.

## 1. Initial setup

### Step 1: Migrations create base structures
- Django migrations create:
  - `vendors_vendor`
  - `vendors_vendor_membership`
  - `inventory_*` tables
  - `expenses_*` tables
  - `products_product.vendor`

### Step 2: Default vendor is created
- Migration `vendors.0002_default_vendor_memberships` creates a `Default Vendor`.
- First superuser or first staff user becomes the default owner when available.
- Existing staff users get vendor memberships for the default vendor.

### Step 3: Existing products are backfilled
- Migration `products.0005_backfill_vendor` assigns all old products to the default vendor.

### Step 4: Default expense categories are seeded
- Migration `expenses.0004_seed_default_categories` creates global categories:
  - Purchase
  - Labor / Making Cost
  - Transport
  - Customs
  - Packaging
  - Advertising
  - Utilities
  - Rent
  - Miscellaneous

## 2. Vendor access and feature gating

### Step 1: Super admin configures vendor
- Super admin opens Django admin.
- Super admin creates or updates a `Vendor`.
- Super admin controls:
  - `inventory_enabled`
  - `expenses_enabled`
  - `inventory_mode`
    - `trading`
    - `manufacturing`

### Step 2: Vendor users are attached
- `VendorMembership` links users to vendors.
- A vendor owner is marked with `is_owner=True`.
- Staff can also be attached with a `Role`.

### Step 3: Request resolves active vendor
- Backend resolves vendor from:
  - `X-Vendor-ID` header, or
  - `vendor` query param, or
  - first active vendor membership
- Main helper: `vendors.services.get_request_vendor`

### Step 4: Auth payload includes vendor context
- Login response and `/api/v1/users/me/` include:
  - `active_vendor`
  - `enabled_features`
  - `inventory_mode`
  - `vendor_permissions`
  - `is_vendor_owner`

### Step 5: Permission checks run
- Global permissions still use `HasModulePermission(...)`.
- Vendor module access uses `HasVendorModulePermission(...)`.
- Inventory endpoints require:
  - active vendor
  - `inventory_enabled=True`
  - owner or `manage_inventory`
- Expense endpoints require:
  - active vendor
  - `expenses_enabled=True`
  - owner or `manage_expenses`

## 3. Product ownership flow

### Step 1: Product belongs to a vendor
- `Product.vendor` is now the ownership boundary.
- Staff product queries are filtered by active vendor.

### Step 2: Product create flow
- Vendor staff creates product from product API.
- Active vendor is injected into serializer context.
- Product is saved with `vendor=<active_vendor>`.

### Step 3: Variant stock remains sellable stock source of truth
- Checkout still reads `ProductVariant.stock_quantity`.
- Inventory flows update that field through inventory services.

## 4. Trading vendor inventory flow

This is for vendors who buy ready-made goods and sell them directly.

### Step 1: Vendor is set to trading mode
- `Vendor.inventory_mode = trading`

### Step 2: Vendor creates products and variants
- Product and variant are created normally.
- Variant starts with stock `0` or existing stock.

### Step 3: Vendor records finished goods receipt
- Endpoint:
  - `POST /api/v1/inventory/receipts/`
- Model:
  - `inventory.FinishedGoodsReceipt`

Payload includes:
- `variant`
- `supplier_name`
- `reference`
- `received_at`
- `quantity`
- `supplier_unit_cost`
- `landed_cost`
- `note`

### Step 4: Receipt cost is calculated
- `inventory.services.calculate_receipt_unit_cost(...)` calculates:
  - total cost = `quantity * supplier_unit_cost + landed_cost`
  - unit cost = `total cost / quantity`

### Step 5: Stock is posted
- `post_finished_goods_receipt(...)` calls `apply_variant_stock_transaction(...)`
- A `VariantStockTransaction` row is created with:
  - `transaction_type = purchase_receipt`
  - positive stock movement
  - new stock balance

### Step 6: Variant stock and cost are updated
- `ProductVariant.stock_quantity` increases
- `ProductVariant.cost_price` is updated from receipt unit cost

## 5. Manufacturing vendor inventory flow

This is for vendors who buy raw materials and produce finished goods.

### Step 1: Vendor is set to manufacturing mode
- `Vendor.inventory_mode = manufacturing`

### Step 2: Vendor creates material categories
- Model:
  - `inventory.MaterialCategory`

### Step 3: Vendor creates materials
- Endpoint:
  - `POST /api/v1/inventory/materials/`
- Model:
  - `inventory.Material`

Material stores:
- category
- sku
- unit
- reorder level
- weighted average cost
- current quantity

### Step 4: Vendor posts material receipts or adjustments
- Endpoint:
  - `POST /api/v1/inventory/material-transactions/`
- Model:
  - `inventory.MaterialTransaction`

Allowed manual transaction types:
- `purchase`
- `adjustment_in`
- `adjustment_out`

### Step 5: Weighted average cost is recalculated
- `apply_material_transaction(...)`:
  - increases or decreases `Material.current_quantity`
  - recalculates `Material.weighted_average_cost` on inbound movements with unit cost
  - creates transaction history row

### Step 6: Vendor creates production batch
- Endpoint:
  - `POST /api/v1/inventory/batches/`
- Model:
  - `inventory.ProductionBatch`

Batch includes:
- `materials`
  - actual quantity per material
- `outputs`
  - finished variant + produced quantity

### Step 7: Vendor links direct batch expenses
- Expenses can point to:
  - `production_batch`
  - optional `product_variant`

### Step 8: Vendor completes batch
- Endpoint:
  - `POST /api/v1/inventory/batches/<id>/complete/`
- Service:
  - `inventory.services.complete_production_batch(...)`

### Step 9: Material stock is consumed
- For each batch material:
  - current weighted average cost is copied into batch line
  - total material cost is calculated
  - `MaterialTransaction` is created with `issue_to_batch`
  - `Material.current_quantity` decreases

### Step 10: Batch cost is calculated
- `calculate_batch_cost(...)` sums:
  - material line total cost
  - batch-linked expenses
- Then calculates:
  - total batch cost
  - total output quantity
  - finished unit cost

### Step 11: Finished goods stock is posted
- Each output variant receives stock through `apply_variant_stock_transaction(...)`
- `VariantStockTransaction` is created with:
  - `transaction_type = production_receipt`

### Step 12: Variant sellable stock is updated
- `ProductVariant.stock_quantity` increases
- `ProductVariant.cost_price` is updated from batch unit cost
- Batch status changes to `completed`

## 6. Expense flow

Expenses are available for all vendors.

### Step 1: Vendor uses expense categories
- Endpoint:
  - `GET /api/v1/expenses/categories/`
  - `POST /api/v1/expenses/categories/`
- Model:
  - `expenses.ExpenseCategory`

Categories can be:
- global seed categories with `vendor=None`
- vendor-specific custom categories

### Step 2: Vendor creates expense entry
- Endpoint:
  - `POST /api/v1/expenses/entries/`
- Model:
  - `expenses.Expense`

Expense fields include:
- category
- amount
- incurred date
- reference
- notes
- optional production batch
- optional product variant

### Step 3: Expense validation runs
- Category must belong to current vendor or be global.
- Batch must belong to current vendor.
- Variant must belong to current vendor.

### Step 4: Expense affects reporting
- All expenses appear in summaries.
- Only batch-linked expenses affect manufacturing batch costing in v1.
- General expenses do not update inventory valuation automatically.

### Step 5: Expense summary is generated
- Endpoint:
  - `GET /api/v1/expenses/reports/summary/`
- Summary returns:
  - `total_expense`
  - `by_category`
  - `batch_linked_total`
  - `general_total`

## 7. Order and stock sync flow

### Step 1: Customer places order
- Endpoint:
  - `POST /api/v1/orders/create/`
- Order serializer validates:
  - product exists
  - variant belongs to product
  - variant is active
  - enough stock is available

### Step 2: Order is created
- `Order`
- `OrderItem`
- `ShippingAddress`
- `OrderStatusHistory`

### Step 3: Stock is reduced through inventory service
- For each non-digital item:
  - `apply_variant_stock_transaction(...)` is called
  - `transaction_type = order_sale`
- This creates a `VariantStockTransaction`
- This also decreases `ProductVariant.stock_quantity`

### Step 4: Customer or admin cancels order
- Endpoint:
  - `POST /api/v1/orders/<id>/cancel/`

### Step 5: Stock is restored through inventory service
- For each non-digital item:
  - `apply_variant_stock_transaction(...)`
  - `transaction_type = order_cancel_return`
- This creates a return ledger row
- This also restores `ProductVariant.stock_quantity`

## 8. Read/report flows

### Step 1: Product listing still works from product tables
- Product serializers still read:
  - `ProductVariant.stock_quantity`
  - `Product.cost_price`
  - `ProductVariant.cost_price`

### Step 2: Inventory audit trail is available
- `GET /api/v1/inventory/variant-transactions/`
- `GET /api/v1/inventory/material-transactions/`

This gives:
- what changed
- when it changed
- reference object type
- reference object id
- resulting balance

### Step 3: Dashboard becomes vendor-aware
- Order dashboard filters by active vendor when vendor context exists.
- Product and stock metrics now reflect vendor scope.

## 9. Main backend components by responsibility

### Vendor resolution
- `backend/vendors/services.py`

### Vendor models
- `backend/vendors/models.py`

### Inventory models
- `backend/inventory/models.py`

### Inventory posting and costing
- `backend/inventory/services.py`

### Expense models and summaries
- `backend/expenses/models.py`
- `backend/expenses/serializers.py`

### Product vendor ownership
- `backend/products/models.py`
- `backend/products/views.py`

### Order to inventory sync
- `backend/orders/serializers.py`
- `backend/orders/views.py`

### Permission layer
- `backend/utils/permissions.py`

## 10. End-to-end examples

### Trading example
1. Super admin enables inventory for Vendor B and sets mode to `trading`.
2. Vendor B owner logs in and gets active vendor context.
3. Vendor B creates product and variant.
4. Vendor B posts a finished goods receipt.
5. Receipt updates variant stock and cost.
6. Customer places order.
7. Order reduces stock and writes stock transaction.
8. Expense entries such as advertising or transport are saved separately for reporting.

### Manufacturing example
1. Super admin enables inventory for Vendor A and sets mode to `manufacturing`.
2. Vendor A creates materials and receives raw material stock.
3. Vendor A creates production batch with consumed materials and output variants.
4. Vendor A records labor or making cost expense linked to the batch.
5. Vendor A completes the batch.
6. Material stock is reduced.
7. Finished goods stock is added.
8. Variant cost is updated from actual batch cost.
9. Customer order reduces finished goods stock.

## 11. Important current rules

- One active vendor context per request in v1.
- Product ownership is vendor-level.
- Inventory mode is vendor-level, not product-level.
- Trading vendors cannot use material or batch endpoints.
- Manufacturing vendors can use both material and batch flows.
- `ProductVariant.stock_quantity` remains checkout stock source of truth.
- General expenses are reportable but do not affect inventory valuation in v1.

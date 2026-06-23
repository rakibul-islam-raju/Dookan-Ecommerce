# First-Party Analytics Pages

## Summary

Build a new admin analytics area using only data already stored in the app, split into `Basic` and `Advanced` pages. This will not use Meta Ads reporting data. It will use Django aggregation endpoints, React Query, and Recharts for visual dashboards.

Default reporting window: last 30 days. Both pages support `start_date`, `end_date`, and preset filters for 7 days, 30 days, 90 days, this month, and custom range.

Access: users with `view_dashboard` can access analytics. Inventory and expense sections appear only when the vendor has those modules enabled.

## Backend Changes

Add a new Django `analytics` app with routes under `/api/v1/analytics/`.

Public API endpoints:

- `GET /api/v1/analytics/basic/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`
- `GET /api/v1/analytics/advanced/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`

Both endpoints use `HasModulePermission("view_dashboard")` and vendor filtering via the current request vendor.

`Basic` response includes:

- Product totals: active products, inactive products, digital products
- Variant totals: active variants, low stock variants, out of stock variants
- Category totals: active categories, inactive categories
- Customer totals: total customers, new customers in range, active/inactive customers
- Coupon totals: active coupons, expired coupons, total coupon usage, top used coupons
- Sales totals: active sales, scheduled sales, expired sales
- Review totals: approved reviews, pending reviews, average rating, rating distribution
- Staff totals: active staff, inactive staff, role distribution
- Order basics: total orders, order count by status, payment status breakdown, paid revenue, revenue trend, order trend

`Advanced` response includes:

- Product revenue ranking from paid orders
- Variant revenue ranking from paid orders
- Product benefit/loss using conservative COGS: `order_item.total_price - cost_price * quantity`
- Cost fallback order: `variant.cost_price`, then `product.cost_price`, otherwise mark as missing cost
- Missing-cost count and missing-cost revenue so profit is visibly incomplete where needed
- Top selling products by quantity and revenue
- Average order value from paid orders
- Order trends by day, status, payment status, delivery type, coupon usage, discount amount, tax, shipping
- Expense totals by category, month, general vs batch-linked, and product-variant-linked expenses
- Inventory analytics: low stock variants, stock movement by transaction type, stock movement trend, purchase/production receipt cost, estimated stock value
- Manufacturing-only analytics: material low stock, material value, batch status counts, batch material cost, batch output cost

Revenue basis: paid orders only, matching the current dashboard behavior.

## Admin Frontend Changes

Add Recharts to the admin app dependencies.

Add routes:

- `/analytics/basic`
- `/analytics/advanced`

Add sidebar group:

- `Analytics`
- children: `Basic`, `Advanced`
- permission: `view_dashboard`

Add admin API client:

- `admin/src/lib/api/analytics.ts`
- query keys: `analyticsBasic`, `analyticsAdvanced`

Add feature pages:

- `admin/src/features/analytics/BasicAnalytics.tsx`
- `admin/src/features/analytics/AdvancedAnalytics.tsx`

Shared analytics UI:

- date range preset control
- metric cards
- empty states
- loading skeletons
- reusable chart wrappers for line, bar, pie/donut, and ranked horizontal bars
- currency and number formatting using existing locale helpers

Basic page layout:

- top KPI cards for products, variants, customers, orders, revenue
- order status and payment status charts
- product/category/customer/coupon/sale/review/staff summary sections
- top used coupons and rating distribution

Advanced page layout:

- top KPI cards for revenue, AOV, profit estimate, total expenses, stock value
- product revenue and top selling product charts
- product benefit/loss table with missing-cost warning
- order trend, revenue trend, delivery type, discount and coupon charts
- expense category/month charts
- inventory movement and low stock charts
- manufacturing-only batch/material charts when applicable

## Tests

Backend tests:

- basic analytics endpoint requires `view_dashboard`
- advanced analytics endpoint requires `view_dashboard`
- vendor filtering excludes other vendors’ products/orders/expenses/inventory
- order status, payment status, revenue, and AOV aggregations are correct
- product revenue and variant revenue are correct from paid order items
- product benefit/loss uses variant cost first, product cost second, and reports missing cost
- expense and inventory sections return empty/disabled data when modules are unavailable

Frontend verification:

- `pnpm build`
- `pnpm lint`, noting existing unrelated lint failures if still present
- manual smoke test for `/analytics/basic` and `/analytics/advanced`
- verify empty states, loading states, date range changes, and vendor feature gating

## Assumptions

- This phase uses only first-party app data, not Meta Ads Insights.
- Recharts is the approved charting library.
- `view_dashboard` is the analytics access permission.
- Paid orders are the revenue source of truth.
- Product benefit/loss is an estimate unless every sold product or variant has cost data.
- No database migrations are needed unless creating the new Django `analytics` app requires only app registration and routing.

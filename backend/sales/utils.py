from decimal import Decimal

from django.utils import timezone


def get_active_sales(now=None):
    """Return queryset of currently active sales, prefetching M2M."""
    from sales.models import Sale

    now = now or timezone.now()
    return Sale.objects.filter(
        is_active=True,
        valid_from__lte=now,
        valid_until__gte=now,
    ).prefetch_related("products", "categories")


def get_best_sale_for_product(product, active_sales=None):
    """
    Find the best (biggest discount) active sale for a single product.
    Returns (sale, sale_price) or (None, product.base_price).
    """
    if active_sales is None:
        active_sales = get_active_sales()

    product_category_ids = _get_category_id_chain(product.category)
    best_sale = None
    best_price = product.base_price

    for sale in active_sales:
        if _sale_applies_to_product(sale, product, product_category_ids):
            candidate_price = sale.calculate_sale_price(product.base_price)
            if candidate_price < best_price:
                best_price = candidate_price
                best_sale = sale

    return best_sale, best_price


def get_sale_prices_bulk(products_qs):
    """
    Batch-compute sale prices for a queryset of products.
    Returns dict: {product_id: (sale, sale_price, discount_pct)}

    Designed to be called once per list view to avoid N+1 queries.
    """
    active_sales = list(get_active_sales())
    if not active_sales:
        return {}

    # Build category -> [sales] and product -> [sales] lookup maps
    category_sales = {}   # category_id -> [sale]
    product_sales = {}    # product_id -> [sale]
    all_product_sales = []  # sales that apply to all products

    for sale in active_sales:
        if sale.applies_to == "all_products":
            all_product_sales.append(sale)
        elif sale.applies_to == "specific_categories":
            for cat in sale.categories.all():
                category_sales.setdefault(str(cat.id), []).append(sale)
        elif sale.applies_to == "specific_products":
            for prod in sale.products.all():
                product_sales.setdefault(str(prod.id), []).append(sale)

    result = {}
    products_with_category = products_qs.select_related("category__parent")

    for product in products_with_category:
        category_chain = _get_category_id_chain(product.category)
        pid = str(product.id)

        applicable = list(all_product_sales)
        applicable += product_sales.get(pid, [])
        for cat_id in category_chain:
            applicable += category_sales.get(cat_id, [])

        best_sale = None
        best_price = product.base_price

        for sale in applicable:
            candidate = sale.calculate_sale_price(product.base_price)
            if candidate < best_price:
                best_price = candidate
                best_sale = sale

        if best_sale:
            if product.base_price > Decimal("0"):
                discount_pct = int(
                    ((product.base_price - best_price) / product.base_price) * 100
                )
            else:
                discount_pct = 0
            result[pid] = (best_sale, best_price, discount_pct)

    return result


def _get_category_id_chain(category):
    """Return list of str IDs for a category and all its ancestors."""
    ids = []
    current = category
    while current:
        ids.append(str(current.id))
        current = current.parent
    return ids


def _sale_applies_to_product(sale, product, category_id_chain):
    """Check if a sale applies to a given product (uses prefetched M2M)."""
    if sale.applies_to == "all_products":
        return True
    if sale.applies_to == "specific_products":
        return any(str(p.id) == str(product.id) for p in sale.products.all())
    if sale.applies_to == "specific_categories":
        sale_cat_ids = {str(c.id) for c in sale.categories.all()}
        return bool(sale_cat_ids & set(category_id_chain))
    return False

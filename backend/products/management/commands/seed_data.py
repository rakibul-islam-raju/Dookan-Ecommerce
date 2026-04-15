from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils.text import slugify

from products.models import (
    Category,
    Product,
    VariantType,
    VariantOption,
    ProductVariant,
)


CATEGORIES = [
    {"name": "Honey & Sweeteners", "description": "Pure organic honey and natural sweeteners", "display_order": 1},
    {"name": "Ghee & Oils", "description": "Traditional ghee and cold-pressed cooking oils", "display_order": 2},
    {"name": "Spices & Masala", "description": "Authentic spices and spice blends", "display_order": 3},
    {"name": "Rice & Grains", "description": "Premium quality rice and whole grains", "display_order": 4},
    {"name": "Nuts & Dry Fruits", "description": "Organic nuts, seeds, and dried fruits", "display_order": 5},
    {"name": "Tea & Beverages", "description": "Organic teas, herbal infusions, and healthy drinks", "display_order": 6},
    {"name": "Dairy & Eggs", "description": "Farm-fresh dairy products and free-range eggs", "display_order": 7},
    {"name": "Fruits & Vegetables", "description": "Fresh organic fruits and seasonal vegetables", "display_order": 8},
    {"name": "Snacks & Chips", "description": "Healthy organic snacks and handmade chips", "display_order": 9},
    {"name": "Personal Care", "description": "Natural and organic personal care products", "display_order": 10},
    {"name": "Digital Products", "description": "Ebooks, guides, and digital downloads", "display_order": 11},
]


PRODUCTS = [
    # Honey & Sweeteners
    {
        "name": "Sundarbans Raw Honey",
        "sku": "HON-001",
        "category": "Honey & Sweeteners",
        "description": "Pure raw honey harvested from the Sundarbans mangrove forest. Unprocessed and unfiltered, retaining all natural enzymes and nutrients.",
        "short_description": "Pure Sundarbans mangrove forest honey",
        "base_price": Decimal("650.00"),
        "unit": "kg",
        "unit_value": Decimal("1"),
        "is_featured": True,
    },
    {
        "name": "Litchi Flower Honey",
        "sku": "HON-002",
        "category": "Honey & Sweeteners",
        "description": "Light and aromatic honey collected from litchi orchards in Rajshahi. Delicate floral flavor with a smooth finish.",
        "short_description": "Aromatic litchi blossom honey from Rajshahi",
        "base_price": Decimal("550.00"),
        "unit": "g",
        "unit_value": Decimal("500"),
        "is_featured": False,
    },
    {
        "name": "Organic Date Molasses (Khejur Gur)",
        "sku": "HON-003",
        "category": "Honey & Sweeteners",
        "description": "Traditional date palm jaggery made by skilled artisans. Rich, caramel-like flavor perfect for desserts and sweets.",
        "short_description": "Traditional handmade date palm jaggery",
        "base_price": Decimal("350.00"),
        "unit": "kg",
        "unit_value": Decimal("1"),
        "is_featured": False,
    },
    # Ghee & Oils
    {
        "name": "Pure Desi Cow Ghee",
        "sku": "GHE-001",
        "category": "Ghee & Oils",
        "description": "Traditional slow-cooked ghee made from grass-fed desi cow milk. Rich golden color with nutty aroma. Made using the bilona (churning) method.",
        "short_description": "Traditional bilona method cow ghee",
        "base_price": Decimal("850.00"),
        "unit": "kg",
        "unit_value": Decimal("1"),
        "is_featured": True,
    },
    {
        "name": "Cold-Pressed Mustard Oil",
        "sku": "OIL-001",
        "category": "Ghee & Oils",
        "description": "Wood-pressed mustard oil from premium sarisha seeds. Pungent aroma and bold flavor, ideal for Bengali cooking.",
        "short_description": "Wood-pressed pure mustard oil",
        "base_price": Decimal("280.00"),
        "unit": "l",
        "unit_value": Decimal("1"),
        "is_featured": False,
    },
    {
        "name": "Extra Virgin Coconut Oil",
        "sku": "OIL-002",
        "category": "Ghee & Oils",
        "description": "Cold-pressed virgin coconut oil from fresh coconuts. Multi-purpose oil for cooking, skin care, and hair care.",
        "short_description": "Cold-pressed virgin coconut oil",
        "base_price": Decimal("450.00"),
        "unit": "ml",
        "unit_value": Decimal("500"),
        "is_featured": False,
    },
    # Spices & Masala
    {
        "name": "Organic Turmeric Powder",
        "sku": "SPI-001",
        "category": "Spices & Masala",
        "description": "High-curcumin organic turmeric powder from Bogra. Stone-ground for maximum potency and vibrant color.",
        "short_description": "Stone-ground high-curcumin turmeric",
        "base_price": Decimal("180.00"),
        "unit": "g",
        "unit_value": Decimal("200"),
        "is_featured": True,
    },
    {
        "name": "Whole Garam Masala",
        "sku": "SPI-002",
        "category": "Spices & Masala",
        "description": "Premium whole spice blend including cardamom, cinnamon, cloves, bay leaves, and black pepper. Perfect for biryanis and curries.",
        "short_description": "Premium whole spice blend for biryanis",
        "base_price": Decimal("250.00"),
        "unit": "g",
        "unit_value": Decimal("100"),
        "is_featured": False,
    },
    {
        "name": "Red Chili Powder (Morich Gura)",
        "sku": "SPI-003",
        "category": "Spices & Masala",
        "description": "Pure red chili powder with vibrant color and moderate heat. Ideal for everyday Bengali cooking.",
        "short_description": "Pure red chili powder, moderate heat",
        "base_price": Decimal("120.00"),
        "unit": "g",
        "unit_value": Decimal("200"),
        "is_featured": False,
    },
    # Rice & Grains
    {
        "name": "Miniket Premium Rice",
        "sku": "RIC-001",
        "category": "Rice & Grains",
        "description": "Premium quality Miniket rice known for its fine grain and aromatic flavor. Ideal for everyday meals.",
        "short_description": "Fine grain premium Miniket rice",
        "base_price": Decimal("95.00"),
        "unit": "kg",
        "unit_value": Decimal("1"),
        "is_featured": False,
    },
    {
        "name": "Kalijeera Aromatic Rice",
        "sku": "RIC-002",
        "category": "Rice & Grains",
        "description": "Tiny grain aromatic rice known as 'the prince of rice'. Perfect for polao, payesh, and special occasions.",
        "short_description": "Aromatic fine-grain rice for special dishes",
        "base_price": Decimal("220.00"),
        "unit": "kg",
        "unit_value": Decimal("1"),
        "is_featured": True,
    },
    {
        "name": "Brown Rice (Organic)",
        "sku": "RIC-003",
        "category": "Rice & Grains",
        "description": "Whole grain organic brown rice with bran layer intact. High in fiber and nutrients for health-conscious consumers.",
        "short_description": "Whole grain organic brown rice",
        "base_price": Decimal("160.00"),
        "unit": "kg",
        "unit_value": Decimal("1"),
        "is_featured": False,
    },
    # Nuts & Dry Fruits
    {
        "name": "Premium Cashew Nuts",
        "sku": "NUT-001",
        "category": "Nuts & Dry Fruits",
        "description": "Whole W240 grade cashew nuts. Creamy, crunchy, and perfect for snacking or cooking.",
        "short_description": "W240 grade whole cashew nuts",
        "base_price": Decimal("750.00"),
        "unit": "g",
        "unit_value": Decimal("500"),
        "is_featured": True,
    },
    {
        "name": "California Almonds",
        "sku": "NUT-002",
        "category": "Nuts & Dry Fruits",
        "description": "Premium California almonds, raw and unsalted. Rich in vitamin E and healthy fats.",
        "short_description": "Raw unsalted California almonds",
        "base_price": Decimal("680.00"),
        "unit": "g",
        "unit_value": Decimal("500"),
        "is_featured": False,
    },
    {
        "name": "Mixed Dry Fruits Pack",
        "sku": "NUT-003",
        "category": "Nuts & Dry Fruits",
        "description": "A curated mix of almonds, cashews, raisins, walnuts, and pistachios. Perfect gift pack or daily nutrition boost.",
        "short_description": "Curated mix of premium dry fruits",
        "base_price": Decimal("950.00"),
        "unit": "g",
        "unit_value": Decimal("500"),
        "is_featured": True,
    },
    # Tea & Beverages
    {
        "name": "Sylhet Premium CTC Tea",
        "sku": "TEA-001",
        "category": "Tea & Beverages",
        "description": "Strong CTC tea leaves from Sylhet tea gardens. Rich, full-bodied flavor perfect for milk tea.",
        "short_description": "Premium Sylhet CTC tea leaves",
        "base_price": Decimal("320.00"),
        "unit": "g",
        "unit_value": Decimal("500"),
        "is_featured": False,
    },
    {
        "name": "Green Tea (Organic)",
        "sku": "TEA-002",
        "category": "Tea & Beverages",
        "description": "Organic green tea leaves with high antioxidant content. Light and refreshing taste.",
        "short_description": "Organic antioxidant-rich green tea",
        "base_price": Decimal("280.00"),
        "unit": "g",
        "unit_value": Decimal("100"),
        "is_featured": True,
    },
    # Dairy & Eggs
    {
        "name": "Farm Fresh Desi Eggs",
        "sku": "DAI-001",
        "category": "Dairy & Eggs",
        "description": "Free-range desi chicken eggs from organic farms. Rich golden yolk and superior taste.",
        "short_description": "Free-range organic desi eggs",
        "base_price": Decimal("180.00"),
        "unit": "piece",
        "unit_value": Decimal("12"),
        "is_featured": False,
    },
    {
        "name": "Organic Paneer",
        "sku": "DAI-002",
        "category": "Dairy & Eggs",
        "description": "Fresh handmade paneer from organic whole milk. Soft, creamy texture perfect for curries and tikka.",
        "short_description": "Fresh handmade organic paneer",
        "base_price": Decimal("220.00"),
        "unit": "g",
        "unit_value": Decimal("250"),
        "is_featured": False,
    },
    # Fruits & Vegetables
    {
        "name": "Organic Banana (Sabri)",
        "sku": "FRU-001",
        "category": "Fruits & Vegetables",
        "description": "Sweet and creamy Sabri bananas grown organically. A staple fruit rich in potassium.",
        "short_description": "Organic Sabri bananas",
        "base_price": Decimal("80.00"),
        "unit": "piece",
        "unit_value": Decimal("12"),
        "is_featured": False,
    },
    {
        "name": "Fresh Moringa Leaves",
        "sku": "VEG-001",
        "category": "Fruits & Vegetables",
        "description": "Farm-fresh moringa (drumstick) leaves, a superfood packed with vitamins and minerals.",
        "short_description": "Farm-fresh organic moringa leaves",
        "base_price": Decimal("60.00"),
        "unit": "g",
        "unit_value": Decimal("250"),
        "is_featured": False,
    },
    # Snacks & Chips
    {
        "name": "Handmade Banana Chips",
        "sku": "SNK-001",
        "category": "Snacks & Chips",
        "description": "Crispy handmade banana chips fried in coconut oil. Lightly salted for the perfect crunch.",
        "short_description": "Coconut oil fried banana chips",
        "base_price": Decimal("150.00"),
        "unit": "g",
        "unit_value": Decimal("200"),
        "is_featured": False,
    },
    {
        "name": "Puffed Rice Snack (Muri Mix)",
        "sku": "SNK-002",
        "category": "Snacks & Chips",
        "description": "Traditional muri mix with peanuts, chanachur, and spices. A classic Bengali street snack.",
        "short_description": "Traditional spiced muri mix",
        "base_price": Decimal("100.00"),
        "unit": "g",
        "unit_value": Decimal("300"),
        "is_featured": False,
    },
    # Personal Care
    {
        "name": "Neem Face Wash",
        "sku": "PER-001",
        "category": "Personal Care",
        "description": "Natural neem face wash with antibacterial properties. Gentle cleansing for oily and acne-prone skin.",
        "short_description": "Natural antibacterial neem face wash",
        "base_price": Decimal("250.00"),
        "unit": "ml",
        "unit_value": Decimal("150"),
        "is_featured": False,
    },
    {
        "name": "Pure Aloe Vera Gel",
        "sku": "PER-002",
        "category": "Personal Care",
        "description": "100% pure aloe vera gel for skin and hair. Soothing, hydrating, and multipurpose.",
        "short_description": "100% pure multipurpose aloe vera gel",
        "base_price": Decimal("180.00"),
        "unit": "ml",
        "unit_value": Decimal("200"),
        "is_featured": True,
    },
    # Digital Products
    {
        "name": "Organic Cooking Guide (Ebook)",
        "sku": "DIG-001",
        "category": "Digital Products",
        "description": "A comprehensive digital guide to organic cooking with 100+ recipes using seasonal Bangladeshi ingredients. Instant download PDF.",
        "short_description": "100+ organic recipes — instant PDF download",
        "base_price": Decimal("199.00"),
        "unit": "piece",
        "unit_value": Decimal("1"),
        "is_featured": False,
        "is_digital": True,
    },
    {
        "name": "Digital Gift Card",
        "sku": "DIG-002",
        "category": "Digital Products",
        "description": "Send the gift of organic goodness. Digital gift cards are delivered instantly by email and never expire.",
        "short_description": "Instant email delivery, never expires",
        "base_price": Decimal("500.00"),
        "unit": "piece",
        "unit_value": Decimal("1"),
        "is_featured": False,
        "is_digital": True,
    },
]


VARIANT_TYPES = [
    {
        "name": "Size",
        "options": ["Small", "Medium", "Large"],
    },
    {
        "name": "Weight",
        "options": ["250g", "500g", "1kg"],
    },
]


# Every product must have at least one variant.
# Format: product_sku → list of variant dicts.
# Variants without an "option" key get no option assignment (single "Default" variant).
PRODUCT_VARIANTS = {
    # --- Honey & Sweeteners ---
    "HON-001": {
        "variant_type": "Weight",
        "variants": [
            {"option": "250g", "sku": "HON-001-250", "name": "250g", "base_price": Decimal("200.00"), "stock": 30},
            {"option": "500g", "sku": "HON-001-500", "name": "500g", "base_price": Decimal("380.00"), "stock": 40},
            {"option": "1kg",  "sku": "HON-001-1K",  "name": "1kg",  "base_price": Decimal("650.00"), "stock": 50},
        ],
    },
    "HON-002": {
        "variants": [
            {"sku": "HON-002-STD", "name": "500g", "base_price": Decimal("550.00"), "stock": 35},
        ],
    },
    "HON-003": {
        "variants": [
            {"sku": "HON-003-STD", "name": "1kg", "base_price": Decimal("350.00"), "stock": 80},
        ],
    },
    # --- Ghee & Oils ---
    "GHE-001": {
        "variant_type": "Weight",
        "variants": [
            {"option": "250g", "sku": "GHE-001-250", "name": "250g", "base_price": Decimal("250.00"), "stock": 30},
            {"option": "500g", "sku": "GHE-001-500", "name": "500g", "base_price": Decimal("480.00"), "stock": 35},
            {"option": "1kg",  "sku": "GHE-001-1K",  "name": "1kg",  "base_price": Decimal("850.00"), "stock": 40},
        ],
    },
    "OIL-001": {
        "variants": [
            {"sku": "OIL-001-1L", "name": "1 Litre", "base_price": Decimal("280.00"), "stock": 60},
        ],
    },
    "OIL-002": {
        "variants": [
            {"sku": "OIL-002-STD", "name": "500ml", "base_price": Decimal("450.00"), "stock": 45},
        ],
    },
    # --- Spices & Masala ---
    "SPI-001": {
        "variants": [
            {"sku": "SPI-001-STD", "name": "200g", "base_price": Decimal("180.00"), "stock": 100},
        ],
    },
    "SPI-002": {
        "variants": [
            {"sku": "SPI-002-STD", "name": "100g", "base_price": Decimal("250.00"), "stock": 70},
        ],
    },
    "SPI-003": {
        "variants": [
            {"sku": "SPI-003-STD", "name": "200g", "base_price": Decimal("120.00"), "stock": 90},
        ],
    },
    # --- Rice & Grains ---
    "RIC-001": {
        "variants": [
            {"sku": "RIC-001-STD", "name": "1kg", "base_price": Decimal("95.00"), "stock": 200},
        ],
    },
    "RIC-002": {
        "variants": [
            {"sku": "RIC-002-STD", "name": "1kg", "base_price": Decimal("220.00"), "stock": 80},
        ],
    },
    "RIC-003": {
        "variants": [
            {"sku": "RIC-003-STD", "name": "1kg", "base_price": Decimal("160.00"), "stock": 60},
        ],
    },
    # --- Nuts & Dry Fruits ---
    "NUT-001": {
        "variants": [
            {"sku": "NUT-001-STD", "name": "500g", "base_price": Decimal("750.00"), "stock": 50},
        ],
    },
    "NUT-002": {
        "variants": [
            {"sku": "NUT-002-STD", "name": "500g", "base_price": Decimal("680.00"), "stock": 40},
        ],
    },
    "NUT-003": {
        "variant_type": "Size",
        "variants": [
            {"option": "Small",  "sku": "NUT-003-SM", "name": "Small",  "base_price": Decimal("500.00"),  "stock": 25},
            {"option": "Medium", "sku": "NUT-003-MD", "name": "Medium", "base_price": Decimal("950.00"),  "stock": 30},
            {"option": "Large",  "sku": "NUT-003-LG", "name": "Large",  "base_price": Decimal("1750.00"), "stock": 15},
        ],
    },
    # --- Tea & Beverages ---
    "TEA-001": {
        "variants": [
            {"sku": "TEA-001-STD", "name": "500g", "base_price": Decimal("320.00"), "stock": 75},
        ],
    },
    "TEA-002": {
        "variants": [
            {"sku": "TEA-002-STD", "name": "100g", "base_price": Decimal("280.00"), "stock": 60},
        ],
    },
    # --- Dairy & Eggs ---
    "DAI-001": {
        "variants": [
            {"sku": "DAI-001-STD", "name": "12 pcs", "base_price": Decimal("180.00"), "stock": 100},
        ],
    },
    "DAI-002": {
        "variants": [
            {"sku": "DAI-002-STD", "name": "250g", "base_price": Decimal("220.00"), "stock": 25},
        ],
    },
    # --- Fruits & Vegetables ---
    "FRU-001": {
        "variants": [
            {"sku": "FRU-001-STD", "name": "12 pcs", "base_price": Decimal("80.00"), "stock": 150},
        ],
    },
    "VEG-001": {
        "variants": [
            {"sku": "VEG-001-STD", "name": "250g", "base_price": Decimal("60.00"), "stock": 40},
        ],
    },
    # --- Snacks & Chips ---
    "SNK-001": {
        "variants": [
            {"sku": "SNK-001-STD", "name": "200g", "base_price": Decimal("150.00"), "stock": 80},
        ],
    },
    "SNK-002": {
        "variants": [
            {"sku": "SNK-002-STD", "name": "300g", "base_price": Decimal("100.00"), "stock": 60},
        ],
    },
    # --- Personal Care ---
    "PER-001": {
        "variants": [
            {"sku": "PER-001-STD", "name": "150ml", "base_price": Decimal("250.00"), "stock": 45},
        ],
    },
    "PER-002": {
        "variants": [
            {"sku": "PER-002-STD", "name": "200ml", "base_price": Decimal("180.00"), "stock": 55},
        ],
    },
    # --- Digital Products (no stock) ---
    "DIG-001": {
        "variants": [
            {"sku": "DIG-001-PDF", "name": "PDF Download", "base_price": Decimal("199.00"), "stock": 0},
        ],
    },
    "DIG-002": {
        "variants": [
            {"sku": "DIG-002-500",  "name": "৳500",  "base_price": Decimal("500.00"),  "stock": 0},
            {"sku": "DIG-002-1000", "name": "৳1000", "base_price": Decimal("1000.00"), "stock": 0},
            {"sku": "DIG-002-2000", "name": "৳2000", "base_price": Decimal("2000.00"), "stock": 0},
        ],
    },
}


class Command(BaseCommand):
    help = "Seed database with sample categories, products, and variants for development"

    def add_arguments(self, parser):
        parser.add_argument(
            "--flush",
            action="store_true",
            help="Delete existing seed data before creating new data",
        )

    def handle(self, *args, **options):
        if options["flush"]:
            self.stdout.write("Flushing existing product data...")
            ProductVariant.objects.all().delete()
            VariantOption.objects.all().delete()
            VariantType.objects.all().delete()
            Product.objects.all().delete()
            Category.objects.all().delete()
            self.stdout.write(self.style.WARNING("All product data deleted."))

        self._seed_categories()
        self._seed_products()
        self._seed_variant_types()
        self._seed_product_variants()

        self.stdout.write(self.style.SUCCESS("Database seeded successfully!"))

    def _seed_categories(self):
        created = 0
        for cat_data in CATEGORIES:
            _, was_created = Category.objects.get_or_create(
                name=cat_data["name"],
                defaults={
                    "slug": slugify(cat_data["name"]),
                    "description": cat_data["description"],
                    "display_order": cat_data["display_order"],
                },
            )
            if was_created:
                created += 1
        self.stdout.write(f"  Categories: {created} created, {len(CATEGORIES) - created} already existed")

    def _seed_products(self):
        created = 0
        for prod_data in PRODUCTS:
            category = Category.objects.get(name=prod_data["category"])
            defaults = {
                "name": prod_data["name"],
                "slug": slugify(prod_data["name"]),
                "description": prod_data.get("description", ""),
                "short_description": prod_data.get("short_description", ""),
                "category": category,
                "base_price": prod_data["base_price"],
                "unit": prod_data["unit"],
                "unit_value": prod_data["unit_value"],
                "is_featured": prod_data.get("is_featured", False),
                "is_digital": prod_data.get("is_digital", False),
            }
            _, was_created = Product.objects.get_or_create(
                sku=prod_data["sku"],
                defaults=defaults,
            )
            if was_created:
                created += 1
        self.stdout.write(
            f"  Products: {created} created, {len(PRODUCTS) - created} already existed"
        )

    def _seed_variant_types(self):
        created_types = 0
        created_options = 0
        for vt_data in VARIANT_TYPES:
            vt, was_created = VariantType.objects.get_or_create(name=vt_data["name"])
            if was_created:
                created_types += 1
            for option_value in vt_data["options"]:
                _, opt_created = VariantOption.objects.get_or_create(
                    variant_type=vt, value=option_value
                )
                if opt_created:
                    created_options += 1
        self.stdout.write(f"  Variant types: {created_types} created | Options: {created_options} created")

    def _seed_product_variants(self):
        created = 0
        skipped = 0
        for product_sku, pv_data in PRODUCT_VARIANTS.items():
            try:
                product = Product.objects.get(sku=product_sku)
            except Product.DoesNotExist:
                self.stdout.write(self.style.WARNING(f"  Skipping variants for {product_sku} - product not found"))
                skipped += 1
                continue

            variant_type_name = pv_data.get("variant_type")
            vt = None
            if variant_type_name:
                vt = VariantType.objects.get(name=variant_type_name)

            for var_data in pv_data["variants"]:
                variant, was_created = ProductVariant.objects.get_or_create(
                    sku=var_data["sku"],
                    defaults={
                        "product": product,
                        "name": var_data["name"],
                        "base_price": var_data["base_price"],
                        "stock_quantity": var_data["stock"],
                    },
                )
                if was_created:
                    if vt and var_data.get("option"):
                        option = VariantOption.objects.get(variant_type=vt, value=var_data["option"])
                        variant.options.add(option)
                    created += 1

        total = sum(len(v["variants"]) for v in PRODUCT_VARIANTS.values())
        self.stdout.write(f"  Product variants: {created} created, {total - created} already existed, {skipped} products skipped")

from django.db import migrations


def copy_meta_from_vendor(apps, schema_editor):
    SiteConfig = apps.get_model("store", "SiteConfig")
    Vendor = apps.get_model("vendors", "Vendor")

    config = SiteConfig.objects.first()
    vendor = Vendor.objects.first()

    if config and vendor:
        config.meta_pixel_id = getattr(vendor, "meta_pixel_id", "") or ""
        config.meta_access_token = getattr(vendor, "meta_access_token", "") or ""
        config.meta_test_event_code = getattr(vendor, "meta_test_event_code", "") or ""
        config.meta_default_currency = getattr(vendor, "meta_default_currency", "BDT") or "BDT"
        config.save()


class Migration(migrations.Migration):

    dependencies = [
        ("store", "0005_siteconfig_meta_fields"),
        ("vendors", "0004_copy_siteconfig_meta_to_vendor"),
    ]

    operations = [
        migrations.RunPython(copy_meta_from_vendor, migrations.RunPython.noop),
    ]

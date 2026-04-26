from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("vendors", "0004_copy_siteconfig_meta_to_vendor"),
        ("store", "0006_copy_meta_from_vendor"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="vendor",
            name="meta_pixel_id",
        ),
        migrations.RemoveField(
            model_name="vendor",
            name="meta_access_token",
        ),
        migrations.RemoveField(
            model_name="vendor",
            name="meta_test_event_code",
        ),
        migrations.RemoveField(
            model_name="vendor",
            name="meta_default_currency",
        ),
    ]

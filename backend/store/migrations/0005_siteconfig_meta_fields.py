from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("store", "0004_remove_siteconfig_meta_access_token_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="siteconfig",
            name="meta_pixel_id",
            field=models.CharField(blank=True, max_length=32),
        ),
        migrations.AddField(
            model_name="siteconfig",
            name="meta_access_token",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="siteconfig",
            name="meta_test_event_code",
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name="siteconfig",
            name="meta_default_currency",
            field=models.CharField(default="BDT", max_length=10),
        ),
    ]

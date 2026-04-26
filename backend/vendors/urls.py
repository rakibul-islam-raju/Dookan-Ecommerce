from django.urls import path

from vendors.views import ActiveVendorView

app_name = "vendors"

urlpatterns = [
    path("me/", ActiveVendorView.as_view(), name="active-vendor"),
]


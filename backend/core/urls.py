from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

from django.contrib import admin
from django.urls import path, include

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)


admin.site.site_header = "Dookan"
admin.site.site_title = "Admin Dashboard"
admin.site.index_title = "Dookan"


def health_check(_request):
    return JsonResponse({"status": "ok"})

# schema_view = get_schema_view(
#     openapi.Info(
#         title="Dookan API",
#         default_version="v1",
#         description="Dookan API",
#     ),
#     public=True,
#     permission_classes=(permissions.AllowAny,),
# )

urlpatterns = [
    path("healthz/", health_check, name="healthz"),
    path(
        "",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/schema/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
    path("control-panel/", admin.site.urls),
    # Store
    path("api/v1/store/", include("store.urls", namespace="store")),
    # Authentication
    path("api/v1/auth/", include("authentication.urls", namespace="authentication")),
    # Users
    path("api/v1/users/", include("users.urls", namespace="users")),
    # Products
    path("api/v1/products/", include("products.urls", namespace="products")),
    # Orders
    path("api/v1/orders/", include("orders.urls", namespace="orders")),
    # Coupons
    path("api/v1/coupons/", include("coupons.urls", namespace="coupons")),
    # Wishlists
    path("api/v1/wishlists/", include("wishlists.urls", namespace="wishlists")),
    # Sales
    path("api/v1/sales/", include("sales.urls", namespace="sales")),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

from django.urls import path

from .views import (
    AnnouncementListCreateView,
    AnnouncementRetrieveUpdateDestroyView,
    BannerListCreateView,
    BannerRetrieveUpdateDestroyView,
    SiteConfigView,
)

app_name = "store"

urlpatterns = [
    path(
        "site-config/",
        SiteConfigView.as_view(),
        name="site-config",
    ),
    path(
        "banners/",
        BannerListCreateView.as_view(),
        name="banner-list-create",
    ),
    path(
        "banners/<uuid:pk>/",
        BannerRetrieveUpdateDestroyView.as_view(),
        name="banner-retrieve-update-destroy",
    ),
    path(
        "announcements/",
        AnnouncementListCreateView.as_view(),
        name="announcement-list-create",
    ),
    path(
        "announcements/<int:pk>/",
        AnnouncementRetrieveUpdateDestroyView.as_view(),
        name="announcement-retrieve-update-destroy",
    ),
]

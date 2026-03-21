from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAdminUser

from utils.permissions import HasModulePermission

from .models import Announcement, Banner, SiteConfig
from .serializers import (
    AnnouncementSerializer,
    BannerSerializer,
    SiteConfigSerializer,
)


class AnnouncementListCreateView(generics.ListCreateAPIView):
    serializer_class = AnnouncementSerializer

    def get_queryset(self):
        if self.request.user.is_staff:
            return Announcement.objects.all()
        return Announcement.objects.filter(is_active=True)

    def get_permissions(self):
        if self.request.method == "POST":
            self.permission_classes = [HasModulePermission("manage_announcements")]
        else:
            self.permission_classes = [AllowAny]
        return super().get_permissions()


class AnnouncementRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AnnouncementSerializer
    permission_classes = [HasModulePermission("manage_announcements")]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Announcement.objects.all()
        return Announcement.objects.filter(is_active=True)


class SiteConfigView(generics.RetrieveUpdateAPIView):
    """
    Singleton view for site configuration.
    GET: Public access to retrieve site config
    PUT/PATCH: Admin only to update site config
    """

    serializer_class = SiteConfigSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        # Get or create the singleton SiteConfig instance
        obj, created = SiteConfig.objects.get_or_create()
        return obj

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH"]:
            self.permission_classes = [HasModulePermission("manage_settings")]
        else:
            self.permission_classes = [AllowAny]
        return super().get_permissions()


class BannerListCreateView(generics.ListCreateAPIView):
    """
    List and create banners.
    GET: Public access to active banners only
    POST: Admin only to create new banners
    """

    serializer_class = BannerSerializer

    def get_queryset(self):
        if self.request.user.is_staff:
            return Banner.objects.all()
        return Banner.objects.filter(is_active=True)

    def get_permissions(self):
        if self.request.method == "POST":
            self.permission_classes = [HasModulePermission("manage_banners")]
        else:
            self.permission_classes = [AllowAny]
        return super().get_permissions()


class BannerRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a specific banner.
    All operations require admin access.
    """

    serializer_class = BannerSerializer
    permission_classes = [HasModulePermission("manage_banners")]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Banner.objects.all()
        return Banner.objects.filter(is_active=True)

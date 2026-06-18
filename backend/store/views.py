from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from utils.permissions import HasModulePermission
from vendors.services import assert_storefront_enabled, is_backoffice_request

from .meta_oauth import (
    MetaOAuthCallbackSerializer,
    MetaPixelSelectSerializer,
    create_meta_oauth_authorization_url,
    exchange_code_for_access_token,
    list_existing_meta_pixels,
    validate_meta_oauth_state,
)
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
        assert_storefront_enabled(self.request)
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
        assert_storefront_enabled(self.request)
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
        if self.request.method == "GET" and not is_backoffice_request(self.request):
            assert_storefront_enabled(self.request)
        # Get or create the singleton SiteConfig instance
        obj, created = SiteConfig.objects.get_or_create()
        return obj

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH"]:
            self.permission_classes = [HasModulePermission("manage_settings")]
        else:
            self.permission_classes = [AllowAny]
        return super().get_permissions()


class MetaOAuthStartView(APIView):
    permission_classes = [HasModulePermission("manage_settings")]

    def post(self, request):
        return Response(create_meta_oauth_authorization_url(request.user))


class MetaOAuthCallbackView(APIView):
    permission_classes = [HasModulePermission("manage_settings")]

    def post(self, request):
        serializer = MetaOAuthCallbackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        state = serializer.validated_data["state"]
        code = serializer.validated_data["code"]

        validate_meta_oauth_state(state, request.user)
        access_token = exchange_code_for_access_token(code)
        pixels = list_existing_meta_pixels(access_token)

        return Response({"pixels": pixels})


class MetaPixelSelectView(APIView):
    permission_classes = [HasModulePermission("manage_settings")]

    def post(self, request):
        serializer = MetaPixelSelectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        site_config, _created = SiteConfig.objects.get_or_create()
        site_config.meta_pixel_id = serializer.validated_data["pixel_id"]
        site_config.save(update_fields=["meta_pixel_id", "updated_at"])

        return Response(SiteConfigSerializer(site_config, context={"request": request}).data)


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
        assert_storefront_enabled(self.request)
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
        assert_storefront_enabled(self.request)
        return Banner.objects.filter(is_active=True)

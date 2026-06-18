import json
import secrets
import urllib.error
import urllib.parse
import urllib.request

from django.conf import settings
from django.core.cache import cache
from rest_framework import serializers, status
from rest_framework.exceptions import APIException, ValidationError


META_GRAPH_VERSION = "v22.0"
META_OAUTH_STATE_TIMEOUT = 600
META_OAUTH_STATE_PREFIX = "meta_oauth_state:"


class MetaOAuthConfigurationError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Meta OAuth is not configured."
    default_code = "meta_oauth_not_configured"


class MetaGraphAPIError(APIException):
    status_code = status.HTTP_502_BAD_GATEWAY
    default_detail = "Meta Graph API request failed."
    default_code = "meta_graph_api_failed"


class MetaOAuthCallbackSerializer(serializers.Serializer):
    code = serializers.CharField()
    state = serializers.CharField()


class MetaPixelSelectSerializer(serializers.Serializer):
    pixel_id = serializers.RegexField(regex=r"^\d{1,32}$")


def _state_cache_key(state):
    return f"{META_OAUTH_STATE_PREFIX}{state}"


def _configured_redirect_url():
    redirect_url = settings.META_OAUTH_REDIRECT_URL
    admin_url = settings.ADMIN_URL.rstrip("/")

    if not redirect_url:
        redirect_url = f"{admin_url}/store/settings/meta/callback"

    if not (
        redirect_url == admin_url
        or redirect_url.startswith(f"{admin_url}/")
    ):
        raise MetaOAuthConfigurationError(
            "META_OAUTH_REDIRECT_URL must be under ADMIN_URL."
        )

    return redirect_url


def _require_meta_oauth_settings():
    if not settings.META_APP_ID or not settings.META_APP_SECRET:
        raise MetaOAuthConfigurationError()
    return _configured_redirect_url()


def create_meta_oauth_authorization_url(user):
    redirect_url = _require_meta_oauth_settings()
    state = secrets.token_urlsafe(32)
    cache.set(
        _state_cache_key(state),
        {"user_id": str(user.id)},
        timeout=META_OAUTH_STATE_TIMEOUT,
    )

    query = urllib.parse.urlencode(
        {
            "client_id": settings.META_APP_ID,
            "redirect_uri": redirect_url,
            "state": state,
            "scope": settings.META_OAUTH_SCOPES,
            "response_type": "code",
        }
    )
    return {
        "authorization_url": f"https://www.facebook.com/{META_GRAPH_VERSION}/dialog/oauth?{query}",
        "state": state,
    }


def validate_meta_oauth_state(state, user):
    cached = cache.get(_state_cache_key(state))
    if not cached:
        raise ValidationError({"state": ["Invalid or expired OAuth state."]})

    cache.delete(_state_cache_key(state))

    if cached.get("user_id") != str(user.id):
        raise ValidationError({"state": ["OAuth state does not match the current user."]})


def _request_json(url, params=None):
    if params:
        separator = "&" if "?" in url else "?"
        url = f"{url}{separator}{urllib.parse.urlencode(params)}"

    request = urllib.request.Request(url, method="GET")
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            body = response.read().decode("utf-8")
            return json.loads(body) if body else {}
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="ignore")
        raise MetaGraphAPIError(
            f"Meta Graph API returned {exc.code}: {body[:300]}"
        ) from exc
    except Exception as exc:
        raise MetaGraphAPIError() from exc


def exchange_code_for_access_token(code):
    redirect_url = _require_meta_oauth_settings()
    return _request_json(
        f"https://graph.facebook.com/{META_GRAPH_VERSION}/oauth/access_token",
        {
            "client_id": settings.META_APP_ID,
            "client_secret": settings.META_APP_SECRET,
            "redirect_uri": redirect_url,
            "code": code,
        },
    ).get("access_token")


def _normalize_ad_account_pixel(ad_account, pixel):
    business = ad_account.get("business") or {}
    return {
        "pixel_id": str(pixel.get("id") or ""),
        "pixel_name": pixel.get("name") or "Unnamed Pixel",
        "ad_account_id": str(ad_account.get("id") or ""),
        "ad_account_name": ad_account.get("name") or "Unnamed Ad Account",
        "business_id": str(business.get("id") or "") or None,
        "business_name": business.get("name") or None,
    }


def list_existing_meta_pixels(access_token):
    if not access_token:
        raise MetaGraphAPIError("Meta did not return an access token.")

    accounts_response = _request_json(
        f"https://graph.facebook.com/{META_GRAPH_VERSION}/me/adaccounts",
        {
            "access_token": access_token,
            "fields": "id,name,account_id,business{id,name},adspixels{id,name}",
            "limit": 100,
        },
    )

    pixels = []
    seen_pixel_ids = set()

    for account in accounts_response.get("data", []):
        nested_pixels = (account.get("adspixels") or {}).get("data", [])

        if not nested_pixels:
            pixel_response = _request_json(
                f"https://graph.facebook.com/{META_GRAPH_VERSION}/{account.get('id')}/adspixels",
                {
                    "access_token": access_token,
                    "fields": "id,name",
                    "limit": 100,
                },
            )
            nested_pixels = pixel_response.get("data", [])

        for pixel in nested_pixels:
            option = _normalize_ad_account_pixel(account, pixel)
            if not option["pixel_id"] or option["pixel_id"] in seen_pixel_ids:
                continue
            seen_pixel_ids.add(option["pixel_id"])
            pixels.append(option)

    return pixels

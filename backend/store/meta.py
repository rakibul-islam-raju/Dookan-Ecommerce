import hashlib
import json
import logging
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid

from .models import SiteConfig

logger = logging.getLogger(__name__)

META_GRAPH_VERSION = "v22.0"


def _normalize_text(value):
    if value is None:
        return None
    normalized = str(value).strip().lower()
    return normalized or None


def _normalize_phone(value):
    if value is None:
        return None
    digits = "".join(ch for ch in str(value) if ch.isdigit())
    return digits or None


def _hash_value(value):
    if not value:
        return None
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def _split_name(value):
    normalized = _normalize_text(value)
    if not normalized:
        return None, None
    parts = normalized.split()
    if len(parts) == 1:
        return parts[0], None
    return parts[0], parts[-1]


def _get_client_ip(request):
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def generate_event_id():
    return str(uuid.uuid4())


def build_purchase_event_payload(order):
    contents = []
    content_ids = []

    for item in order.items.select_related("product").all():
        product_id = str(item.product_id)
        content_ids.append(product_id)
        contents.append(
            {
                "id": product_id,
                "quantity": item.quantity,
                "item_price": float(item.unit_price),
            }
        )

    return {
        "currency": order_meta_currency(order),
        "value": float(order.total_amount),
        "content_type": "product",
        "content_ids": content_ids,
        "contents": contents,
        "num_items": sum(item["quantity"] for item in contents),
        "order_id": order.order_number,
    }


def order_meta_currency(order):
    site_config = getattr(order, "_meta_site_config", None)
    if site_config:
        return site_config.meta_default_currency

    site_config = SiteConfig.objects.first()
    if site_config and site_config.meta_default_currency:
        return site_config.meta_default_currency

    return "BDT"


def build_user_data(order, request):
    first_name, last_name = _split_name(order.customer_name)
    shipping_address = getattr(order, "shipping_address", None)

    user_data = {
        "em": _hash_value(_normalize_text(order.customer_email)),
        "ph": _hash_value(_normalize_phone(order.guest_mobile_number)),
        "fn": _hash_value(first_name),
        "ln": _hash_value(last_name),
        "ct": _hash_value(
            _normalize_text(shipping_address.city) if shipping_address else None
        ),
        "st": _hash_value(
            _normalize_text(shipping_address.state) if shipping_address else None
        ),
        "zp": _hash_value(
            _normalize_text(shipping_address.postal_code) if shipping_address else None
        ),
        "country": _hash_value(
            _normalize_text(shipping_address.country) if shipping_address else None
        ),
        "external_id": _hash_value(str(order.user_id) if order.user_id else order.order_number),
    }

    if shipping_address and shipping_address.mobile_number:
        user_data["ph"] = _hash_value(_normalize_phone(shipping_address.mobile_number))

    client_ip = _get_client_ip(request)
    user_agent = request.META.get("HTTP_USER_AGENT")
    if client_ip:
        user_data["client_ip_address"] = client_ip
    if user_agent:
        user_data["client_user_agent"] = user_agent

    return {key: value for key, value in user_data.items() if value}


def send_meta_event(
    *,
    event_name,
    event_id,
    event_time,
    user_data,
    custom_data,
    action_source="website",
    event_source_url=None,
    request=None,
):
    site_config = SiteConfig.objects.first()
    if not site_config:
        return False
    if not site_config.meta_capi_enabled:
        return False
    if not site_config.meta_pixel_id or not site_config.meta_access_token:
        return False

    payload = {
        "data": [
            {
                "event_name": event_name,
                "event_time": event_time,
                "event_id": event_id,
                "action_source": action_source,
                "user_data": user_data,
                "custom_data": custom_data,
            }
        ]
    }

    if event_source_url:
        payload["data"][0]["event_source_url"] = event_source_url
    if site_config.meta_test_event_code:
        payload["test_event_code"] = site_config.meta_test_event_code

    url = (
        f"https://graph.facebook.com/{META_GRAPH_VERSION}/"
        f"{site_config.meta_pixel_id}/events?"
        f"{urllib.parse.urlencode({'access_token': site_config.meta_access_token})}"
    )
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            return 200 <= response.status < 300
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="ignore")
        logger.warning(
            "Meta CAPI HTTP error",
            extra={
                "event_name": event_name,
                "event_id": event_id,
                "status_code": exc.code,
                "response_body": body[:500],
            },
        )
    except Exception:
        logger.exception(
            "Meta CAPI request failed",
            extra={
                "event_name": event_name,
                "event_id": event_id,
            },
        )

    return False


def send_purchase_event(order, request, event_id=None):
    order = (
        order.__class__.objects.select_related("shipping_address", "user")
        .prefetch_related("items")
        .get(pk=order.pk)
    )
    site_config = SiteConfig.objects.first()
    if site_config:
        order._meta_site_config = site_config

    resolved_event_id = event_id or generate_event_id()
    custom_data = build_purchase_event_payload(order)
    user_data = build_user_data(order, request)

    referer = request.META.get("HTTP_REFERER")
    event_source_url = referer or request.build_absolute_uri("/")

    send_meta_event(
        event_name="Purchase",
        event_id=resolved_event_id,
        event_time=int(time.time()),
        user_data=user_data,
        custom_data=custom_data,
        event_source_url=event_source_url,
        request=request,
    )

    return resolved_event_id

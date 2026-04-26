# Creating a Vendor Owner Account

A vendor owner has full permissions across the admin dashboard. This guide covers how to create one using the `create_vendor_owner` management command.

## Prerequisites

- A Vendor record must exist and be active in the database. If none exists, create one first via the Django admin at `/control-panel/` → **Vendors**.
- `ADMIN_URL` must be set in `.env` (defaults to `http://localhost:5173`). The password setup email links to this URL.

## Command

```bash
uv run python manage.py create_vendor_owner \
  --email owner@example.com \
  --first-name John \
  --last-name Doe \
  --mobile +8801XXXXXXXXX
```

### Arguments

| Argument | Required | Description |
|---|---|---|
| `--email` | Yes | Owner's email address (must be unique) |
| `--first-name` | Yes | First name |
| `--last-name` | Yes | Last name |
| `--mobile` | Yes | Mobile number in international format, e.g. `+8801XXXXXXXXX` |

## What Happens

1. A user account is created with `is_staff=True`, `is_active=True`, and no password.
2. The user is set as `Vendor.owner` if the vendor has no owner yet.
3. A `VendorMembership` is created with `is_owner=True`, granting full permissions.
4. A password setup email is sent to the provided address.

## Setting the Password

The owner receives an email with a **Set Up Your Account** link. Clicking it opens the admin dashboard at `/set-password` with a pre-filled OTP. They enter a new password and can then log in at `/login`.

The OTP expires after `OTP_EXPIRE_MINUTES` (configured in settings, default 10 minutes). If it expires before the owner acts, use the password reset flow at `/forgot-password`.

## Permissions

A vendor owner (`VendorMembership.is_owner = True`) automatically has all permissions:

```
view_dashboard, manage_products, manage_orders, manage_customers,
manage_categories, manage_coupons, manage_reviews, manage_banners,
manage_announcements, manage_settings, manage_staff, manage_sales,
manage_wishlists, manage_inventory, manage_expenses
```

To create a staff member with limited permissions, use the admin dashboard UI instead (Staff → Add Staff Member).

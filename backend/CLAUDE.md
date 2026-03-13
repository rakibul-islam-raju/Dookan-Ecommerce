# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fatty Life backend is a Django REST Framework API for an organic products e-commerce platform. This API serves a Next.js customer storefront and a Vite + React admin dashboard.

## Development Commands

```bash
# Start PostgreSQL database (required for development)
docker compose up -d

# Install dependencies (uses uv package manager)
uv sync

# Run development server
uv run python manage.py runserver

# Database migrations
uv run python manage.py makemigrations
uv run python manage.py migrate

# Collect static files
uv run python manage.py collectstatic

# Create superuser for Django admin
uv run python manage.py createsuperuser
```

## Architecture

### App Structure

The backend is organized into domain-specific Django apps:

- **`authentication/`** - JWT authentication, registration, email/OTP verification
- **`users/`** - Custom user model with UUID primary keys, addresses, verification tracking
- **`products/`** - Products, categories (hierarchical), variants, images, inventory
- **`orders/`** - Order processing, guest orders, payment methods, order status tracking
- **`store/`** - Store announcements and banners
- **`core/`** - Django settings, root URL configuration, WSGI
- **`utils/`** - Shared utilities including BaseModel, email helpers

### URL Patterns

API endpoints are versioned at `/api/v1/{app}/`:
- `/api/v1/auth/` - Authentication endpoints
- `/api/v1/users/` - User profile and addresses
- `/api/v1/products/` - Products and categories
- `/api/v1/orders/` - Order management
- `/api/v1/store/` - Store configuration

Additional endpoints:
- `/` - Swagger UI API documentation
- `/control-panel/` - Django admin interface

### Key Technical Details

**Custom User Model**: Uses `users.User` with email as username field and UUID primary key.

**BaseModel Pattern**: All models inherit from `utils.models.BaseModel` which provides:
- UUID primary key (`id`)
- `is_active` for soft deletes
- `created_at` and `updated_at` timestamps

**JWT Authentication**: Via `rest_framework_simplejwt` with:
- 1-day access token lifetime
- 30-day refresh token lifetime
- Token rotation and blacklisting on logout

**Pagination**: `LimitOffsetPagination` with 20 items per page by default.

**Email**: Gmail SMTP for OTP verification, order confirmations, and password resets.

### Environment Variables

Required in `.env`:
- `DJANGO_SECRET_KEY` - Django secret key
- `DEBUG` - Debug mode (True/False)
- `DJANGO_ALLOWED_HOSTS` - Comma-separated list of allowed hosts
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT` - Database connection
- `CORS_ALLOWED_ORIGINS` - Comma-separated list of frontend URLs
- `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` - Gmail SMTP credentials
- `DEFAULT_FROM_EMAIL` - Default sender email address

### Database

PostgreSQL 17 running in Docker on port 5433 (mapped from container's 5432). Default credentials from `docker-compose.yml`:
- Database: `ecom`
- User: `ecom_user`
- Password: `ecom_password`

# Dookan Ecommerce Platform

Dookan is a full-stack, single-vendor ecommerce platform with a customer-facing
storefront, an operations dashboard, and a Django REST API. It covers the full
sales workflow—from catalog browsing and checkout to order processing,
inventory, expenses, staff permissions, and store configuration.

The project is organized as three applications:

| Application | Technology | Default URL |
| --- | --- | --- |
| Storefront | Next.js 16, React 19, TypeScript, Tailwind CSS | `http://localhost:3000` |
| Admin dashboard | React 19, Vite, TypeScript, Tailwind CSS | `http://localhost:5173` |
| Backend API | Django 5.2, Django REST Framework, PostgreSQL | `http://localhost:8000` |

## Features

### Customer storefront

- Bengali and English interfaces with locale-aware routes
- Responsive product catalog with categories, search, filtering, and sorting
- Product details, image galleries, variants, stock availability, and reviews
- Shopping cart, coupon validation, configurable tax, and delivery charges
- Checkout for registered customers and guests
- Customer registration, email verification, login, and password reset
- Customer profiles, saved addresses, order history, and wishlist
- OTP-based guest order tracking
- Store banners, announcements, contact details, and social links
- SEO metadata, sitemap, robots configuration, and localized canonical URLs
- Meta Pixel browser events and optional Conversions API purchase tracking
- Maintenance mode support

### Admin dashboard

- Sales and order overview dashboard
- Product, category, image, variant, and review management
- Order creation, status history, payment status, and customer management
- Coupon and sale campaign management
- Wishlist insights
- Staff accounts, roles, and module-level permissions
- Banner, announcement, shipping, tax, and general store configuration
- English and Bengali dashboard interfaces
- Manual Meta Pixel and Conversions API credential configuration

### Inventory and expenses

- Optional inventory module that can be enabled per deployment
- Trading and manufacturing inventory modes
- Raw material categories, materials, transactions, and stock history
- Production batches, material consumption, batch outputs, and finished goods
- Product variant stock transactions and goods receipts
- Expense categories, expense entries, dashboards, and reports

### Backend and security

- Versioned REST API with JWT access and refresh tokens
- Token rotation and refresh-token blacklisting
- Email OTP verification and password recovery
- Request throttling for authentication and public API endpoints
- Vendor-scoped staff memberships and role-based permissions
- OpenAPI schema, Swagger UI, and ReDoc documentation
- Celery and Redis support for background email tasks
- PostgreSQL persistence and uploaded media support
- Production Docker, Gunicorn, Nginx, HTTPS, and health-check configuration

## Technology stack

**Backend**

- Python 3.13+
- Django 5.2 and Django REST Framework
- PostgreSQL 16 or newer
- Simple JWT, django-filter, and drf-spectacular
- Celery and Redis
- Pillow
- `uv` for Python dependency management

**Frontend**

- Next.js 16 and React 19
- TypeScript
- Tailwind CSS 4
- TanStack Query, Axios, Zustand, React Hook Form, and Zod
- next-intl for Bengali and English localization

**Admin**

- React 19 and Vite 7
- TypeScript and Tailwind CSS 4
- React Router, TanStack Query, Axios, Zustand, React Hook Form, and Zod
- Radix/shadcn-style components and Lucide icons

## Repository structure

```text
.
├── backend/               # Django REST API
│   ├── core/              # Settings, root URLs, Celery, ASGI, and WSGI
│   ├── authentication/    # Login, registration, OTP, and password recovery
│   ├── products/          # Catalog, categories, variants, and reviews
│   ├── orders/            # Checkout, orders, status, and dashboard data
│   ├── inventory/         # Materials, production, receipts, and stock
│   ├── expenses/          # Expense tracking and reports
│   ├── vendors/           # Vendor settings and staff memberships
│   ├── users/             # Users, roles, permissions, and addresses
│   ├── store/             # Site configuration, banners, and announcements
│   ├── coupons/           # Discount coupons
│   ├── sales/             # Sale campaigns
│   └── wishlists/         # Customer wishlists
├── admin/                 # Vite operations dashboard
│   └── src/features/      # Dashboard features grouped by domain
└── frontend/              # Next.js customer storefront
    ├── src/app/           # App Router pages and layouts
    ├── src/components/    # Shared storefront components
    └── src/messages/      # English and Bengali translations
```

## Prerequisites

Install the following before starting:

- Python 3.13 or newer
- [`uv`](https://docs.astral.sh/uv/)
- Node.js 20 or newer
- [`pnpm`](https://pnpm.io/)
- Docker with Docker Compose, or a local PostgreSQL installation

Redis is optional during normal local development because Django runs Celery
tasks eagerly when `DEBUG=True`. It is required when background workers are
enabled.

## Local installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd Ecommerce
```

### 2. Start PostgreSQL

The development Compose file starts PostgreSQL on host port `5433`:

```bash
cd backend
docker compose up -d db
cd ..
```

It creates the following development database:

```text
Database: ecom
User:     ecom_user
Password: ecom_password
Host:     localhost
Port:     5433
```

You may use an existing PostgreSQL server instead and update the backend
environment variables accordingly.

### 3. Configure and run the backend

```bash
cd backend
cp .env.example .env
uv sync
```

For local development, update these values in `backend/.env`:

```dotenv
DEBUG=True
DJANGO_SECRET_KEY=replace-with-a-long-random-development-key
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://localhost:5173
ADMIN_URL=http://localhost:5173
FRONTEND_URL=http://localhost:3000

POSTGRES_DB=ecom
POSTGRES_USER=ecom_user
POSTGRES_PASSWORD=ecom_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5433

CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

USE_X_FORWARDED_HOST=False
SECURE_SSL_REDIRECT=False
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False
SECURE_HSTS_SECONDS=0
```

Apply migrations and start the API:

```bash
uv run python3 manage.py migrate
uv run python3 manage.py runserver
```

The API is now available at `http://localhost:8000`.

### 4. Configure and run the admin dashboard

Open a second terminal:

```bash
cd admin
cp .env.example .env
pnpm install
pnpm dev
```

The default environment connects to the local API:

```dotenv
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_STOREFRONT_REVALIDATE_URL=http://localhost:3000/api/revalidate
VITE_STOREFRONT_REVALIDATE_SECRET=change-me
```

Open `http://localhost:5173`.

### 5. Configure and run the storefront

Open a third terminal:

```bash
cd frontend
cp .env.example .env
pnpm install
pnpm dev
```

Ensure `REVALIDATE_SECRET` matches
`VITE_STOREFRONT_REVALIDATE_SECRET` in `admin/.env`.

Open:

- Bengali storefront: `http://localhost:3000/bn`
- English storefront: `http://localhost:3000/en`

## Initial administrator setup

Create a Django superuser:

```bash
cd backend
uv run python3 manage.py createsuperuser
```

Then:

1. Open the Django control panel at `http://localhost:8000/control-panel/`.
2. Create one active **Vendor** record. The application intentionally supports
   one vendor per deployment.
3. Create the vendor owner account:

```bash
uv run python3 manage.py create_vendor_owner \
  --email owner@example.com \
  --first-name John \
  --last-name Doe \
  --mobile +8801XXXXXXXXX
```

With the console email backend, the account setup link and OTP are printed in
the backend terminal. Use them to set the password, then sign in to the admin
dashboard at `http://localhost:5173/login`.

The vendor owner receives all dashboard permissions. Additional staff members
and restricted roles can be created from the dashboard.

## Useful URLs

| Service | URL |
| --- | --- |
| Storefront | `http://localhost:3000/bn` |
| Admin dashboard | `http://localhost:5173` |
| API root and Swagger UI | `http://localhost:8000/` |
| OpenAPI schema | `http://localhost:8000/api/schema/` |
| ReDoc | `http://localhost:8000/api/schema/redoc/` |
| Django control panel | `http://localhost:8000/control-panel/` |
| Health check | `http://localhost:8000/healthz/` |

API resources are served under `/api/v1/`.

## Development commands

### Backend

```bash
cd backend

# Install or update dependencies
uv sync

# Create and apply database migrations
uv run python3 manage.py makemigrations
uv run python3 manage.py migrate

# Run the development server
uv run python3 manage.py runserver

# Run all backend tests
uv run python3 manage.py test

# Seed sample catalog data
uv run python3 manage.py seed_data
```

### Admin dashboard

```bash
cd admin
pnpm dev
pnpm lint
pnpm build
pnpm preview
```

### Storefront

```bash
cd frontend
pnpm dev
pnpm lint
pnpm build
pnpm start
```

## Environment configuration

Templates for all required settings are included:

- `backend/.env.example`
- `admin/.env.example`
- `frontend/.env.example`

Important configuration groups include:

- Django secret key, debug mode, hosts, CORS, and CSRF origins
- PostgreSQL connection settings
- SMTP email and OTP behavior
- JWT throttling and cache settings
- Storefront and admin URLs
- Next.js authentication cookies and cache revalidation
- Shipping, tax, and store details managed through the dashboard
- Optional Meta Pixel and Conversions API credentials
- Production HTTPS, Gunicorn, and Nginx settings

Never commit populated `.env` files or production secrets.

## Optional background workers

Production email tasks use Celery with Redis. The production Compose stack
already defines the database, Redis, API, and Celery worker:

```bash
cd backend
docker compose -f docker-compose.prod.yml up -d
```

To run a worker directly on the host instead, provide a host-accessible Redis
URL and start Celery:

```bash
CELERY_BROKER_URL=redis://localhost:6379/0 \
CELERY_RESULT_BACKEND=redis://localhost:6379/0 \
uv run celery -A core worker --loglevel=info
```

## Testing and quality checks

Run the checks for every application you modify:

```bash
# Backend
cd backend
uv run python3 manage.py test

# Admin
cd admin
pnpm lint
pnpm build

# Storefront
cd frontend
pnpm lint
pnpm build
```

Backend tests cover models, serializers, API behavior, permissions, inventory,
orders, store settings, and integrations. Automated frontend tests are not
currently configured, so linting and production builds are the required UI
checks.

## Production deployment

Production-oriented Docker files are included for all three applications:

- `backend/Dockerfile.prod` and `backend/docker-compose.prod.yml`
- `admin/Dockerfile` and `admin/docker-compose.yml`
- `frontend/Dockerfile` and `frontend/docker-compose.yml`

Before deploying:

1. Replace every example secret and hostname.
2. Set `DEBUG=False`.
3. Configure PostgreSQL, Redis, SMTP, CORS, CSRF, and allowed hosts.
4. Provide valid TLS certificates and review the Nginx settings.
5. Set secure cookie and HTTPS options to `True`.
6. Run migrations, collect static files, and verify `/healthz/`.
7. Build both frontend applications and confirm their API URLs.
8. Review Django's deployment checklist:

```bash
cd backend
uv run python3 manage.py check --deploy
```

## Contributing

Keep changes inside the relevant domain application or frontend feature
directory. Before opening a pull request:

- Use Conventional Commit messages such as `feat: add order export`.
- Run backend tests for API changes.
- Run lint and build commands for affected frontend applications.
- Include screenshots or recordings for visual changes.
- Do not commit environment files, uploaded media, dependency caches, or build
  output.

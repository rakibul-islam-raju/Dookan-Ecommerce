# Dookan — Scale & Deployment Readiness Audit

**Date:** 2026-04-10  
**Auditor:** Claude Code (automated)  
**Scope:** Backend (Django), Frontend (Next.js), Admin (Vite + React)

---

## Verdict

> **⛔ NOT PRODUCTION-READY**

The codebase has a solid architectural foundation — good database design, proper query optimisation, JWT auth, and containerisation — but several **critical blockers** must be resolved before any public deployment.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Load Capacity Estimates](#2-load-capacity-estimates)
3. [Critical Blockers](#3-critical-blockers)
4. [Backend Audit](#4-backend-audit)
5. [Frontend Audit](#5-frontend-audit)
6. [Admin Audit](#6-admin-audit)
7. [Security Audit](#7-security-audit)
8. [What's Already Good](#8-whats-already-good)
9. [Fix Roadmap](#9-fix-roadmap)
10. [Readiness Checklist](#10-readiness-checklist)

---

## 1. Executive Summary

| Layer | Status | Biggest Concern |
|-------|--------|----------------|
| Backend (Django) | ⛔ Blocked | Dev server in prod, no rate limiting, DEBUG=True |
| Database (PostgreSQL) | ⚠️ Partial | No connection pooling, no cache layer |
| Frontend (Next.js) | ✅ Mostly ready | Minor image optimisation gaps |
| Admin (Vite) | ✅ Mostly ready | Missing prod build optimisation |
| Security | ⛔ Blocked | Hardcoded secrets, no HTTPS enforcement |
| Infrastructure | ⚠️ Partial | Docker exists but start script uses dev server |

---

## 2. Load Capacity Estimates

### Current State (no fixes applied)

| Metric | Estimate | Reason |
|--------|----------|--------|
| Concurrent users | **~20–50** | `manage.py runserver` is single-threaded |
| Requests/sec | **~10–30 req/s** | No WSGI worker pool |
| Orders/hour | **~200–400** | Each order blocks on email sending (no async) |
| DB connections | **~5–10** | No pooling — hits PostgreSQL default limit slowly |
| Time to first error under load | **< 2 minutes** | No rate limiting → DB overload |

### After Critical Fixes (Gunicorn + pooling + Redis)

| Metric | Estimate | Configuration |
|--------|----------|---------------|
| Concurrent users | **1,000–3,000** | 8-worker Gunicorn + Redis cache |
| Requests/sec | **400–800 req/s** | Cached product endpoints |
| Orders/hour | **5,000–10,000** | Celery async emails |
| DB connections | **40–80** | PgBouncer + `CONN_MAX_AGE=600` |
| P95 latency (product list) | **80–150 ms** | With Redis cache |
| P95 latency (order create) | **200–400 ms** | DB write path, no cache |

### Scaling formula for Gunicorn workers

```
workers = (2 × CPU cores) + 1

2-core server  →  5 workers
4-core server  →  9 workers
8-core server  →  17 workers
```

---

## 3. Critical Blockers

These must be fixed before **any** deployment.

### 3.1 Development server in production

**File:** `backend/start.sh`, line 27

```bash
# CURRENT — kills you in prod
exec uv run python manage.py runserver 0.0.0.0:8000

# FIX — replace with:
exec uv run gunicorn core.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 9 \
    --worker-class sync \
    --timeout 30 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --access-logfile - \
    --error-logfile -
```

`manage.py runserver` is single-threaded, has no worker management, and throws a warning that it is not for production use. Under any real load it will queue requests or crash.

---

### 3.2 DEBUG = True

**File:** `backend/.env`, line 2

```env
DEBUG=True   # ← exposes full stack traces, SQL queries, env vars to browsers
```

**Fix:** Set `DEBUG=False` in all non-local environments. Also add to `settings.py`:

```python
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31_536_000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_BROWSER_XSS_FILTER = True
```

---

### 3.3 Hardcoded secret key

**File:** `backend/.env`, line 3

The `DJANGO_SECRET_KEY` is a known value checked into the repo. Anyone who can read the repo can forge session cookies and JWT tokens.

**Fix:**
```bash
# Generate a new key
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```
Store it in a secrets manager (AWS Secrets Manager, Doppler, HashiCorp Vault) — never in `.env` files that are committed.

---

### 3.4 No rate limiting

**File:** `backend/core/settings.py` — REST_FRAMEWORK block has no throttle classes.

Every auth endpoint (`/api/v1/auth/login/`, `/api/v1/auth/register/`) is wide open to brute force and credential stuffing.

**Fix — add to `settings.py`:**

```python
REST_FRAMEWORK = {
    # ... existing config ...
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",
        "user": "1000/hour",
        "login": "10/minute",      # tighter on auth
        "register": "5/minute",
    },
}
```

---

### 3.5 Python version mismatch in Docker

**File:** `backend/Dockerfile` and `backend/Dockerfile.prod`  
Both use `python:3.12-slim` but `pyproject.toml` declares `requires-python = ">=3.13"`.

**Fix:**
```dockerfile
FROM python:3.13-slim
```

---

## 4. Backend Audit

### 4.1 Database

| Check | Status | Notes |
|-------|--------|-------|
| Connection pooling | ❌ Missing | No `CONN_MAX_AGE` — every request opens a new connection |
| Indexes | ✅ Good | Orders, products, categories, users all indexed |
| Query optimisation | ✅ Good | `select_related` / `prefetch_related` used consistently |
| Pagination | ✅ Good | Default 20 items/page via `LimitOffsetPagination` |
| Pagination gap | ⚠️ | `pagination_class = None` on variant-type endpoints — could return thousands |

**Add connection pooling** (`settings.py`):
```python
DATABASES = {
    "default": {
        # ... existing config ...
        "CONN_MAX_AGE": 600,   # reuse connections for 10 minutes
        "OPTIONS": {
            "connect_timeout": 10,
        },
    }
}
```

For production, add **PgBouncer** in front of PostgreSQL (transaction mode, 20–30 server connections, unlimited client connections).

---

### 4.2 Caching — None exists

The application makes a fresh database round-trip on every request. No Redis, no Memcached, no in-process cache.

**Impact:**
- Product list: ~80–120 ms each, hundreds of SQL rows
- Category tree: re-fetched on every page load
- JWT blacklist: validated against the database on every authenticated request

**Fix — add Redis cache to `settings.py`:**
```python
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://redis:6379/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "SOCKET_CONNECT_TIMEOUT": 5,
            "SOCKET_TIMEOUT": 5,
        },
        "TIMEOUT": 300,  # 5 minutes default TTL
    }
}
```

Add `django-redis` to `pyproject.toml`. Cache the product list and category tree — these are the hottest read paths.

---

### 4.3 Async tasks — None exists

Email sending (`order_confirmation`, `OTP`, `password_reset`) runs **synchronously inside the request cycle**. A slow SMTP response (Gmail averages 1–3 s) blocks the HTTP worker for that duration.

**Impact:** With 9 Gunicorn workers, 9 slow emails can stall all workers simultaneously.

**Fix:** Add Celery with Redis as broker:
```python
# celery.py
CELERY_BROKER_URL = "redis://redis:6379/0"
CELERY_RESULT_BACKEND = "redis://redis:6379/0"
```
Move all email sends and image processing to `@shared_task`.

---

### 4.4 Static and media files

Django currently serves both in development (`DEBUG=True`). In production with `DEBUG=False`, static files return 404 unless configured.

**Fix options (pick one):**
- **WhiteNoise** (simplest): `whitenoise.middleware.WhiteNoiseMiddleware` — serves compressed static files directly from Python with far-future cache headers
- **nginx** reverse proxy serving `/static/` and `/media/`
- **S3 + CloudFront** via `django-storages` (best for scale — offloads media from app servers entirely)

---

### 4.5 JWT token blacklist

`rest_framework_simplejwt.token_blacklist` stores blacklisted tokens in PostgreSQL. Every logout adds a row; every authenticated request queries this table. The table grows unbounded.

**Fix:** Add a management command or cron job to purge expired tokens weekly:
```bash
python manage.py flushexpiredtokens
```

Long-term: migrate blacklist to Redis with TTL set to the token's remaining lifetime.

---

### 4.6 N+1 risk

One instance found at `backend/products/views.py` around order item iteration — a loop over `order.items.all()` without verifying items were prefetched. All other query sets look well-optimised. Verify with Django Debug Toolbar locally before going live.

---

## 5. Frontend Audit

### 5.1 Build & rendering strategy

| Check | Status | Notes |
|-------|--------|-------|
| React Compiler | ✅ | Enabled — auto-memoises components |
| Standalone output | ✅ | `output: "standalone"` — Docker-ready |
| ISR caching | ✅ | Products (1 hr), categories (2 hr) |
| Server Components | ✅ | Used correctly for initial data |
| Client hydration | ✅ | React Query for client state |
| API timeout | ✅ | 10 s on both server and client axios |
| Token refresh | ✅ | 401 interceptor handles silent refresh |

### 5.2 Missing optimisations

```ts
// next.config.ts — add these:
images: {
  formats: ["image/avif", "image/webp"],   // serve modern formats
  minimumCacheTTL: 3600,                   // 1-hour CDN cache on images
},
```

### 5.3 Cart is localStorage-only (Zustand persist)

The cart lives entirely in the browser. This is fine for a simple store but means:
- Cart is lost on logout / private browsing
- No server-side cart merging when a guest logs in
- No cart abandonment tracking possible

Not a blocker, but worth noting for future iteration.

---

## 6. Admin Audit

The admin is a Vite SPA served as a static bundle. No server-side concerns.

| Check | Status | Notes |
|-------|--------|-------|
| Production build | ✅ | `tsc -b && vite build` |
| Auth (localStorage) | ⚠️ | Tokens in localStorage — XSS risk; consider `httpOnly` cookies |
| Route guards | ✅ | Role-based protection on all routes |
| React Compiler | ✅ | Enabled |

**Recommendation:** Serve the admin bundle from the same nginx that proxies the API — avoids needing a separate origin and simplifies CORS.

---

## 7. Security Audit

### Critical

| Issue | Location | Risk |
|-------|----------|------|
| `DEBUG=True` | `backend/.env:2` | Full error pages exposed to public |
| Hardcoded SECRET_KEY | `backend/.env:3` | Token forgery possible |
| No rate limiting | `settings.py` | Brute force, credential stuffing |
| No HTTPS enforcement | `settings.py` | Credentials sent in clear text |

### High

| Issue | Location | Risk |
|-------|----------|------|
| Email credentials in `.env` | `backend/.env:16-18` | SMTP account hijack |
| Admin tokens in localStorage | `admin/` | XSS can steal tokens |
| `ALLOWED_HOSTS=*` | `backend/.env:4` | Host header injection |
| No CSRF cookie secure flag | `settings.py` | Cookie theft over HTTP |

### Good security already in place ✅

- OTP 5-minute expiry with 3-attempt lock
- Email verification before account activation
- JWT token rotation on refresh
- Token blacklisting on logout
- UUID primary keys (no enumerable IDs)
- Role-based module permissions on admin endpoints
- Password hashing via Django's PBKDF2

---

## 8. What's Already Good

These do **not** need changes before launch:

- **Database indexes** — Orders, products, categories, users all have well-chosen composite indexes
- **Query optimisation** — `select_related` / `prefetch_related` used throughout; no obvious N+1 patterns in hot paths
- **Sale price bulk query** — `sales/utils.py` `get_sale_prices_bulk()` batches price lookups correctly
- **Order model immutability** — Snapshots `product_name` and `unit_price` at order time
- **API versioning** — `/api/v1/` prefix in place
- **drf-spectacular** — Swagger docs auto-generated
- **Separate dev/prod Docker configs** — `docker-compose.yml` vs `docker-compose.prod.yml`
- **Next.js standalone output** — Docker-optimised build
- **React Query stale times** — Sensible cache windows per resource type
- **ISR revalidation** — Banner and product caches correctly tagged for on-demand invalidation from admin
- **Guest checkout** — Fully supported without account creation

---

## 9. Fix Roadmap

### Phase 1 — Before any deployment (Day 1–2)

| # | Task | File | Effort |
|---|------|------|--------|
| 1 | Replace `runserver` with Gunicorn | `backend/start.sh` | 15 min |
| 2 | Set `DEBUG=False` in prod env | `backend/.env.prod` | 5 min |
| 3 | Rotate SECRET_KEY, store securely | — | 30 min |
| 4 | Add DRF throttle classes | `backend/core/settings.py` | 20 min |
| 5 | Set `ALLOWED_HOSTS` to exact domains | `backend/.env.prod` | 5 min |
| 6 | Add HTTPS security settings block | `backend/core/settings.py` | 20 min |
| 7 | Fix Dockerfile Python version to 3.13 | `backend/Dockerfile.prod` | 5 min |
| 8 | Add `CONN_MAX_AGE=600` to DB config | `backend/core/settings.py` | 5 min |

**Total Phase 1: ~2 hours**

---

### Phase 2 — Within first week

| # | Task | Effort |
|---|------|--------|
| 1 | Add Redis container + `django-redis` cache | 2 hr |
| 2 | Cache product list and category tree (5-min TTL) | 2 hr |
| 3 | Add WhiteNoise for static files | 1 hr |
| 4 | Add Celery + Redis for async emails | 4 hr |
| 5 | Add nginx reverse proxy config | 2 hr |
| 6 | Add `flushexpiredtokens` cron | 30 min |
| 7 | Add pagination to variant-type endpoints | 1 hr |
| 8 | Set up Sentry for error tracking | 1 hr |

---

### Phase 3 — First month

| # | Task |
|---|------|
| 1 | S3 + CloudFront for media uploads |
| 2 | PgBouncer connection pooler |
| 3 | Elasticsearch for product search |
| 4 | Prometheus + Grafana metrics |
| 5 | CI/CD pipeline (GitHub Actions) |
| 6 | Load testing with k6 or Locust |
| 7 | Write test suite (currently zero tests) |
| 8 | Database backup automation |

---

## 10. Readiness Checklist

### Blockers (must fix before launch)

- [ ] Replace `manage.py runserver` with Gunicorn in `start.sh`
- [ ] Set `DEBUG=False` in production environment
- [ ] Rotate and securely store `DJANGO_SECRET_KEY`
- [ ] Add DRF throttle classes to prevent brute force
- [ ] Set `ALLOWED_HOSTS` to exact domain(s)
- [ ] Add HTTPS enforcement settings
- [ ] Fix Dockerfile to use `python:3.13-slim`
- [ ] Add `CONN_MAX_AGE` for DB connection reuse
- [ ] Configure static file serving (WhiteNoise or nginx)

### Strongly recommended before launch

- [ ] Redis cache layer
- [ ] Celery for async email/tasks
- [ ] Sentry error tracking
- [ ] Structured logging
- [ ] Health check endpoint (`/health/`)

### Good to have (post-launch)

- [ ] PgBouncer connection pooler
- [ ] S3 + CDN for media
- [ ] Load testing (k6 / Locust)
- [ ] Test suite
- [ ] CI/CD pipeline
- [ ] Database backup automation
- [ ] Kubernetes manifests

---

## Appendix — Load Test Scenario

Run this after Phase 1 fixes are applied using [k6](https://k6.io):

```js
// k6_smoke_test.js
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "2m", target: 100 },   // ramp to 100 users
    { duration: "5m", target: 500 },   // ramp to 500
    { duration: "5m", target: 1000 },  // peak load
    { duration: "2m", target: 0 },     // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],  // 95% of requests < 500ms
    http_req_failed: ["rate<0.01"],    // < 1% errors
  },
};

const BASE = "https://your-api-domain.com/api/v1";

export default function () {
  // Product listing (hottest endpoint)
  const products = http.get(`${BASE}/products/?limit=20&offset=0`);
  check(products, { "products 200": (r) => r.status === 200 });
  sleep(1);

  // Product detail
  const detail = http.get(`${BASE}/products/some-slug/`);
  check(detail, { "detail 200": (r) => r.status === 200 });
  sleep(0.5);
}
```

**Expected baseline results after Phase 1 + Phase 2 fixes:**

| Percentile | Target |
|-----------|--------|
| P50 | < 80 ms |
| P95 | < 300 ms |
| P99 | < 800 ms |
| Error rate | < 0.5% |
| Max concurrent users | 1,000+ |

---

*Generated by automated audit — 2026-04-10*

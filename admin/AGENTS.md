# Repository Guidelines

## Project Structure & Module Organization

This repository contains three apps:

- `backend/`: Django 5.2 API. Domain apps live under paths such as `backend/products/`, `backend/orders/`, and `backend/inventory/`. Shared settings are in `backend/core/`, templates in `backend/templates/`, uploads in `backend/media/`, and notes in `backend/docs/`.
- `admin/`: React + TypeScript + Vite dashboard. Feature code lives in `admin/src/features/`, shared UI in `admin/src/components/`, API helpers in `admin/src/lib/` and `admin/src/services/`, and static assets in `admin/public/` and `admin/src/assets/`.
- `frontend/`: Next.js storefront. Routes are in `frontend/src/app/`, shared components in `frontend/src/components/`, and public assets in `frontend/public/`.

## Build, Test, and Development Commands

- `cd backend && uv sync`: install backend dependencies.
- `cd backend && uv run python3 manage.py runserver`: start the Django API locally.
- `cd backend && uv run python3 manage.py makemigrations && uv run python3 manage.py migrate`: create and apply schema changes.
- `cd backend && uv run python3 manage.py test`: run backend tests.
- `cd admin && pnpm dev`: start the admin dashboard with Vite.
- `cd admin && pnpm build`: type-check and build the admin app.
- `cd admin && pnpm lint`: run ESLint for the admin app.
- `cd frontend && pnpm dev`, `pnpm build`, `pnpm lint`: run, build, and lint the storefront.

## Coding Style & Naming Conventions

Use 4-space indentation in Python. Keep Django logic inside the relevant app (`models.py`, `serializers.py`, `views.py`, `urls.py`, `services.py`). Use `PascalCase` for models and React components, `snake_case` for Python functions and fields, and `camelCase` for TypeScript hooks and utilities. In the admin UI, prefer existing Radix/shadcn-style patterns and `lucide-react` icons.

## Testing Guidelines

Backend tests use Django’s test runner and are usually colocated in each app’s `tests.py`. Add coverage for serializers, permissions, API views, and model behavior when touching backend logic. Frontend test tooling is not configured here, so validate UI work with `pnpm lint` and `pnpm build` in the affected frontend.

## Commit & Pull Request Guidelines

Follow Conventional Commit style, for example `feat: add coupon usage validation` or `fix: prevent duplicate inventory entries`. PRs should describe the change, list affected areas, link issues, and include screenshots or recordings for UI updates. Do not commit `.env`, uploaded media, build artifacts, or dependency caches.

## Security & Configuration Tips

Start from `backend/.env.example` for local settings. Keep secrets out of version control and review CORS, database, email, and production settings in `backend/core/settings.py` before changing deployment behavior.

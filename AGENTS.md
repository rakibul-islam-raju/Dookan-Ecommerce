# Repository Guidelines

## Project Structure & Module Organization

This repository has three applications. `backend/` contains the Django 5.2 API, with domain apps such as `products`, `orders`, `inventory`, `expenses`, `vendors`, `users`, `store`, `coupons`, `wishlists`, and `sales`; shared settings live in `backend/core/`, email templates in `backend/templates/`, uploads in `backend/media/`, and notes in `backend/docs/`. `admin/` is the React + TypeScript Vite admin dashboard; feature code is in `admin/src/features/`, reusable UI in `admin/src/components/`, and API helpers in `admin/src/lib/` and `admin/src/services/`. `frontend/` is the Next.js storefront, with routes in `frontend/src/app/`, shared components in `frontend/src/components/`, and assets in `frontend/public/`.

## Build, Test, and Development Commands

- Backend setup: `cd backend && uv sync`
- Backend dev server: `cd backend && uv run python3 manage.py runserver`
- Backend migrations: `cd backend && uv run python3 manage.py makemigrations && uv run python3 manage.py migrate`
- Backend tests: `cd backend && uv run python3 manage.py test`
- Admin dev: `cd admin && pnpm install && pnpm dev`
- Admin build/lint: `cd admin && pnpm build` and `pnpm lint`
- Storefront dev: `cd frontend && pnpm install && pnpm dev`
- Storefront build/lint: `cd frontend && pnpm build` and `pnpm lint`

## Coding Style & Naming Conventions

Use 4-space indentation for Python and keep Django logic inside the relevant app (`models.py`, `serializers.py`, `views.py`, `urls.py`, `services.py` where present). Name models in `PascalCase`, functions and fields in `snake_case`, and migrations with Django-generated names. For TypeScript, use `PascalCase` for components, `camelCase` for hooks/utilities, and colocate feature code under `features/<domain>/`. Prefer existing Radix/shadcn-style UI patterns and `lucide-react` icons.

## Testing Guidelines

Backend tests use Django’s test runner and live in each app’s `tests.py`; add tests beside the app being changed, especially for serializers, permissions, API views, and model behavior. Frontend test tooling is not configured, so run `pnpm lint` and `pnpm build` for affected frontends before submitting UI changes.

## Commit & Pull Request Guidelines

Git history uses Conventional Commit-style messages such as `feat: Add meta pixel support...`; follow `type: concise imperative summary` (`feat`, `fix`, `chore`, `docs`, `refactor`). Pull requests should describe the change, list areas touched, include screenshots or recordings for UI changes, link issues, and note commands run. Never commit `.env`, uploaded media, build outputs, or dependency caches.

## Security & Configuration Tips

Start from `backend/.env.example` for local settings and keep secrets out of version control. Review CORS, database, email, and production settings in `backend/core/settings.py` when changing deployment behavior.

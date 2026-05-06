# Repository Guidelines

## Project Structure & Module Organization

This repository contains the Django 5.2 backend for the ecommerce platform. Project settings and root URL configuration live in `core/`. Domain apps are organized by business area, including `products`, `orders`, `inventory`, `expenses`, `vendors`, `users`, `store`, `coupons`, `wishlists`, and `sales`. Shared utilities belong in `utils/`, email templates in `templates/`, uploaded files in `media/`, deployment files in `deploy/`, and project notes in `docs/`.

Keep app-specific code inside the relevant Django app: `models.py`, `serializers.py`, `views.py`, `urls.py`, `admin.py`, `services.py` where present, and `tests.py`.

## Build, Test, and Development Commands

- `uv sync`: install backend dependencies from `pyproject.toml` and `uv.lock`.
- `uv run python3 manage.py runserver`: start the local Django development server.
- `uv run python3 manage.py makemigrations`: generate migrations for model changes.
- `uv run python3 manage.py migrate`: apply database migrations.
- `uv run python3 manage.py test`: run the Django test suite.
- `uv run python3 manage.py shell`: open a Django-aware Python shell for debugging.

Run commands from the backend directory unless a command explicitly says otherwise.

## Coding Style & Naming Conventions

Use 4-space indentation for Python. Follow Django conventions and keep business logic near the app that owns it. Name models and serializers in `PascalCase`, for example `Product` or `OrderSerializer`. Use `snake_case` for functions, methods, fields, variables, and module names.

Prefer clear service functions for reusable business workflows instead of duplicating logic across views or serializers. Keep migrations Django-generated and do not edit historical migrations unless there is a specific migration repair task.

## Testing Guidelines

Backend tests use Django’s built-in test runner. Add or update tests in the affected app’s `tests.py`, especially for serializers, permissions, API views, model behavior, and service logic. Use descriptive test method names such as `test_staff_can_update_inventory`.

Before submitting backend changes, run:

```bash
uv run python3 manage.py test
```

## Commit & Pull Request Guidelines

Recent history follows Conventional Commit-style messages, such as `feat: Add meta pixel support...`. Use `type: concise imperative summary`, with types like `feat`, `fix`, `chore`, `docs`, and `refactor`.

Pull requests should describe the change, list affected apps, link related issues, note migrations or configuration changes, and include the commands run during verification.

## Security & Configuration Tips

Start local configuration from `.env.example` if present and never commit secrets, uploaded media, dependency caches, or production credentials. Review `core/settings.py` when changing CORS, database, email, static/media, or production deployment behavior.

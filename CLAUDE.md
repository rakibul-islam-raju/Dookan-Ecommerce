# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dookan is an e-commerce platform for organic products consisting of three independent applications:

- **frontend**: Next.js 16 customer-facing storefront
- **admin**: Vite + React admin dashboard for store management
- **backend**: Django REST Framework API

Each project has its own git repository and runs independently.

## Development Commands

### Backend (Django)

```bash
cd backend

# Start PostgreSQL database
docker compose up -d

# Install dependencies (uses uv package manager)
uv sync

# Run development server
uv run python manage.py runserver

# Run migrations
uv run python manage.py migrate

# Make migrations
uv run python manage.py makemigrations
```

### Frontend (Next.js)

```bash
cd frontend
npm install   # or pnpm install
npm run dev   # Development server on http://localhost:3000
npm run build
npm run lint
```

### Admin (Vite + React Compiler)

```bash
cd admin
npm install   # or pnpm install
npm run dev   # Development server on http://localhost:5173
npm run build # tsc -b && vite build
npm run lint
```

Note: React Compiler is enabled in admin, which impacts dev & build performance.

## Architecture

### Backend Structure

Django project with apps organized by domain:

- `core/` - Project settings, root URL configuration
- `authentication/` - JWT auth (login, register, token refresh)
- `users/` - Custom user model and profile management
- `products/` - Product, category, variant management
- `orders/` - Order processing and management
- `store/` - Store-level configuration
- `utils/` - Shared utilities

API endpoints follow pattern: `/api/v1/{app}/`

Key configurations:

- JWT authentication via `djangorestframework-simplejwt`
- API documentation at root URL via `drf-spectacular` (Swagger UI)
- Admin panel at `/control-panel/`
- Custom user model: `users.User`

### Frontend Structure (Next.js App Router)

```
src/
├── app/
│   ├── (auth)/          # Auth pages (login, register, forgot-password)
│   └── (store)/         # Store pages (home, shop, cart, checkout, account)
├── components/
│   └── ui/              # shadcn/ui components (new-york style)
├── lib/
│   ├── api/             # API client modules (axios instances, endpoints)
│   ├── hooks/           # React Query hooks for data fetching
│   ├── store/           # Zustand stores (useAuthStore)
│   └── providers/       # React context providers
└── @types/              # TypeScript type definitions
```

Key patterns:

- Server/client axios instances in `lib/api/axios.ts`
- React Query for client-side data fetching with query key factories
- Zustand for auth state with cookie-based token storage
- Forms use react-hook-form with Zod validation

### Admin Structure (Vite + React Router)

```
src/
├── features/            # Feature modules (products, orders, categories, auth)
├── components/
│   ├── layout/          # DashboardLayout, AuthLayout
│   └── ui/              # shadcn/ui components
├── routes/              # React Router configuration
├── services/            # API client
└── store/               # Zustand stores
```

Key patterns:

- Feature-based organization
- React Router for navigation
- Auth tokens stored in localStorage

## Tech Stack Details

### Backend

- Python 3.13, Django 5.2, DRF 3.16
- PostgreSQL 17 (via Docker)
- JWT tokens (1-day access, 30-day refresh)
- Package management: `uv`

### Frontend

- Next.js 16, React 19, TypeScript 5.9
- Tailwind CSS 4 with shadcn/ui components
- TanStack Query for data fetching
- React Compiler enabled

### Admin

- Vite 7, React 19, TypeScript 5.9
- React Router 7, TanStack Query
- Tailwind CSS 4 with shadcn/ui components
- React Compiler enabled

## Environment Variables

### Backend (`backend/.env`)

Required: `DJANGO_SECRET_KEY`, `DEBUG`, `DJANGO_ALLOWED_HOSTS`, `POSTGRES_*`, `CORS_ALLOWED_ORIGINS`

### Frontend (`frontend/.env`)

Required: `NEXT_PUBLIC_API_URL`

### Admin (`admin/.env`)

Required: `VITE_API_URL`

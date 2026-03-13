# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Next.js 16 customer-facing storefront for Dookan e-commerce platform. See parent `../CLAUDE.md` for full project context.

## Development Commands

```bash
npm run dev     # Start dev server on http://localhost:3000
npm run build   # Production build
npm run lint    # Run ESLint
npm start       # Start production server
```

## Architecture

### Route Groups

- `(auth)/` - Authentication pages (login, register, forgot-password, reset-password)
- `(store)/` - Main store pages with shared Header/Footer layout
- `(store)/(account)/` - Protected user account pages (profile, orders, addresses)

### Data Fetching Pattern

**Server Components (SSR/ISR):** Use `serverApi` from `lib/api/axios.ts`

```typescript
import { productServerApi } from "@/lib/api/products";
const products = await productServerApi.getFeaturedProducts();
```

**Client Components:** Use React Query hooks from `lib/hooks/`

```typescript
import { useProducts } from "@/lib/hooks/useProducts";
const { data, isLoading } = useProducts({ category: "organic" });
```

### API Client Structure

Each domain has two API modules in `lib/api/`:

- `*ServerApi` - For Server Components, uses `serverApi` axios instance
- `*ClientApi` - For Client Components, uses `clientApi` with auth interceptors

### Query Key Factories

Located in each hook file (e.g., `lib/hooks/useProducts.ts`):

```typescript
export const productKeys = {
	all: ["products"] as const,
	lists: () => [...productKeys.all, "list"] as const,
	list: (filters) => [...productKeys.lists(), filters] as const,
	detail: (slug) => [...productKeys.details(), slug] as const,
};
```

### Authentication Flow

- Tokens stored in cookies (`vinMart_access_token`, `vinMart_refresh_token`)
- Auth state managed by Zustand in `lib/store/useAuthStore.ts`
- `AuthInitializer` component hydrates user data on app load
- `clientApi` interceptor handles token refresh on 401 responses

### Form Pattern

Forms use `useZodForm` hook combining react-hook-form + Zod:

```typescript
import { useZodForm } from "@/hooks/useZodForm";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });
const form = useZodForm(schema);
```

## Key Files

- `src/lib/api/axios.ts` - Server/client axios instances with interceptors
- `src/lib/store/useAuthStore.ts` - Auth state management
- `src/config/env.ts` - Environment variable access with ISR revalidation times
- `src/@types/` - TypeScript interfaces for API responses

## Environment Variables

Required in `.env`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Optional:

```
NEXT_PUBLIC_BASE_APP_URL=http://localhost:3000
NEXT_PUBLIC_IMAGE_DOMAIN=your-production-image-domain.com
```

## Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json)

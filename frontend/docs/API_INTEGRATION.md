# API Integration Setup - Next.js + Django E-commerce

## 📋 Overview

This API integration follows industry best practices for a Next.js App Router + Django REST Framework e-commerce application with full SSR/ISR support.

## 🏗️ Architecture

### **Technology Stack**

- **Axios**: HTTP client for both server and client-side requests
- **TanStack Query (React Query v5)**: Data fetching, caching, and state management
- **TypeScript**: Full type safety across API layer
- **Next.js App Router**: SSR, ISR, and Client Components

### **Key Features**

✅ **SSR/ISR Support**: Server-side rendering for SEO-critical pages  
✅ **Optimistic Updates**: Instant UI feedback for better UX  
✅ **Type Safety**: Full TypeScript coverage  
✅ **Error Handling**: Centralized error handling with interceptors  
✅ **Token Refresh**: Automatic JWT token refresh  
✅ **Separation of Concerns**: Dedicated API services per domain

---

## 📦 Installation

```bash
npm install axios @tanstack/react-query @tanstack/react-query-devtools
```

---

## 🗂️ Project Structure

```
src/
├── config/
│   └── env.ts                 # Environment configuration
├── lib/
│   ├── api/
│   │   ├── axios.ts          # Axios instances (server & client)
│   │   ├── products.ts       # Product API service
│   │   ├── categories.ts     # Category API service
│   │   ├── auth.ts           # Authentication API
│   │   ├── cart.ts           # Cart API
│   │   ├── orders.ts         # Orders API
│   │   └── index.ts          # Central exports
│   ├── hooks/
│   │   ├── useProducts.ts    # Product React Query hooks
│   │   ├── useCart.ts        # Cart React Query hooks
│   │   └── useAuth.ts        # Auth React Query hooks
│   ├── providers/
│   │   └── query-provider.tsx # TanStack Query provider
│   └── examples/             # Usage examples
└── types/                     # TypeScript types
```

---

## ⚙️ Configuration

### 1. Environment Variables

Create `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api
API_URL=http://localhost:8000/api

# For production, use internal URL for server-side requests
# INTERNAL_API_URL=http://internal-api:8000/api

# Authentication
NEXT_PUBLIC_AUTH_COOKIE_NAME=access_token
NEXT_PUBLIC_REFRESH_COOKIE_NAME=refresh_token

# ISR Revalidation (in seconds)
REVALIDATE_PRODUCTS=3600      # 1 hour
REVALIDATE_CATEGORIES=7200    # 2 hours
```

### 2. Add Query Provider to Root Layout

Update `src/app/layout.tsx`:

```tsx
import { QueryProvider } from "@/lib/providers/query-provider";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>
				<QueryProvider>{children}</QueryProvider>
			</body>
		</html>
	);
}
```

---

## 🚀 Usage Guide

### **Server Components (SSR/ISR)** - For SEO

Use for:

- Product listing pages
- Product detail pages
- Category pages
- Static content pages

```tsx
// app/products/page.tsx
import { productServerApi } from "@/lib/api";

// Enable ISR
export const revalidate = 3600; // 1 hour

export default async function ProductsPage() {
	// Fetch on server
	const products = await productServerApi.getProducts({ limit: 12 });

	return (
		<div>
			{products.results.map((product) => (
				<ProductCard key={product.id} product={product} />
			))}
		</div>
	);
}

// Generate static params
export async function generateStaticParams() {
	return [{ page: "1" }, { page: "2" }];
}

// SEO metadata
export async function generateMetadata() {
	return {
		title: "Products | VinlandMart",
		description: "Browse our organic products",
	};
}
```

### **Client Components (CSR)** - For Interactivity

Use for:

- Cart management
- User authentication
- Search functionality
- Real-time updates

```tsx
// app/cart/page.tsx
"use client";

import { useCart, useUpdateCartItem } from "@/lib/hooks/useCart";

export default function CartPage() {
	const { data: cart, isLoading } = useCart();
	const updateItem = useUpdateCartItem();

	if (isLoading) return <div>Loading...</div>;

	return (
		<div>
			{cart?.items.map((item) => (
				<div key={item.id}>
					<h3>{item.product.name}</h3>
					<button
						onClick={() =>
							updateItem.mutate({
								itemId: item.id,
								quantity: item.quantity + 1,
							})
						}
					>
						+
					</button>
				</div>
			))}
		</div>
	);
}
```

### **Hybrid Approach** - Best of Both Worlds

```tsx
// app/products/[slug]/page.tsx
import { productServerApi } from "@/lib/api";
import { AddToCartButton } from "./add-to-cart-button";

// Server Component (SSR)
export default async function ProductPage({
	params,
}: {
	params: { slug: string };
}) {
	const product = await productServerApi.getProductBySlug(params.slug);

	return (
		<div>
			<h1>{product.name}</h1>
			<p>৳{product.price}</p>

			{/* Client Component for interactivity */}
			<AddToCartButton productId={product.id} />
		</div>
	);
}

// app/products/[slug]/add-to-cart-button.tsx
("use client");

import { useAddToCart } from "@/lib/hooks/useCart";

export function AddToCartButton({ productId }: { productId: string }) {
	const addToCart = useAddToCart();

	return (
		<button
			onClick={() => addToCart.mutate({ product_id: productId, quantity: 1 })}
			disabled={addToCart.isPending}
		>
			{addToCart.isPending ? "Adding..." : "Add to Cart"}
		</button>
	);
}
```

---

## 🔐 Authentication Flow

### Django Backend Setup (Cookie-based)

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_COOKIE': 'access_token',
    'AUTH_COOKIE_SECURE': True,
    'AUTH_COOKIE_HTTP_ONLY': True,
    'AUTH_COOKIE_SAMESITE': 'Lax',
}
```

### Frontend Usage

```tsx
"use client";

import { useLogin } from "@/lib/hooks/useAuth";

export default function LoginPage() {
	const login = useLogin();

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);

		login.mutate({
			email: formData.get("email") as string,
			password: formData.get("password") as string,
		});
	};

	return (
		<form onSubmit={handleSubmit}>
			<input name="email" type="email" required />
			<input name="password" type="password" required />
			<button type="submit" disabled={login.isPending}>
				{login.isPending ? "Logging in..." : "Login"}
			</button>
		</form>
	);
}
```

---

## 🎯 Best Practices

### 1. **Use Server Components by Default**

- Better SEO
- Faster initial page load
- Reduced JavaScript bundle size

### 2. **Use Client Components for Interactivity**

- User interactions (cart, wishlist)
- Real-time updates
- Form submissions with optimistic updates

### 3. **Implement ISR for Dynamic Content**

```tsx
export const revalidate = 3600; // Revalidate every hour
```

### 4. **Use Optimistic Updates for Better UX**

```tsx
const updateItem = useUpdateCartItem(); // Already implements optimistic updates
```

### 5. **Handle Errors Gracefully**

```tsx
const { data, error, isLoading } = useProducts();

if (error) return <ErrorMessage />;
if (isLoading) return <Skeleton />;
```

### 6. **Prefetch Data for Better Performance**

```tsx
// In a parent component
const queryClient = useQueryClient();

queryClient.prefetchQuery({
	queryKey: productKeys.detail(slug),
	queryFn: () => productClientApi.getProductBySlug(slug),
});
```

---

## 🔄 Data Flow

### Server-Side (SSR/ISR)

```
User Request → Next.js Server → serverApi → Django API → Response → HTML
```

### Client-Side (CSR)

```
User Action → React Query → clientApi → Django API → Cache Update → UI Update
```

---

## 📊 Performance Optimization

### 1. **ISR Configuration**

```tsx
// Revalidate product pages every hour
export const revalidate = 3600;

// No cache for user-specific pages
export const revalidate = 0;
```

### 2. **Query Caching**

```tsx
// Products cached for 5 minutes
staleTime: 5 * 60 * 1000;

// Cart cached for 1 minute
staleTime: 1 * 60 * 1000;
```

### 3. **Static Generation**

```tsx
export async function generateStaticParams() {
	const products = await productServerApi.getProducts({ limit: 100 });
	return products.results.map((p) => ({ slug: p.slug }));
}
```

---

## 🐛 Debugging

### Enable React Query Devtools

Already included in development mode:

```tsx
// lib/providers/query-provider.tsx
{
	process.env.NODE_ENV === "development" && (
		<ReactQueryDevtools initialIsOpen={false} />
	);
}
```

### Check Network Requests

All API errors are logged to console:

```tsx
console.error("[Server API Error]:", { url, status, message });
console.error("[Client API Error]:", { url, status, message, data });
```

---

## 🚨 Common Issues & Solutions

### Issue: "Cookies not being sent"

**Solution**: Ensure `withCredentials: true` in axios config (already set)

### Issue: "CORS errors"

**Solution**: Configure Django CORS:

```python
CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
CORS_ALLOW_CREDENTIALS = True
```

### Issue: "Token refresh not working"

**Solution**: Check Django JWT settings and cookie configuration

### Issue: "Hydration errors with Server Components"

**Solution**: Don't use client-side hooks in Server Components

---

## 📚 Additional Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Axios Documentation](https://axios-http.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)

---

## 🎓 Next Steps

1. ✅ Install dependencies: `npm install axios @tanstack/react-query`
2. ✅ Set up environment variables
3. ✅ Add QueryProvider to root layout
4. ✅ Start using Server Components for SEO pages
5. ✅ Use Client Components for interactive features
6. ✅ Configure Django backend for cookie-based auth
7. ✅ Test API integration with your Django backend

---

**Need help?** Check the example files in `src/lib/examples/`

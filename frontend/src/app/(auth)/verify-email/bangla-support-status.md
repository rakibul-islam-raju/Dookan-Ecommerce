# Bangla Support Status

## Done

- Added bilingual locale routing with explicit `/en/...` and `/bn/...` storefront, auth, and account URLs.
- Added locale redirect behavior:
  - `/` redirects to `/bn`
  - legacy unprefixed routes like `/shop`, `/cart`, and `/login` still resolve via redirect behavior
- Integrated `next-intl` and added translation message files:
  - `frontend/src/messages/en.json`
  - `frontend/src/messages/bn.json`
- Added centralized i18n helpers and locale-aware navigation:
  - `frontend/src/i18n/routing.ts`
  - `frontend/src/i18n/navigation.ts`
  - `frontend/src/i18n/request.ts`
- Made the root layout locale-aware with Bangla-capable font loading and per-locale message hydration.
- Added `[locale]` route wrappers so existing pages work under localized URLs.
- Added localized SEO infrastructure:
  - locale-aware metadata helper in `frontend/src/lib/seo.ts`
  - localized metadata copy in `frontend/src/i18n/page-metadata.ts`
  - `frontend/src/app/robots.ts`
  - `frontend/src/app/sitemap.ts`
- Added a locale switcher in the header.
- Updated shared navigation and common components to preserve locale:
  - header
  - footer
  - logo links
  - bottom nav
  - account button
  - category menus
  - cart drawer
  - wishlist and login redirects
- Localized an initial batch of UI copy:
  - auth layout, pages, and forms
  - header and footer labels
  - guest order tracking flow
  - account navigation labels
- Installed `next-intl` and updated frontend config:
  - `frontend/package.json`
  - `frontend/next.config.ts`
- Fixed build and type issues encountered during rollout, including sitemap typing and mock product data.
- Verified the frontend:
  - `pnpm lint` passes with warnings
  - `pnpm build` passes

## Left To Do

- Translate the remaining page-level English UI copy across the storefront.
- Translate remaining status, error, empty, and loading text in:
  - cart
  - checkout
  - wishlist
  - orders
  - order details
  - product detail
  - shop filters
  - quick view modal
- Move remaining hardcoded strings into translation files.
- Review untouched `Link`, `router.push`, and `redirect` calls to ensure locale preservation everywhere.
- Expand localized metadata coverage for more pages beyond the initial high-priority routes.
- Improve localized structured data coverage so more schema text is translated, not only URLs and route-level metadata.
- Add deeper `hreflang` coverage for all dynamic route variants if full SEO parity is required.
- Improve build-time fallback behavior when the backend API is unavailable so build logs are quieter.
- Clean up current lint warnings, mainly around hook dependencies and unused code.

## Optional Future Work

- Add localized pathname support.
- Add backend-translated product, category, banner, and site-config content.
- Add locale-aware product and category slugs.
- Add richer sitemap alternates per locale entry.
- Add stronger server-side locale persistence based on cookie or request negotiation.

## Current State

The bilingual architecture is in place and working. The app now supports locale-prefixed Bangla and English routing, locale-aware navigation, message loading, a visible language switcher, and core SEO plumbing. The remaining work is mostly completeness: translating the rest of the UI and expanding SEO and localization coverage across all pages.

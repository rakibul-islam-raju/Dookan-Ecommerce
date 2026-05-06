# Repository Guidelines

## Project Structure & Module Organization

This app is a Next.js 16 storefront. Route segments and API handlers live in `src/app/`, including grouped routes such as `src/app/(store)` and `src/app/(auth)`. Reusable UI lives in `src/components/`, with shared primitives under `src/components/ui/`. State, providers, and API helpers are in `src/lib/` (`api/`, `providers/`, `store/`, `hooks/`). Static assets are split between `public/` for directly served files and `src/assets/images/` for imported images. Keep configuration and constants in `src/config/` and `src/constants/`.

## Build, Test, and Development Commands

- `pnpm dev` - start the local dev server on `http://localhost:3000`.
- `pnpm build` - create the production build; use this before submitting changes that affect routing or rendering.
- `pnpm start` - run the production build locally after `pnpm build`.
- `pnpm lint` - run ESLint across the project.

Install dependencies with `pnpm install`. Prefer `pnpm` here because the repo already includes `pnpm-lock.yaml`.

## Coding Style & Naming Conventions

Use TypeScript and follow the existing Next.js App Router structure. Prefer `PascalCase` for React components (`StoreHeader.tsx`), `camelCase` for hooks and utilities, and lowercase route folder names in `src/app/`. Use 2-space indentation in TS/TSX files to match the existing frontend toolchain. Reuse local UI patterns from `src/components/ui/`, and prefer `lucide-react` icons over custom SVGs when possible.

## Testing Guidelines

There is no dedicated frontend test runner configured in this app. Treat `pnpm lint` and `pnpm build` as the minimum validation for every change. For UI-heavy updates, verify the affected pages manually in the dev server and note the paths tested in your PR.

## Commit & Pull Request Guidelines

Follow Conventional Commit style, for example: `feat: add featured products carousel` or `fix: handle expired auth token`. Keep pull requests focused, summarize the user-facing change, list touched areas, and link related issues. Include screenshots or short recordings for UI changes, plus the commands you ran (`pnpm lint`, `pnpm build`).

## Security & Configuration Tips

Do not commit secrets, `.env` files, build output, or dependency caches. Review `next.config.ts` and any API client changes in `src/lib/api/` carefully when modifying runtime behavior or external integrations.

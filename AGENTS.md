Agent Guidelines for this Repository

Scope: This file applies to the entire repository.

Project Summary
- Tech: React 19, TypeScript, Vite 7, React Router 7, TanStack Query, React Hook Form + Zod, Tailwind CSS 4, Radix UI/Shadcn components, Axios.
- Entry points: `index.html`, `src/App.tsx`, router in `src/routes/Routes.tsx`.
- Build tooling: Vite with SWC, Tailwind via `@tailwindcss/vite`, ESLint (TypeScript + React Hooks + React Refresh).

Run, Build, Lint
- Dev server: `pnpm dev` or `npm run dev`.
- Build: `pnpm build` or `npm run build` (runs `tsc -b` then `vite build`).
- Preview: `pnpm preview` or `npm run preview`.
- Lint: `pnpm lint` or `npm run lint`.

Environment
- Primary variables are defined in `src/config/environments.ts` and read from `import.meta.env`:
  - `VITE_API_BASE_URL` (required) – Base URL for API requests.
  - `VITE_GOOGLE_CLIENT_ID` (optional)
  - `VITE_ENCRYPTION_KEY` (optional)
  - `VITE_WEBSOCKET_URL` (optional)
  - `VITE_PRODUCTION` (optional boolean)
- Local env files: `.env.development`, `.env.production`.
- Vite base path: `vite.config.ts` sets `base: '/test/'`. Update this for deployments as needed.

Source Layout (high‑level)
- `src/components/ui/*`: Shadcn/Radix-based primitives. Keep API stable; prefer composing rather than modifying.
- `src/components/form/*`: Form wrappers built on React Hook Form + UI primitives.
- `src/features/<domain>/`:
  - `components/` – domain UI.
  - `pages/` – route-level views.
  - `hooks/` – TanStack Query hooks and local state helpers.
  - `services/` – Axios-based API access for the domain.
  - `schemas/` – Zod schemas.
  - `types/` – TypeScript types.
- `src/config/` – runtime configuration and route config.
- `src/contexts/` – React Contexts (Auth, Permission, Theme, FormSheet).
- `src/lib/` – shared libs (axios client, utils, toast, etc.).
- `src/routes/Routes.tsx` – app routing, lazy loading, and auth redirects.
- `src/pages/` – top-level pages (Login, Dashboard, etc.).

 Coding Conventions
- TypeScript: strict mode; never use `any`. Prefer precise types or `unknown` with proper narrowing. Use feature-level `types/` and shared types in `src/shared/types/`.
- File naming:
  - Components: PascalCase file names (e.g., `MyWidget.tsx`).
  - Hooks: `use*.ts(x)` (e.g., `useThing.ts`).
  - Zod schemas: `*.schema.ts`.
  - Types: `*.types.ts`.
- Imports: use `@/` alias for paths under `src/` (configured in `tsconfig*`).
- UI:
  - Compose with `src/components/ui/*` primitives; do not fork their internal API unless necessary.
  - Use Tailwind utility classes; favor composition over deep overrides.
  - Inputs: for all user-facing inputs, use floating form wrappers from `src/components/form/*` (`FormFloatingInput`, `FormFloatingSelect`, `FormFloatingDatePicker`, etc.). Avoid using `src/components/ui/input` directly in pages/features.
- Forms:
  - Prefer `src/components/ui/form.tsx` utilities (`Form`, `FormField`, etc.).
  - Use wrapper components in `src/components/form/*` for common patterns (floating labels, selects, date pickers).
  - Validation: use Zod with `@hookform/resolvers/zod` where possible.
- Data fetching/state:
  - Use TanStack Query for server state. Key structure: `['domain', filters, pagination]`.
  - Invalidate/prefetch via `useQueryClient` in hooks.
  - Use React Contexts for cross-cutting app state (auth, permissions, theme, form sheets).

API Layer
- Preferred axios instance: `src/lib/api.ts` (baseURL from config, request/response interceptors). Some code also references `src/service/api.ts`; treat that as legacy and avoid introducing new references to it. When refactoring, consolidate on `src/lib/api.ts`.
- Services live in `src/features/<domain>/services/*` and should:
  - Be class-based or module-level functions encapsulating endpoints.
  - Return parsed `data` payloads (not raw axios responses).
  - Accept filter/pagination objects where relevant.

Routing
- Route configuration lives in `src/config/routes.ts`; `src/routes/Routes.tsx` renders from that config and applies role-based filtering.
- When adding a new page:
  - Create the page component under its feature at `features/<domain>/pages/*`.
  - Lazy-load via route config and provide `id`, `path`, `name`, `icon`, `roles`, and optional `children`.

Performance & Bundling
- Vite `manualChunks` is configured for `react` and common UI primitives. Keep imports stable to preserve chunking.
- Prefer code-splitting via `lazy(() => import(...))` for route-level components.

Testing
- No dedicated test setup is present. If adding tests, follow the repository’s structure and do not introduce new tooling without confirmation.

PR/Change Etiquette for Agents
- Keep changes focused and minimal; do not refactor unrelated areas.
- Follow the naming and structure conventions above.
- Prefer `src/lib/api.ts` over `src/service/api.ts` for new code.
- Do not remove or rewrite UI primitives under `src/components/ui/` unless explicitly requested.
- Update docs when adding new environment variables, scripts, or top-level folders.

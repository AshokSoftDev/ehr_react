# React App Structure & Logic

This document summarizes the folder structure and core logic patterns used in the React module.

## Tech Overview
- React 19, TypeScript, Vite 7 (SWC)
- Routing: React Router 7
- Server state: TanStack Query v5
- Forms: React Hook Form + Zod
- UI: Tailwind CSS 4, Radix UI/Shadcn primitives
- HTTP: Axios instance with interceptors

TypeScript Policy
- Never use `any`. Prefer precise types or `unknown` with proper narrowing.

## Key Entry Points
- HTML shell: `react/index.html`
- App root: `react/src/App.tsx`
- Router: `react/src/routes/Routes.tsx`
- Route config: `react/src/config/routes.ts`

## Source Layout
- `react/src/components/ui/*`: Reusable UI primitives (alert, dialog, form, table, etc.). Prefer composition over modification.
- `react/src/components/form/*`: Form wrappers on top of RHF + UI primitives (floating inputs, selects, date pickers).
- `react/src/features/<domain>/`
  - `components/`: Feature UI
  - `pages/`: Route-level components
  - `hooks/`: Data fetching (TanStack Query) and local state hooks
  - `services/`: Axios-based API access
  - `schemas/`: Zod validation schemas
  - `types/`: TypeScript types
  - Example domains:
    - `features/appointments`: appointment calendar + table views
    - `features/groups`: group + permissions management
    - `features/locations`: Location master CRUD (backed by `/master/location` API)
- `react/src/config/`: Runtime configuration (`environments.ts`) and routes (`routes.ts`).
- `react/src/contexts/`: Cross-cutting React Contexts (Auth, Permissions, Theme, FormSheet).
- `react/src/lib/`: Shared libs (Axios instance, utilities, toast).
- `react/src/pages/`: Top-level pages like Login, Dashboard.
- `react/src/utils/`: Helpers (routing utils, crypto, timezone, etc.).

## Routing & Navigation
- Route configuration is centralized in `react/src/config/routes.ts`. Each entry provides `id`, `path`, `name`, `icon`, `roles`, optional `children`, and a lazily imported `component`.
- Rendering is handled by `react/src/routes/Routes.tsx` which:
  - Applies role-based filtering via `filterRoutesByRole` (`react/src/utils/routeUtils.ts`).
  - Lazily loads route components with `<Suspense>` and `PageSkeleton` fallback.
  - Provides a main `Layout` wrapper for authenticated sections.

## HTTP & API Layer
- Preferred Axios instance: `react/src/lib/api.ts`
  - `baseURL` from `react/src/config/environments.ts`
  - Request interceptor adds `Authorization` header when token is present.
  - Response interceptor can transparently decrypt payloads when `encryptedData` is returned.
- Feature services live under `react/src/features/<domain>/services/*` and should return parsed `data` payloads.

## Server State & Caching (TanStack Query v5)
- `QueryClient` is created and provided in `react/src/App.tsx`.
- Recommended defaults (set in `QueryClient`):
  - `staleTime`: reduce refetching for recent data.
  - `gcTime`: let unused caches be collected sooner when memory pressure is a concern.
  - `refetchOnWindowFocus: false` where appropriate.
- Use `useQuery`/`useInfiniteQuery` inside feature hooks (e.g., `features/users/hooks/*`).
- Use query keys like `['domain', params]` and invalidate via `useQueryClient`.

## Forms & Validation
- Use `react/src/components/ui/form.tsx` primitives (`Form`, `FormField`, etc.).
- Prefer Zod schemas under `schemas/*` with `@hookform/resolvers/zod`.

## Contexts
- Permissions: `react/src/contexts/PermissionContext/index.tsx` fetches and exposes role/module access. Use `usePermissions()` to guard UI/route visibility.
- Theme: `react/src/contexts/ThemeContext.tsx` and a `ThemeProvider`.
- Form sheets: `react/src/contexts/FormSheetContext/*` manages open/close state for feature sheets.

## UI Composition
- Build complex UIs from `react/src/components/ui/*` (Radix/Shadcn). Keep their APIs stable and compose for custom behavior.

## Adding a New Feature
1. Create `react/src/features/your-feature/{components,pages,hooks,services,schemas,types}`.
2. Add a route in `react/src/config/routes.ts` (lazy import, roles, nav visibility).
3. Implement API access in `services/*` using `react/src/lib/api.ts`.
4. Use TanStack Query in `hooks/*` and export typed hooks for pages/components.
5. Follow naming conventions (PascalCase components, `use*.ts(x)` hooks, `*.schema.ts`, `*.types.ts`).

EHR React Frontend (Vite + TypeScript)

Overview
- Modern React 19 + TypeScript app powered by Vite 7.
- UI built with Tailwind CSS 4 and Radix/Shadcn primitives.
- Routing via React Router 7; data fetching with TanStack Query.
- Forms powered by React Hook Form and Zod validation.

Quick Start
1) Install dependencies
   - npm: `npm install`
   - pnpm: `pnpm install`

2) Configure environment
   - Copy `.env.development` and update values as needed (see Environment section).

3) Run the dev server
   - `npm run dev` (or `pnpm dev`)
   - Open the printed local URL in your browser.

Scripts
- `dev` – start Vite dev server with HMR.
- `build` – type-check (`tsc -b`) and create a production build with Vite.
- `preview` – preview the production build locally.
- `lint` – run ESLint on the project.

Environment
Runtime config is read from `import.meta.env` and defined in `src/config/environments.ts`.
- `VITE_API_BASE_URL` (required): Base URL for API, e.g. `https://example.com/api/v1/`.
- `VITE_GOOGLE_CLIENT_ID` (optional): Google OAuth Client ID.
- `VITE_ENCRYPTION_KEY` (optional): Symmetric key for optional payload encryption.
- `VITE_WEBSOCKET_URL` (optional): WebSocket endpoint, e.g. `wss://example.com/socket`.
- `VITE_PRODUCTION` (optional): `true` or `false`.

Notes
- The Vite base path is set to `'/test/'` in `vite.config.ts`. Change it for your deployment context if needed.
- Example env files: `.env.development`, `.env.production`.

Project Structure
```
src/
  components/
    form/                # Form wrappers (floating inputs, selects, date pickers)
    ui/                  # Shadcn/Radix primitives (buttons, inputs, dialogs, etc.)
  config/                # Environment and route config
  contexts/              # App contexts (Auth, Permission, Theme, FormSheet)
  features/
    doctors/             # Domain feature (components, hooks, pages, schemas, services, types)
    patients/
    users/
    groups/
    appointments/
    visits/
    locations/           # Location master (CRUD UI, filters; uses /master/location API)
  hooks/                 # Reusable hooks
  lib/                   # Axios client, utilities, toast helpers
  pages/                 # Top-level pages (Login, Dashboard)
  routes/                # App router and utilities
  styles/                # Global styles (e.g., toast.css)
  utils/                 # Common helpers (routes, crypto, timezone, etc.)
```

Development Workflow
- Routing: Define route entries in `src/config/routes.ts`. `src/routes/Routes.tsx` lazy-loads components and applies role-based filtering.
- Data fetching: Use TanStack Query hooks under each feature (e.g., `src/features/doctors/hooks/useDoctors.ts`). Keep stable `queryKey`s and prefetch adjacent pages when appropriate.
- Services: Implement domain services under `src/features/<domain>/services/*` and use the shared axios instance from `src/lib/api.ts`.
  - Example: `src/features/locations/services/location.service.ts` wraps the `/master/location` CRUD API.
- Forms: Use `src/components/ui/form.tsx` primitives (`Form`, `FormField`, `FormControl`, etc.) and the higher-level wrappers in `src/components/form/*`. Prefer Zod schemas in `schemas/` and `@hookform/resolvers/zod` for validation.
- UI: Compose using `src/components/ui/*` primitives and Tailwind utilities. Avoid modifying primitive component APIs unless necessary.

Conventions
- Components: PascalCase file names (e.g., `UserForm.tsx`).
- Hooks: `use*.ts(x)` (e.g., `useUsers.ts`).
- Schemas: `*.schema.ts`; Types: `*.types.ts`.
- Imports: Use `@/` alias for `src/` (configured in `tsconfig*`).

Deployment
- Adjust `base` in `vite.config.ts` to match your hosting path (current: `'/test/'`).
- Build with `npm run build` and serve the `dist/` directory.

Troubleshooting
- API calls: Confirm `VITE_API_BASE_URL` is reachable and CORS-enabled.
- Auth headers: `src/lib/api.ts` attaches `Authorization: Bearer <token>` from `sessionStorage` (`access_token`). Some legacy code uses `src/service/api.ts` with `localStorage`; prefer `src/lib/api.ts` for new work.
- Styles: Tailwind v4 is integrated via the Vite plugin; no separate config file is required.

For Contributors
- See `AGENTS.md` for detailed conventions and guardrails for changes.
- Primary development happens on the `dev` branch. Create feature branches from `dev`
  and open pull requests back into it before merging changes to production branches.
- Configure the `origin` remote before pushing changes:
  1. `git remote add origin https://github.com/user/ehr_react.git`
  2. `git push -u origin dev`

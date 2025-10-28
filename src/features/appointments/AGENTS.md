Appointments Feature — Agent Context & Memory Guidelines

Scope: This file applies to files under this folder.

Server State & Cache
- Use TanStack Query for appointments data (never store lists in React Context).
- Query keys: ['appointments', filters], ['appointment', id].
- Defaults: staleTime 30s, gcTime 120s, refetchOnWindowFocus false, retry 1.
- Prefer select to drop unused fields; removeQueries(['appointments']) on hard navigations if needed.

React Context
- Keep context small (UI flags only). Do not put appointment arrays or large objects in context.

Forms — Use Floating Inputs Only
- Always use components in src/components/form/* for user input:
  - Text/number/time: FormFloatingInput
  - Select/combobox: FormFloatingSelect or FormSearchSelectWithCreate
  - Date: FormFloatingDatePicker
- Do not use components/ui/input directly for end‑user inputs in this feature.

TypeScript — No `any`
- Do not use `any` in this feature. Prefer precise types or `unknown` with narrowing.
- React Hook Form: type `useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>` and pass `control: Control<TFieldValues, unknown, TFieldValues>` to inputs to avoid `any`.
- Zod: rely on schema inference; avoid manual `as any` casts.

UI & Performance
- Virtualize long lists; lazy‑load heavy subtrees and images.
- Keep item components pure/memoized; avoid prop churn in lists.

API & Permissions
- Use src/lib/api.ts for HTTP. Guard UI and routes with usePermissions().

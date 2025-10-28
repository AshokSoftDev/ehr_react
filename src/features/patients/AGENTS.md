Patients Feature — Agent Context & Memory Guidelines

Scope: This file applies to files under this folder.

Server State & Cache
- Manage patient data with TanStack Query.
- Query keys: ['patients', filters], ['patient', id], plus subresources like ['patient-docs', id], ['patient-vitals', id].
- Defaults: staleTime 30s, gcTime 120s, refetchOnWindowFocus false, retry 1.
- Use select to strip unused fields; removeQueries on hard nav if memory pressure.

React Context
- Do not store patient lists/details in context. Context is for small UI flags only.

Forms — Use Floating Inputs Only
- Required: use FormFloatingInput, FormFloatingSelect/FormSearchSelectWithCreate, FormFloatingDatePicker for every user input.
- Avoid components/ui/input directly in this feature.

TypeScript — No `any`
- Never use `any`. Prefer `unknown` with narrowing or precise types.
- RHF: `useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>`; inputs accept `Control<TFieldValues, unknown, TFieldValues>`.
- Do not cast with `as any`; use Zod output types.

UI & Performance
- Virtualize long lists (history, notes, documents). Memoize item components; lazy‑load media viewers.

API & Permissions
- Use src/lib/api.ts. Enforce access via usePermissions() when showing PHI.

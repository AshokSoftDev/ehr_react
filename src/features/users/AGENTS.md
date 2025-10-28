Users Feature — Agent Context & Memory Guidelines

Scope: This file applies to files under this folder.

Server State & Cache
- Use TanStack Query for users and related resources.
- Query keys: ['users', filters], ['user', id].
- Defaults: staleTime 30s, gcTime 120s, refetchOnWindowFocus false, retry 1.

React Context
- Do not store user lists/profiles in context; limit context to UI flags.

Forms — Use Floating Inputs Only
- All user‑facing inputs must use src/components/form/* wrappers:
  - FormFloatingInput, FormFloatingSelect/FormSearchSelectWithCreate, FormFloatingDatePicker.
- Do not use components/ui/input directly.

TypeScript — No `any`
- Never use `any`. Use precise types or `unknown` with narrowing.
- RHF: `useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>`; inputs accept `Control<TFieldValues, unknown, TFieldValues>`.
- Avoid `as any`; rely on Zod inference and typed services.

UI & Performance
- Virtualize large lists and tables; memoize rows; lazy‑load detail panels.

API & Permissions
- Use src/lib/api.ts and guard UX with usePermissions().

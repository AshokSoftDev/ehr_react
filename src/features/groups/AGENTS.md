Groups Feature — Agent Context & Memory Guidelines

Scope: This file applies to files under this folder.

Server State & Cache
- Use TanStack Query for groups and permissions.
- Query keys: ['groups', filters], ['group', id], ['group-permissions', id].
- Defaults: staleTime 30s, gcTime 120s, refetchOnWindowFocus false, retry 1.

React Context
- Keep context minimal; do not put full permissions matrices or lists here. Fetch via queries and map locally.

Forms — Use Floating Inputs Only
- Use: FormFloatingInput, FormFloatingSelect/FormSearchSelectWithCreate, FormFloatingDatePicker.
- Do not use components/ui/input directly for user input.

TypeScript — No `any`
- Do not use `any`. Use precise types or `unknown` and narrow.
- RHF: `useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>` and `Control<TFieldValues, unknown, TFieldValues>` in inputs.
- Avoid `as any` casts; leverage Zod inference.

UI & Performance
- Virtualize long permission tables; memoize cells; lazy‑load configuration panes.

API & Permissions
- Use src/lib/api.ts. Respect usePermissions() when rendering/administering groups.

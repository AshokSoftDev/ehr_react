Doctors Feature — Agent Context & Memory Guidelines

Scope: This file applies to files under this folder.

Server State & Cache
- Use TanStack Query for doctors data.
- Query keys: ['doctors', filters], ['doctor', id].
- Defaults: staleTime 30s, gcTime 120s, refetchOnWindowFocus false, retry 1.
- Use select to shrink payloads and structural sharing.

React Context
- Avoid storing doctor lists/profiles in context; only minimal UI flags belong in context.

Forms — Use Floating Inputs Only
- Always use src/components/form/* wrappers:
  - FormFloatingInput, FormFloatingSelect/FormSearchSelectWithCreate, FormFloatingDatePicker.
- Do not use components/ui/input directly in this feature.

TypeScript — No `any`
- Never use `any`. Prefer exact types or `unknown` with narrowing.
- RHF typing: `useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>`; inputs accept `Control<TFieldValues, unknown, TFieldValues>`.
- Avoid `as any` casts; refine types at boundaries.

UI & Performance
- Virtualize long tables/grids; memoize row/item components; lazy‑load heavy subtrees.

API & Permissions
- Use src/lib/api.ts for HTTP. Apply usePermissions() for feature/submodule controls.

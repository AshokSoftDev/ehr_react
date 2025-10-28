Shared Feature — Agent Context & Memory Guidelines

Scope: This file applies to files under this folder.

Purpose
- This folder holds shared types/utilities. Avoid introducing heavy state, context providers, or feature‑specific caches here.

React Context & Memory
- Keep shared context providers minimal and stable if added; avoid storing large arrays/blobs.

Forms — Use Floating Inputs Only
- When adding shared form components, ensure they wrap the floating primitives (FormFloatingInput, FormFloatingSelect, FormFloatingDatePicker) to keep UX consistent repository‑wide.

API
- Do not add new axios instances here; import and reuse src/lib/api.ts.

TypeScript — No `any`
- Do not introduce `any` in shared code. Prefer exact types or `unknown` with narrowings.
- Keep generic helpers well‑typed; avoid escape hatches like `as any`.

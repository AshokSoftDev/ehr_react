# Feed Agent — Overview & Implementation Guide

This document defines the client-side “Feed Agent”: the pattern for fetching, caching, and rendering a personalized activity/content feed in this app, aligned with existing architecture and conventions.

## Goals
- Consistent, modular feature structure under `src/features/feed/*`.
- Efficient server-state handling with TanStack Query v5.
- Minimal React Context usage; prefer query cache and local state.
- Scalable UI using virtualization and lazy loading.
- TypeScript: never use `any`; prefer precise types or `unknown` with narrowing.

## Proposed Structure
```
react/src/features/feed/
  components/
    FeedList.tsx
    FeedItem.tsx
  pages/
    FeedPage.tsx
  hooks/
    useFeed.ts
    useFeedFilters.ts
  services/
    feed.service.ts
  schemas/
    feed.schema.ts
  types/
    feed.types.ts
```

## Data Flow
- Service (`services/feed.service.ts`)
  - Encapsulate HTTP calls using `react/src/lib/api.ts`.
  - Example endpoints: `GET /feed` (paged), `GET /feed/:id`, `POST /feed/ack`.
- Hook (`hooks/useFeed.ts`)
  - Use `useInfiniteQuery` with a key like `['feed', filters]`.
  - Provide `data`, `fetchNextPage`, `hasNextPage`, `isFetchingNextPage`.
  - Apply `select` to map the response to a minimal shape.
- Components
  - `FeedList.tsx`: renders a virtualized list; appends pages via `fetchNextPage`.
  - `FeedItem.tsx`: pure, memo-friendly item renderer.
  - `FeedPage.tsx`: wires filters + list, lazy-loaded via route config.

## Query & Cache Settings (v5)
- Query key: `['feed', filters]` where `filters` is a stable object.
- Suggested defaults:
  - `staleTime: 30_000` — avoid noisy refetching.
  - `gcTime: 120_000` — free unused pages sooner under memory pressure.
  - `refetchOnWindowFocus: false` for a smoother UX.
  - `retry: 1` with exponential backoff for transient errors.
- Infinite queries:
  - `getNextPageParam: (lastPage) => lastPage.nextCursor ?? null`.
  - `initialPageParam: null` (cursor) or `1` (offset).
  - Use `select` to flatten pages if the consumer wants a single array.

## Permissions & Visibility
- Use `usePermissions()` from `react/src/contexts/PermissionContext/index.tsx` to guard:
  - `FeedPage` route visibility in `react/src/config/routes.ts`.
  - Feature buttons (e.g., acknowledge/like) per module/submodule.

## Error & Toasts
- Centralize error handling; call `toast.error` from `react/src/lib/toast.ts`.
- Normalize API errors in the service before returning to hooks.

## Example Sketches

Service (`services/feed.service.ts`):
```ts
import { api } from '@/lib/api';
import type { FeedItem, FeedPage } from '../types/feed.types';

export async function fetchFeed(params: { cursor?: string|null; limit?: number; filters?: Record<string, unknown> }): Promise<FeedPage> {
  const { data } = await api.get('/feed', { params });
  return data.data as FeedPage;
}
```

Hook (`hooks/useFeed.ts`):
```ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchFeed } from '../services/feed.service';

export function useFeed(filters: Record<string, unknown>) {
  return useInfiniteQuery({
    queryKey: ['feed', filters],
    queryFn: ({ pageParam }) => fetchFeed({ cursor: pageParam ?? null, limit: 20, filters }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor ?? null,
    staleTime: 30_000,
    gcTime: 120_000,
    select: (data) => ({
      ...data,
      pages: data.pages.map(p => ({ items: p.items, nextCursor: p.nextCursor }))
    }),
  });
}
```

List (`components/FeedList.tsx`):
```tsx
// Render a flat list from infinite pages; consider virtualization
```

## UI & Performance
- Prefer virtualization (e.g., `@tanstack/react-virtual` or `react-virtuoso`) for long feeds.
- Lazy load images and heavy sub-components.
- Keep items pure (`React.memo`) and avoid prop churn.

## Routing
- Add a nav entry in `react/src/config/routes.ts` under an appropriate module; lazy import `FeedPage`.

## Testing Notes
- Start with interaction tests around pagination, filters, and virtualization boundary conditions.
- Keep the API layer mockable (service functions return plain data).

For memory optimization and React Context guidance, see: `react/docs/feed-agent-context-memory.md`.

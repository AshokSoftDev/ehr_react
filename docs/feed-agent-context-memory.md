# Feed Agent — Context & Memory Optimization

This document details strategies to reduce memory usage and unnecessary re-renders when building the Feed feature. It aligns with the app’s patterns (TanStack Query v5, minimal React Context, lazy loading).

## Principles
- Keep server-state in TanStack Query, not React Context.
- Keep contexts small and stable; avoid large arrays/objects.
- Prefer memoized, pure UI components and virtualization for lists.
- Proactively control query cache lifetimes and shapes.
- TypeScript: never use `any`; prefer `unknown` with narrowing or exact types.

## React Context Best Practices
- Do not store the feed list in context. Context is for small, cross-cutting state (e.g., theme, permissions, lightweight UI flags).
- If you need global feed-related state, store only minimal primitives (e.g., current filter ids, sort key). Keep large results in the query cache.
- Memoize provider values: `const value = useMemo(() => ({ a, b, c }), [a,b,c])` to avoid new object identities each render.
- Split concerns across multiple contexts if one grows large; consumers only subscribe to what they need.
- Avoid closures capturing large data; derive computed values lazily inside consumers.

## TanStack Query v5 Settings
- Configure the global `QueryClient` in `react/src/App.tsx` with memory-aware defaults:
```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 120_000, // collect unused caches sooner
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```
- For feed queries:
  - Use `useInfiniteQuery` and return minimal page shapes via `select` (e.g., keep only `items` and `nextCursor`).
  - Use `placeholderData` for UX without duplicating large arrays when refetching.
  - Prefer `structuralSharing: true` (default) to reuse references and reduce allocations when data is unchanged.
  - Clear feed cache on hard navigations if memory is tight: `queryClient.removeQueries({ queryKey: ['feed'] })`.

## Component-Level Optimizations
- Virtualize long lists (e.g., `@tanstack/react-virtual` or `react-virtuoso`). Render only visible rows to cap DOM and memory.
- Keep `FeedItem` pure and small:
  - `export default memo(FeedItem)` and ensure props are primitives or stable references.
  - Avoid inline functions/objects in large lists; lift them or wrap with `useCallback`/`useMemo`.
- Lazy-load heavy subtrees (media viewers, editors) and images (`loading="lazy"`).
- Use CSS containment for large list containers where useful.

## Data Shape & Normalization
- Normalize items if the payload has repeated nested structures; store IDs and minimal references in component state if needed.
- Use `select` in queries to drop unused fields early:
```ts
select: (data) => ({
  pageParams: data.pageParams,
  pages: data.pages.map(p => ({ items: p.items.map(({ id, title, ts }) => ({ id, title, ts })), nextCursor: p.nextCursor })),
})
```

## Pagination & Windowing
- Keep page size modest (e.g., 20–30) to balance network vs. memory.
- If users rarely scroll back far, consider limiting retained pages and offering a “Back to top” that refetches.
- Reset the infinite list on filter changes (`queryClient.invalidateQueries({ queryKey: ['feed'] })`).

## Abort & Cleanup
- Use `AbortController` (Axios supports `signal`) to cancel in-flight requests on unmount or filter changes to avoid dangling work.
- Remove subscriptions/timers in `useEffect` cleanups to prevent leaks.

## When to Use Context
- Cross-cutting, lightweight feed preferences (e.g., compact mode toggle) can live in a small context.
- Avoid storing arrays of items or media blobs in context.

Applying the above preserves responsiveness while keeping memory usage predictable, especially on low-end devices or long-running sessions.

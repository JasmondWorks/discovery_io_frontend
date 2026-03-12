# How to Add New Endpoints Using the API Layer & React Query

This project uses a tailored Axios API layer for secure token management, wrapped with **React Query** for global data fetching, caching, and state management. When adding new endpoints, follow this clean separation of concerns.

## 1. Create a Specific API Module

Organize your fetching functions based on the resource (e.g., `booksApi.ts`). Place this inside the feature's `api/` folder: `src/features/[featureName]/api/[featureName]Api.ts`.

```ts
// src/features/books/api/booksApi.ts
import api from "../../../api/api"; // Central Axios wrapper

export interface Book {
  id: string;
  title: string;
}

// Ensure you extract `res.data` for React Query
export const fetchBooks = () =>
  api.get<Book[]>("/books").then((res) => res.data);

export const fetchBookById = (id: string) =>
  api.get<Book>(`/books/${id}`).then((res) => res.data);

export const createBook = (payload: { title: string }) =>
  api.post<Book>("/books", payload).then((res) => res.data);
```

> **Important Setup Rule:** These raw API functions shouldn't handle loading state or try/catches. React Query does that for you!

---

## 2. Define React Query Hooks

Instead of executing API functions directly in components, wrap them in custom React Query hooks inside the `hooks/` folder.

### A. Queries (Fetching Data)

For `GET` requests, use `useQuery`. Define unique query keys so React Query can cache and deduplicate requests perfectly.

```ts
// src/features/books/hooks/useBooks.ts
import { useQuery } from "@tanstack/react-query";
import { fetchBooks, fetchBookById } from "../api/booksApi";

// Hook for fetching a list
export function useBooks() {
  return useQuery({
    queryKey: ["books"], // Global cache key
    queryFn: fetchBooks, // Function that returns a Promise
  });
}

// Hook for fetching a single item conditionally
export function useBook(id?: string) {
  return useQuery({
    queryKey: ["books", id],
    queryFn: () => fetchBookById(id!),
    enabled: !!id, // Only run the query if `id` exists
  });
}
```

### B. Mutations (Modifying Data)

For `POST`, `PUT`, `PATCH`, or `DELETE` requests, use `useMutation`. Often, you want to invalidate the cached query so your UI auto-updates after a successful mutation.

```ts
// src/features/books/hooks/useCreateBook.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBook } from "../api/booksApi";

export function useCreateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBook,
    onSuccess: () => {
      // Magically refresh the books list in the background
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
}
```

---

## 3. Consume Hooks in UI Components

Your React components stay incredibly clean. Just call your custom hooks and destructure states like `data`, `isPending`, and `isError`.

```tsx
// src/features/books/components/BooksList.tsx
import { useBooks } from "../hooks/useBooks";
import { useCreateBook } from "../hooks/useCreateBook";

export function BooksList() {
  // Query state
  const { data: books, isPending, isError, refetch } = useBooks();

  // Mutation state
  const { mutate, isPending: isCreating } = useCreateBook();

  if (isPending) return <p>Loading dynamically cached books...</p>;
  if (isError) return <button onClick={() => refetch()}>Try Again</button>;

  return (
    <div>
      <button
        onClick={() => mutate({ title: "New Auto-refreshed Book" })}
        disabled={isCreating}
      >
        {isCreating ? "Adding..." : "Add Random Book"}
      </button>

      <ul>
        {books?.map((book) => (
          <li key={book.id}>{book.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Best Practices

- **Never use standard `fetch` or standalone `axios`.** Use the `api` instance from `api/api.ts` to ensure requests inject JWT tokens, automatically navigate to login on errors, and trigger silent refreshes.
- Wrap queries and mutations in separate custom `use-[Action].ts` hook files. Centralizing Query Keys makes caching predictable.
- Avoid tracking your own loading spinners globally. Let `isPending` via React Query handle standard request lifetimes.

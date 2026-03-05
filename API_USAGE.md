# How to Add New Endpoints Using the API Layer

This project uses a specialized API layer built with Axios that automatically manages token refreshes, interceptors, error logging, request aborts, and protected contexts. When building a new feature or integrating new endpoints, you should follow this high-level workflow.

## 1. Create a Specific API Module

Organize API calls around the specific feature or resource you are fetching (e.g., `booksApi.ts`, `postsApi.ts`). Place this inside the `api/` folder of the feature: `src/features/[featureName]/api/[featureName]Api.ts`.

```ts
// src/features/books/api/booksApi.ts
import api from "../../../api/api"; // Central Axios wrapper

// Type Definition for responses/payloads
export interface Book {
  id: string;
  title: string;
}

// Write the endpoint functions and extract the "data" from the AxiosResponse
export const fetchBooks = () =>
  api.get<Book[]>("/books").then((res) => res.data);

export const createBook = (payload: { title: string }) =>
  api.post<Book>("/books", payload).then((res) => res.data);
```

## 2. Define a React Hook Using `useApi`

Use the `useApi` hook to wrap the API module functions. The `useApi` hook tracks the status (`isPending`, `isSuccess`, `isError`, etc.) and seamlessly supports request abort signals if needed.

```ts
// src/features/books/hooks/useFetchBooks.ts
import { useEffect, useRef } from "react";
import { useApi } from "../../../hooks/useApi";
import { fetchBooks } from "../api/booksApi";

export function useFetchBooks(fetchOnMount = true) {
  // Use abort controller tracking via abortRef to cancel requests on unmount
  const abortRef = useRef<(() => void) | undefined>(undefined);

  const {
    data: books,
    exec: initFetchBooks,
    isPending,
    isError,
    // Add additional fields as needed...
  } = useApi(() =>
    fetchBooks({
      abort: (cancel) => {
        abortRef.current = cancel;
      },
    }),
  );

  useEffect(() => {
    if (fetchOnMount) {
      initFetchBooks();
    }
    return () => {
      // Abort the pending fetch if the component unmounts
      abortRef.current?.();
    };
  }, [fetchOnMount]);

  return {
    books: books ?? [],
    initFetchBooks,
    isPending,
    isError,
  };
}
```

## 3. Consume the Data in UI Components

Now you just bring your cleanly abstracted hook into your React component.

```tsx
// src/features/books/components/BooksList.tsx
import { useFetchBooks } from "../hooks/useFetchBooks";

export function BooksList() {
  const { books, isPending, isError, initFetchBooks } = useFetchBooks();

  if (isPending) return <p>Loading books...</p>;

  if (isError) {
    return (
      <div>
        <p>Could not load books.</p>
        <button onClick={initFetchBooks}>Try Again</button>
      </div>
    );
  }

  return (
    <ul>
      {books.map((book) => (
        <li key={book.id}>{book.title}</li>
      ))}
    </ul>
  );
}
```

## Best Practices

- **Never use standard fetch or standalone Axios in your components.** Using `api` from `api/api.ts` ensures requests securely inject JWT tokens, automatically navigate to login on errors, and attempt refreshing access tokens.
- Keep the `api/api.ts` module untouched unless a new core behavior (e.g., custom header on all requests) needs to be established.
- Always create encapsulated React Hooks for fetching logic (like `useFetchBooks` shown above) to separate API logic from presentation constraints.

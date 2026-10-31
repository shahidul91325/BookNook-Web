import { apiRequest, ApiError } from "@/lib/api/client";
import type {
  Book,
  BookFilterParams,
  CreateBookInput,
  UpdateBookInput,
} from "@/types";

/**
 * Service for managing books against the BookNook API.
 * Communicates with the Express backend — no fake or hardcoded books.
 */
export const bookService = {
  /**
   * Fetch all books with optional search, category, and sorting filters.
   */
  async getBooks(params?: BookFilterParams): Promise<Book[]> {
    const searchParams = new URLSearchParams();
    if (params?.category && params.category !== "All") {
      searchParams.set("category", params.category);
    }
    if (params?.search?.trim()) {
      searchParams.set("search", params.search.trim());
    }
    if (params?.sort) {
      searchParams.set("sort", params.sort);
    }
    if (params?.limit) {
      searchParams.set("limit", String(params.limit));
    }
    if (params?.page) {
      searchParams.set("page", String(params.page));
    }

    const query = searchParams.toString();
    const endpoint = query ? `/api/books?${query}` : "/api/books";
    return apiRequest<Book[]>(endpoint);
  },

  /**
   * Fetch latest arrivals for the homepage section.
   */
  async getNewArrivals(limit: number = 6): Promise<Book[]> {
    return this.getBooks({ sort: "newest", limit });
  },

  /**
   * Fetch a single book by its identifier.
   */
  async getBookById(id: string): Promise<Book> {
    return apiRequest<Book>(`/api/books/${id}`);
  },

  /**
   * Fetch books belonging to the currently logged in user.
   * Follows backend session authentication without relying on client IDs.
   */
  async getMyBooks(userEmail?: string): Promise<Book[]> {
    try {
      return await apiRequest<Book[]>("/api/my-books");
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        try {
          return await apiRequest<Book[]>("/api/books/my");
        } catch (err2: unknown) {
          if (err2 instanceof ApiError && err2.status === 404) {
            try {
              return await apiRequest<Book[]>("/api/books/user");
            } catch (err3: unknown) {
              if (err3 instanceof ApiError && err3.status === 404 && userEmail) {
                return await apiRequest<Book[]>(`/api/books/user/${encodeURIComponent(userEmail)}`);
              }
              throw err3;
            }
          }
          throw err2;
        }
      }
      throw err;
    }
  },

  /**
   * Fetch books added by a specific user.
   */
  async getBooksByUser(email: string): Promise<Book[]> {
    const encodedEmail = encodeURIComponent(email);
    return apiRequest<Book[]>(`/api/books/user/${encodedEmail}`);
  },

  /**
   * Add a new book to the library.
   */
  async createBook(data: CreateBookInput): Promise<Book> {
    try {
      return await apiRequest<Book>("/api/books", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        return await apiRequest<Book>("/api/book", {
          method: "POST",
          body: JSON.stringify(data),
        });
      }
      throw err;
    }
  },

  /**
   * Update an existing book.
   */
  async updateBook(id: string, data: UpdateBookInput): Promise<Book> {
    try {
      return await apiRequest<Book>(`/api/books/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        return await apiRequest<Book>(`/api/book/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      }
      throw err;
    }
  },

  /**
   * Delete a book by its identifier.
   */
  async deleteBook(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      return await apiRequest<{ success: boolean; message?: string }>(`/api/books/${id}`, {
        method: "DELETE",
      });
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        return await apiRequest<{ success: boolean; message?: string }>(`/api/book/${id}`, {
          method: "DELETE",
        });
      }
      throw err;
    }
  },
};

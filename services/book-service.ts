import { apiRequest } from "@/lib/api/client";
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
   * The backend filters by the verified JWT subject.
   */
  async getMyBooks(): Promise<Book[]> {
    return apiRequest<Book[]>("/api/my-books");
  },

  /**
   * Add a new book to the library.
   */
  async createBook(data: CreateBookInput): Promise<Book> {
    return apiRequest<Book>("/api/books", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing book.
   */
  async updateBook(id: string, data: UpdateBookInput): Promise<Book> {
    return apiRequest<Book>(`/api/books/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a book by its identifier.
   */
  async deleteBook(id: string): Promise<{ success: boolean; message?: string }> {
    return apiRequest<{ success: boolean; message?: string }>(`/api/books/${id}`, {
      method: "DELETE",
    });
  },
};

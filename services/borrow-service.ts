import { apiRequest, ApiError } from "@/lib/api/client";
import type { BorrowRecord, CreateBorrowInput } from "@/types";

/**
 * Service for borrowing and returning books against the BookNook API.
 */
export const borrowService = {
  /**
   * Borrow a book for a user.
   */
  async borrowBook(data: CreateBorrowInput): Promise<BorrowRecord> {
    try {
      return await apiRequest<BorrowRecord>("/api/borrows", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        return await apiRequest<BorrowRecord>("/api/borrow", {
          method: "POST",
          body: JSON.stringify(data),
        });
      }
      throw err;
    }
  },

  /**
   * Get all books borrowed by the authenticated user.
   * Prioritizes session-based endpoints, with fallbacks to email queries.
   */
  async getUserBorrows(userEmail?: string): Promise<BorrowRecord[]> {
    // 1. Try session-based endpoints first
    try {
      return await apiRequest<BorrowRecord[]>("/api/my-borrows");
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        try {
          return await apiRequest<BorrowRecord[]>("/api/borrows/my");
        } catch (err2: unknown) {
          if (err2 instanceof ApiError && err2.status === 404) {
            try {
              return await apiRequest<BorrowRecord[]>("/api/borrows/user");
            } catch (err3: unknown) {
              if (err3 instanceof ApiError && err3.status === 404 && userEmail) {
                const encodedEmail = encodeURIComponent(userEmail);
                try {
                  return await apiRequest<BorrowRecord[]>(`/api/borrows/user/${encodedEmail}`);
                } catch (err4: unknown) {
                  if (err4 instanceof ApiError && err4.status === 404) {
                    try {
                      return await apiRequest<BorrowRecord[]>(`/api/borrows?email=${encodedEmail}`);
                    } catch (err5: unknown) {
                      if (err5 instanceof ApiError && err5.status === 404) {
                        return await apiRequest<BorrowRecord[]>("/api/borrows");
                      }
                      throw err5;
                    }
                  }
                  throw err4;
                }
              }
              if (err3 instanceof ApiError && err3.status === 404) {
                return await apiRequest<BorrowRecord[]>("/api/borrows");
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
   * Return a borrowed book with multi-endpoint fallback.
   */
  async returnBook(
    borrowId: string,
    metadata?: { bookId?: string; userEmail?: string }
  ): Promise<{ success: boolean; message?: string }> {
    // 1. Standard PUT /api/borrows/:id/return
    try {
      return await apiRequest<{ success: boolean; message?: string }>(
        `/api/borrows/${borrowId}/return`,
        {
          method: "PUT",
          body: metadata ? JSON.stringify(metadata) : undefined,
        }
      );
    } catch (err: unknown) {
      if (err instanceof ApiError && (err.status === 404 || err.status === 405)) {
        // 2. Try PATCH /api/borrows/:id/return
        try {
          return await apiRequest<{ success: boolean; message?: string }>(
            `/api/borrows/${borrowId}/return`,
            {
              method: "PATCH",
              body: metadata ? JSON.stringify(metadata) : undefined,
            }
          );
        } catch (err2: unknown) {
          if (err2 instanceof ApiError && (err2.status === 404 || err2.status === 405)) {
            // 3. Try PUT /api/borrows/:id with status "Returned"
            try {
              return await apiRequest<{ success: boolean; message?: string }>(
                `/api/borrows/${borrowId}`,
                {
                  method: "PUT",
                  body: JSON.stringify({ status: "Returned", ...metadata }),
                }
              );
            } catch (err3: unknown) {
              if (err3 instanceof ApiError && (err3.status === 404 || err3.status === 405)) {
                // 4. Try DELETE /api/borrows/:id (for backends that remove the borrow record on return)
                try {
                  return await apiRequest<{ success: boolean; message?: string }>(
                    `/api/borrows/${borrowId}`,
                    {
                      method: "DELETE",
                    }
                  );
                } catch (err4: unknown) {
                  if (err4 instanceof ApiError && (err4.status === 404 || err4.status === 405)) {
                    // 5. Try single noun endpoint /api/borrow/:id/return
                    try {
                      return await apiRequest<{ success: boolean; message?: string }>(
                        `/api/borrow/${borrowId}/return`,
                        {
                          method: "PUT",
                        }
                      );
                    } catch (err5: unknown) {
                      if (err5 instanceof ApiError && (err5.status === 404 || err5.status === 405)) {
                        return await apiRequest<{ success: boolean; message?: string }>(
                          `/api/borrow/${borrowId}`,
                          {
                            method: "DELETE",
                          }
                        );
                      }
                      throw err5;
                    }
                  }
                  throw err4;
                }
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
};

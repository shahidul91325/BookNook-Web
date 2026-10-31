import { apiRequest } from "@/lib/api/client";
import type { BorrowRecord, CreateBorrowInput } from "@/types";

/**
 * Service for borrowing and returning books against the BookNook API.
 */
export const borrowService = {
  /**
   * Borrow a book for a user.
   */
  async borrowBook(data: CreateBorrowInput): Promise<BorrowRecord> {
    return apiRequest<BorrowRecord>("/api/borrows", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Get all books borrowed by a specific user.
   */
  async getUserBorrows(email: string): Promise<BorrowRecord[]> {
    const encodedEmail = encodeURIComponent(email);
    return apiRequest<BorrowRecord[]>(`/api/borrows/user/${encodedEmail}`);
  },

  /**
   * Return a borrowed book.
   */
  async returnBook(borrowId: string): Promise<{ success: boolean; message?: string }> {
    return apiRequest<{ success: boolean; message?: string }>(
      `/api/borrows/${borrowId}/return`,
      {
        method: "PUT",
      }
    );
  },
};

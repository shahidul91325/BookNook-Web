export type BorrowStatus = "Borrowed" | "Returned";

export interface BorrowRecord {
  id: string;
  _id?: string;
  bookId: string;
  bookTitle: string;
  bookImage?: string;
  userName: string;
  userEmail: string;
  borrowDate: string;
  returnDate: string;
  status: BorrowStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBorrowInput {
  bookId: string;
  bookTitle?: string;
  bookImage?: string;
  userName: string;
  userEmail: string;
  returnDate: string;
}

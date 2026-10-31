export type BorrowStatus = "Borrowed" | "Returned" | string;

export interface PopulatedBook {
  id?: string;
  _id?: string;
  title?: string;
  image?: string;
  author?: string;
  category?: string;
  quantity?: number;
  isbn?: string;
}

export interface BorrowRecord {
  id: string;
  _id?: string;
  bookId?: string | PopulatedBook;
  bookTitle?: string;
  bookImage?: string;
  userName?: string;
  userEmail?: string;
  borrowDate: string;
  returnDate: string;
  status?: BorrowStatus;
  createdAt?: string;
  updatedAt?: string;
  book?: PopulatedBook;
}

export interface CreateBorrowInput {
  bookId: string;
  bookTitle?: string;
  bookImage?: string;
  userName: string;
  userEmail: string;
  returnDate: string;
}

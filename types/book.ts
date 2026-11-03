export type BookCategory = 'Fiction' | 'Science' | 'History' | 'Kids' | 'Others';
export interface Book {
  id: string;
  _id?: string;
  title: string;
  author: string;
  category: BookCategory | string;
  image: string;
  quantity: number;
  /** Copies currently available to borrow (server-computed; may differ from quantity while copies are out on loan). */
  availableCopies?: number;
  isbn?: string;
  rating?: number;
  reviewsCount?: number;
  description: string;
  /** Stable owner id supplied by the backend from verified auth. */
  addedBy?: string;
  userName?: string;
  userEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookFilterParams {
  category?: string;
  search?: string;
  /** Sort modes supported by `GET /api/books`; unknown values fall back to the backend default. */
  sort?: 'newest' | 'oldest' | 'title-asc' | 'title-desc' | 'quantity-desc' | string;
  limit?: number;
  page?: number;
}

export interface CreateBookInput {
  title: string;
  author: string;
  category: string;
  image: string;
  quantity: number;
  description: string;
  rating?: number;
}

export type UpdateBookInput = Partial<CreateBookInput>;

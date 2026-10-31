export type BookCategory =
  | "Fiction"
  | "Science"
  | "History"
  | "Kids"
  | "Self Help"
  | "Programming"
  | "Fantasy"
  | "Financial"
  | "Others";

export interface Book {
  id: string;
  _id?: string;
  title: string;
  author: string;
  category: BookCategory | string;
  image: string;
  quantity: number;
  rating?: number;
  reviewsCount?: number;
  description: string;
  userName?: string;
  userEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookFilterParams {
  category?: string;
  search?: string;
  sort?: "newest" | "oldest" | "rating" | "title" | string;
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
  userName: string;
  userEmail: string;
  rating?: number;
}

export type UpdateBookInput = Partial<CreateBookInput>;

import { Suspense } from "react";
import type { Metadata } from "next";
import { BooksCatalog } from "@/components/books/books-catalog";
import { BooksCatalogSkeleton } from "@/components/books/books-catalog-skeleton";

export const metadata: Metadata = {
  title: "BookNook | All Books",
  description:
    "Browse our expansive collection of community books. Filter by category, search by title or author, and borrow easily.",
};

export default function BooksPage() {
  return (
    <Suspense fallback={<BooksCatalogSkeleton />}>
      <BooksCatalog />
    </Suspense>
  );
}

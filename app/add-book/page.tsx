import { Suspense } from "react";
import type { Metadata } from "next";
import { AddBookForm, AddBookFormSkeleton } from "@/components/books/add-book-form";

export const metadata: Metadata = {
  title: "BookNook | Add Book",
  description:
    "Contribute and publish a new book to the BookNook community library collection.",
};

export default function AddBookPage() {
  return (
    <Suspense fallback={<AddBookFormSkeleton />}>
      <AddBookForm />
    </Suspense>
  );
}

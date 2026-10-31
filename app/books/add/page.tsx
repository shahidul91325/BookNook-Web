import type { Metadata } from "next";
import { AddBookForm } from "@/components/books/add-book-form";

export const metadata: Metadata = {
  title: "Add a New Book | BookNook",
  description:
    "Contribute and publish a new book to the BookNook community library collection.",
};

export default function BooksAddPage() {
  return <AddBookForm />;
}

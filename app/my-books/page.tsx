import type { Metadata } from "next";
import { MyBooksView } from "@/components/books/my-books-view";

export const metadata: Metadata = {
  title: "My Added Books | BookNook",
  description:
    "View and manage all the books you have contributed to the BookNook library collection.",
};

export default function MyBooksPage() {
  return <MyBooksView />;
}

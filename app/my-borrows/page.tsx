import type { Metadata } from "next";
import { MyBorrowsView } from "@/components/books/my-borrows-view";

export const metadata: Metadata = {
  title: "My Borrowed Books | BookNook",
  description:
    "Track your reading loans, view return deadlines, and return borrowed books to the BookNook library collection.",
};

export default function MyBorrowsPage() {
  return <MyBorrowsView />;
}

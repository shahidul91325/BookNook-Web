import { Suspense } from "react";
import type { Metadata } from "next";
import { MyBorrowsView } from "@/components/books/my-borrows-view";
import { TablePageSkeleton } from "@/components/books/book-table-skeleton";

export const metadata: Metadata = {
  title: "BookNook | My Borrows",
  description:
    "Track your reading loans, view return deadlines, and return borrowed books to the BookNook library collection.",
};

export default function MyBorrowsPage() {
  return (
    <Suspense fallback={<TablePageSkeleton type="borrows" />}>
      <MyBorrowsView />
    </Suspense>
  );
}

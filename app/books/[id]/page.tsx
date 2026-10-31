import type { Metadata } from "next";
import { Suspense } from "react";
import { BookDetailsView } from "@/components/books/book-details-view";
import { BookDetailsSkeleton } from "@/components/books/book-details-skeleton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Book Details | BookNook`,
    description: `View book details, availability, and borrow book ${id} from the BookNook library.`,
  };
}

async function BookDetailsLoader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BookDetailsView bookId={id} />;
}

export default function BookDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<BookDetailsSkeleton />}>
      <BookDetailsLoader params={params} />
    </Suspense>
  );
}

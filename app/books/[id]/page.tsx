import type { Metadata } from "next";
import { Suspense } from "react";
import { bookService } from "@/services/book-service";
import { BookDetailsView } from "@/components/books/book-details-view";
import { BookDetailsSkeleton } from "@/components/books/book-details-skeleton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const book = await bookService.getBookById(id);
    if (book && book.title) {
      return {
        title: `BookNook | ${book.title}`,
        description:
          book.description ||
          `View details and borrow ${book.title} by ${book.author} from the BookNook library.`,
      };
    }
  } catch {
    // If backend is unreachable during static build or id is not yet fetched
  }

  return {
    title: "BookNook | Book Details",
    description: `View book details, availability, and borrow book from the BookNook library.`,
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

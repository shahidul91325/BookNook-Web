import type { Metadata } from "next";
import { Suspense } from "react";
import { BookDetailsView } from "@/components/books/book-details-view";

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

function BookDetailsLoading() {
  return (
    <div className="py-8 sm:py-12 bg-background min-h-screen">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="h-4 w-32 bg-surface rounded mb-8 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          <div className="md:col-span-5 lg:col-span-4">
            <div className="aspect-[3/4] w-full rounded-2xl bg-surface animate-pulse" />
          </div>
          <div className="md:col-span-7 lg:col-span-8 space-y-4">
            <div className="h-6 w-24 bg-surface rounded animate-pulse" />
            <div className="h-10 w-3/4 bg-surface rounded animate-pulse" />
            <div className="h-4 w-40 bg-surface/70 rounded animate-pulse" />
            <div className="h-24 w-full bg-surface/60 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
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
    <Suspense fallback={<BookDetailsLoading />}>
      <BookDetailsLoader params={params} />
    </Suspense>
  );
}

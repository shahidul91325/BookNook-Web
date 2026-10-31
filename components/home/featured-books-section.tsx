"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, AlertCircle, RefreshCw, PlusCircle } from "lucide-react";
import { bookService } from "@/services/book-service";
import { BookCard, BookCardSkeleton } from "@/components/books/book-card";
import { Button } from "@/components/ui/button";
import type { Book } from "@/types";

export function FeaturedBooksSection() {
  const [books, setBooks] = React.useState<Book[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [retryKey, setRetryKey] = React.useState(0);

  React.useEffect(() => {
    let isCancelled = false;

    async function loadBooks() {
      try {
        const data = await bookService.getNewArrivals(6);
        if (!isCancelled) {
          setBooks(Array.isArray(data) ? data : []);
          setErrorMessage(null);
        }
      } catch (error) {
        if (!isCancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Could not load featured books from the server.";
          setErrorMessage(message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadBooks();

    return () => {
      isCancelled = true;
    };
  }, [retryKey]);

  const handleRetry = () => {
    setIsLoading(true);
    setRetryKey((prev) => prev + 1);
  };

  return (
    <section className="py-14 sm:py-20 border-b border-border/80 bg-background/50 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase mb-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Fresh Additions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              New Arrivals
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Fresh books, just for you. Explore the newest additions to the library.
            </p>
          </div>

          <Link
            href="/books"
            className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-primary-hover transition-colors self-start sm:self-auto"
          >
            <span>See All Books</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Loading Skeleton State */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <BookCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && errorMessage && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center max-w-xl mx-auto shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/15 text-destructive mb-3.5">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Unable to load books
            </h3>
            <p className="text-xs text-muted-foreground mt-1 mb-5 leading-relaxed">
              {errorMessage}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="default"
                size="sm"
                onClick={handleRetry}
                className="gap-2 text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <Link href="/books">Explore Catalog</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !errorMessage && books.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border/90 bg-card/40 p-12 text-center max-w-lg mx-auto">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface border border-border/80 text-primary mb-4 shadow-inner">
              <BookOpen className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              No books published yet
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 mb-6 max-w-sm mx-auto">
              Our shelves are currently waiting for their first additions. Share your
              favorite books with the BookNook reading community today!
            </p>
            <Button asChild variant="default" size="sm" className="gap-2 text-xs font-semibold">
              <Link href="/add-book">
                <PlusCircle className="h-3.5 w-3.5" />
                Add First Book
              </Link>
            </Button>
          </div>
        )}

        {/* Books Grid */}
        {!isLoading && !errorMessage && books.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
            {books.map((book) => (
              <BookCard key={book.id || book._id} book={book} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

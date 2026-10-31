import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Book } from "@/types";
import { cn } from "@/lib/utils";

interface BookListItemProps {
  book: Book;
  className?: string;
}

export function BookListItem({ book, className }: BookListItemProps) {
  const bookId = book.id || book._id;
  const isAvailable = book.quantity !== undefined ? book.quantity > 0 : true;
  const availableCopies = book.quantity !== undefined ? book.quantity : 1;

  return (
    <div
      className={cn(
        "group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-border/80 bg-card p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
        className
      )}
    >
      <div className="flex items-center gap-4 w-full sm:w-auto">
        {/* Book Thumbnail */}
        <div className="relative aspect-[3/4] w-20 sm:w-24 shrink-0 overflow-hidden rounded-lg bg-surface border border-border/50">
          {book.image ? (
            <Image
              src={book.image}
              alt={book.title}
              fill
              sizes="100px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground bg-surface">
              <BookOpen className="h-8 w-8 text-primary/40" />
            </div>
          )}
        </div>

        {/* Book Details */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="default" className="text-[10px] font-medium px-2 py-0.5">
              {book.category}
            </Badge>

            {isAvailable ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {availableCopies} {availableCopies === 1 ? "copy" : "copies"} available
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                Out of stock
              </span>
            )}
          </div>

          <h3
            className="font-semibold text-foreground text-base sm:text-lg group-hover:text-primary transition-colors truncate"
            title={book.title}
          >
            {book.title}
          </h3>

          <p className="text-xs text-muted-foreground mb-2">
            By <span className="font-medium text-foreground/80">{book.author}</span>
          </p>

          {book.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 max-w-xl hidden sm:block">
              {book.description}
            </p>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="w-full sm:w-auto shrink-0 flex items-center justify-end">
        <Button
          asChild
          variant="default"
          size="sm"
          className="w-full sm:w-auto gap-1.5 text-xs font-semibold px-4"
        >
          <Link href={`/books/${bookId}`}>
            <span>View Details</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function BookListItemSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/80 bg-card p-4 animate-pulse">
      <div className="flex items-center gap-4 flex-1">
        <div className="aspect-[3/4] w-20 sm:w-24 shrink-0 rounded-lg bg-surface/80" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 bg-surface rounded" />
          <div className="h-5 w-48 bg-surface/80 rounded" />
          <div className="h-3 w-32 bg-surface/60 rounded" />
          <div className="h-3 w-3/4 bg-surface/40 rounded hidden sm:block" />
        </div>
      </div>
      <div className="h-9 w-24 bg-surface/80 rounded-lg shrink-0 hidden sm:block" />
    </div>
  );
}

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Book } from "@/types";
import { cn } from "@/lib/utils";

interface BookCardProps {
  book: Book;
  className?: string;
}

export function BookCard({ book, className }: BookCardProps) {
  const bookId = book.id || book._id;
  const isAvailable = book.quantity !== undefined ? book.quantity > 0 : true;
  const availableCopies = book.quantity !== undefined ? book.quantity : 1;

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1",
        className
      )}
    >
      <div className="flex flex-col">
        {/* Book Cover Container */}
        <Link
          href={`/books/${bookId}`}
          className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-surface mb-3.5 border border-border/50 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={`View details for ${book.title}`}
        >
          {book.image ? (
            <Image
              src={book.image}
              alt={book.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground bg-surface">
              <BookOpen className="h-12 w-12 stroke-[1.5] text-primary/40" />
            </div>
          )}

          {/* Availability Floating Badge */}
          <div className="absolute top-2.5 right-2.5">
            {isAvailable ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-card/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {availableCopies} {availableCopies === 1 ? "copy" : "copies"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-card/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-red-400 border border-red-500/20 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                Out of stock
              </span>
            )}
          </div>
        </Link>

        {/* Title & Author */}
        <h3
          className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors text-base"
          title={book.title}
        >
          <Link href={`/books/${bookId}`} className="hover:underline">
            {book.title}
          </Link>
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 mb-2.5 line-clamp-1">
          {book.author}
        </p>

        {/* Category & Metadata Pill */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <Badge
            variant="default"
            className="text-[11px] font-medium px-2 py-0.5 max-w-[130px] truncate"
          >
            {book.category}
          </Badge>

          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Layers className="h-3 w-3 text-muted-foreground/70" />
            {isAvailable ? "Available" : "Borrowed"}
          </span>
        </div>
      </div>

      {/* Primary Action Button */}
      <Button
        asChild
        variant="default"
        size="sm"
        className="w-full justify-center gap-1.5 text-xs font-semibold shadow-sm hover:shadow-primary/20 transition-all"
      >
        <Link href={`/books/${bookId}`}>
          View Details
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </Button>
    </div>
  );
}

export function BookCardSkeleton() {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 animate-pulse">
      <div>
        <div className="aspect-[3/4] w-full rounded-lg bg-surface/80 mb-3.5" />
        <div className="h-4 w-3/4 rounded bg-surface/80 mb-2" />
        <div className="h-3 w-1/2 rounded bg-surface/60 mb-3" />
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-16 rounded-full bg-surface/80" />
          <div className="h-3 w-12 rounded bg-surface/60" />
        </div>
      </div>
      <div className="h-8 w-full rounded-lg bg-surface/80" />
    </div>
  );
}

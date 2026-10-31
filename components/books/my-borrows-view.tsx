"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Bookmark,
  BookOpen,
  Calendar,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogIn,
  ExternalLink,
  Clock,
  Loader2,
} from "lucide-react";
import { borrowService } from "@/services/borrow-service";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import type { BorrowRecord } from "@/types";

// Helper extractors
function getRecordId(record: BorrowRecord): string {
  return record.id || record._id || "";
}

function getBookId(record: BorrowRecord): string {
  if (typeof record.bookId === "object" && record.bookId) {
    return record.bookId.id || record.bookId._id || "";
  }
  return (record.bookId as string) || record.book?.id || record.book?._id || "";
}

function getBookTitle(record: BorrowRecord): string {
  if (record.bookTitle) return record.bookTitle;
  if (typeof record.bookId === "object" && record.bookId?.title) {
    return record.bookId.title;
  }
  if (record.book?.title) return record.book.title;
  return "Library Book";
}

function getBookImage(record: BorrowRecord): string {
  if (record.bookImage) return record.bookImage;
  if (typeof record.bookId === "object" && record.bookId?.image) {
    return record.bookId.image;
  }
  if (record.book?.image) return record.book.image;
  return "";
}

function getBookAuthor(record: BorrowRecord): string {
  if (typeof record.bookId === "object" && record.bookId?.author) {
    return record.bookId.author;
  }
  if (record.book?.author) return record.book.author;
  return "";
}

function getBookCategory(record: BorrowRecord): string {
  if (typeof record.bookId === "object" && record.bookId?.category) {
    return record.bookId.category;
  }
  if (record.book?.category) return record.book.category;
  return "";
}

function isRecordReturned(record: BorrowRecord): boolean {
  return record.status?.toLowerCase() === "returned";
}

function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getDueInfo(returnDateStr?: string, isReturned?: boolean) {
  if (isReturned) {
    return { label: "Returned", isOverdue: false, textClass: "text-emerald-400" };
  }
  if (!returnDateStr) {
    return { label: "Active Loan", isOverdue: false, textClass: "text-muted-foreground" };
  }
  try {
    const target = new Date(returnDateStr);
    if (isNaN(target.getTime())) {
      return { label: "Active", isOverdue: false, textClass: "text-muted-foreground" };
    }
    const now = new Date();
    const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const diffDays = Math.round((targetMidnight - nowMidnight) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `Overdue by ${Math.abs(diffDays)}d`,
        isOverdue: true,
        textClass: "text-red-400 font-semibold",
      };
    } else if (diffDays === 0) {
      return {
        label: "Due Today",
        isOverdue: false,
        textClass: "text-amber-400 font-semibold",
      };
    } else if (diffDays === 1) {
      return {
        label: "Due Tomorrow",
        isOverdue: false,
        textClass: "text-amber-300",
      };
    } else {
      return {
        label: `${diffDays} days left`,
        isOverdue: false,
        textClass: "text-muted-foreground",
      };
    }
  } catch {
    return { label: "Active Loan", isOverdue: false, textClass: "text-muted-foreground" };
  }
}

export function MyBorrowsView() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [borrows, setBorrows] = React.useState<BorrowRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [retryKey, setRetryKey] = React.useState(0);

  // Unauthenticated Route Guard: Redirect to /login with return destination
  React.useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/login?redirect=/my-borrows");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // Return Book Confirmation Dialog & Mutation State
  const [selectedRecordForReturn, setSelectedRecordForReturn] = React.useState<BorrowRecord | null>(null);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = React.useState(false);
  const [isReturning, setIsReturning] = React.useState(false);
  const [returningIds, setReturningIds] = React.useState<Record<string, boolean>>({});

  // Fetch borrows for authenticated user
  React.useEffect(() => {
    let isCancelled = false;

    async function loadBorrows() {
      try {
        const data = await borrowService.getUserBorrows(user?.email);
        if (!isCancelled) {
          setBorrows(Array.isArray(data) ? data : []);
          setErrorMessage(null);
        }
      } catch (error) {
        if (!isCancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Could not load your borrowed books from the server.";
          setErrorMessage(message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    if (isAuthenticated) {
      loadBorrows();
    }

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, user?.email, retryKey]);

  // Handle Return Book API submission
  const handleConfirmReturn = async () => {
    if (!selectedRecordForReturn) return;

    const borrowId = getRecordId(selectedRecordForReturn);
    const bookId = getBookId(selectedRecordForReturn);
    const bookTitle = getBookTitle(selectedRecordForReturn);

    if (!borrowId) {
      toast.error("Invalid borrow record identifier.");
      return;
    }

    // Prevent duplicate return requests
    if (returningIds[borrowId] || isReturning) {
      return;
    }

    setIsReturning(true);
    setReturningIds((prev) => ({ ...prev, [borrowId]: true }));

    try {
      await borrowService.returnBook(borrowId, {
        bookId: bookId || undefined,
        userEmail: user?.email,
      });

      toast.success(`Successfully returned "${bookTitle}"!`);

      // Immediately update UI: mark this record as Returned
      setBorrows((prev) =>
        prev.map((item) =>
          getRecordId(item) === borrowId
            ? { ...item, status: "Returned" }
            : item
        )
      );

      setIsReturnDialogOpen(false);
      setSelectedRecordForReturn(null);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to return the book. Please try again.";
      toast.error(msg);
    } finally {
      setIsReturning(false);
      setReturningIds((prev) => {
        const next = { ...prev };
        delete next[borrowId];
        return next;
      });
    }
  };

  // Auth Loading Skeleton
  if (isAuthLoading) {
    return (
      <div className="py-12 bg-background min-h-[600px] flex items-center justify-center">
        <div className="space-y-4 text-center animate-pulse">
          <div className="h-10 w-10 bg-surface rounded-full mx-auto" />
          <div className="h-4 w-40 bg-surface rounded mx-auto" />
        </div>
      </div>
    );
  }

  // Unauthenticated Guard
  if (!isAuthenticated) {
    return (
      <div className="py-16 sm:py-24 bg-background min-h-screen flex items-center justify-center">
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-4 shadow-sm">
            <LogIn className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Sign In Required</h2>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            Please sign in to view your borrowed books, manage return dates, and return books to the library.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild variant="default" size="sm">
              <Link href="/login?redirect=/my-borrows" className="gap-2">
                <LogIn className="h-4 w-4" />
                Sign In to Continue
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/books">Explore Catalog</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const activeBorrowsCount = borrows.filter((b) => !isRecordReturned(b)).length;

  return (
    <div className="py-8 sm:py-12 bg-background min-h-screen transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-border/80">
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase mb-1.5">
              <Bookmark className="h-4 w-4" />
              <span>Personal Loans</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                My Borrowed Books
              </h1>
              {!isLoading && (
                <span className="inline-flex items-center rounded-full bg-primary/15 border border-primary/30 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  Active Loans: {activeBorrowsCount}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Keep track of your borrowed books, view return deadlines, and return books when finished.
            </p>
          </div>

          <Button asChild variant="default" size="sm" className="gap-2 text-xs font-semibold self-start sm:self-auto shadow-md">
            <Link href="/books">
              <BookOpen className="h-4 w-4" />
              Browse More Books
            </Link>
          </Button>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4 animate-pulse">
            <div className="h-6 w-48 bg-surface rounded" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 w-full bg-surface/70 rounded-xl" />
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && errorMessage && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center max-w-md mx-auto my-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/15 text-destructive mb-3.5">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Unable to load your borrowed books
            </h3>
            <p className="text-xs text-muted-foreground mt-1 mb-5">{errorMessage}</p>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setIsLoading(true);
                setRetryKey((k) => k + 1);
              }}
              className="gap-2 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !errorMessage && borrows.length === 0 && (
          <EmptyState
            icon={<Bookmark className="h-8 w-8 text-primary" />}
            title="No borrowed books yet"
            description="You haven't borrowed any books from BookNook yet. Discover interesting titles from our catalog and start reading today!"
            actionLabel="Browse Available Books"
            actionHref="/books"
            className="my-10"
          />
        )}

        {/* Borrows Table View */}
        {!isLoading && !errorMessage && borrows.length > 0 && (
          <div className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[35%]">Book</TableHead>
                  <TableHead className="w-[18%]">Borrow Date</TableHead>
                  <TableHead className="w-[20%]">Return Deadline</TableHead>
                  <TableHead className="w-[12%]">Status</TableHead>
                  <TableHead className="w-[15%] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {borrows.map((record, index) => {
                  const borrowId = getRecordId(record) || `borrow-item-${index}`;
                  const bookId = getBookId(record);
                  const title = getBookTitle(record);
                  const image = getBookImage(record);
                  const author = getBookAuthor(record);
                  const category = getBookCategory(record);
                  const isReturned = isRecordReturned(record);
                  const dueInfo = getDueInfo(record.returnDate, isReturned);
                  const isPendingReturn = Boolean(returningIds[borrowId]);

                  return (
                    <TableRow key={borrowId} className="group">
                      {/* Book Thumbnail + Title + Author */}
                      <TableCell>
                        <div className="flex items-center gap-3.5">
                          <div className="relative aspect-[3/4] w-12 rounded-lg overflow-hidden bg-surface shrink-0 border border-border/50">
                            {image ? (
                              <Image
                                src={image}
                                alt={title}
                                fill
                                sizes="50px"
                                className="object-cover transition-transform group-hover:scale-105"
                              />
                            ) : (
                              <BookOpen className="h-5 w-5 m-auto text-primary/40" />
                            )}
                          </div>
                          <div className="min-w-0">
                            {bookId ? (
                              <Link
                                href={`/books/${bookId}`}
                                className="font-semibold text-foreground hover:text-primary transition-colors text-sm truncate block"
                                title={title}
                              >
                                {title}
                              </Link>
                            ) : (
                              <span className="font-semibold text-foreground text-sm truncate block">
                                {title}
                              </span>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                              {author && <span>By {author}</span>}
                              {category && (
                                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4">
                                  {category}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Borrow Date */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-foreground">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>{formatDateDisplay(record.borrowDate || record.createdAt)}</span>
                        </div>
                      </TableCell>

                      {/* Return Date + Due Countdown */}
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-1.5 text-xs text-foreground">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span>{formatDateDisplay(record.returnDate)}</span>
                          </div>
                          <span className={`text-[11px] block mt-0.5 ${dueInfo.textClass}`}>
                            {dueInfo.label}
                          </span>
                        </div>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell>
                        {isReturned ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            Returned
                          </span>
                        ) : dueInfo.isOverdue ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-red-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                            Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/30 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Borrowed
                          </span>
                        )}
                      </TableCell>

                      {/* Return Action */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {bookId && (
                            <Button
                              asChild
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              title="View Book Details"
                            >
                              <Link href={`/books/${bookId}`}>
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}

                          {isReturned ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              className="h-8 px-2.5 text-xs font-medium opacity-60 cursor-default"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                              Returned
                            </Button>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              disabled={isPendingReturn}
                              onClick={() => {
                                setSelectedRecordForReturn(record);
                                setIsReturnDialogOpen(true);
                              }}
                              className="h-8 px-3 text-xs font-semibold gap-1.5 shadow-sm"
                            >
                              {isPendingReturn ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  Returning...
                                </>
                              ) : (
                                <>
                                  <RotateCcw className="h-3.5 w-3.5" />
                                  Return Book
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Return Book Confirmation Dialog */}
      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
              <RotateCcw className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-lg font-bold">
              Confirm Book Return
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground">
              Are you sure you want to return this book? This will mark your loan as returned and increment the available copies in the library.
            </DialogDescription>
          </DialogHeader>

          {selectedRecordForReturn && (
            <div className="rounded-xl border border-border/70 bg-surface/40 p-3.5 my-2 flex items-center gap-3">
              <div className="relative aspect-[3/4] w-10 rounded-md overflow-hidden bg-surface shrink-0 border border-border/50">
                {getBookImage(selectedRecordForReturn) ? (
                  <Image
                    src={getBookImage(selectedRecordForReturn)}
                    alt={getBookTitle(selectedRecordForReturn)}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <BookOpen className="h-4 w-4 m-auto text-primary/40" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">
                  {getBookTitle(selectedRecordForReturn)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Borrowed on: {formatDateDisplay(selectedRecordForReturn.borrowDate || selectedRecordForReturn.createdAt)}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isReturning}
              onClick={() => {
                setIsReturnDialogOpen(false);
                setSelectedRecordForReturn(null);
              }}
            >
              Keep Reading
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={isReturning}
              onClick={handleConfirmReturn}
              className="gap-2 font-semibold"
            >
              {isReturning ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Returning Book...
                </>
              ) : (
                <>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Confirm Return
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

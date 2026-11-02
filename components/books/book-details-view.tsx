"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  BookmarkCheck,
  User,
  Hash,
  Star,
  Copy,
  Clock,
  LogIn,
  RefreshCw,
  Loader2,
  Edit,
  Trash2,
  Home,
} from "lucide-react";
import { toast } from "sonner";
import { bookService } from "@/services/book-service";
import { borrowService } from "@/services/borrow-service";
import { useAuth } from "@/hooks/use-auth";
import { EditBookDialog } from "@/components/books/edit-book-dialog";
import { DeleteBookDialog } from "@/components/books/delete-book-dialog";
import { BookDetailsSkeleton } from "@/components/books/book-details-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Book } from "@/types";

interface BookDetailsViewProps {
  bookId: string;
}

export function BookDetailsView({ bookId }: BookDetailsViewProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [book, setBook] = React.useState<Book | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Route Protection: Unauthenticated users accessing Book Details must be redirected to /login
  React.useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace(`/login?redirect=/books/${encodeURIComponent(bookId)}`);
    }
  }, [isAuthLoading, isAuthenticated, bookId, router]);

  // Borrow Dialog State
  const [isBorrowDialogOpen, setIsBorrowDialogOpen] = React.useState(false);
  const [returnDate, setReturnDate] = React.useState("");
  const [isBorrowing, setIsBorrowing] = React.useState(false);

  // Edit and Delete Dialog States
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  // Calculate default return date (e.g. 7 days from now)
  const defaultReturnDate = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  }, []);

  const minReturnDate = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  // Fetch Book Data
  const isCancelledRef = React.useRef(false);

  // Fetch Book Data
  const reloadBook = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await bookService.getBookById(bookId);
      if (!isCancelledRef.current) {
        setBook(data);
        setErrorMessage(null);
      }
    } catch (error) {
      if (!isCancelledRef.current) {
        setBook(null);
        setErrorMessage(
          error instanceof Error ? error.message : "Could not load book details."
        );
      }
    } finally {
      if (!isCancelledRef.current) {
        setIsLoading(false);
      }
    }
  }, [bookId]);

  React.useEffect(() => {
    isCancelledRef.current = false;
    void (async () => {
      try {
        const data = await bookService.getBookById(bookId);
        if (!isCancelledRef.current) {
          setBook(data);
          setErrorMessage(null);
        }
      } catch (error) {
        if (!isCancelledRef.current) {
          setBook(null);
          setErrorMessage(
            error instanceof Error ? error.message : "Could not load book details."
          );
        }
      } finally {
        if (!isCancelledRef.current) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      isCancelledRef.current = true;
    };
  }, [bookId]);

  // Open Borrow Modal
  const handleOpenBorrowDialog = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to borrow books from the library.");
      router.push(`/login?redirect=/books/${bookId}`);
      return;
    }

    if (!book || (book.quantity !== undefined && book.quantity <= 0)) {
      toast.error("This book is currently out of stock.");
      return;
    }

    setReturnDate(defaultReturnDate);
    setIsBorrowDialogOpen(true);
  };

  // Submit Borrow Request
  const handleConfirmBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book || !user) return;

    if (!returnDate) {
      toast.error("Please select a return date.");
      return;
    }

    setIsBorrowing(true);
    try {
      await borrowService.borrowBook({
        bookId: book.id || book._id || bookId,
        bookTitle: book.title,
        bookImage: book.image,
        userName: user.name || "BookNook Reader",
        userEmail: user.email,
        returnDate,
      });

      toast.success(`Successfully borrowed "${book.title}"! Due on ${returnDate}.`);

      // Optimistically decrement available copies
      setBook((prev) =>
        prev
          ? {
              ...prev,
              availableCopies: Math.max(0, (prev.availableCopies ?? prev.quantity ?? 1) - 1),
            }
          : null
      );

      setIsBorrowDialogOpen(false);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to process borrow request. Please try again.";
      toast.error(msg);
    } finally {
      setIsBorrowing(false);
    }
  };

  // Loading Skeleton View
  if (isAuthLoading || !isAuthenticated || isLoading) {
    return <BookDetailsSkeleton />;
  }

  // Error / Not Found View
  if (errorMessage || !book) {
    return (
      <div className="py-16 sm:py-24 bg-background min-h-screen flex items-center justify-center">
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/15 text-destructive mb-4">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Book Not Found</h2>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            {errorMessage || "The requested book could not be found in our library collection."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="default" size="sm">
              <Link href="/books" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to All Books
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/" className="gap-2">
                <Home className="h-4 w-4" />
                Home
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => reloadBook()}
              className="gap-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const availableCopies = book.availableCopies ?? book.quantity ?? 0;
  const isAvailable = availableCopies > 0;
  const copiesCount = availableCopies;
  const isOwner = Boolean(
    user?.email &&
      book?.userEmail &&
      user.email.toLowerCase() === book.userEmail.toLowerCase()
  );

  return (
    <div className="py-8 sm:py-12 bg-background min-h-screen transition-colors">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/books"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-primary transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Books</span>
          </Link>
        </div>

        {/* Main Details Card */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Book Cover Image */}
            <div className="md:col-span-5 lg:col-span-4 flex flex-col items-center">
              <div className="relative aspect-[3/4] w-full max-w-sm rounded-2xl overflow-hidden bg-surface border border-border/70 shadow-lg group">
                {book.image ? (
                  <Image
                    src={book.image}
                    alt={book.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 380px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground bg-surface">
                    <BookOpen className="h-20 w-20 text-primary/30" />
                  </div>
                )}
              </div>

              {/* Quick Status Pill */}
              <div className="mt-4 w-full text-center">
                {isAvailable ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Available for Borrowing ({copiesCount} {copiesCount === 1 ? "copy" : "copies"})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 border border-red-500/30 px-3 py-1 text-xs font-semibold text-red-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Currently Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Right Column: Title, Author, Description, Details & Action */}
            <div className="md:col-span-7 lg:col-span-8 flex flex-col space-y-6">
              {/* Category & Rating */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="default" className="text-xs font-semibold px-3 py-1">
                  {book.category}
                </Badge>

                {book.rating !== undefined && (
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{book.rating}</span>
                    {book.reviewsCount !== undefined && (
                      <span className="text-muted-foreground font-normal">
                        ({book.reviewsCount} reviews)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Title & Author */}
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                  {book.title}
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground mt-1 font-medium">
                  By <span className="text-foreground">{book.author}</span>
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Overview
                </h2>
                <p className="text-sm sm:text-base text-foreground/90 leading-relaxed whitespace-pre-line">
                  {book.description || "No overview provided for this title."}
                </p>
              </div>

              {/* Metadata Attributes Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-4 border-t border-border/60">
                {book.isbn && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-surface/50 p-3">
                    <Hash className="h-4 w-4 text-primary shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">ISBN</p>
                      <p className="text-xs font-medium text-foreground truncate">{book.isbn}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-surface/50 p-3">
                  <Copy className="h-4 w-4 text-primary shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Available Copies</p>
                    <p className="text-xs font-medium text-foreground truncate">{copiesCount}</p>
                  </div>
                </div>

                {book.userName && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-surface/50 p-3 col-span-2 sm:col-span-1">
                    <User className="h-4 w-4 text-primary shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Added By</p>
                      <p className="text-xs font-medium text-foreground truncate">{book.userName}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Contributor Actions & Primary Borrow CTA */}
              <div className="pt-6 border-t border-border/60 space-y-4">
                {isOwner && (
                  <div className="flex flex-wrap items-center gap-2.5 p-3.5 rounded-2xl bg-surface/80 border border-border/80 shadow-sm">
                    <span className="text-xs font-semibold text-muted-foreground mr-1">
                      Contributor Actions:
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditDialogOpen(true)}
                      className="gap-1.5 text-xs font-semibold"
                    >
                      <Edit className="h-3.5 w-3.5 text-primary" />
                      Edit Book
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Book
                    </Button>
                  </div>
                )}

                {isAuthenticated ? (
                  <Button
                    onClick={handleOpenBorrowDialog}
                    disabled={!isAvailable}
                    size="lg"
                    className="w-full sm:w-auto px-8 py-3 text-sm font-semibold shadow-xl shadow-primary/25 gap-2.5"
                  >
                    <BookmarkCheck className="h-4 w-4" />
                    <span>{isAvailable ? "Borrow This Book" : "Currently Out of Stock"}</span>
                  </Button>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <Button
                      onClick={handleOpenBorrowDialog}
                      size="lg"
                      className="w-full sm:w-auto px-8 py-3 text-sm font-semibold gap-2.5"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Sign In to Borrow</span>
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Membership is 100% free and gives you instant borrowing access.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Borrow Modal Dialog */}
      <Dialog open={isBorrowDialogOpen} onOpenChange={setIsBorrowDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Borrow Book</DialogTitle>
            <DialogDescription>
              Confirm your borrowing request. Please return it on time so other readers can enjoy it.
            </DialogDescription>
          </DialogHeader>

          {/* Book Summary Card in Dialog */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border/80 bg-surface mb-4">
            <div className="relative aspect-[3/4] w-12 rounded overflow-hidden bg-card shrink-0 border border-border/50">
              {book.image ? (
                <Image src={book.image} alt={book.title} fill className="object-cover" />
              ) : (
                <BookOpen className="h-6 w-6 m-auto text-primary/40" />
              )}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-foreground truncate">{book.title}</h4>
              <p className="text-[11px] text-muted-foreground truncate">{book.author}</p>
              <span className="text-[10px] text-emerald-400 font-medium">
                {copiesCount} {copiesCount === 1 ? "copy" : "copies"} left
              </span>
            </div>
          </div>

          <form onSubmit={handleConfirmBorrow} className="space-y-4">
            {/* User Name */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Your Name
              </label>
              <Input
                type="text"
                value={user?.name || ""}
                disabled
                className="bg-surface/50 text-muted-foreground cursor-not-allowed text-xs"
              />
            </div>

            {/* User Email */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Your Email
              </label>
              <Input
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-surface/50 text-muted-foreground cursor-not-allowed text-xs"
              />
            </div>

            {/* Return Date Picker */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5 flex items-center justify-between">
                <span>Return Date</span>
                <span className="text-[11px] text-muted-foreground font-normal flex items-center gap-1">
                  <Clock className="h-3 w-3 text-primary" />
                  Default: 7 days
                </span>
              </label>
              <div className="relative">
                <Input
                  type="date"
                  value={returnDate}
                  min={minReturnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  required
                  className="bg-surface border-border focus-visible:ring-primary text-xs"
                />
              </div>
            </div>

            <DialogFooter className="mt-6 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsBorrowDialogOpen(false)}
                disabled={isBorrowing}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={isBorrowing}
                className="gap-2 text-xs font-semibold"
              >
                {isBorrowing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <BookmarkCheck className="h-3.5 w-3.5" />
                    Confirm Borrow
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Book Modal Dialog */}
      <EditBookDialog
        book={book}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdated={(updated) => setBook(updated)}
      />

      {/* Delete Book Confirmation Modal Dialog */}
      <DeleteBookDialog
        book={book}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDeleted={() => {
          router.push("/books");
          router.refresh();
        }}
      />
    </div>
  );
}

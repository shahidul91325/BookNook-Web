"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Library,
  PlusCircle,
  Edit,
  Trash2,
  BookOpen,
  AlertCircle,
  RefreshCw,
  LogIn,
  ExternalLink,
} from "lucide-react";
import { bookService } from "@/services/book-service";
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
import { EditBookDialog } from "@/components/books/edit-book-dialog";
import { DeleteBookDialog } from "@/components/books/delete-book-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import type { Book } from "@/types";

export function MyBooksView() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [books, setBooks] = React.useState<Book[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [retryKey, setRetryKey] = React.useState(0);

  // Edit / Delete dialog states
  const [selectedBookForEdit, setSelectedBookForEdit] = React.useState<Book | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  const [selectedBookForDelete, setSelectedBookForDelete] = React.useState<Book | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  // Load books belonging to authenticated user
  React.useEffect(() => {
    let isCancelled = false;

    async function loadMyBooks() {
      try {
        const data = await bookService.getMyBooks(user?.email);
        if (!isCancelled) {
          setBooks(Array.isArray(data) ? data : []);
          setErrorMessage(null);
        }
      } catch (error) {
        if (!isCancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Could not load your added books from the server.";
          setErrorMessage(message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    if (isAuthenticated) {
      loadMyBooks();
    }

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, user?.email, retryKey]);

  // Handler after updating a book
  const handleBookUpdated = (updatedBook: Book) => {
    setBooks((prev) =>
      prev.map((b) =>
        (b.id || b._id) === (updatedBook.id || updatedBook._id) ? updatedBook : b
      )
    );
  };

  // Handler after deleting a book
  const handleBookDeleted = (deletedId: string) => {
    setBooks((prev) => prev.filter((b) => (b.id || b._id) !== deletedId));
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
            Please sign in to access your personal dashboard and manage the books you have added.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild variant="default" size="sm">
              <Link href="/login?redirect=/my-books" className="gap-2">
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

  return (
    <div className="py-8 sm:py-12 bg-background min-h-screen transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-border/80">
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase mb-1.5">
              <Library className="h-4 w-4" />
              <span>Personal Management</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                My Added Books
              </h1>
              {!isLoading && (
                <span className="inline-flex items-center rounded-full bg-primary/15 border border-primary/30 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  Total Books: {books.length}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Manage, update, and track all the books you have contributed to BookNook.
            </p>
          </div>

          <Button asChild variant="default" size="sm" className="gap-2 text-xs font-semibold self-start sm:self-auto shadow-md">
            <Link href="/add-book">
              <PlusCircle className="h-4 w-4" />
              Add a New Book
            </Link>
          </Button>
        </div>

        {/* Loading Skeleton View */}
        {isLoading && (
          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4 animate-pulse">
            <div className="h-6 w-48 bg-surface rounded" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 w-full bg-surface/70 rounded-xl" />
              ))}
            </div>
          </div>
        )}

        {/* Error State View */}
        {!isLoading && errorMessage && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center max-w-md mx-auto my-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/15 text-destructive mb-3.5">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Unable to load your books
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

        {/* Empty State View */}
        {!isLoading && !errorMessage && books.length === 0 && (
          <EmptyState
            icon={<BookOpen className="h-8 w-8 text-primary" />}
            title="No books added yet"
            description="You haven't contributed any books to the BookNook library yet. Share your first title to help other readers discover great reads!"
            actionLabel="Add Your First Book"
            actionHref="/add-book"
            className="my-10"
          />
        )}

        {/* Books Table View */}
        {!isLoading && !errorMessage && books.length > 0 && (
          <div className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[45%]">Book</TableHead>
                  <TableHead className="w-[20%]">Category</TableHead>
                  <TableHead className="w-[15%]">Available</TableHead>
                  <TableHead className="w-[20%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {books.map((book) => {
                  const bookId = book.id || book._id || "";
                  const isAvailable = (book.quantity || 0) > 0;

                  return (
                    <TableRow key={bookId} className="group">
                      {/* Book Thumbnail + Title + Author */}
                      <TableCell>
                        <div className="flex items-center gap-3.5">
                          <div className="relative aspect-[3/4] w-12 rounded-lg overflow-hidden bg-surface shrink-0 border border-border/50">
                            {book.image ? (
                              <Image
                                src={book.image}
                                alt={book.title}
                                fill
                                sizes="50px"
                                className="object-cover transition-transform group-hover:scale-105"
                              />
                            ) : (
                              <BookOpen className="h-5 w-5 m-auto text-primary/40" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/books/${bookId}`}
                              className="font-semibold text-foreground hover:text-primary transition-colors text-sm truncate block"
                              title={book.title}
                            >
                              {book.title}
                            </Link>
                            <p className="text-xs text-muted-foreground truncate">
                              By {book.author}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        <Badge variant="default" className="text-[11px] font-medium">
                          {book.category}
                        </Badge>
                      </TableCell>

                      {/* Available Copies */}
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                            isAvailable ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isAvailable ? "bg-emerald-400" : "bg-red-400"
                            }`}
                          />
                          {book.quantity || 0} copies
                        </span>
                      </TableCell>

                      {/* Action Buttons: View, Edit, Delete */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details */}
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

                          {/* Edit action */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBookForEdit(book);
                              setIsEditDialogOpen(true);
                            }}
                            className="h-8 px-2.5 gap-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>

                          {/* Delete action */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBookForDelete(book);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="h-8 px-2.5 gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-500/10 hover:border-red-500/30"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
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

      {/* Edit Book Dialog */}
      <EditBookDialog
        book={selectedBookForEdit}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdated={handleBookUpdated}
      />

      {/* Delete Book Confirmation Dialog */}
      <DeleteBookDialog
        book={selectedBookForDelete}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDeleted={handleBookDeleted}
      />
    </div>
  );
}

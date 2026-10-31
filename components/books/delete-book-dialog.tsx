"use client";

import * as React from "react";
import Image from "next/image";
import { AlertTriangle, BookOpen, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { bookService } from "@/services/book-service";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Book } from "@/types";

interface DeleteBookDialogProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: (deletedBookId: string) => void;
}

export function DeleteBookDialog({
  book,
  open,
  onOpenChange,
  onDeleted,
}: DeleteBookDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!book) return null;

  const bookId = book.id || book._id || "";

  const handleDelete = async () => {
    if (!bookId) return;

    setIsDeleting(true);
    try {
      await bookService.deleteBook(bookId);
      toast.success(`"${book.title}" was successfully deleted.`);
      onOpenChange(false);
      onDeleted(bookId);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete book. Please try again.";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-500 border border-red-500/20 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Delete Book</DialogTitle>
              <DialogDescription className="text-xs">
                This action is irreversible. The book will be permanently removed from the library.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Book Preview Card */}
        <div className="flex items-center gap-3 p-3 rounded-xl border border-border/80 bg-surface my-2">
          <div className="relative aspect-[3/4] w-12 rounded-lg overflow-hidden bg-card shrink-0 border border-border/50">
            {book.image ? (
              <Image src={book.image} alt={book.title} fill className="object-cover" />
            ) : (
              <BookOpen className="h-6 w-6 m-auto text-muted-foreground" />
            )}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-foreground truncate">{book.title}</h4>
            <p className="text-[11px] text-muted-foreground truncate">{book.author}</p>
            <span className="text-[10px] text-primary font-medium">{book.category}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Are you sure you want to remove <span className="font-semibold text-foreground">&ldquo;{book.title}&rdquo;</span>? All associated records and borrowing data for this volume will no longer be available.
        </p>

        <DialogFooter className="mt-6 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-2 text-xs font-semibold"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                Confirm Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import * as React from "react";
import {
  Edit,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { bookService } from "@/services/book-service";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Book, BookCategory, UpdateBookInput } from "@/types";

const CATEGORIES: BookCategory[] = [
  "Fiction",
  "Science",
  "History",
  "Kids",
  "Self Help",
  "Programming",
  "Fantasy",
  "Financial",
  "Others",
];

interface EditBookDialogProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (updatedBook: Book) => void;
}

interface FormErrors {
  title?: string;
  author?: string;
  image?: string;
  quantity?: string;
  description?: string;
}

interface EditBookFormInnerProps {
  book: Book;
  onOpenChange: (open: boolean) => void;
  onUpdated: (updatedBook: Book) => void;
}

function EditBookFormInner({ book, onOpenChange, onUpdated }: EditBookFormInnerProps) {
  const [title, setTitle] = React.useState(book.title || "");
  const [author, setAuthor] = React.useState(book.author || "");
  const [category, setCategory] = React.useState<BookCategory>((book.category as BookCategory) || "Fiction");
  const [image, setImage] = React.useState(book.image || "");
  const [quantity, setQuantity] = React.useState(String(book.quantity !== undefined ? book.quantity : 1));
  const [description, setDescription] = React.useState(book.description || "");

  const [errors, setErrors] = React.useState<FormErrors>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const bookId = book.id || book._id || "";

  const validateField = (field: string) => {
    const newErrors = { ...errors };

    if (field === "title") {
      if (!title.trim()) {
        newErrors.title = "Title is required.";
      } else if (title.trim().length < 2) {
        newErrors.title = "Must be at least 2 characters.";
      } else {
        delete newErrors.title;
      }
    }

    if (field === "author") {
      if (!author.trim()) {
        newErrors.author = "Author is required.";
      } else if (author.trim().length < 2) {
        newErrors.author = "Must be at least 2 characters.";
      } else {
        delete newErrors.author;
      }
    }

    if (field === "image") {
      if (!image.trim()) {
        newErrors.image = "Book cover image is required.";
      } else if (!/^https?:\/\/.+/i.test(image.trim()) && !image.trim().startsWith("/uploads/")) {
        newErrors.image = "Please upload an image or enter a valid URL.";
      } else {
        delete newErrors.image;
      }
    }

    if (field === "quantity") {
      const q = parseInt(quantity, 10);
      if (isNaN(q) || q < 0) {
        newErrors.quantity = "Must be 0 or greater.";
      } else {
        delete newErrors.quantity;
      }
    }

    if (field === "description") {
      if (!description.trim()) {
        newErrors.description = "Description is required.";
      } else if (description.trim().length < 10) {
        newErrors.description = "Must be at least 10 characters.";
      } else {
        delete newErrors.description;
      }
    }

    setErrors(newErrors);
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};
    if (!title.trim() || title.trim().length < 2) {
      newErrors.title = "Title must be at least 2 characters.";
    }
    if (!author.trim() || author.trim().length < 2) {
      newErrors.author = "Author must be at least 2 characters.";
    }
    if (!image.trim() || (!/^https?:\/\/.+/i.test(image.trim()) && !image.trim().startsWith("/uploads/"))) {
      newErrors.image = "Valid image or uploaded cover is required.";
    }
    const q = parseInt(quantity, 10);
    if (isNaN(q) || q < 0) {
      newErrors.quantity = "Quantity must be 0 or greater.";
    }
    if (!description.trim() || description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({
        title: true,
        author: true,
        image: true,
        quantity: true,
        description: true,
      });
      toast.error("Please correct the form errors.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: UpdateBookInput = {
        title: title.trim(),
        author: author.trim(),
        category,
        image: image.trim(),
        quantity: parseInt(quantity, 10) || 0,
        description: description.trim(),
      };

      const updated = await bookService.updateBook(bookId, payload);
      toast.success(`"${title}" has been updated.`);
      onOpenChange(false);
      onUpdated({
        ...book,
        ...payload,
        ...(updated || {}),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update book.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 my-2">
      {/* Row 1: Title & Author */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1">
            Title *
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => handleBlur("title")}
            className={errors.title && touched.title ? "border-red-500 text-xs" : "text-xs"}
          />
          {errors.title && touched.title && (
            <p className="flex items-center gap-1 text-[10px] text-red-500 mt-1">
              <AlertCircle className="h-3 w-3" />
              {errors.title}
            </p>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground block mb-1">
            Author *
          </label>
          <Input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            onBlur={() => handleBlur("author")}
            className={errors.author && touched.author ? "border-red-500 text-xs" : "text-xs"}
          />
          {errors.author && touched.author && (
            <p className="flex items-center gap-1 text-[10px] text-red-500 mt-1">
              <AlertCircle className="h-3 w-3" />
              {errors.author}
            </p>
          )}
        </div>
      </div>

      {/* Row 2: Category & Quantity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1">
            Category *
          </label>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value as BookCategory)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground block mb-1">
            Available Copies *
          </label>
          <Input
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onBlur={() => handleBlur("quantity")}
            className={errors.quantity && touched.quantity ? "border-red-500 text-xs" : "text-xs"}
          />
          {errors.quantity && touched.quantity && (
            <p className="flex items-center gap-1 text-[10px] text-red-500 mt-1">
              <AlertCircle className="h-3 w-3" />
              {errors.quantity}
            </p>
          )}
        </div>
      </div>

      {/* Row 3: Cover Image Upload & Preview */}
      <div>
        <label className="text-xs font-semibold text-foreground block mb-1">
          Cover Image *
        </label>
        <ImageUpload
          value={image}
          onChange={(url) => {
            setImage(url);
            setErrors((prev) => {
              const next = { ...prev };
              delete next.image;
              return next;
            });
          }}
          disabled={isSubmitting}
          error={touched.image ? errors.image : undefined}
        />
      </div>

      {/* Row 4: Short Description */}
      <div>
        <label className="text-xs font-semibold text-foreground block mb-1">
          Short Description *
        </label>
        <Textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => handleBlur("description")}
          className={errors.description && touched.description ? "border-red-500 text-xs" : "text-xs"}
        />
        {errors.description && touched.description && (
          <p className="flex items-center gap-1 text-[10px] text-red-500 mt-1">
            <AlertCircle className="h-3 w-3" />
            {errors.description}
          </p>
        )}
      </div>

      <DialogFooter className="mt-6 gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onOpenChange(false)}
          disabled={isSubmitting}
          className="text-xs"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="default"
          size="sm"
          disabled={isSubmitting}
          className="gap-2 text-xs font-semibold"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="h-3.5 w-3.5" />
              Save Changes
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EditBookDialog({
  book,
  open,
  onOpenChange,
  onUpdated,
}: EditBookDialogProps) {
  if (!book) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
              <Edit className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Edit Book Details</DialogTitle>
              <DialogDescription className="text-xs">
                Update the metadata and copies for this book in the library.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {open && (
          <EditBookFormInner
            key={`${book.id || book._id}-${open}`}
            book={book}
            onOpenChange={onOpenChange}
            onUpdated={onUpdated}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

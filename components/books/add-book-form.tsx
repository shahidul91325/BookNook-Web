'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PlusCircle, Loader2, AlertCircle, ArrowLeft, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { bookService } from '@/services/book-service';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/image-upload';
import { AuthLink } from '@/components/auth/auth-link';
import type { BookCategory, CreateBookInput } from '@/types';

const CATEGORIES: BookCategory[] = ['Fiction', 'Science', 'History', 'Kids', 'Others'];

interface FormErrors {
  title?: string;
  author?: string;
  category?: string;
  image?: string;
  quantity?: string;
  description?: string;
}

export function AddBookFormSkeleton() {
  return (
    <div className="py-8 sm:py-12 bg-background min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="h-4 w-32 bg-surface rounded mb-6 animate-pulse" />
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-xl space-y-6 animate-pulse">
          <div className="flex items-center gap-3 pb-6 border-b border-border/60">
            <div className="h-12 w-12 rounded-2xl bg-surface" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-surface rounded" />
              <div className="h-3.5 w-72 bg-surface/70 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="h-10 bg-surface rounded-xl" />
            <div className="h-10 bg-surface rounded-xl" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="h-10 bg-surface rounded-xl" />
            <div className="h-10 bg-surface rounded-xl" />
          </div>
          <div className="h-28 bg-surface rounded-xl" />
          <div className="h-11 w-40 bg-surface rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function AddBookForm() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Login redirect that preserves the user's originally requested route.
  const loginRedirect = React.useMemo(
    () => `/login?redirect=${encodeURIComponent(pathname)}`,
    [pathname]
  );

  // Unauthenticated Route Guard: Redirect to /login with return destination
  React.useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace(loginRedirect);
    }
  }, [isAuthLoading, isAuthenticated, router, loginRedirect]);

  // Form Field States
  const [title, setTitle] = React.useState('');
  const [author, setAuthor] = React.useState('');
  const [category, setCategory] = React.useState<BookCategory>('Fiction');
  const [image, setImage] = React.useState('');
  const [quantity, setQuantity] = React.useState('5');
  const [description, setDescription] = React.useState('');

  // Status & Validation States
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Mark field as touched on blur
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  // Validate single field
  const validateField = (field: string) => {
    const newErrors = { ...errors };

    if (field === 'title') {
      if (!title.trim()) {
        newErrors.title = 'Book title is required.';
      } else if (title.trim().length < 2) {
        newErrors.title = 'Title must be at least 2 characters.';
      } else {
        delete newErrors.title;
      }
    }

    if (field === 'author') {
      if (!author.trim()) {
        newErrors.author = 'Author name is required.';
      } else if (author.trim().length < 2) {
        newErrors.author = 'Author must be at least 2 characters.';
      } else {
        delete newErrors.author;
      }
    }

    if (field === 'image') {
      if (!image.trim()) {
        newErrors.image = 'Book cover image is required.';
      } else if (!/^https?:\/\/.+/i.test(image.trim()) && !image.trim().startsWith('/uploads/')) {
        newErrors.image = 'Please upload an image or enter a valid HTTP/HTTPS URL.';
      } else {
        delete newErrors.image;
      }
    }

    if (field === 'quantity') {
      const q = parseInt(quantity, 10);
      if (isNaN(q) || q < 1) {
        newErrors.quantity = 'Quantity must be at least 1 copy.';
      } else {
        delete newErrors.quantity;
      }
    }

    if (field === 'description') {
      if (!description.trim()) {
        newErrors.description = 'Short description is required.';
      } else if (description.trim().length < 10) {
        newErrors.description = 'Description should be at least 10 characters.';
      } else {
        delete newErrors.description;
      }
    }

    setErrors(newErrors);
  };

  // Validate all fields before submission
  const validateAll = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Book title is required.';
    } else if (title.trim().length < 2) {
      newErrors.title = 'Title must be at least 2 characters.';
    }

    if (!author.trim()) {
      newErrors.author = 'Author name is required.';
    } else if (author.trim().length < 2) {
      newErrors.author = 'Author must be at least 2 characters.';
    }

    if (!image.trim()) {
      newErrors.image = 'Book cover image is required.';
    } else if (!/^https?:\/\/.+/i.test(image.trim()) && !image.trim().startsWith('/uploads/')) {
      newErrors.image = 'Please upload an image or enter a valid HTTP/HTTPS URL.';
    }

    const q = parseInt(quantity, 10);
    if (isNaN(q) || q < 1) {
      newErrors.quantity = 'Quantity must be at least 1 copy.';
    }

    if (!description.trim()) {
      newErrors.description = 'Short description is required.';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description should be at least 10 characters.';
    }

    setErrors(newErrors);
    setTouched({
      title: true,
      author: true,
      category: true,
      image: true,
      quantity: true,
      description: true,
    });

    return Object.keys(newErrors).length === 0;
  };

  // Form Submission Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAll()) {
      toast.error('Please resolve the validation errors before submitting.');
      return;
    }

    if (!user) {
      toast.error('Authentication required. Please sign in.');
      router.push(loginRedirect);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateBookInput = {
        title: title.trim(),
        author: author.trim(),
        category,
        image: image.trim(),
        quantity: parseInt(quantity, 10) || 1,
        description: description.trim(),
        userName: user.name || 'BookNook Member',
        userEmail: user.email,
      };

      await bookService.createBook(payload);

      toast.success(`"${title}" has been added to the BookNook library!`);

      // Redirect to user's dashboard or books catalog
      router.push('/my-books');
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit book to the server. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auth Loading Skeleton (matches form layout to prevent layout shift)
  if (isAuthLoading) {
    return <AddBookFormSkeleton />;
  }

  // Unauthenticated Guard Screen
  if (!isAuthenticated) {
    return (
      <div className="py-16 sm:py-24 bg-background min-h-screen flex items-center justify-center">
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-4 shadow-sm">
            <LogIn className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Sign In Required</h2>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            You must be logged in to contribute and publish books to the BookNook community library.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button asChild variant="default" size="sm">
              <AuthLink href="/login?redirect=/add-book" className="gap-2">
                <LogIn className="h-4 w-4" />
                Sign In to Continue
              </AuthLink>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/books">Browse Library</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 bg-background min-h-screen transition-colors">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/books"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-primary transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Books</span>
          </Link>
        </div>

        {/* Form Container Card */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-xl">
          {/* Form Header */}
          <div className="flex items-center gap-3 pb-6 mb-8 border-b border-border/60">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shrink-0">
              <PlusCircle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">Add a New Book</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Fill in the details to publish a new book to the BookNook library collection.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Title & Author */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Book Title */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Book Title <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Atomic Habits"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => handleBlur('title')}
                  className={errors.title && touched.title ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {errors.title && touched.title && (
                  <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1 font-medium">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{errors.title}</span>
                  </p>
                )}
              </div>

              {/* Author Name */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Author Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. James Clear"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  onBlur={() => handleBlur('author')}
                  className={errors.author && touched.author ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {errors.author && touched.author && (
                  <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1 font-medium">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{errors.author}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Category & Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <Select value={category} onChange={(e) => setCategory(e.target.value as BookCategory)}>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Quantity / Available Copies */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Available Copies <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 5"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  onBlur={() => handleBlur('quantity')}
                  className={errors.quantity && touched.quantity ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {errors.quantity && touched.quantity && (
                  <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1 font-medium">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{errors.quantity}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Row 3: Book Cover Image Upload & Preview */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Book Cover Image <span className="text-red-500">*</span>
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
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Short Description / Overview <span className="text-red-500">*</span>
              </label>
              <Textarea
                rows={4}
                placeholder="Enter a brief synopsis of the book, core themes, or why readers should check it out..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => handleBlur('description')}
                className={errors.description && touched.description ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.description && touched.description && (
                <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1 font-medium">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.description}</span>
                </p>
              )}
            </div>

            {/* Row 5: Read-Only User Info (Logged In Member) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-border/60">
              {/* User Name */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">Contributor Name</label>
                <Input
                  type="text"
                  value={user?.name || 'BookNook Member'}
                  disabled
                  className="bg-surface/50 text-muted-foreground cursor-not-allowed text-xs"
                />
              </div>

              {/* User Email */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">Contributor Email</label>
                <Input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-surface/50 text-muted-foreground cursor-not-allowed text-xs"
                />
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-6 border-t border-border/60 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="default"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-7 gap-2 shadow-lg shadow-primary/20 font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Publishing Book...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4" />
                    <span>Add Book</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

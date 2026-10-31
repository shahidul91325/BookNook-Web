"use client";

import * as React from "react";
import Image from "next/image";
import {
  UploadCloud,
  X,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Link2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { uploadService } from "@/services/upload-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export function ImageUpload({
  value,
  onChange,
  disabled = false,
  className,
  error,
}: ImageUploadProps) {
  const [mode, setMode] = React.useState<"upload" | "url">("upload");
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [urlInput, setUrlInput] = React.useState(value || "");
  const [previewError, setPreviewError] = React.useState(false);
  const [selectedFileName, setSelectedFileName] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sync internal urlInput when value changes externally (React recommended pattern)
  const [prevValue, setPrevValue] = React.useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    setUrlInput(value || "");
    setPreviewError(false);
  }

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Please select a valid image file (JPEG, PNG, WebP, GIF, or AVIF).";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Image file size exceeds the 5MB limit.";
    }
    return null;
  };

  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsUploading(true);
    setSelectedFileName(file.name);
    setPreviewError(false);

    try {
      const uploadedUrl = await uploadService.uploadBookCover(file);
      onChange(uploadedUrl);
      toast.success("Cover image uploaded successfully!");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to upload image.";
      toast.error(message);
      setSelectedFileName(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      onChange("");
      return;
    }
    if (!/^https?:\/\/.+/i.test(trimmed) && !trimmed.startsWith("/uploads/")) {
      toast.error("Please enter a valid HTTP/HTTPS image URL.");
      return;
    }
    onChange(trimmed);
    toast.success("Image URL updated.");
  };

  const handleRemove = () => {
    onChange("");
    setUrlInput("");
    setSelectedFileName(null);
    setPreviewError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const hasImage = Boolean(value && !previewError);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-border/70 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors",
              mode === "upload"
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors",
              mode === "url"
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Link2 className="h-3.5 w-3.5" />
            Image URL
          </button>
        </div>

        {hasImage && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Image Ready
          </span>
        )}
      </div>

      {/* Main Upload / Preview Area */}
      <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4 items-start">
        {/* Aspect Ratio Preview Card */}
        <div className="relative aspect-[3/4] w-full max-w-[140px] mx-auto sm:mx-0 rounded-xl overflow-hidden bg-surface border border-border/70 flex items-center justify-center text-muted-foreground shadow-sm group">
          {hasImage ? (
            <>
              <Image
                src={value}
                alt="Book cover preview"
                fill
                sizes="140px"
                className="object-cover transition-transform group-hover:scale-105 duration-300"
                onError={() => setPreviewError(true)}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                  disabled={disabled || isUploading}
                  className="h-8 w-8 p-0 rounded-full shadow-lg"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : isUploading ? (
            <div className="flex flex-col items-center justify-center p-3 text-center">
              <Loader2 className="h-7 w-7 text-primary animate-spin mb-2" />
              <span className="text-[10px] font-medium text-foreground">
                Uploading...
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-3 text-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground/40 mb-1.5" />
              <span className="text-[11px] text-muted-foreground font-medium">
                No Cover
              </span>
              <span className="text-[9px] text-muted-foreground/70">
                Aspect 3:4
              </span>
            </div>
          )}
        </div>

        {/* Input & Action Controls */}
        <div className="flex-1 w-full space-y-3">
          {mode === "upload" ? (
            <div>
              {/* Hidden Native File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                onChange={handleFileChange}
                disabled={disabled || isUploading}
                className="hidden"
                id="book-cover-file-input"
              />

              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => {
                  if (!disabled && !isUploading) {
                    fileInputRef.current?.click();
                  }
                }}
                className={cn(
                  "relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 text-center",
                  isDragging
                    ? "border-primary bg-primary/5 scale-[0.99]"
                    : "border-border/80 hover:border-primary/50 hover:bg-surface/50",
                  (disabled || isUploading) && "opacity-60 cursor-not-allowed",
                  error && "border-red-500/70"
                )}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-xs font-semibold text-foreground">
                      Uploading to BookNook storage...
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Please wait a moment while the image is processed.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2 shadow-inner">
                      <UploadCloud className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">
                      <span className="text-primary hover:underline">
                        Click to browse
                      </span>{" "}
                      or drag & drop
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      JPEG, PNG, WebP, GIF, or AVIF (max 5MB)
                    </p>
                    {selectedFileName && (
                      <p className="text-[11px] text-primary font-medium mt-2 bg-primary/10 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {selectedFileName}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Quick Actions if image exists */}
              {hasImage && (
                <div className="flex items-center gap-2 mt-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isUploading}
                    className="h-8 text-xs gap-1.5"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Change Image
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    disabled={disabled || isUploading}
                    className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10 gap-1.5"
                  >
                    <X className="h-3 w-3" />
                    Remove
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApplyUrl();
                    }
                  }}
                  disabled={disabled}
                  className={cn("text-xs h-9", error && "border-red-500")}
                />
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleApplyUrl}
                  disabled={disabled}
                  className="h-9 px-3 text-xs shrink-0"
                >
                  Apply URL
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Paste a direct image link from Unsplash, ImgBB, or any public web image.
              </p>
              {hasImage && (
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    disabled={disabled}
                    className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10 gap-1.5"
                  >
                    <X className="h-3 w-3" />
                    Clear Image
                  </Button>
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="flex items-center gap-1.5 text-[11px] text-red-500 font-medium">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

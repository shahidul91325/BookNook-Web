"use client";

import * as React from "react";
import Image from "next/image";
import {
  Camera,
  User,
  Loader2,
  RefreshCw,
  X,
  AlertCircle,
  Link2,
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

interface AvatarUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export function AvatarUpload({
  value,
  onChange,
  disabled = false,
  className,
  error,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [showUrlInput, setShowUrlInput] = React.useState(false);
  const [urlInput, setUrlInput] = React.useState(value || "");
  const [previewError, setPreviewError] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sync internal urlInput when value changes externally
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
      return "Avatar image size exceeds the 5MB limit.";
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
    setPreviewError(false);

    try {
      const uploadedUrl = await uploadService.uploadBookCover(
        file,
        "registration-avatar"
      );
      onChange(uploadedUrl);
      toast.success("Avatar image uploaded successfully!");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to upload avatar image.";
      toast.error(message);
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
    toast.success("Avatar URL applied.");
  };

  const handleRemove = () => {
    onChange("");
    setUrlInput("");
    setPreviewError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const hasImage = Boolean(value && !previewError);

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-center gap-4">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="hidden"
          id="avatar-file-input"
        />

        {/* Avatar Preview Circle */}
        <div className="relative group shrink-0">
          <div
            onClick={() => {
              if (!disabled && !isUploading) {
                fileInputRef.current?.click();
              }
            }}
            className={cn(
              "relative h-16 w-16 sm:h-18 sm:w-18 rounded-full overflow-hidden bg-surface border-2 flex items-center justify-center transition-all cursor-pointer shadow-sm",
              hasImage
                ? "border-primary/40 hover:border-primary"
                : "border-dashed border-border hover:border-primary/60 hover:bg-surface-hover",
              isUploading && "opacity-75 cursor-wait",
              disabled && "opacity-50 cursor-not-allowed",
              error && "border-destructive"
            )}
            title="Click to choose profile avatar"
          >
            {hasImage ? (
              <Image
                src={value}
                alt="Avatar preview"
                fill
                sizes="72px"
                className="object-cover"
                onError={() => setPreviewError(true)}
              />
            ) : isUploading ? (
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                <User className="h-7 w-7" />
              </div>
            )}

            {/* Hover overlay for changing avatar */}
            {!isUploading && !disabled && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera className="h-5 w-5" />
              </div>
            )}
          </div>
        </div>

        {/* Buttons & Actions */}
        <div className="flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              className="h-8 text-xs font-semibold gap-1.5 border-border/80 hover:border-primary/40 hover:bg-surface-hover"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  Uploading...
                </>
              ) : hasImage ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 text-primary" />
                  Change Photo
                </>
              ) : (
                <>
                  <Camera className="h-3.5 w-3.5 text-primary" />
                  Upload Avatar
                </>
              )}
            </Button>

            {hasImage && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={disabled || isUploading}
                className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10 gap-1"
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </Button>
            )}

            <button
              type="button"
              onClick={() => setShowUrlInput((prev) => !prev)}
              className="text-[11px] text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 ml-auto"
            >
              <Link2 className="h-3 w-3" />
              <span>{showUrlInput ? "Hide URL" : "Paste URL"}</span>
            </button>
          </div>

          <p className="text-[10px] text-muted-foreground">
            JPG, PNG, WebP or GIF up to 5MB.
          </p>
        </div>
      </div>

      {/* URL Input Dropdown */}
      {showUrlInput && (
        <div className="flex gap-2 pt-1">
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
            className="text-xs h-8"
          />
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleApplyUrl}
            disabled={disabled}
            className="h-8 px-2.5 text-xs shrink-0"
          >
            Apply
          </Button>
        </div>
      )}

      {error && (
        <p className="flex items-center gap-1 text-[11px] text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export interface UploadResponse {
  success: boolean;
  url: string;
  filename?: string;
  size?: number;
  type?: string;
  provider?: string;
  error?: string;
}

export class UploadService {
  /**
   * Upload an image file for a book cover.
   * Sends multipart/form-data to /api/upload route handler.
   */
  async uploadBookCover(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data: UploadResponse = await response.json().catch(() => ({
      success: false,
      url: "",
      error: `Upload failed with status code ${response.status}`,
    }));

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to upload image. Please try again.");
    }

    return data.url;
  }
}

export const uploadService = new UploadService();

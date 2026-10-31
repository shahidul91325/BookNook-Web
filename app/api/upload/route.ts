import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: "No file provided. Please select an image file." },
        { status: 400 }
      );
    }

    // Type validation
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Only JPEG, PNG, WebP, GIF, and AVIF images are allowed.",
        },
        { status: 400 }
      );
    }

    // Size validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "Image size exceeds the 5MB limit. Please upload a smaller image.",
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Check if an external storage service API key is configured (e.g. ImgBB)
    const imgbbApiKey = process.env.IMGBB_API_KEY;
    if (imgbbApiKey) {
      try {
        const imgbbForm = new FormData();
        imgbbForm.append("image", buffer.toString("base64"));

        const imgbbRes = await fetch(
          `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`,
          {
            method: "POST",
            body: imgbbForm,
          }
        );

        if (imgbbRes.ok) {
          const imgbbData = await imgbbRes.json();
          if (imgbbData?.data?.url) {
            return NextResponse.json({
              success: true,
              url: imgbbData.data.url,
              provider: "imgbb",
              size: file.size,
              type: file.type,
            });
          }
        }
      } catch (err) {
        console.warn("ImgBB upload failed, falling back to local storage:", err);
      }
    }

    // Local file storage in public/uploads
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Derive file extension
    let ext = "jpg";
    if (file.type === "image/png") ext = "png";
    else if (file.type === "image/webp") ext = "webp";
    else if (file.type === "image/gif") ext = "gif";
    else if (file.type === "image/avif") ext = "avif";
    else if (file.type === "image/jpeg" || file.type === "image/jpg") ext = "jpg";

    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
    const filename = `book-cover-${uniqueSuffix}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: file.size,
      type: file.type,
      provider: "local",
    });
  } catch (error) {
    console.error("Upload handler error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to upload file.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

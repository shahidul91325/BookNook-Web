import { NextRequest, NextResponse } from "next/server";

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

    // ImgBB is the only storage backend. The API key is read server-side only
    // and is never exposed to the browser.
    const imgbbApiKey = process.env.IMGBB_API_KEY;
    if (!imgbbApiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Image upload is not configured. Set the IMGBB_API_KEY environment variable.",
        },
        { status: 500 }
      );
    }

    const imgbbForm = new FormData();
    imgbbForm.append("image", buffer.toString("base64"));

    const imgbbRes = await fetch(
      `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`,
      {
        method: "POST",
        body: imgbbForm,
      }
    );

    const imgbbData = await imgbbRes.json().catch(() => null);

    if (!imgbbRes.ok || !imgbbData?.data?.url) {
      const detail =
        imgbbData?.error?.message ||
        `ImgBB upload failed with status ${imgbbRes.status}`;
      return NextResponse.json(
        { success: false, error: detail },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      url: imgbbData.data.url,
      provider: "imgbb",
      size: file.size,
      type: file.type,
      filename: imgbbData.data?.filename ?? undefined,
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

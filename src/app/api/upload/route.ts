import { NextRequest, NextResponse } from "next/server";
import { createPresignedUploadUrl, getPublicUrl } from "@/lib/s3";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentType, filename } = body as {
      contentType?: string;
      filename?: string;
    };

    if (!contentType || !ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: "Invalid or missing content type. Use JPEG, PNG, or WebP." },
        { status: 400 }
      );
    }

    const ext = contentType.split("/")[1] ?? "jpg";
    const key = `uploads/${Date.now()}-${(filename ?? "image").replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 64)}.${ext}`;

    const result = await createPresignedUploadUrl(key, contentType);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      uploadUrl: result.url,
      key: result.key,
      publicUrl: getPublicUrl(result.key),
    });
  } catch (e) {
    console.error("Upload API error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 }
    );
  }
}

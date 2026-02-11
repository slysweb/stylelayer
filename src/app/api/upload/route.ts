import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getPublicUrl } from "@/lib/s3";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Proxy upload: accepts file in FormData, uploads to R2 via binding.
 * Avoids CORS entirely - browser only talks to same-origin.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided. Use FormData with key 'file'." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid type. Use JPEG, PNG, or WebP." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File must be under 10MB." },
        { status: 400 }
      );
    }

    const ext = file.type.split("/")[1] ?? "jpg";
    const key = `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 64)}.${ext}`;

    const ctx = await getCloudflareContext({ async: true });
    const bucket = (ctx.env as { R2_BUCKET?: { put: (key: string, value: BodyInit, opts?: { httpMetadata?: { contentType?: string } }) => Promise<void> } }).R2_BUCKET;

    if (!bucket) {
      return NextResponse.json(
        { error: "R2 bucket not configured. Add R2_BUCKET binding." },
        { status: 500 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    await bucket.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    const publicUrl = getPublicUrl(key);

    return NextResponse.json({
      key,
      publicUrl,
    });
  } catch (e) {
    console.error("Upload API error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 }
    );
  }
}

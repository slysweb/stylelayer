import { AwsClient } from "aws4fetch";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME ?? "style-layer-assets";
const publicDomain = process.env.R2_PUBLIC_DOMAIN;

if (!accountId || !accessKeyId || !secretAccessKey) {
  console.warn(
    "R2 credentials missing. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY."
  );
}

const r2BaseUrl =
  accountId && accessKeyId && secretAccessKey
    ? `https://${accountId}.r2.cloudflarestorage.com/${bucketName}`
    : null;

/**
 * Generate a presigned URL for direct upload to R2.
 * Uses aws4fetch (Web API only) - compatible with Cloudflare Workers (no fs).
 */
export async function createPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<{ url: string; key: string } | { error: string }> {
  if (!r2BaseUrl || !accessKeyId || !secretAccessKey) {
    return { error: "R2 storage not configured" };
  }

  const client = new AwsClient({
    accessKeyId,
    secretAccessKey,
    service: "s3",
    region: "auto",
  });

  const objectUrl = `${r2BaseUrl}/${key}?X-Amz-Expires=${expiresIn}`;

  try {
    const signedRequest = await client.sign(
      new Request(objectUrl, {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
        },
      }),
      { aws: { signQuery: true } }
    );
    return { url: signedRequest.url.toString(), key };
  } catch (e) {
    console.error("Presigned URL error:", e);
    return {
      error: e instanceof Error ? e.message : "Failed to create upload URL",
    };
  }
}

/**
 * Get public URL for an object (if R2 public bucket or custom domain is set).
 */
export function getPublicUrl(key: string): string {
  if (publicDomain) {
    const base = publicDomain.replace(/\/$/, "");
    return `${base}/${key}`;
  }
  if (accountId && bucketName) {
    return `https://pub-${accountId}.r2.dev/${bucketName}/${key}`;
  }
  return key;
}

type R2Bucket = {
  put: (
    key: string,
    value: ArrayBuffer | ReadableStream,
    opts?: { httpMetadata?: { contentType?: string } }
  ) => Promise<void>;
};

async function getR2Bucket(): Promise<R2Bucket | null> {
  try {
    const ctx = await getCloudflareContext({ async: true });
    return (ctx.env as { R2_BUCKET?: R2Bucket }).R2_BUCKET ?? null;
  } catch {
    return null;
  }
}

/**
 * Download an image from a URL and upload it to R2.
 * Returns the permanent public URL, or null on failure.
 */
export async function uploadImageToR2FromUrl(
  sourceUrl: string,
  keyPrefix = "results"
): Promise<string | null> {
  try {
    const bucket = await getR2Bucket();
    if (!bucket) {
      console.error("R2 bucket binding not available");
      return null;
    }

    const res = await fetch(sourceUrl);
    if (!res.ok) {
      console.error(`Failed to download image: ${res.status}`);
      return null;
    }

    const contentType = res.headers.get("content-type") ?? "image/png";
    const ext = contentType.includes("jpeg") || contentType.includes("jpg") ? "jpg" : "png";
    const key = `${keyPrefix}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const arrayBuffer = await res.arrayBuffer();
    await bucket.put(key, arrayBuffer, {
      httpMetadata: { contentType },
    });

    return getPublicUrl(key);
  } catch (e) {
    console.error("uploadImageToR2FromUrl error:", e);
    return null;
  }
}

/**
 * Upload base64-encoded image data to R2.
 * Returns the permanent public URL, or null on failure.
 */
export async function uploadBase64ToR2(
  base64Data: string,
  keyPrefix = "results"
): Promise<string | null> {
  try {
    const bucket = await getR2Bucket();
    if (!bucket) {
      console.error("R2 bucket binding not available");
      return null;
    }

    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const key = `${keyPrefix}/${Date.now()}-${crypto.randomUUID()}.png`;
    await bucket.put(key, bytes.buffer, {
      httpMetadata: { contentType: "image/png" },
    });

    return getPublicUrl(key);
  } catch (e) {
    console.error("uploadBase64ToR2 error:", e);
    return null;
  }
}

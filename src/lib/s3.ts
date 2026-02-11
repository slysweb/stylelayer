import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

const s3Client =
  accountId && accessKeyId && secretAccessKey
    ? new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      })
    : null;

export type UploadResult =
  | { ok: true; key: string; url: string }
  | { ok: false; error: string };

/**
 * Generate a presigned URL for direct upload to R2.
 * Frontend uploads to this URL, then we use the returned key for the generation.
 */
export async function createPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<{ url: string; key: string } | { error: string }> {
  if (!s3Client) {
    return { error: "R2 storage not configured" };
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return { url, key };
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

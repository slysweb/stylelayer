import { AwsClient } from "aws4fetch";

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

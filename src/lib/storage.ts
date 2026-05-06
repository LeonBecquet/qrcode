import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "@/lib/env";

let _r2: S3Client | null = null;

function getR2(): S3Client {
  if (_r2) return _r2;
  if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
    throw new Error("R2 storage not configured. See .env.example for required variables.");
  }
  _r2 = new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
  return _r2;
}

export async function uploadToR2(params: {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
}): Promise<string> {
  if (!env.R2_BUCKET) throw new Error("R2_BUCKET missing.");
  if (!env.R2_PUBLIC_URL) throw new Error("R2_PUBLIC_URL missing.");

  const client = getR2();
  await client.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return `${env.R2_PUBLIC_URL.replace(/\/$/, "")}/${params.key}`;
}

export const ALLOWED_IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function inferExtension(mimeType: string): string {
  const ext = mimeType.split("/")[1] ?? "jpg";
  return ext === "jpeg" ? "jpg" : ext;
}

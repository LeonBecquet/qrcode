import { put } from "@vercel/blob";
import { env } from "@/lib/env";

/**
 * Upload d'images via Vercel Blob (storage natif Vercel).
 *
 * En prod : `BLOB_READ_WRITE_TOKEN` est injecté automatiquement par Vercel
 * quand le store Blob est activé sur le projet (Storage → Blob → Connect).
 *
 * En dev : ajoute la variable manuellement dans .env.local (Vercel CLI fait
 * `vercel env pull` pour la récupérer).
 */
export async function uploadImage(params: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<string> {
  if (!env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "Stockage d'images non configuré. Activez Vercel Blob dans Vercel → Storage.",
    );
  }

  const blob = await put(params.key, params.body, {
    access: "public",
    contentType: params.contentType,
    cacheControlMaxAge: 31_536_000,
    addRandomSuffix: false,
    allowOverwrite: true,
    token: env.BLOB_READ_WRITE_TOKEN,
  });

  return blob.url;
}

/**
 * Alias historique — anciennes call sites utilisent uploadToR2.
 * Redirige vers uploadImage pour ne pas casser le code existant.
 * @deprecated Use uploadImage instead.
 */
export const uploadToR2 = uploadImage;

export const ALLOWED_IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function inferExtension(mimeType: string): string {
  const ext = mimeType.split("/")[1] ?? "jpg";
  return ext === "jpeg" ? "jpg" : ext;
}

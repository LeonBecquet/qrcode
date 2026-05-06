import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.APP_URL.replace(/\/$/, "");
  const now = new Date();

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/signin`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/legal/mentions-legales`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal/cgu`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal/cgv`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal/confidentialite`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}

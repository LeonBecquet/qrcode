import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = env.APP_URL.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/admin/",
          "/onboarding",
          // Pages clients (menu d'un resto) — on ne veut pas les indexer
          "/r/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}

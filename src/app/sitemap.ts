import type { MetadataRoute } from "next";
import { getAllPostMeta } from "@/lib/posts";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/blog", "/about", "/contact", "/privacy-policy", "/terms-of-service"].map((p) => ({
    url: `${SITE.url}${p}`,
    lastModified: new Date(),
  }));
  const posts = getAllPostMeta().map((p) => ({
    url: `${SITE.url}/blog/${p.slug}`,
    lastModified: new Date(p.date),
  }));
  return [...staticRoutes, ...posts];
}

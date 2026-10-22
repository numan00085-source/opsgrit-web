import type { MetadataRoute } from "next";
import { getAllPostMeta } from "@/lib/posts";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/blog", "/about", "/tools", "/tools/ops-bot", "/tools/cutover-simulator", "/tools/roi-calculator", "/tools/sop-builder", "/tools/invoice-generator", "/tools/raci-generator", "/tools/out-of-office-generator", "/tools/stack-audit", "/tools/readiness-scorecard", "/glossary", "/topics/ai-automation", "/topics/ops-stack", "/topics/process-sops", "/editorial-policy", "/advertise", "/affiliate-disclosure", "/contact", "/privacy-policy", "/terms-of-service"].map((p) => ({
    url: `${SITE.url}${p}`,
    lastModified: new Date(),
  }));
  const posts = getAllPostMeta().map((p) => ({
    url: `${SITE.url}/blog/${p.slug}`,
    lastModified: new Date(p.date),
  }));
  return [...staticRoutes, ...posts];
}

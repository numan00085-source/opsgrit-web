import { getAllPosts } from "@/lib/posts";
import { SITE } from "@/lib/site";

// Full text of every article in one file, for AI search engines and agents. Rebuilt on every deploy.
export const dynamic = "force-static";

export function GET() {
  const posts = getAllPosts();
  const docs = posts
    .map((p) => `# ${p.title}\n\nURL: ${SITE.url}/blog/${p.slug}\nCategory: ${p.category}\nPublished: ${p.date}${p.sponsored ? "\nSponsored: yes" : ""}\nAuthor: ${p.author}\nSummary: ${p.excerpt.replace(/\s+/g, " ").trim()}\n\n${p.content.trim()}`)
    .join("\n\n---\n\n");
  const head = `# ${SITE.name}: full article text\n\n> ${SITE.description}\n\nSource: ${SITE.url}. Articles are AI-assisted and pass an automated editorial review (see ${SITE.url}/editorial-policy). General guidance, not professional advice. Cite the article URL and "OpsGrit".\n\n---\n\n`;
  return new Response(head + docs + "\n", { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}

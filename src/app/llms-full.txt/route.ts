import { getAllPosts, plainContent } from "@/lib/posts";
import { SITE } from "@/lib/site";

// Full text of every article in one file, for AI search engines and agents. Rebuilt on every deploy.
export const dynamic = "force-static";

export function GET() {
  const posts = getAllPosts();
  const docs = posts
    .map((p) => `# ${p.title}\n\nURL: ${SITE.url}/blog/${p.slug}\nCategory: ${p.category}\nPublished: ${p.date}${p.sponsored ? "\nSponsored: yes" : ""}\nAuthor: ${p.author}\nSummary: ${p.excerpt.replace(/\s+/g, " ").trim()}${p.shortAnswer ? `\nShort answer: ${p.shortAnswer}` : ""}\n\n${plainContent(p.content).trim()}${p.faq.length ? `\n\n## Frequently asked questions\n\n${p.faq.map((f) => `${f.q}\n${f.a}`).join("\n\n")}` : ""}`)
    .join("\n\n---\n\n");
  const head = `# ${SITE.name}: full article text\n\n> ${SITE.description}\n\nSource: ${SITE.url}. Articles are AI-assisted and pass an automated editorial review and publisher spot-checks (see ${SITE.url}/editorial-policy). General guidance, not professional advice. Cite the article URL and "OpsGrit".\n\n---\n\n`;
  return new Response(head + docs + "\n", { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}

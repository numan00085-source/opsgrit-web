import type { Metadata } from "next";
import { getAllPostMeta } from "@/lib/posts";
import { CATEGORIES } from "@/lib/site";
import BlogExplorer from "@/components/BlogExplorer";

export const metadata: Metadata = {
  title: "Articles",
  description: "Search OpsGrit articles on AI automation, the modern ops stack and process SOPs.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const posts = getAllPostMeta();
  return (
    <div className="container-page py-14">
      <header className="mb-10 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-white">Articles</h1>
        <p className="mt-3 text-slate-400">Playbooks and teardowns for operators. Filter by topic or search by keyword.</p>
      </header>
      <BlogExplorer posts={posts} categories={CATEGORIES.map((c) => c.name)} />
    </div>
  );
}

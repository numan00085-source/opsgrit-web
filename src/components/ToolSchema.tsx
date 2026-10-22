import { SITE } from "@/lib/site";

/** WebApplication structured data for a free in-browser tool. */
export default function ToolSchema({ name, description, path, category = "BusinessApplication" }: { name: string; description: string; path: string; category?: string }) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url: `${SITE.url}${path}`,
    applicationCategory: category,
    operatingSystem: "Any (runs in a web browser)",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />;
}

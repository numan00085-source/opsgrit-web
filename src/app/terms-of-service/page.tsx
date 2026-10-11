import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of the OpsGrit website and content.",
  alternates: { canonical: "/terms-of-service" },
};

export default function TermsPage() {
  return (
    <PolicyPage title="Terms of Service" updated={SITE.updated}>
      <p>
        By accessing or using {SITE.name} (the &quot;Site&quot;), you agree to these Terms of Service. If you do not
        agree, please do not use the Site.
      </p>

      <h2>Use of the Site</h2>
      <p>
        You may use the Site for lawful, personal or internal business purposes. You agree not to misuse the Site,
        interfere with its operation, attempt unauthorized access, or scrape it in a way that harms performance.
      </p>

      <h2>Intellectual property</h2>
      <p>
        All content on the Site, including text, graphics and logos, is owned by or licensed to {SITE.name} and is
        protected by copyright and other laws. You may share short excerpts with attribution and a link back to the
        original article. Republishing full articles requires our written permission.
      </p>

      <h2>No professional advice</h2>
      <p>
        Content is provided for general informational purposes only and does not constitute legal, financial, tax or
        other professional advice. Evaluate any tool, process or recommendation against your own circumstances and
        consult a qualified professional where appropriate.
      </p>

      <h2>Affiliate links and advertising</h2>
      <p>
        Some pages may contain affiliate links or advertisements. We may earn a commission if you purchase through an
        affiliate link, at no extra cost to you. Such relationships do not determine our editorial opinions.
      </p>

      <h2>Third-party links</h2>
      <p>The Site may link to third-party websites. We do not control and are not responsible for their content or practices.</p>

      <h2>Disclaimer of warranties</h2>
      <p>
        The Site and its content are provided &quot;as is&quot; and &quot;as available&quot; without warranties of any
        kind. We do not guarantee that the content is complete, accurate or up to date at all times.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, {SITE.name} will not be liable for any indirect, incidental or
        consequential damages arising from your use of, or inability to use, the Site.
      </p>

      <h2>Changes</h2>
      <p>We may update these Terms at any time. Continued use of the Site after changes means you accept the updated Terms.</p>

      <h2>Contact</h2>
      <p>Questions? Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
    </PolicyPage>
  );
}

import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How OpsGrit collects, uses and protects information, including cookies and advertising.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPage() {
  return (
    <PolicyPage title="Privacy Policy" updated={SITE.updated}>
      <p>
        This Privacy Policy explains how {SITE.name} (&quot;we&quot;, &quot;us&quot;) collects and uses information when
        you visit {SITE.url.replace(/^https?:\/\//, "")} (the &quot;Site&quot;).
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li><strong>Information you provide:</strong> your email address if you subscribe to our newsletter, and any details you include when you contact us.</li>
        <li><strong>Automatically collected information:</strong> standard log and device data such as IP address, browser type, pages viewed and referring pages.</li>
        <li><strong>Cookies and similar technologies:</strong> small files used to keep the Site working, understand usage and, where applicable, serve advertising.</li>
      </ul>

      <h2>How we use information</h2>
      <ul>
        <li>To operate, secure and improve the Site and our content.</li>
        <li>To send the newsletter you requested. Your address is stored with our database provider (Upstash) and is never sold. You can unsubscribe at any time on our <a href="/unsubscribe">unsubscribe page</a>.</li>
        <li>To respond to your enquiries.</li>
        <li>To measure performance and, where applicable, to show advertising.</li>
      </ul>

      <h2>Advertising and third-party vendors</h2>
      <p>
        We may use third-party advertising partners, including Google, to show ads on the Site. Third-party vendors,
        including Google, use cookies to serve ads based on your prior visits to this and other websites. Google&apos;s
        use of advertising cookies enables it and its partners to serve ads based on your visit to our Site and/or other
        sites on the internet.
      </p>
      <p>
        You may opt out of personalized advertising by visiting{" "}
        <a href="https://www.google.com/settings/ads" rel="noopener noreferrer" target="_blank">Google Ads Settings</a>{" "}
        or <a href="https://www.aboutads.info" rel="noopener noreferrer" target="_blank">aboutads.info</a>. Where required
        by law, such as in the European Economic Area, the United Kingdom and Switzerland, we will request your consent
        before using non-essential cookies for personalized advertising.
      </p>

      <h2>Analytics</h2>
      <p>
        We use a simple first-party page-view counter to understand which articles are read. It records the page
        visited, the referring website and the visitor&apos;s country, and counts unique visitors using a one-way
        hash that changes every day, so individuals cannot be identified or tracked across days. It sets no cookies,
        stores nothing on your device and does not save your IP address. We do not count visitors whose browsers send
        a Do Not Track or Global Privacy Control signal.
      </p>

      <h2>Sharing of information</h2>
      <p>
        We do not sell your personal information. We share information only with service providers who help us run the
        Site (such as hosting, email delivery and analytics), when required by law, or to protect our rights and users.
      </p>

      <h2>Data retention and security</h2>
      <p>
        We keep personal information only as long as needed for the purposes described above or as required by law. We
        use reasonable technical and organizational measures to protect information, but no method of transmission over
        the internet is completely secure.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live, you may have the right to access, correct, delete or restrict the use of your
        personal information, to object to certain processing, and to withdraw consent. California residents may have
        additional rights under the CCPA/CPRA. To make a request, contact us at{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>

      <h2>Children&apos;s privacy</h2>
      <p>The Site is intended for a business audience and is not directed to children under 16. We do not knowingly collect their personal information.</p>

      <h2>External links</h2>
      <p>The Site may link to third-party websites. We are not responsible for their privacy practices.</p>

      <h2>Changes to this policy</h2>
      <p>We may update this policy from time to time. The &quot;Last updated&quot; date above shows the latest revision.</p>

      <h2>Contact</h2>
      <p>Questions about this policy? Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
    </PolicyPage>
  );
}

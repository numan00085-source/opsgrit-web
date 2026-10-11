import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the OpsGrit editorial team for corrections, partnerships and general enquiries.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <PolicyPage title="Contact us">
      <p>
        We read every message. Use the address below for editorial feedback, corrections, partnership and advertising
        enquiries, or privacy requests.
      </p>
      <p>
        <strong>Email:</strong> <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
      </p>
      <h2>What to expect</h2>
      <ul>
        <li>General and editorial enquiries: we aim to reply within 3 business days.</li>
        <li>Corrections: we review factual corrections as a priority.</li>
        <li>Privacy requests: see our <a href="/privacy-policy">Privacy Policy</a> for how we handle them.</li>
      </ul>
      <p>
        Please do not send sensitive personal or financial information by email.
      </p>
    </PolicyPage>
  );
}

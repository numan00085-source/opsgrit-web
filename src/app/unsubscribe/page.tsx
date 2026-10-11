import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";
import UnsubscribeForm from "@/components/UnsubscribeForm";

export const metadata: Metadata = {
  title: "Unsubscribe",
  description: "Stop receiving the OpsGrit Brief.",
  alternates: { canonical: "/unsubscribe" },
  robots: { index: false },
};

export default function UnsubscribePage() {
  return (
    <PolicyPage title="Unsubscribe">
      <p>Enter the email address you subscribed with and we will remove it from the OpsGrit Brief list.</p>
      <UnsubscribeForm />
    </PolicyPage>
  );
}

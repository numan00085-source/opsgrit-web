import ToolNext from "@/components/ToolNext";
import type { Metadata } from "next";
import Link from "next/link";
import InvoiceGenerator from "./InvoiceGenerator";

export const metadata: Metadata = {
  title: "Free invoice generator",
  description:
    "Free invoice generator with no signup. Add line items, tax, discount and payment terms, then print or save a clean PDF invoice. Nothing is stored on a server.",
  alternates: { canonical: "/tools/invoice-generator" },
};

export default function Page() {
  return (
    <div className="container-page py-14">
      <nav className="mb-6 text-sm text-ink-500 print:hidden"><Link href="/tools" className="hover:text-gold-700">Tools</Link> / Invoice generator</nav>
      <h1 className="text-4xl font-extrabold tracking-tight text-ink-900 print:hidden">Free invoice generator</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-600 print:hidden">
        Fill in the form on the left and the invoice builds on the right. Totals, tax and the due date calculate as you
        type. Print it or save it as a PDF. No account, and nothing leaves your browser.
      </p>
      <InvoiceGenerator />

      <section className="mt-16 max-w-3xl print:hidden">
        <h2 className="text-2xl font-bold text-ink-900">What a good invoice includes</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-700">
          <li><strong>A unique invoice number.</strong> Number them in order so you and your client can find any invoice and spot a duplicate.</li>
          <li><strong>Both parties&apos; details.</strong> Legal name and address for you and your client, plus a contact for questions.</li>
          <li><strong>Clear line items.</strong> Describe what was delivered, with quantity and unit price, so the approver can match it to the order.</li>
          <li><strong>Dates and terms.</strong> The issue date, the due date and the payment terms avoid arguments later.</li>
          <li><strong>How to pay.</strong> Say exactly where to send the money and which reference to use.</li>
        </ul>
        <p className="mt-4 text-sm text-ink-500">
          This tool produces a general-purpose invoice. Tax and invoicing rules differ by country and state, and some
          require extra fields such as a tax registration number, so check the requirements that apply to you or ask your
          accountant. We do not give tax advice.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-ink-900">Getting paid faster</h2>
        <p className="mt-3 text-ink-700">
          Send the invoice to the person who approves it, not only the person who ordered the work, and quote the purchase
          order number if there is one. Invoices that match an order are approved sooner. To see how the client side works,
          read our guide to the{" "}
          <Link className="underline underline-offset-2" href="/blog/invoice-approval-workflow-thresholds-controls">invoice approval workflow</Link>
          , and for the technology behind it,{" "}
          <Link className="underline underline-offset-2" href="/blog/ai-invoice-processing-accounts-payable">AI invoice processing</Link>.
        </p>
      </section>
      <ToolNext
        items={[
          { href: "/tools/roi-calculator", tag: "Calculator", title: "Automation ROI calculator", body: "Estimate what automating invoice handling would save." },
          { href: "/blog/invoice-approval-workflow-thresholds-controls", tag: "Guide", title: "Invoice approval thresholds and controls", body: "Set approval limits that make sense." },
          { href: "/tools/stack-audit", tag: "Worksheet", title: "Tech stack audit worksheet", body: "See what your tools cost and which to retire." },
        ]}
      />
    </div>
  );
}

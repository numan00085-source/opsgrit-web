import ToolSchema from "@/components/ToolSchema";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchema name="Invoice generator" description="Free invoice generator that calculates line totals and tax, then lets you print or save the invoice as a PDF. Runs in your browser; nothing is uploaded." path="/tools/invoice-generator" />
      {children}
    </>
  );
}

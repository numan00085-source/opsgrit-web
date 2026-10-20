import ToolSchema from "@/components/ToolSchema";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchema name="RACI matrix generator" description="Free RACI matrix generator with checks for missing or duplicate accountable owners. Copy, download as CSV or print." path="/tools/raci-generator" />
      {children}
    </>
  );
}

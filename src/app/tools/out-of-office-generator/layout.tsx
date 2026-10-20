import ToolSchema from "@/components/ToolSchema";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchema name="Out-of-office email generator" description="Free generator for clear out-of-office messages with handover contacts and optional return date." path="/tools/out-of-office-generator" />
      {children}
    </>
  );
}

import ToolSchema from "@/components/ToolSchema";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchema name="Automation readiness scorecard" description="Free scorecard: answer ten questions about a process and see whether it is ready to automate, which areas are weakest and what to fix first." path="/tools/readiness-scorecard" />
      {children}
    </>
  );
}

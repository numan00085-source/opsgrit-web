import ToolSchema from "@/components/ToolSchema";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchema name="Cutover simulator" description="A free three-minute game. Make six migration decisions, from the pre-flight audit to decommissioning the old system, and see whether your cutover is clean or ends in a rollback." path="/tools/cutover-simulator" />
      {children}
    </>
  );
}

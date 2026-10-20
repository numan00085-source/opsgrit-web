import ToolSchema from "@/components/ToolSchema";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchema name="OpsGrit Bot" description="Ask OpsGrit Bot about automation, SOPs, tool choices and AI at work. A free assistant that answers from OpsGrit guides and points you to the right one." path="/tools/ops-bot" />
      {children}
    </>
  );
}

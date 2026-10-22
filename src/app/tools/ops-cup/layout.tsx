import ToolSchema from "@/components/ToolSchema";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchema name="OpsGrit Cup" description="A free 6-a-side football game that runs in your browser. Play the computer or a friend online with a 5-letter code." path="/tools/ops-cup" category="GameApplication" />
      {children}
    </>
  );
}

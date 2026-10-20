import ToolSchema from "@/components/ToolSchema";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchema name="Tech stack audit worksheet" description="Free worksheet to inventory your operations tools: owner, cost, users, overlap and decision. See total cost and cost per user, and export to CSV." path="/tools/stack-audit" />
      {children}
    </>
  );
}

import ToolSchema from "@/components/ToolSchema";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchema name="SOP builder" description="Free SOP builder: fill in a short form and get a clean standard operating procedure with purpose, scope, roles, steps, exceptions and a change log. Copy or download it." path="/tools/sop-builder" />
      {children}
    </>
  );
}

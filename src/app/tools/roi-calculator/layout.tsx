import ToolSchema from "@/components/ToolSchema";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchema name="Automation ROI calculator" description="Free calculator: estimate hours saved, monthly savings, payback period and first-year ROI of an automation using your own numbers." path="/tools/roi-calculator" />
      {children}
    </>
  );
}

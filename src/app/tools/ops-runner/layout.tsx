import ToolSchema from "@/components/ToolSchema";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchema name="Ops Runner" description="A free browser arcade game. Jump over Reply All, spreadsheets and sync meetings, collect the hours you save and see how high you can rank." path="/tools/ops-runner" category="GameApplication" />
      {children}
    </>
  );
}

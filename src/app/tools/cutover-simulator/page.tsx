import type { Metadata } from "next";
import Link from "next/link";
import CutoverSimulator from "./CutoverSimulator";

export const metadata: Metadata = {
  title: "Cutover Simulator: migrate ops tools without downtime",
  description:
    "A free three-minute game. Make six migration decisions, from the pre-flight audit to decommissioning the old system, and see whether your cutover is clean or ends in a rollback.",
  alternates: { canonical: "/tools/cutover-simulator" },
};

export default function Page() {
  return (
    <div className="container-page py-14">
      <nav className="mb-6 text-sm text-ink-500"><Link href="/tools" className="hover:text-gold-700">Tools</Link> / Cutover Simulator</nav>
      <h1 className="text-4xl font-extrabold tracking-tight text-ink-900">Cutover Simulator</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-600">
        Can you switch a CRM, ERP or automation platform without downtime? Make six decisions and find out.
      </p>
      <CutoverSimulator />
      <div className="prose mt-12 max-w-3xl">
        <h2>What the game is based on</h2>
        <p>
          Every round follows a phase of our migration playbook: assess, prepare, parallel-run, cutover and decommission.
          The best answer in each round is the approach the playbook recommends, and the weaker answers are shortcuts
          teams commonly take. Read{" "}
          <Link href="/blog/migrate-operations-tools-without-downtime-playbook">How to Migrate Operations Tools Without Downtime</Link>{" "}
          for the detail, including the rollback trigger matrix and communication templates.
        </p>
        <p>
          Deciding which tool owns which data is the first step of any migration. See{" "}
          <Link href="/blog/system-of-record-source-of-truth">System of Record: How to Decide Which Tool Owns Which Data</Link>.
        </p>
        <p className="text-sm text-ink-500">
          The score and risk meter are part of the game. They are not statistics or a forecast for your own migration.
          Nothing you choose is stored or sent anywhere.
        </p>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import OpsCup from "./OpsCup";
import ToolNext from "@/components/ToolNext";

export const metadata: Metadata = {
  title: "OpsGrit Cup: free online football game",
  description:
    "A free 6-a-side football game that runs in your browser. Play the computer, or share a 5-letter code and play a friend online. Full screen on phone, tablet or keyboard. No signup.",
  alternates: { canonical: "/tools/ops-cup" },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ join?: string }> }) {
  const sp = await searchParams;
  const join = typeof sp.join === "string" && /^[A-HJ-NP-Za-hj-np-z2-9]{5}$/.test(sp.join) ? sp.join.toUpperCase() : undefined;
  return (
    <div className="container-page py-14">
      <nav className="mb-6 text-sm text-ink-500"><Link href="/tools" className="hover:text-gold-700">Tools</Link> / OpsGrit Cup</nav>
      <h1 className="text-4xl font-extrabold tracking-tight text-ink-900">OpsGrit Cup</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-600">
        A full-screen 6-a-side football game for your browser. Play the computer, or get a code and play a friend online.
        OpsGrit FC takes on Backlog United.
      </p>
      <OpsCup autoJoin={join} />

      <div className="prose mt-12 max-w-3xl">
        <h2>How to play</h2>
        <ul>
          <li><strong>Move</strong> with WASD, the arrow keys or the on-screen stick on a phone.</li>
          <li><strong>Shoot</strong> by holding Space and releasing. A longer hold is a harder shot, but a very hard one can fly over the bar.</li>
          <li><strong>Pass</strong> with J or F and aim with the move keys. <strong>Tackle</strong> with K or E. <strong>Sprint</strong> with Shift. <strong>Switch player</strong> with L or Q.</li>
          <li>A match is two halves of 45 minutes, played in about three and a half minutes. Throw-ins, corners and goal kicks are all in.</li>
        </ul>
        <h2>Playing a friend online</h2>
        <p>
          One of you chooses <em>Get your code</em> and sends the 5-letter code (or the invite link). The other chooses <em>Enter the code</em>.
          The two browsers then connect directly with each other, and the match starts. Codes expire after ten minutes and nothing about your match is saved.
        </p>
        <p className="text-sm text-ink-500">
          Because the connection is direct, your opponent&apos;s browser can see your network address, as with any video call. On some strict
          school, work or mobile networks a direct connection is not possible. If it fails, try again on the same Wi-Fi or play the computer.
        </p>
        <h2>Why a football game on an operations site?</h2>
        <p>
          Good teams win on clean handoffs, clear roles and a plan for when things go wrong. That is also what the guides on OpsGrit are about.
          The match report counts your clean handoffs for that reason. If you want to apply it at work, start with the{" "}
          <Link href="/tools/raci-generator">RACI matrix generator</Link> or the <Link href="/tools/readiness-scorecard">automation readiness scorecard</Link>.
        </p>
      </div>
      <ToolNext
        items={[
          { href: "/tools/readiness-scorecard", tag: "Scorecard", title: "Automation readiness scorecard", body: "Ten questions to see if a process is ready to automate." },
          { href: "/tools/roi-calculator", tag: "Calculator", title: "Automation ROI calculator", body: "Turn a repetitive task into hours saved and payback time." },
          { href: "/tools/raci-generator", tag: "Generator", title: "RACI matrix generator", body: "Give every task one clear owner." },
        ]}
      />
    </div>
  );
}

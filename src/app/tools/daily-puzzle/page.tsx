import type { Metadata } from "next";
import Link from "next/link";
import SpaceBackdrop from "../cutover-simulator/SpaceBackdrop";
import DailyPuzzle from "./DailyPuzzle";
import { getAllPuzzles, latestArticlePuzzles, pickDaily, todayKey } from "@/lib/puzzles";

export const revalidate = 900; // re-check the date every 15 minutes

export const metadata: Metadata = {
  title: "Daily Ops Puzzle: three scenarios, one minute",
  description:
    "A free daily puzzle from OpsGrit. Three real operations scenarios per day, drawn from our articles on automation, migrations, SOPs and AI workflows. Pick the best call and see why.",
  alternates: { canonical: "/tools/daily-puzzle" },
};

export default function Page() {
  const all = getAllPuzzles();
  const date = todayKey();
  const daily = pickDaily(all, date, 3);
  const latest = latestArticlePuzzles(all);
  const articles = new Set(all.map((p) => p.slug)).size;
  return (
    <div className="relative isolate -mb-28 -mt-[62px] overflow-hidden bg-night-950 pb-40 pt-[62px]">
      <SpaceBackdrop />
      <div className="container-page relative py-14">
        <nav className="mb-6 text-sm text-slate-400"><Link href="/tools" className="hover:text-gold-300">Tools</Link> / Daily Ops Puzzle</nav>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Daily <span className="gold-text-light">Ops Puzzle</span>
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-300">
          Three operations scenarios a day. Choose the best call, see why, and share your score. A new set every day.
        </p>
        {all.length > 0 ? (
          <DailyPuzzle date={date} daily={daily} latest={latest} pool={all} />
        ) : (
          <p className="mt-8 text-slate-300">Puzzles are on the way. Check back soon.</p>
        )}
        <div className="mt-12 max-w-3xl space-y-4 leading-relaxed text-slate-300 [&_a]:text-gold-300 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-gold-200">
          <h2 className="text-2xl font-bold text-white">Where the puzzles come from</h2>
          <p>
            Every puzzle is written from one of our own articles ({articles} so far), and each result links back to the
            article it came from. When we publish a new article, new puzzles are added with it and the latest article
            gets its own set. Browse everything in <Link href="/blog">the library</Link>.
          </p>
          <p className="text-sm text-slate-400">
            The scenarios are illustrations for learning, not statistics or advice for your own situation. Nothing you
            choose is stored or sent anywhere.
          </p>
        </div>
      </div>
    </div>
  );
}

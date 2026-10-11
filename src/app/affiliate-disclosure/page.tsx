import type { Metadata } from "next";
import Link from "next/link";
import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = {
  title: "Affiliate and sponsorship disclosure",
  description:
    "How OpsGrit earns money: advertising, sponsorships and affiliate links. What is labeled, what never affects our editorial decisions.",
  alternates: { canonical: "/affiliate-disclosure" },
};

export default function AffiliateDisclosurePage() {
  return (
    <PolicyPage title="Affiliate and sponsorship disclosure" updated="October 11, 2026">
      <p>
        OpsGrit is free to read. We cover our costs through advertising, sponsorships and, in some cases, affiliate
        links. This page explains what each one means so you can judge our articles with full information.
      </p>

      <h2>The ways OpsGrit may earn money</h2>
      <ul>
        <li>
          <strong>Advertising.</strong> Ads served by an ad network may appear on the site. They are separate from
          articles and, where required, marked as advertising.
        </li>
        <li>
          <strong>Sponsorships.</strong> A company may pay to place a labeled sponsored article, banner or newsletter
          mention. See <Link href="/advertise">Advertise</Link> for the rules sponsors agree to.
        </li>
        <li>
          <strong>Affiliate links.</strong> Some links to software products may be affiliate links. If you buy or sign
          up through one, OpsGrit may receive a commission from the vendor. The price you pay does not change.
        </li>
      </ul>

      <h2>How affiliate links are handled</h2>
      <ul>
        <li>Affiliate links are marked in the code with <strong>rel=&quot;sponsored&quot;</strong>, so search engines know a commercial relationship exists.</li>
        <li>An article that contains affiliate links says so near the top, before the first link, in plain words.</li>
        <li>We do not hide affiliate links inside text that claims to be neutral.</li>
        <li>Not every link to a product is an affiliate link. Links to vendor documentation, standards and sources are normal links.</li>
      </ul>

      <h2>What money never changes</h2>
      <ul>
        <li>An advertiser, sponsor or affiliate program cannot buy a favorable review, a higher ranking in a comparison or the removal of a criticism.</li>
        <li>We decide which tools to cover by what operations teams need, not by what pays.</li>
        <li>We may recommend a tool that has no affiliate program, and we may criticize one that does.</li>
        <li>Comparisons use the vendor&apos;s published information, which we cite, and say when we could not verify something.</li>
      </ul>

      <h2>Sponsored content</h2>
      <p>
        Anything a company pays for is labeled <strong>Sponsored</strong> or <strong>Advertisement</strong>, kept
        visually separate from independent articles and written to the same accuracy standard. Our full process is
        in the <Link href="/editorial-policy">editorial policy</Link>.
      </p>

      <h2>Legal basis</h2>
      <p>
        We follow the U.S. Federal Trade Commission&apos;s guidance on disclosing material connections between
        publishers and the companies they mention. If you think a connection was not disclosed clearly, tell us
        through the <Link href="/contact">contact page</Link> and we will fix it.
      </p>
    </PolicyPage>
  );
}

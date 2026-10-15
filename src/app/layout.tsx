import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE } from "@/lib/site";
import { adsenseClient, getSettings } from "@/lib/settings";
import AnnouncementBar from "@/components/AnnouncementBar";

const SETTINGS = getSettings();
const ADS_CLIENT = adsenseClient(SETTINGS);
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AmbientDust from "@/components/AmbientDust";
import IntroSplash from "@/components/IntroSplash";
import PageViewTracker from "@/components/PageViewTracker";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — AI Workflows, Automation & Operations Guides`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name}: AI workflow, automation and operations guides`,
    description: SITE.description,
    url: SITE.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name}: AI workflow, automation and operations guides`,
    description: SITE.description,
  },
  verification: SETTINGS.googleVerification ? { google: SETTINGS.googleVerification } : undefined,
  alternates: { canonical: "/", types: { "application/rss+xml": "/feed.xml" } },
};

export const viewport: Viewport = {
  themeColor: "#FAF5E9",
  width: "device-width",
  initialScale: 1,
};

// Site-wide structured data: tells search engines who publishes the site and that it has a search-able catalog.
const SITE_SCHEMA = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/apple-icon.png`,
    description: SITE.description,
    email: SITE.email,
    sameAs: [SETTINGS.social.x, SETTINGS.social.linkedin].filter(Boolean),
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: "en-US",
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Play the intro once per browser session: later page loads skip it. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('og_intro')){document.documentElement.classList.add('no-intro')}else{sessionStorage.setItem('og_intro','1')}}catch(e){}",
          }}
        />
        {/* AdSense snippet in the server-rendered head so Google can find it when it verifies the site. */}
        {ADS_CLIENT && <meta name="google-adsense-account" content={ADS_CLIENT} />}
        {ADS_CLIENT && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="min-h-screen font-sans">
        {SITE_SCHEMA.map((s) => (
          <script key={s["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
        ))}
        <AmbientDust />
        <IntroSplash />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-gold-300 focus:px-3 focus:py-2 focus:text-ink-900"
        >
          Skip to content
        </a>
        <AnnouncementBar />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <PageViewTracker />
      </body>
    </html>
  );
}

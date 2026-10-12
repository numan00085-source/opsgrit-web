import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AmbientDust from "@/components/AmbientDust";
import Script from "next/script";
import IntroSplash from "@/components/IntroSplash";
import PageViewTracker from "@/components/PageViewTracker";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — AI Workflows & Enterprise Operations`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
    url: SITE.url,
  },
  twitter: { card: "summary_large_image", title: SITE.name, description: SITE.description },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } : undefined,
  alternates: { canonical: "/", types: { "application/rss+xml": "/feed.xml" } },
};

export const viewport: Viewport = {
  themeColor: "#FAF5E9",
  width: "device-width",
  initialScale: 1,
};

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
      </head>
      <body className="min-h-screen font-sans">
        <AmbientDust />
        <IntroSplash />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-gold-300 focus:px-3 focus:py-2 focus:text-ink-900"
        >
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <PageViewTracker />
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
          <Script
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
      </body>
    </html>
  );
}

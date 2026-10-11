import type { Metadata, Viewport } from "next";
import { ViewTransition } from "react";
import "@fontsource-variable/montserrat/wght.css";
import "@fontsource-variable/montserrat/wght-italic.css";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { EXTERNAL, SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Tradewinds — Accelerating the Acquisition of Innovation", template: "%s · Tradewinds" },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: SITE.name, url: SITE.url, title: "Tradewinds — Accelerating the Acquisition of Innovation", description: SITE.description },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#022C49", width: "device-width", initialScale: 1 };

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "GovernmentOrganization",
  name: "Tradewinds",
  url: SITE.url,
  description: SITE.description,
  parentOrganization: { "@type": "GovernmentOrganization", name: SITE.org },
  email: EXTERNAL.successEmail,
  sameAs: [EXTERNAL.linkedIn],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh">
        <SiteHeader />
        <ViewTransition>
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
        </ViewTransition>
        <SiteFooter />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </body>
    </html>
  );
}

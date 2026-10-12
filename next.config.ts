import type { NextConfig } from "next";

const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
  : "";

// Inline scripts are required by the Next.js runtime for statically rendered (ISR)
// pages; nonce-based CSP would force dynamic rendering. Everything else is locked down.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://storage.tradewindai.com https://i.ytimg.com ${supabaseOrigin}`.trim(),
  "font-src 'self'",
  `connect-src 'self' ${supabaseOrigin}`.trim(),
  "frame-src https://www.youtube-nocookie.com https://player.vimeo.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "X-Frame-Options", value: "DENY" },
];

// Legacy Wix URLs → new information architecture (see docs/01-AUDIT.md §2).
// Finalize against the full crawl before DNS cutover.
const legacyRedirects: [string, string][] = [
  // Wix-era URLs
  ["/solutions-marketplace", "/marketplace"],
  ["/tradewinds-opportunity", "/opportunities"],
  ["/other-opportunities", "/opportunities?type=external"],
  ["/faqs", "/marketplace/faqs"],
  ["/instructional-videos", "/marketplace/videos"],
  ["/exemplar-videos", "/marketplace/exemplars"],
  ["/cdao-vehicles", "/contract-vehicles"],
  ["/cdao-vehicles/test-and-evaluation-services-blanket-purchase-agreement-bpa", "/contract-vehicles/test-and-evaluation"],
  // Routes from the first rebuild pass (information architecture revised Oct 2026)
  ["/acquisition", "/contract-vehicles"],
  ["/acquisition/vehicles", "/contract-vehicles"],
  ["/acquisition/vehicles/:slug", "/contract-vehicles/:slug"],
  ["/acquisition/guides", "/contract-vehicles/guides"],
  ["/ai-tools", "/ai-playground"],
  ["/ai-tools/:path*", "/ai-playground/:path*"],
  ["/resources/videos", "/marketplace/videos"],
  ["/resources/exemplars", "/marketplace/exemplars"],
  ["/resources/faqs", "/marketplace/faqs"],
  ["/resources/events", "/events"],
  ["/about/contact", "/contact"],
  ["/about/awarded-solutions", "/marketplace/awardees"],
  ["/marketplace/solutions", "/marketplace/awardable-companies"],
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "storage.tradewindai.com" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return legacyRedirects.map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};

export default nextConfig;

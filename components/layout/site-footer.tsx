import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { EXTERNAL, FOOTER_COLUMNS, SITE } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="on-dark relative overflow-hidden bg-navy-900 text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal/60 to-transparent" aria-hidden />
      {/* Oversized monogram watermark, as on the approved business card */}
      <BrandLogo variant="monogram-white" decorative className="pointer-events-none absolute -right-16 top-10 w-[26rem] opacity-[0.04]" />
      <div className="container-page grid gap-12 pb-10 pt-20 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <BrandLogo variant="wordmark-reversed" className="w-[180px]" />
          <p className="mt-6 max-w-sm text-ink-subtle">
            The Department of War&rsquo;s framework for discovering, assessing and acquiring AI, digital and data-analytics solutions — housed in the {SITE.org}.
          </p>
          <div className="mt-8 space-y-2 text-sm">
            <p>
              <span className="text-ink-subtle">Program support: </span>
              <a className="link-underline font-semibold text-sky" href={`mailto:${EXTERNAL.successEmail}`}>{EXTERNAL.successEmail}</a>
            </p>
            <p>
              <span className="text-ink-subtle">Technical support: </span>
              <a className="link-underline font-semibold text-sky" href={`mailto:${EXTERNAL.supportEmail}`}>{EXTERNAL.supportEmail}</a>
            </p>
          </div>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:col-span-9">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.label}>
              <h2 className="eyebrow text-ink-subtle">{col.label}</h2>
              <ul className="mt-5 space-y-3 text-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="link-underline text-white/85 hover:text-white">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="container-page flex flex-col gap-4 border-t border-line-dark py-8 text-xs text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p>An official program of the Chief Digital and Artificial Intelligence Office, U.S. Department of War.</p>
          <p>© {new Date().getFullYear()} Tradewinds · <a href={`mailto:${EXTERNAL.successEmail}`} className="hover:text-white">{EXTERNAL.successEmail}</a></p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          <li><Link href="/privacy" className="hover:text-white">Privacy Notice</Link></li>
          <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
          <li><Link href="/sitemap.xml" className="hover:text-white" prefetch={false}>Sitemap</Link></li>
          <li><a href={EXTERNAL.linkedIn} target="_blank" rel="noopener noreferrer" className="hover:text-white">LinkedIn<span className="sr-only"> (opens external site)</span></a></li>
        </ul>
      </div>
      {/* Guideline page band: Cobalt bar with a Signal Blue slanted corner */}
      <div className="relative h-2 bg-cobalt" aria-hidden>
        <span className="absolute inset-y-0 right-0 w-24 bg-signal [clip-path:polygon(28%_0,100%_0,100%_100%,0_100%)]" />
      </div>
    </footer>
  );
}

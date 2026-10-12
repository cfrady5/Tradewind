import Link from "next/link";
import { MonogramField } from "@/components/brand/monogram-field";
import { ArrowRight, ArrowUpRight } from "@/components/ui/icons";
import { EXTERNAL } from "@/lib/site-config";
import { Reveal } from "@/components/ui/reveal";

export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="on-dark relative isolate overflow-hidden bg-hero text-white">
      <MonogramField variant="cta" className="absolute inset-0 -z-10 h-full w-full" />
      <div className="container-page section-y">
        <Reveal className="max-w-3xl">
          <h2 id="cta-title" className="text-display font-extrabold">
            Innovation moves <span className="text-gradient-sky">faster here</span><span className="text-runway">.</span>
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-4 md:grid-cols-3 lg:max-w-5xl">
          {[
            { href: EXTERNAL.marketplaceSignIn, external: true, eyebrow: "Government", title: "Access the Marketplace", cta: "Sign in" },
            { href: "/marketplace/providers", external: false, eyebrow: "Industry", title: "Submit your solution for assessment", cta: "Start as a provider" },
            { href: "/contact", external: false, eyebrow: "Questions", title: "Reach the right Tradewinds team", cta: "Contact us" },
          ].map((c, i) => {
            const cls = "group flex h-full flex-col rounded-xl border border-white/15 bg-navy/30 p-7 transition-[background-color,border-color] duration-(--duration-ui) hover:border-runway/70 hover:bg-navy/50";
            const inner = (
              <>
                <span className="eyebrow text-runway">{c.eyebrow}</span>
                <span className="mt-4 text-xl font-semibold">{c.title}</span>
                <span className="mt-8 flex items-center gap-2 font-semibold text-sky group-hover:text-white">
                  {c.cta}
                  {c.external ? <ArrowUpRight className="transition-transform duration-(--duration-ui) group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /> : <ArrowRight className="transition-transform duration-(--duration-ui) group-hover:translate-x-1.5" />}
                  {c.external && <span className="sr-only">(opens external site)</span>}
                </span>
              </>
            );
            return (
              <Reveal key={c.title} delay={0.08 + i * 0.06}>
                {c.external
                  ? <a href={c.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
                  : <Link href={c.href} className={cls}>{inner}</Link>}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

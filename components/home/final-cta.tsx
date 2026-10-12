import Link from "next/link";
import { MonogramField } from "@/components/brand/monogram-field";
import { ArrowRight } from "@/components/ui/icons";
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
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:max-w-4xl">
          {[
            { href: "/marketplace/government", eyebrow: "Government", title: "Find capabilities for your mission", cta: "Start as a buyer" },
            { href: "/marketplace/providers", eyebrow: "Industry", title: "Submit your solution to the Marketplace", cta: "Start as a provider" },
          ].map((c, i) => (
            <Reveal key={c.href} delay={0.08 + i * 0.06}>
              <Link href={c.href} className="group flex h-full flex-col rounded-xl border border-white/15 bg-white/[0.04] p-7 backdrop-blur-sm transition-[background-color,border-color] duration-(--duration-ui) hover:border-runway/70 hover:bg-white/[0.08]">
                <span className="eyebrow text-runway">{c.eyebrow}</span>
                <span className="mt-4 text-xl font-semibold">{c.title}</span>
                <span className="mt-8 flex items-center gap-2 font-semibold text-sky group-hover:text-white">
                  {c.cta}<ArrowRight className="transition-transform duration-(--duration-ui) group-hover:translate-x-1.5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

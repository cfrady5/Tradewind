import Link from "next/link";
import { DotTitle } from "@/components/brand/dot-title";
import { ArrowRight } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import type { ContractVehicle } from "@/lib/data/types";

const ORDER = ["draid", "ai-talent-2", "test-and-evaluation"];

/** Contract vehicles (brief §11): DRAID, AI Talent 2.0 and T&E cards. */
export function Vehicles({ vehicles }: { vehicles: ContractVehicle[] }) {
  const rank = (slug: string) => (ORDER.includes(slug) ? ORDER.indexOf(slug) : ORDER.length);
  const sorted = [...vehicles].sort((a, b) => rank(a.slug) - rank(b.slug)).slice(0, 3);
  return (
    <section aria-labelledby="vehicles-title" className="section-y bg-cloud">
      <div className="container-page">
        <Reveal><h2 id="vehicles-title" className="text-h2 font-bold"><DotTitle>{"Contract vehicles."}</DotTitle></h2></Reveal>
        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {sorted.map((v, i) => (
            <Reveal as="li" key={v.slug} delay={i * 0.08}>
              <Link
                href={`/contract-vehicles/${v.slug}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white p-8 transition-[border-color,box-shadow,transform] duration-(--duration-ui) ease-(--ease-out) hover:-translate-y-1 hover:border-signal/50 hover:shadow-lift"
              >
                <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-cobalt to-signal transition-transform duration-(--duration-enter) ease-(--ease-out) group-hover:scale-x-100" aria-hidden />
                <span className="text-3xl font-extrabold tracking-[-0.03em]">{v.shortName}</span>
                <span className="mt-3 text-ink-muted">{v.tagline}</span>
                <ArrowRight className="mt-auto pt-6 text-cobalt transition-transform duration-(--duration-ui) group-hover:translate-x-1.5" width={40} height={40} />
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

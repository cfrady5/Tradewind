import Link from "next/link";
import { DotTitle } from "@/components/brand/dot-title";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRight, Layers } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import type { ContractVehicle } from "@/lib/data/types";
import { VEHICLE_STATUS } from "@/lib/data/vehicle-status";

/** Contract vehicles overview (brief §6.1, §11): DRAID, AI Talent 2.0 and T&E cards. */
export function Vehicles({ vehicles }: { vehicles: ContractVehicle[] }) {
  const order = ["draid", "ai-talent-2", "test-and-evaluation"];
  const rank = (slug: string) => (order.includes(slug) ? order.indexOf(slug) : order.length);
  const sorted = [...vehicles].sort((a, b) => rank(a.slug) - rank(b.slug));
  return (
    <section aria-labelledby="vehicles-title" className="section-y bg-white">
      <div className="container-page">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <h2 id="vehicles-title" className="text-h2 font-bold"><DotTitle>{"Contract vehicles."}</DotTitle></h2>
          </Reveal>
          <Reveal className="lg:col-span-5 lg:pb-2" delay={0.06}>
            <p className="text-lead text-ink-muted">Data readiness, AI talent and test &amp; evaluation through established agreements.</p>
            <div className="mt-6"><ButtonLink href="/contract-vehicles" variant="secondary">Compare vehicles</ButtonLink></div>
          </Reveal>
        </div>
        <ul className="mt-14 grid gap-5 md:grid-cols-3">
          {sorted.map((v, i) => {
            const st = VEHICLE_STATUS[v.status];
            return (
              <Reveal as="li" key={v.slug} delay={i * 0.08}>
                <Link
                  href={`/contract-vehicles/${v.slug}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white p-8 transition-[border-color,box-shadow,transform] duration-(--duration-ui) ease-(--ease-out) hover:-translate-y-1 hover:border-signal/50 hover:shadow-lift"
                >
                  <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-cobalt to-signal transition-transform duration-(--duration-enter) ease-(--ease-out) group-hover:scale-x-100" aria-hidden />
                  <div className="flex items-center justify-between gap-3">
                    <span className="grid size-11 place-items-center rounded-md bg-sky-tint text-cobalt"><Layers width={22} height={22} /></span>
                    <Badge tone={st.tone} dot>{st.label}</Badge>
                  </div>
                  <span className="mt-8 text-3xl font-extrabold tracking-[-0.03em]">{v.shortName}</span>
                  <span className="mt-1 text-sm font-medium text-ink-muted">{v.vehicleType}</span>
                  <span className="mt-4 text-ink-muted">{v.tagline}</span>
                  {v.capabilityCategories && (
                    <span className="mt-6 flex flex-wrap gap-1.5" aria-hidden>
                      {v.capabilityCategories.slice(0, 4).map((c) => <span key={c} className="rounded-sm bg-cloud px-2 py-1 text-xs font-medium text-navy">{c}</span>)}
                      {v.capabilityCategories.length > 4 && <span className="rounded-sm px-2 py-1 text-xs font-medium text-ink-muted">+{v.capabilityCategories.length - 4}</span>}
                    </span>
                  )}
                  <span className="mt-auto flex items-center gap-2 pt-8 font-semibold text-cobalt">
                    {v.shortName} details<ArrowRight className="transition-transform duration-(--duration-ui) group-hover:translate-x-1.5" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

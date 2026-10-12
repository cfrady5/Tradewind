import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Copy, Layers, Search, Spark } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/cn";
import type { ContractVehicle } from "@/lib/data/types";
import { VEHICLE_STATUS } from "@/lib/data/vehicle-status";

function Pillar({ href, title, body, cta, children, className, dark }: {
  href: string; title: string; body: string; cta: string; children: ReactNode; className?: string; dark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border p-8 transition-[border-color,box-shadow] duration-(--duration-ui) ease-(--ease-out) md:p-10",
        dark ? "on-dark border-transparent bg-navy text-white hover:shadow-glow" : "border-line bg-white hover:border-signal/50 hover:shadow-lift",
        className,
      )}
    >
      <h3 className="text-h3 font-bold">{title}</h3>
      <p className={cn("mt-3 max-w-md", dark ? "text-white/75" : "text-ink-muted")}>{body}</p>
      <div className="relative mt-8 flex flex-1 flex-col" aria-hidden>{children}</div>
      <span className={cn("mt-8 flex items-center gap-2 font-semibold", dark ? "text-sky group-hover:text-white" : "text-cobalt")}>
        {cta}<ArrowRight className="transition-transform duration-(--duration-ui) group-hover:translate-x-1.5" />
      </span>
    </Link>
  );
}

export function Ecosystem({ vehicles }: { vehicles: ContractVehicle[] }) {
  return (
    <section aria-labelledby="eco-title" className="section-y bg-white">
      <div className="container-page">
        <SectionHeader
          id="eco-title" title="An integrated acquisition ecosystem."
          lead="Assessed technology, defined procurement pathways, and tools that support the acquisition workforce."
          align="split"
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-12 lg:grid-rows-2">
          <Reveal className="lg:col-span-7 lg:row-span-2">
            <Pillar
              dark
              href="/marketplace"
              title="Discover assessed technologies."
              body="A repository of competitively assessed, readily awardable AI, digital and data solutions — searchable by government buyers."
              cta="Explore the Marketplace"
            >
              <div className="absolute inset-0 bg-grid-fine opacity-70" />
              <div className="relative grid min-h-64 flex-1 auto-rows-fr grid-cols-3 gap-3">
                {["Computer Vision", "NLP & LLMs", "Edge AI", "Geospatial", "Predictive", "Data Fabric", "Cyber Analytics", "Autonomy", "Decision Support"].map((t, i) => (
                  <span
                    key={t}
                    className={cn(
                      "flex min-h-20 flex-col justify-between rounded-md border border-line-dark bg-white/[0.03] p-3 text-xs font-semibold text-white/80 transition-[background-color,border-color,transform] duration-(--duration-enter) ease-(--ease-out)",
                      [1, 3, 5, 7].includes(i) && "group-hover:-translate-y-1 group-hover:border-sky/50 group-hover:bg-cobalt/30",
                    )}
                    style={{ transitionDelay: `${i * 35}ms` }}
                  >
                    <span className={cn("size-1.5 rounded-full", [1, 3, 5, 7].includes(i) ? "bg-runway" : "bg-sky/60")} />
                    {t}
                  </span>
                ))}
              </div>
              <div className="relative mt-4 flex items-center gap-3 rounded-md border border-line-dark bg-navy-900/70 px-4 py-3 text-sm text-ink-subtle">
                <Search width={16} height={16} className="text-sky" /> Awardable solutions · filtered by mission need
              </div>
            </Pillar>
          </Reveal>

          <Reveal className="lg:col-span-5" delay={0.06}>
            <Pillar
              href="/contract-vehicles"
              title="Select the procurement pathway."
              body="Understand procurement vehicles and pathways — compared side by side."
              cta="Compare vehicles"
              className="bg-cloud/60"
            >
              <ul className="space-y-2">
                {vehicles.slice(0, 3).map((v) => (
                  <li key={v.slug} className="flex items-center justify-between rounded-md border border-line bg-white px-4 py-3 text-sm transition-transform duration-(--duration-ui) group-hover:translate-x-1">
                    <span className="flex items-center gap-2 font-semibold"><Layers width={16} height={16} className="text-cobalt" />{v.shortName}</span>
                    <span className="text-xs font-semibold text-ink-muted">{VEHICLE_STATUS[v.status].label}</span>
                  </li>
                ))}
              </ul>
            </Pillar>
          </Reveal>

          <Reveal className="lg:col-span-5" delay={0.12}>
            <Pillar
              href="/ai-playground"
              title="Apply AI to acquisition work."
              body="Tools and a searchable prompt library that support effective acquisition workflows."
              cta="Browse AI tools"
            >
              <div className="rounded-md border border-line bg-cloud/50 p-4 font-mono text-[0.8125rem] leading-relaxed text-navy">
                <div className="flex items-center justify-between font-sans text-xs font-semibold text-ink-muted">
                  <span className="flex items-center gap-1.5"><Spark width={14} height={14} className="text-runway" /> Prompt · Requirements</span>
                  <Copy width={14} height={14} />
                </div>
                <p className="mt-3">Rewrite the following capability request as an <span className="rounded bg-sky-tint px-1 text-cobalt">outcome-based</span> problem statement…</p>
              </div>
            </Pillar>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

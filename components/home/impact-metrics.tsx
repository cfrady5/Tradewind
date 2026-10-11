import { DotTitle } from "@/components/brand/dot-title";
import { Counter } from "@/components/ui/counter";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { DataNotice } from "@/components/ui/data-notice";
import { formatDate } from "@/lib/data/opportunity-status";
import type { Loaded, Metric } from "@/lib/data/types";

export function ImpactMetrics({ data }: { data: Loaded<Metric> }) {
  const items = data.items;
  if (!items.length) return null;
  const periods = [...new Set(items.map((m) => m.reportingPeriod))];
  const unverified = items.some((m) => !m.verified);

  return (
    <section aria-labelledby="impact-title" className="relative overflow-hidden bg-cloud">
      <div className="absolute inset-0 bg-grid-light [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" aria-hidden />
      <div className="container-page relative section-y">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <p className="eyebrow flex items-center gap-3 text-cobalt"><span className="h-px w-8 bg-cobalt" aria-hidden />Impact</p>
            <h2 id="impact-title" className="mt-5 text-h2 font-bold"><DotTitle>{"Measured in solutions fielded, not slides."}</DotTitle></h2>
          </Reveal>
          <Reveal className="lg:col-span-5" delay={0.06}>
            <p className="text-lead text-ink-muted">Program results across the Marketplace — reported with their period and source.</p>
          </Reveal>
        </div>

        <dl className="mt-16 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {items.map((m, i) => (
            <Reveal key={m.key} delay={i * 0.07} className="flex flex-col bg-white p-8 lg:p-10">
              <dt className="order-2 mt-4 font-semibold">{m.label}</dt>
              <dd className="order-1 text-[clamp(2.5rem,1.8rem+2.4vw,4rem)] font-extrabold leading-none tracking-[-0.04em] text-navy">
                <Counter value={m.value} format={m.format} />
              </dd>
              <dd className="order-3 mt-auto pt-6 text-xs text-ink-muted">
                As of {formatDate(m.asOf)}
                {!m.verified && <span className="mt-1 block text-[#8a4100]">Pending verification</span>}
              </dd>
            </Reveal>
          ))}
        </dl>

        <div className="mt-8 flex flex-col gap-4 text-sm text-ink-muted md:flex-row md:items-start md:justify-between">
          <p className="max-w-2xl">
            <span className="font-semibold text-navy">Reporting period:</span> {periods.join("; ")}. Sources: {[...new Set(items.map((m) => m.source))].join("; ")}.
            {unverified && " Figures marked pending are shown as found on public sources and will be replaced with program-office-verified values."}
          </p>
          <ButtonLink href="/about/impact" variant="text">Full impact dashboard</ButtonLink>
        </div>
        <DataNotice source={data.source} what="metric data" className="mt-6" />
      </div>
    </section>
  );
}

import { DotTitle } from "@/components/brand/dot-title";
import { Reveal } from "@/components/ui/reveal";
import type { Metric } from "@/lib/data/types";
import { formatMetric } from "@/lib/format";

/**
 * Proof (brief §11): a testimonial and the participating-organization list. Neither has been cleared
 * for public release yet, so each slot says so instead of showing invented quotes or names.
 */
export function Results({ metrics }: { metrics: Metric[] }) {
  const orgs = metrics.find((m) => m.key === "activities");
  return (
    <section aria-labelledby="proof-title" className="section-y bg-white">
      <div className="container-page">
        <Reveal><h2 id="proof-title" className="text-h2 font-bold"><DotTitle>{"Partners and proof."}</DotTitle></h2></Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <Reveal className="flex flex-col rounded-xl border border-dashed border-line p-8">
            <span className="text-6xl font-extrabold leading-none text-cobalt/25" aria-hidden>&ldquo;</span>
            <p className="mt-2 font-semibold">Testimonials</p>
            <p className="mt-2 text-sm text-ink-muted">Buyer and awardee testimonials appear here once cleared for public release.</p>
          </Reveal>
          <Reveal delay={0.08} className="flex flex-col justify-between rounded-xl bg-cloud/70 p-8">
            <p className="font-semibold">Participating organizations</p>
            {orgs && <p className="mt-4 text-5xl font-extrabold tracking-[-0.04em]">{formatMetric(orgs.value, orgs.format)}</p>}
            <p className="mt-2 text-sm text-ink-muted">Department of War activities. The named list is published once cleared for public release.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

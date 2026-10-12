import { DotTitle } from "@/components/brand/dot-title";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { formatMetric } from "@/lib/format";
import type { Metric } from "@/lib/data/types";
import { formatDate } from "@/lib/data/opportunity-status";

/** Data-driven storytelling built only from metric records; no invented outcomes. */
export function Results({ metrics }: { metrics: Metric[] }) {
  const by = Object.fromEntries(metrics.map((m) => [m.key, m]));
  const submitted = by["submitted"];
  const awardable = by["awardable"];
  const value = by["award-value"];
  const orgs = by["activities"];
  const rate = submitted && awardable ? Math.round((awardable.value / submitted.value) * 100) : null;

  return (
    <section aria-labelledby="results-title" className="section-y bg-white">
      <div className="container-page grid gap-14 lg:grid-cols-12 lg:items-center">
        <Reveal className="lg:col-span-6">
          <h2 id="results-title" className="text-h2 font-bold"><DotTitle>{"Rigorous assessment. Documented outcomes."}</DotTitle></h2>
          <p className="mt-6 max-w-xl text-lead text-ink-muted">
            Every awardable solution is assessed by a peer and subject-matter-expert panel before it reaches a buyer.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/about/impact" variant="primary">View impact</ButtonLink>
            <ButtonLink href="/marketplace/awardees" variant="secondary" arrow={false}>Awardees</ButtonLink>
          </div>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:col-span-6">
          {rate !== null && (
            <Reveal className="relative overflow-hidden rounded-xl bg-navy p-8 text-white sm:col-span-2">
              <div className="flex items-end justify-between gap-6">
                <div>
                  <p className="text-[clamp(3.5rem,2.5rem+3vw,5.5rem)] font-extrabold leading-none tracking-[-0.05em]">{rate}%</p>
                  <p className="mt-3 max-w-xs text-white/80">of submitted solutions determined awardable</p>
                </div>
                {/* Proportional bar — the visual matches the number exactly */}
                <div className="hidden h-32 w-24 flex-col justify-end overflow-hidden rounded-md bg-white/10 sm:flex" role="img" aria-label={`${awardable!.value} of ${submitted!.value} submissions`}>
                  <div className="bg-gradient-to-t from-cobalt to-signal" style={{ height: `${rate}%` }} />
                </div>
              </div>
              <p className="mt-6 border-t border-line-dark pt-4 text-xs text-ink-subtle">
                Derived: {formatMetric(awardable!.value, "number")} awardable ÷ {formatMetric(submitted!.value, "number")} submitted · {submitted!.reportingPeriod}
                {!submitted!.verified && " · pending verification"}
              </p>
            </Reveal>
          )}
          {value && (
            <Reveal delay={0.08} className="rounded-xl border border-line bg-cloud/60 p-8">
              <p className="text-4xl font-extrabold tracking-[-0.04em]">{formatMetric(value.value, value.format)}</p>
              <p className="mt-3 font-semibold">{value.label}</p>
              <p className="mt-4 text-xs text-ink-muted">As of {formatDate(value.asOf)}{!value.verified && " · pending verification"}</p>
            </Reveal>
          )}
          <Reveal delay={0.14} className="flex flex-col justify-between rounded-xl border border-dashed border-line p-8">
            <p className="text-5xl font-extrabold leading-none text-cobalt/30" aria-hidden>&ldquo;</p>
            <p className="mt-2 font-semibold">Testimonials</p>
            <p className="mt-2 text-sm text-ink-muted">Buyer and awardee testimonials appear here once cleared for public release.</p>
          </Reveal>
        </div>
      </div>

      {/* Participating organizations (brief §6.1 proof section) */}
      <div className="container-page mt-16">
        <Reveal className="flex flex-col gap-6 rounded-xl border border-line bg-cloud/60 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold">Participating organizations</p>
            <p className="mt-1 max-w-xl text-sm text-ink-muted">Department of War activities that use the Marketplace. The named list is published once cleared for public release.</p>
          </div>
          {orgs && (
            <p className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold tracking-[-0.04em]">{formatMetric(orgs.value, orgs.format)}</span>
              <span className="text-sm text-ink-muted">{orgs.label.toLowerCase()}{!orgs.verified && " · pending verification"}</span>
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}

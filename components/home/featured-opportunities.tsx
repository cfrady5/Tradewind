import { OpportunityCard } from "@/components/cards/opportunity-card";
import { ButtonLink } from "@/components/ui/button";
import { DataNotice } from "@/components/ui/data-notice";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { opportunityStatus, resolveDates } from "@/lib/data/opportunity-status";
import type { Loaded, Opportunity } from "@/lib/data/types";

export function FeaturedOpportunities({ data, now }: { data: Loaded<Opportunity>; now: Date }) {
  const current = data.items
    .map((o) => ({ o, status: opportunityStatus(o, now), date: resolveDates(o, now) }))
    .filter((x) => x.status !== "closed")
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "open" ? -1 : 1;
      return (a.date.closesAt?.getTime() ?? Infinity) - (b.date.closesAt?.getTime() ?? Infinity);
    })
    .slice(0, 4);

  return (
    <section aria-labelledby="opps-title" className="section-y bg-cloud">
      <div className="container-page">
        <SectionHeader
          eyebrow="Opportunities"
          title={<span id="opps-title">Open now — and closing soon.</span>}
          lead="Live calls for solutions, sorted by deadline. Status updates automatically as dates pass."
          align="split"
          action={<ButtonLink href="/opportunities" variant="secondary">All opportunities</ButtonLink>}
        />
        <DataNotice source={data.source} what="the opportunities list" className="mt-10" />
        <ul className="mt-8 space-y-4">
          {current.map(({ o, status }, i) => (
            <Reveal as="li" key={o.slug} delay={i * 0.06}>
              <OpportunityCard o={o} status={status} now={now} variant="row" />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

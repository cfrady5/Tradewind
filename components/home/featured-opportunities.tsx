import Link from "next/link";
import { DotTitle } from "@/components/brand/dot-title";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRight } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { STATUS_LABEL, TYPE_LABEL, formatDate, opportunityStatus, resolveDates } from "@/lib/data/opportunity-status";
import type { Loaded, Opportunity } from "@/lib/data/types";

/** Opportunities (brief §11): featured cards, active notices, a link to all opportunities. */
export function FeaturedOpportunities({ data, now }: { data: Loaded<Opportunity>; now: Date }) {
  const current = data.items
    .map((o) => ({ o, status: opportunityStatus(o, now), date: resolveDates(o, now) }))
    .filter((x) => x.status !== "closed")
    .sort((a, b) => {
      if (!!a.o.featured !== !!b.o.featured) return a.o.featured ? -1 : 1;
      if (a.status !== b.status) return a.status === "open" ? -1 : 1;
      return (a.date.closesAt?.getTime() ?? Infinity) - (b.date.closesAt?.getTime() ?? Infinity);
    })
    .slice(0, 3);

  return (
    <section aria-labelledby="opps-title" className="section-y bg-cloud">
      <div className="container-page">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal><h2 id="opps-title" className="text-h2 font-bold"><DotTitle>{"Opportunities."}</DotTitle></h2></Reveal>
          <ButtonLink href="/opportunities" variant="secondary">All opportunities</ButtonLink>
        </div>
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {current.map(({ o, status, date }, i) => (
            <Reveal as="li" key={o.slug} delay={i * 0.06}>
              <Link href={`/opportunities/${o.slug}`} className="group flex h-full flex-col rounded-lg border border-line bg-white p-6 transition-[border-color,box-shadow] duration-(--duration-ui) hover:border-signal/50 hover:shadow-lift">
                <span className="flex flex-wrap gap-2">
                  <Badge tone={status} dot>{STATUS_LABEL[status]}</Badge>
                  <Badge tone="neutral">{o.featured ? "Featured" : TYPE_LABEL[o.type]}</Badge>
                  {o.sample && <Badge tone="accent">Sample</Badge>}
                </span>
                <span className="mt-4 text-lg font-semibold leading-snug">{o.title}</span>
                <span className="mt-auto flex items-center justify-between pt-6 text-sm text-ink-muted">
                  {status === "upcoming" && date.opensAt ? `Opens ${formatDate(date.opensAt)}` : date.closesAt ? `Due ${formatDate(date.closesAt)}` : "Ongoing"}
                  <ArrowRight width={18} height={18} className="text-cobalt transition-transform duration-(--duration-ui) group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

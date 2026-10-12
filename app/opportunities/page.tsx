import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { Section } from "@/components/content/blocks";
import { ProcessSteps } from "@/components/content/process-steps";
import { OpportunityCard } from "@/components/cards/opportunity-card";
import { OpportunitiesDirectory } from "@/components/directory/opportunities-directory";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { DataNotice } from "@/components/ui/data-notice";
import { ArrowRight } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { getOpportunities } from "@/lib/data";
import { toRows } from "@/lib/data/opportunity-rows";
import { STATUS_LABEL, formatDate } from "@/lib/data/opportunity-status";
import type { Opportunity } from "@/lib/data/types";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Opportunities",
  description: "Open Tradewinds calls for solutions — the Marketplace collection period, Special Topics, Shopping Notices, notices of intent and initiatives — with live status and deadlines.",
  alternates: { canonical: "/opportunities" },
};

const LANES: { type: Opportunity["type"]; title: string; body: string; href: string }[] = [
  { type: "special-topic", title: "Active special topics", body: "Targeted calls for specific mission challenges.", href: "/opportunities/special-topics" },
  { type: "shopping-notice", title: "Shopping notices", body: "Buyer-issued requests to the Marketplace.", href: "/opportunities/shopping-notices" },
  { type: "notice-of-intent", title: "Notices of intent", body: "Planned awards open to capability statements.", href: "/opportunities?type=notice-of-intent#all" },
];

export default async function Page() {
  const now = new Date();
  const data = await getOpportunities();
  const rows = toRows(data.items, now);
  const live = rows.filter((r) => r.status !== "closed");
  const featured = live.filter((r) => r.o.featured);
  const closedCount = rows.length - live.length;

  return (
    <>
      <PageHero
        title="Opportunities"
        lead="Open calls for AI, digital and data solutions — with status, deadlines and sponsors in one place."
        crumbs={[{ label: "Opportunities", href: "/opportunities" }]}
        compact
      >
        <ButtonLink href="#all" variant="accent">Browse all opportunities</ButtonLink>
        <ButtonLink href="/opportunities/swarm-forge" variant="secondary-dark">Swarm Forge initiative</ButtonLink>
      </PageHero>

      {/* Featured */}
      <Section>
        <DataNotice source={data.source} what="the opportunities list" className="mb-10" />
        <SectionHeader title="Featured." lead="Pinned by the Tradewinds team." />
        <ul className="mt-10 space-y-4">
          {(featured.length ? featured : live.slice(0, 1)).map(({ o, status }, i) => (
            <Reveal as="li" key={o.slug} delay={i * 0.06}><OpportunityCard o={o} status={status} now={now} variant="row" /></Reveal>
          ))}
        </ul>
      </Section>

      {/* Lanes: special topics · shopping notices · notices of intent */}
      <Section tone="cloud">
        <div className="grid gap-5 lg:grid-cols-3">
          {LANES.map((lane, i) => {
            const items = live.filter((r) => r.o.type === lane.type);
            return (
              <Reveal key={lane.type} delay={i * 0.06} className="flex flex-col rounded-xl border border-line bg-white p-7">
                <h2 className="text-xl font-bold">{lane.title}</h2>
                <p className="mt-1 text-sm text-ink-muted">{lane.body}</p>
                <ul className="mt-5 divide-y divide-line border-y border-line">
                  {items.length === 0 && <li className="py-4 text-sm text-ink-muted">None open right now.</li>}
                  {items.map(({ o, status, closesAt, opensAt }) => (
                    <li key={o.slug} className="py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={status} dot>{STATUS_LABEL[status]}</Badge>
                        {o.sample && <Badge tone="accent">Sample</Badge>}
                      </div>
                      <Link href={`/opportunities/${o.slug}`} className="mt-2 block font-semibold leading-snug hover:text-cobalt">{o.title}</Link>
                      <p className="mt-1 text-xs text-ink-muted">{o.sponsor}{status === "upcoming" && opensAt ? ` · opens ${formatDate(opensAt)}` : closesAt ? ` · due ${formatDate(closesAt)}` : ""}</p>
                    </li>
                  ))}
                </ul>
                <Link href={lane.href} className="group mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-cobalt">
                  View all<ArrowRight width={16} height={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* Everything, searchable */}
      <section id="all" aria-labelledby="all-title" className="scroll-mt-24 bg-white">
        <div className="container-page py-16 md:py-24">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 id="all-title" className="text-h2 font-bold">All opportunities<span className="text-runway">.</span></h2>
            <Link href="/opportunities/archive" className="group inline-flex items-center gap-1.5 font-semibold text-cobalt">
              Closed and archived ({closedCount})<ArrowRight width={16} height={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <Suspense fallback={<p className="text-ink-muted">Loading opportunities…</p>}>
            <OpportunitiesDirectory rows={rows} now={now.toISOString()} />
          </Suspense>
        </div>
      </section>

      {/* Submission guidance */}
      <Section tone="cloud">
        <SectionHeader title="How to respond." lead="Most opportunities follow the same Marketplace process." align="split" action={<ButtonLink href="/marketplace/submission-guide" variant="secondary">Submission guide</ButtonLink>} />
        <div className="mt-12">
          <ProcessSteps steps={[
            { title: "Read the call", body: "Confirm the problem, eligibility and deadline on the opportunity page." },
            { title: "Prepare", body: "A concise pitch — five minutes or less — that answers the stated need." },
            { title: "Submit", body: "Upload through the solution-provider portal before the deadline." },
            { title: "Outcome", body: "Awardable solutions become discoverable; others receive feedback." },
          ]} />
        </div>
      </Section>

      <NextSteps steps={[
        { eyebrow: "Learn", title: "Instructional videos", href: "/marketplace/videos" },
        { eyebrow: "Examples", title: "Exemplar submissions", href: "/marketplace/exemplars" },
        { eyebrow: "Questions", title: "Vendor submission FAQs", href: "/marketplace/faqs?category=Vendor+Submission" },
      ]} />
    </>
  );
}

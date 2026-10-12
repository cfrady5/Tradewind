import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { DataNotice } from "@/components/ui/data-notice";
import { Building, Calendar, Document, Mail } from "@/components/ui/icons";
import { getBySlug, getOpportunities } from "@/lib/data";
import { STATUS_LABEL, TYPE_LABEL, daysUntil, formatDate, opportunityStatus, resolveDates } from "@/lib/data/opportunity-status";
import { SITE } from "@/lib/site-config";

export const revalidate = 300;

export async function generateStaticParams() {
  const { items } = await getOpportunities();
  return items.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params }: PageProps<"/opportunities/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { item } = await getBySlug(getOpportunities, slug);
  if (!item) return {};
  return { title: item.title, description: item.summary, alternates: { canonical: `/opportunities/${slug}` } };
}

export default async function OpportunityPage({ params }: PageProps<"/opportunities/[slug]">) {
  const { slug } = await params;
  const { item: o, source } = await getBySlug(getOpportunities, slug);
  if (!o) notFound();
  const now = new Date();
  const status = opportunityStatus(o, now);
  const { opensAt, closesAt } = resolveDates(o, now);
  const days = closesAt && status === "open" ? daysUntil(closesAt, now) : null;

  const sections = [
    o.missionNeed && { id: "mission-need", label: "Mission need", body: <p>{o.missionNeed}</p> },
    o.eligibility && { id: "eligibility", label: "Eligibility", body: <p>{o.eligibility}</p> },
    o.requirements?.length && {
      id: "requirements", label: "Requirements",
      body: <ul className="space-y-3">{o.requirements.map((r) => <li key={r} className="flex gap-3"><span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-runway" />{r}</li>)}</ul>,
    },
    o.submissionInstructions && { id: "how-to-submit", label: "How to submit", body: <p>{o.submissionInstructions}</p> },
    o.documents?.length && {
      id: "documents", label: "Official documents",
      body: (
        <ul className="grid gap-3 sm:grid-cols-2">
          {o.documents.map((d) => (
            <li key={d.url}>
              <a href={d.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-md border border-line p-4 font-semibold transition-colors hover:border-signal hover:bg-sky-tint/40">
                <Document className="shrink-0 text-cobalt" />{d.label}<span className="sr-only"> (opens external site)</span>
              </a>
            </li>
          ))}
        </ul>
      ),
    },
  ].filter(Boolean) as { id: string; label: string; body: React.ReactNode }[];

  const jsonLd = {
    "@context": "https://schema.org", "@type": "WebPage", name: o.title, description: o.summary, url: `${SITE.url}/opportunities/${o.slug}`,
  };

  return (
    <>
      <PageHero
        title={o.title}
        lead={o.summary}
        crumbs={[{ label: "Opportunities", href: "/opportunities" }, { label: o.title, href: `/opportunities/${o.slug}` }]}
        compact
      >
        <Badge tone={status} dot>{STATUS_LABEL[status]}</Badge>
        <Badge tone="neutral">{TYPE_LABEL[o.type]}</Badge>
        {o.sample && <Badge tone="accent">Sample</Badge>}
      </PageHero>

      <section className="bg-white">
        <div className="container-page grid gap-12 py-14 md:py-20 lg:grid-cols-12">
          <aside className="lg:col-span-4 lg:order-2">
            <div className="sticky top-[calc(var(--header-h)+1.5rem)] space-y-6">
              <div className="rounded-lg border border-line bg-cloud/50 p-6">
                <h2 className="eyebrow text-ink-muted">Key dates</h2>
                <dl className="mt-5 space-y-4">
                  {opensAt && <div><dt className="text-sm text-ink-muted">Opens</dt><dd className="font-semibold">{formatDate(opensAt, true)}</dd></div>}
                  {closesAt && (
                    <div>
                      <dt className="text-sm text-ink-muted">{o.recurrence ? "Next deadline" : status === "closed" ? "Closed" : "Closes"}</dt>
                      <dd className="text-xl font-bold">{formatDate(closesAt, true)}</dd>
                      {days !== null && <dd className="mt-1 text-sm font-semibold text-cobalt">{days} day{days === 1 ? "" : "s"} remaining</dd>}
                      {o.recurrence && <dd className="mt-1 text-sm text-ink-muted">Recurs monthly — 12:00 pm ET on the last day of each month</dd>}
                    </div>
                  )}
                  <div className="flex items-center gap-2 border-t border-line pt-4 text-sm"><dt className="sr-only">Sponsor</dt><Building width={16} height={16} className="text-cobalt" /><dd>{o.sponsor}</dd></div>
                </dl>
                <div className="mt-6 grid gap-3">
                  {status !== "closed" && o.externalUrl && (
                    <ButtonLink href={o.externalUrl} external variant="primary">{o.type === "external" ? "View on SAM.gov" : "Go to submission portal"}</ButtonLink>
                  )}
                  {o.contactEmail && (
                    <a href={`mailto:${o.contactEmail}`} className="flex items-center justify-center gap-2 text-sm font-semibold text-cobalt hover:underline"><Mail width={16} height={16} />{o.contactEmail}</a>
                  )}
                </div>
              </div>
              {sections.length > 1 && (
                <nav aria-label="On this page" className="hidden lg:block">
                  <h2 className="eyebrow text-ink-muted">On this page</h2>
                  <ul className="mt-4 space-y-1 border-l border-line text-sm">
                    {sections.map((s) => (
                      <li key={s.id}><a href={`#${s.id}`} className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-ink-muted hover:border-cobalt hover:text-navy">{s.label}</a></li>
                    ))}
                  </ul>
                </nav>
              )}
            </div>
          </aside>

          <article className="lg:col-span-8 lg:order-1">
            <DataNotice source={source} what="this opportunity" className="mb-10" />
            {status === "closed" && (
              <p className="mb-10 flex items-center gap-3 rounded-md bg-cloud p-4 text-sm"><Calendar className="text-ink-muted" />This opportunity has closed and is retained for reference.</p>
            )}
            {sections.length === 0 && <p className="text-ink-muted">Full details for this opportunity are awaiting approved content.</p>}
            <div className="space-y-14">
              {sections.map((s) => (
                <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-32">
                  <h2 id={`${s.id}-h`} className="text-h3 font-bold">{s.label}</h2>
                  <div className="mt-5 max-w-prose text-lg leading-relaxed text-ink-muted">{s.body}</div>
                </section>
              ))}
            </div>
          </article>
        </div>
      </section>
      <NextSteps steps={[
        { eyebrow: "Opportunities", title: "See all open opportunities", href: "/opportunities" },
        { eyebrow: "Industry", title: "Prepare with the submission guide", href: "/marketplace/submission-guide" },
        { eyebrow: "Questions", title: "Read the FAQs", href: "/marketplace/faqs" },
      ]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}

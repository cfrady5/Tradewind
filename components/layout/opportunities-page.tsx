import { Suspense } from "react";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { OpportunitiesDirectory } from "@/components/directory/opportunities-directory";
import { DataNotice } from "@/components/ui/data-notice";
import { getOpportunities } from "@/lib/data";
import { toRows } from "@/lib/data/opportunity-rows";
import type { Opportunity } from "@/lib/data/types";
import type { Crumb } from "@/components/ui/breadcrumbs";

/** Shared template for the directory and its filtered views (special topics, notices, archive). */
export async function OpportunitiesPage({ title, lead, crumbs, lockType, defaultStatus, intro }: {
  title: string; lead: string; crumbs: Crumb[]; lockType?: Opportunity["type"]; defaultStatus?: "current" | "closed" | "all"; intro?: React.ReactNode;
}) {
  const now = new Date();
  const data = await getOpportunities();
  const rows = toRows(data.items, now).filter((r) => !lockType || r.o.type === lockType);
  return (
    <>
      <PageHero eyebrow="Opportunities" title={title} lead={lead} crumbs={[{ label: "Opportunities", href: "/opportunities" }, ...crumbs]} compact />
      <section className="bg-white">
        <div className="container-page py-14 md:py-20">
          {intro}
          <DataNotice source={data.source} what="the opportunities list" className="mb-8" />
          <Suspense fallback={<p className="text-ink-muted">Loading opportunities…</p>}>
            <OpportunitiesDirectory rows={rows} now={now.toISOString()} lockType={lockType} defaultStatus={defaultStatus} />
          </Suspense>
        </div>
      </section>
      <NextSteps steps={[
        { eyebrow: "Industry", title: "Read the submission guide", href: "/marketplace/submission-guide" },
        { eyebrow: "Learn", title: "Watch exemplar pitches", href: "/resources/exemplars" },
        { eyebrow: "Questions", title: "Browse FAQs", href: "/resources/faqs" },
      ]} />
    </>
  );
}

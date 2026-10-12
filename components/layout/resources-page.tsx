import { Suspense } from "react";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps, type Step } from "@/components/layout/next-steps";
import { ResourcesDirectory } from "@/components/directory/resources-directory";
import { DataNotice } from "@/components/ui/data-notice";
import { getResources } from "@/lib/data";
import type { Crumb } from "@/components/ui/breadcrumbs";
import type { Resource } from "@/lib/data/types";

export async function ResourcesPage({ title, lead, crumbs, lockKinds, steps }: { title: string; lead: string; crumbs: Crumb[]; lockKinds?: Resource["kind"][]; steps: Step[] }) {
  const data = await getResources();
  return (
    <>
      <PageHero title={title} lead={lead} crumbs={crumbs} compact />
      <section className="bg-white">
        <div className="container-page py-14 md:py-20">
          <DataNotice source={data.source} what="the resource library" className="mb-8" />
          <Suspense fallback={<p className="text-ink-muted">Loading…</p>}><ResourcesDirectory items={data.items} lockKinds={lockKinds} /></Suspense>
        </div>
      </section>
      <NextSteps steps={steps} />
    </>
  );
}

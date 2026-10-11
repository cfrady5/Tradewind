import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { SolutionsDirectory } from "@/components/directory/solutions-directory";
import { DataNotice } from "@/components/ui/data-notice";
import { ButtonLink } from "@/components/ui/button";
import { Shield } from "@/components/ui/icons";
import { getSolutions } from "@/lib/data";
import { EXTERNAL } from "@/lib/site-config";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Browse Awardable Solutions",
  description: "Search public information about solutions determined awardable in the Tradewinds Solutions Marketplace.",
  alternates: { canonical: "/marketplace/solutions" },
};

export default async function SolutionsPage() {
  const data = await getSolutions();
  return (
    <>
      <PageHero
        eyebrow="Marketplace"
        title="Browse awardable solutions"
        lead="Search public information about solutions determined awardable through the Tradewinds assessment process."
        crumbs={[{ label: "Marketplace", href: "/marketplace" }, { label: "Browse Awardables", href: "/marketplace/solutions" }]}
        compact
      />
      <section className="bg-white">
        <div className="container-page py-14 md:py-20">
          <div className="mb-10 flex flex-col gap-4 rounded-lg border border-line bg-cloud/60 p-5 md:flex-row md:items-center md:justify-between">
            <p className="flex items-start gap-3 text-sm">
              <Shield className="mt-0.5 shrink-0 text-cobalt" />
              <span>
                <strong className="font-semibold">Public metadata only.</strong> Pitch videos and detailed solution information remain in the
                Marketplace, available to government users with .gov or .mil access.
              </span>
            </p>
            <ButtonLink href={EXTERNAL.marketplaceSignIn} external variant="primary" className="shrink-0">Government sign-in</ButtonLink>
          </div>
          <DataNotice source={data.source} what="the solutions directory" className="mb-8" />
          <Suspense fallback={<p className="text-ink-muted">Loading directory…</p>}>
            <SolutionsDirectory items={data.items} />
          </Suspense>
        </div>
      </section>
      <NextSteps steps={[
        { eyebrow: "Government", title: "How buyers use the Marketplace", href: "/marketplace/government" },
        { eyebrow: "Acquisition", title: "Compare contract vehicles", href: "/acquisition/vehicles" },
        { eyebrow: "Industry", title: "Get your solution assessed", href: "/marketplace/providers" },
      ]} />
    </>
  );
}

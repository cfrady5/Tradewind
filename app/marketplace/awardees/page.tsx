import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { Section } from "@/components/content/blocks";
import { AwardeesDirectory } from "@/components/directory/awardees-directory";
import { EmptyState } from "@/components/ui/empty-state";
import { Shield } from "@/components/ui/icons";
import { getAwards } from "@/lib/data";

export const revalidate = 300;
export const metadata: Metadata = { title: "Awardees", description: "Public records of contracts awarded through the Tradewinds ecosystem.", alternates: { canonical: "/marketplace/awardees" } };

export default async function Page() {
  const data = await getAwards();
  return (
    <>
      <PageHero title="Awardees" lead="Real contract outcomes from the Tradewinds ecosystem — companies, awards and the organizations that made them." crumbs={[{ label: "Marketplace", href: "/marketplace" }, { label: "Awardees", href: "/marketplace/awardees" }]} compact />
      <Section>
        <p className="mb-10 flex items-start gap-3 rounded-lg border border-line bg-cloud/60 p-5 text-sm">
          <Shield className="mt-0.5 shrink-0 text-cobalt" />
          <span><strong className="font-semibold">Public information only.</strong> Award titles, organizations, dates and values appear only where cleared for release. Classified awards are never listed.</span>
        </p>
        {data.items.length === 0 ? (
          <EmptyState title="Award records are awaiting an approved public dataset">
            Only award information cleared for public release will appear here. No records are shown until the program office approves the dataset.
          </EmptyState>
        ) : (
          <Suspense fallback={<p className="text-ink-muted">Loading…</p>}><AwardeesDirectory items={data.items} /></Suspense>
        )}
      </Section>
      <NextSteps steps={[
        { eyebrow: "Marketplace", title: "Awardable companies", href: "/marketplace/awardable-companies" },
        { eyebrow: "Impact", title: "Program metrics", href: "/about/impact" },
        { eyebrow: "Acquisition", title: "Contract vehicles", href: "/contract-vehicles" },
      ]} />
    </>
  );
}

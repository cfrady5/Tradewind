import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { Section } from "@/components/content/blocks";
import { EmptyState } from "@/components/ui/empty-state";
import { getAwards } from "@/lib/data";
import { formatDate } from "@/lib/data/opportunity-status";
import { formatMetric } from "@/lib/format";

export const revalidate = 300;
export const metadata: Metadata = { title: "Awarded Solutions", description: "Public records of awards made through Tradewinds.", alternates: { canonical: "/about/awarded-solutions" } };

export default async function Page() {
  const data = await getAwards();
  return (
    <>
      <PageHero eyebrow="About" title="Awarded solutions" lead="Public records of awards made through the Tradewinds ecosystem." crumbs={[{ label: "About", href: "/about" }, { label: "Awarded Solutions", href: "/about/awarded-solutions" }]} compact />
      <Section>
        {data.items.length === 0 ? (
          <EmptyState title="Award records are awaiting an approved public dataset">
            Only award information cleared for public release will appear here. No records are shown until the program office approves the dataset.
          </EmptyState>
        ) : (
          <div className="overflow-hidden rounded-xl border border-line">
            <table className="w-full text-left text-[0.9375rem]">
              <caption className="sr-only">Public award records</caption>
              <thead className="bg-cloud text-xs uppercase tracking-[0.12em] text-ink-muted">
                <tr><th scope="col" className="p-4">Vendor</th><th scope="col" className="p-4">Solution</th><th scope="col" className="p-4">Awarding activity</th><th scope="col" className="p-4">Date</th><th scope="col" className="p-4">Value</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.items.map((a) => (
                  <tr key={a.slug}><th scope="row" className="p-4 font-semibold">{a.vendor}</th><td className="p-4">{a.solution}</td><td className="p-4">{a.awardingActivity}</td><td className="p-4">{formatDate(a.awardDate)}</td><td className="p-4 tabular-nums">{a.valueUsd ? formatMetric(a.valueUsd, "currency-compact") : "—"}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
      <NextSteps steps={[
        { eyebrow: "Impact", title: "Program metrics", href: "/about/impact" },
        { eyebrow: "Marketplace", title: "Awardable solutions", href: "/marketplace/solutions" },
        { eyebrow: "Acquisition", title: "How awards are made", href: "/acquisition" },
      ]} />
    </>
  );
}

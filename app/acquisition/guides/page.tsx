import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { Section } from "@/components/content/blocks";
import { ResourceCard } from "@/components/cards/resource-card";
import { DataNotice } from "@/components/ui/data-notice";
import { getResources } from "@/lib/data";

export const revalidate = 300;
export const metadata: Metadata = { title: "Acquisition Guides", description: "Handbooks, guides and official documents for acquiring through Tradewinds.", alternates: { canonical: "/acquisition/guides" } };

export default async function Page() {
  const data = await getResources();
  const guides = data.items.filter((r) => (r.kind === "guide" || r.kind === "document") && r.audiences.some((a) => a !== "industry"));
  return (
    <>
      <PageHero eyebrow="Acquisition" title="Acquisition guides" lead="Handbooks and official documents for buyers and contracting teams." crumbs={[{ label: "Acquisition", href: "/acquisition" }, { label: "Guides", href: "/acquisition/guides" }]} compact />
      <Section>
        <DataNotice source={data.source} what="the guide list" className="mb-8" />
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{guides.map((r) => <li key={r.slug}><ResourceCard r={r} /></li>)}</ul>
      </Section>
      <NextSteps steps={[
        { eyebrow: "Vehicles", title: "Compare contract vehicles", href: "/acquisition/vehicles" },
        { eyebrow: "Library", title: "All resources", href: "/resources" },
        { eyebrow: "Questions", title: "Acquisition FAQs", href: "/resources/faqs?category=Acquisition" },
      ]} />
    </>
  );
}

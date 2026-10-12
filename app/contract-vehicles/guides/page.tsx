import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { Section } from "@/components/content/blocks";
import { ResourceCard } from "@/components/cards/resource-card";
import { DataNotice } from "@/components/ui/data-notice";
import { getResources } from "@/lib/data";

export const revalidate = 300;
export const metadata: Metadata = { title: "Acquisition Guides", description: "Handbooks, guides and official documents for acquiring through Tradewinds.", alternates: { canonical: "/contract-vehicles/guides" } };

export default async function Page() {
  const data = await getResources();
  const guides = data.items.filter((r) => (r.kind === "guide" || r.kind === "document") && r.audiences.some((a) => a !== "industry"));
  return (
    <>
      <PageHero title="Acquisition guides" lead="Handbooks and official documents for buyers and contracting teams." crumbs={[{ label: "Contract Vehicles", href: "/contract-vehicles" }, { label: "Guides", href: "/contract-vehicles/guides" }]} compact />
      <Section>
        <DataNotice source={data.source} what="the guide list" className="mb-8" />
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{guides.map((r) => <li key={r.slug}><ResourceCard r={r} /></li>)}</ul>
      </Section>
      <NextSteps steps={[
        { eyebrow: "Vehicles", title: "Compare contract vehicles", href: "/contract-vehicles" },
        { eyebrow: "Library", title: "All resources", href: "/resources" },
        { eyebrow: "Questions", title: "Acquisition FAQs", href: "/marketplace/faqs?category=Acquisition" },
      ]} />
    </>
  );
}

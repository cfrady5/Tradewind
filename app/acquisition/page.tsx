import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { Section, Split } from "@/components/content/blocks";
import { ProcessSteps } from "@/components/content/process-steps";
import { VehicleCompare } from "@/components/content/vehicle-compare";
import { DataNotice } from "@/components/ui/data-notice";
import { SectionHeader } from "@/components/ui/section-header";
import { ButtonLink } from "@/components/ui/button";
import { getVehicles } from "@/lib/data";

export const revalidate = 300;
export const metadata: Metadata = { title: "Acquisition", description: "Procurement pathways and CDAO contract vehicles for AI, digital and data capabilities.", alternates: { canonical: "/acquisition" } };

export default async function Page() {
  const vehicles = await getVehicles();
  return (
    <>
      <PageHero
        title="Choose the right pathway to award."
        lead="Tradewinds connects discovery to procurement: the Solutions Marketplace for assessed solutions, and CDAO contract vehicles for services, talent and test."
        crumbs={[{ label: "Acquisition", href: "/acquisition" }]}
      >
        <ButtonLink href="/acquisition/vehicles" variant="accent">Compare vehicles</ButtonLink>
        <ButtonLink href="/acquisition/guides" variant="secondary-dark" arrow={false}>Acquisition guides</ButtonLink>
      </PageHero>
      <Section>
        <SectionHeader title="From need to award" lead="Most acquisitions follow the same arc. The right vehicle depends on what you're buying." />
        <div className="mt-14">
          <ProcessSteps steps={[
            { title: "Define the need", body: "Outcome-based problem statement, constraints and success measures." },
            { title: "Discover", body: "Search awardable solutions in the Marketplace, or scope services needs." },
            { title: "Select a pathway", body: "Award from the Marketplace, or order through an appropriate contract vehicle." },
            { title: "Award & deliver", body: "Your contracting office awards; Tradewinds supports through delivery." },
          ]} />
        </div>
      </Section>
      <Section tone="cloud">
        <SectionHeader title="Compare at a glance" />
        <DataNotice source={vehicles.source} what="vehicle information" className="mt-8" />
        <div className="mt-10"><VehicleCompare vehicles={vehicles.items} /></div>
      </Section>
      <Section>
        <Split title="Clear status on every vehicle">
          <p>Each vehicle page separates <strong>current ordering guidance</strong> from <strong>historical information</strong>. Where details are being confirmed with the program office, the page says so rather than presenting outdated information as current.</p>
        </Split>
      </Section>
      <NextSteps steps={[
        { eyebrow: "Marketplace", title: "Find awardable solutions", href: "/marketplace" },
        { eyebrow: "Guides", title: "Acquisition guides", href: "/acquisition/guides" },
        { eyebrow: "Support", title: "Talk to the team", href: "/about/contact" },
      ]} />
    </>
  );
}

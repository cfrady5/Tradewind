import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { Section, Split, FeatureList } from "@/components/content/blocks";
import { SectionHeader } from "@/components/ui/section-header";

export const metadata: Metadata = { title: "About Tradewinds", description: "Tradewinds is the Department's framework for sourcing, funding and developing AI, digital and data-analytics solutions, housed in the CDAO.", alternates: { canonical: "/about" } };

export default function Page() {
  return (
    <>
      <PageHero
        title="Built to move innovation at mission speed."
        lead="Tradewinds is the Department's framework for sourcing, funding and developing solutions to challenges in the AI/ML, digital and data-analytics space."
        crumbs={[{ label: "About", href: "/about" }]}
      />
      <Section>
        <Split title="Mission & vision.">
          {/* Official mission statement — Tradewinds Brand Guidelines (09.24.26), p.1 */}
          <p className="text-[clamp(1.25rem,1.1rem+0.6vw,1.625rem)] leading-snug text-navy">
            The Tradewinds Marketplace is changing the way the Department of War (DoW) discovers, assesses, and acquires cutting-edge AI, digital,
            and data-driven technologies. By streamlining traditionally lengthy procurement processes, the TSM leverages concise, monthly
            vendor-submitted video pitches, rigorously assessed against federal standards, to quickly surface validated, high-impact solutions.
          </p>
        </Split>
      </Section>
      <Section tone="dark">
        <SectionHeader dark title="Who does what" />
        <div className="mt-12">
          <FeatureList dark items={[
            { title: "Chief Digital and AI Office (CDAO)", body: "Tradewinds is housed in the CDAO, which leads the Department's adoption of data, analytics and AI." },
            { title: "Applied Research Institute (ARI)", body: "Serves as manager of the Tradewinds Solutions Marketplace." },
            { title: "Government buyers", body: "Organizations across the Department discover awardable solutions and award through their contracting offices." },
            { title: "Solution providers", body: "Businesses, non-traditional contractors and academia submit solutions for expert assessment." },
          ]} />
        </div>
      </Section>
      <Section tone="cloud">
        <Split title="One front door">
          <p>The <strong>Solutions Marketplace</strong> for assessed, awardable solutions. <strong>Contract vehicles</strong> for services, talent and test. <strong>AI tools</strong> and resources that help acquisition teams work faster. Together they form a single ecosystem with one front door.</p>
        </Split>
      </Section>
      <NextSteps steps={[
        { eyebrow: "Results", title: "Impact & results", href: "/about/impact" },
        { eyebrow: "Marketplace", title: "How the Marketplace works", href: "/marketplace" },
        { eyebrow: "Contact", title: "Reach the team", href: "/about/contact" },
      ]} />
    </>
  );
}

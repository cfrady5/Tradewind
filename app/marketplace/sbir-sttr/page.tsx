import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { Section, Split, PendingContent } from "@/components/content/blocks";

export const metadata: Metadata = { title: "SBIR/STTR Aisle", description: "A dedicated Marketplace aisle connecting buyers with technologies developed through the Small Business Innovation Research and Small Business Technology Transfer programs.", alternates: { canonical: "/marketplace/sbir-sttr" } };

export default function Page() {
  return (
    <>
      <PageHero
        title="SBIR/STTR Aisle"
        lead="A dedicated Marketplace aisle connecting buyers with technologies developed through the Small Business Innovation Research and Small Business Technology Transfer programs."
        crumbs={[{ label: "Marketplace", href: "/marketplace" }, { label: "SBIR/STTR Aisle", href: "/marketplace/sbir-sttr" }]}
        compact
      />
      <Section>
        <Split title="How it works">
          <PendingContent what="Eligibility, submission workflow and buyer guidance for the SBIR/STTR Aisle" />
          <p className="mt-8">In the meantime, the Marketplace&rsquo;s standard process applies: submit a pitch for expert assessment, and awardable solutions become discoverable to government buyers.</p>
        </Split>
      </Section>
      <NextSteps steps={[
        { eyebrow: "Marketplace", title: "How the Marketplace works", href: "/marketplace" },
        { eyebrow: "Submit", title: "Submission guide", href: "/marketplace/submission-guide" },
        { eyebrow: "Questions", title: "Contact the team", href: "/about/contact" },
      ]} />
    </>
  );
}

import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { Section, Split, PendingContent } from "@/components/content/blocks";

export const metadata: Metadata = { title: "Prototype Transition Aisle", description: "A dedicated Marketplace aisle helping proven prototypes find a path to production and fielding.", alternates: { canonical: "/marketplace/prototype-transition" } };

export default function Page() {
  return (
    <>
      <PageHero
        title="Prototype Transition Aisle"
        lead="A dedicated Marketplace aisle helping proven prototypes find a path to production and fielding."
        crumbs={[{ label: "Marketplace", href: "/marketplace" }, { label: "Prototype Transition Aisle", href: "/marketplace/prototype-transition" }]}
        compact
      />
      <Section>
        <Split title="How it works">
          <PendingContent what="Eligibility, submission workflow and transition guidance for the Prototype Transition Aisle" />
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

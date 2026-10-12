import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { Section, Split, PendingContent } from "@/components/content/blocks";
import { ProcessSteps } from "@/components/content/process-steps";
import { ButtonLink } from "@/components/ui/button";
import { EXTERNAL } from "@/lib/site-config";

export const metadata: Metadata = { title: "Swarm Forge", description: "The Swarm Forge initiative: autonomous systems and swarm prototype efforts sourced through Tradewinds.", alternates: { canonical: "/opportunities/swarm-forge" } };

export default function Page() {
  return (
    <>
      <PageHero
        title="Swarm Forge"
        lead="An initiative for autonomous-systems and swarm prototype efforts, sourced through the Tradewinds ecosystem."
        crumbs={[{ label: "Opportunities", href: "/opportunities" }, { label: "Swarm Forge", href: "/opportunities/swarm-forge" }]}
        compact
      >
        <ButtonLink href={EXTERNAL.submissionPortal} external variant="primary">Submit through the portal</ButtonLink>
      </PageHero>
      <Section>
        <Split title="Initiative overview.">
          <PendingContent what="The initiative overview, problem statement, capability needs, submission requirements and timeline" />
          <p className="mt-8">Until that content is published, submissions follow the standard Marketplace process: a concise pitch, assessment against stated criteria, and discoverability for awardable solutions.</p>
        </Split>
      </Section>
      <Section tone="cloud">
        <h2 className="text-h3">How to participate</h2>
        <div className="mt-10">
          <ProcessSteps steps={[
            { title: "Review the problem statement", body: "Confirm your capability addresses the stated autonomy or swarm need." },
            { title: "Prepare a concise pitch", body: "Five minutes or less: the problem, your approach, evidence and maturity." },
            { title: "Submit by the deadline", body: "Reference the initiative in your submission." },
            { title: "Assessment and next steps", body: "Awardable solutions become discoverable to sponsoring organizations." },
          ]} />
        </div>
      </Section>
      <NextSteps steps={[
        { eyebrow: "Opportunities", title: "All current opportunities", href: "/opportunities" },
        { eyebrow: "Guidance", title: "Instructional videos", href: "/marketplace/videos" },
        { eyebrow: "Questions", title: "Contact the team", href: "/contact" },
      ]} />
    </>
  );
}

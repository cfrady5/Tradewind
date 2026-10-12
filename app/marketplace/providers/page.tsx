import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { Section, Split, FeatureList } from "@/components/content/blocks";
import { ProcessSteps } from "@/components/content/process-steps";
import { FaqList } from "@/components/content/faq-list";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { Clock } from "@/components/ui/icons";
import { getFaqs } from "@/lib/data";
import { formatDate, monthlyDeadline } from "@/lib/data/opportunity-status";
import { EXTERNAL } from "@/lib/site-config";

export const revalidate = 300;
export const metadata: Metadata = { title: "For Solution Providers", description: "Submit your AI, digital or data-analytics solution to the Tradewinds Solutions Marketplace.", alternates: { canonical: "/marketplace/providers" } };

export default async function Page() {
  const faqs = await getFaqs();
  const deadline = monthlyDeadline();
  return (
    <>
      <PageHero
        title="Bring your technology to the mission."
        lead="Submit a five-minute pitch. Get assessed by experts. If awardable, become discoverable to government buyers across the Department."
        crumbs={[{ label: "Marketplace", href: "/marketplace" }, { label: "For Solution Providers", href: "/marketplace/providers" }]}
        aside={
          <div className="rounded-xl border border-line-dark bg-white/[0.05] p-6 backdrop-blur">
            <p className="flex items-center gap-2 text-sm font-semibold text-runway"><Clock width={18} height={18} />Current collection period closes</p>
            <p className="mt-2 text-2xl font-bold">{formatDate(deadline, true)}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink href={EXTERNAL.submissionPortal} external variant="accent">Go to submission portal</ButtonLink>
            </div>
          </div>
        }
      >
        <ButtonLink href="/marketplace/submission-guide" variant="secondary-dark">Read the submission guide</ButtonLink>
      </PageHero>
      <Section>
        <SectionHeader title="Six steps to awardable" />
        <div className="mt-14">
          <ProcessSteps steps={[
            { title: "Determine eligibility", body: "U.S. businesses, non-traditional contractors, academia and certain foreign entities may submit. Confirm against the current solicitation." },
            { title: "Understand the Marketplace", body: "Awardable solutions are discoverable by government buyers. Awardable is not a contract award." },
            { title: "Prepare your materials", body: "Plan a pitch of five minutes or less: problem, solution, evidence, differentiation." },
            { title: "Submit through the portal", body: "Create a solution-provider account and upload before 12:00 pm ET on the last day of the month." },
            { title: "Understand assessment", body: "Peer/SME panels assess each pitch. Every submission receives an outcome; non-awardable submissions receive feedback." },
            { title: "Explore next steps", body: "If awardable, use approved language and the Awardable graphic, and engage buyers. If not, revise and resubmit." },
          ]} />
        </div>
      </Section>
      <Section tone="dark">
        <SectionHeader dark title="What strong submissions demonstrate." />
        <div className="mt-12">
          <FeatureList dark items={[
            { title: "A precise mission problem", body: "Name the operational problem and who has it — not just the technology category." },
            { title: "Proof it works", body: "Results, deployments, test data or demonstrations. Specific beats sweeping." },
            { title: "Clear differentiation", body: "What makes your approach better for this mission than the alternatives?" },
            { title: "Deployment realism", body: "Maturity, integration, security and sustainment considerations a buyer will ask about." },
          ]} />
        </div>
      </Section>
      <Section>
        <Split title="For solution providers">
          <FaqList faqs={faqs.items.filter((f) => f.audiences.includes("industry"))} />
        </Split>
      </Section>
      <NextSteps steps={[
        { eyebrow: "Prepare", title: "Interactive submission guide", href: "/marketplace/submission-guide" },
        { eyebrow: "Learn", title: "Watch exemplar pitches", href: "/marketplace/exemplars" },
        { eyebrow: "Open now", title: "Special Topics & notices", href: "/opportunities" },
      ]} />
    </>
  );
}

import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { Callout } from "@/components/content/blocks";
import { DetailLayout, Bullets, Pending } from "@/components/content/detail-layout";
import { ProcessSteps } from "@/components/content/process-steps";
import { FaqList } from "@/components/content/faq-list";
import { ButtonLink } from "@/components/ui/button";
import { getFaqs } from "@/lib/data";
import { EXTERNAL } from "@/lib/site-config";

export const revalidate = 300;
export const metadata: Metadata = { title: "Swarm Forge", description: "Swarm Forge: the Tradewinds initiative for autonomous systems and swarm prototype efforts.", alternates: { canonical: "/opportunities/swarm-forge" } };

/** Initiative page in the brief's section order (§6.9). Program specifics publish from the Employee Portal once approved. */
export default async function Page() {
  const faqs = (await getFaqs()).items.filter((f) => ["video-length", "submission-deadline", "not-awardable"].includes(f.slug));
  return (
    <>
      <PageHero
        title="Swarm Forge"
        lead="An initiative for autonomous systems and swarm prototype efforts, sourced through the Tradewinds ecosystem."
        crumbs={[{ label: "Opportunities", href: "/opportunities" }, { label: "Swarm Forge", href: "/opportunities/swarm-forge" }]}
        compact
      >
        <ButtonLink href={EXTERNAL.submissionPortal} external variant="accent">Submit through the portal</ButtonLink>
        <ButtonLink href="/contact" variant="secondary-dark">Contact the team</ButtonLink>
      </PageHero>
      <DetailLayout
        intro={<Callout tone="pending" title="Initiative details being finalized">The problem statement, capability needs and timeline publish here as soon as they are approved. The submission process below applies now.</Callout>}
        sections={[
          { id: "overview", title: "Initiative overview", content: <p>Swarm Forge focuses the Tradewinds ecosystem on autonomous systems and swarm prototype efforts: finding capable teams, assessing them quickly and moving the strongest toward prototype work.</p> },
          { id: "problem", title: "Problem statement", content: <Pending>The approved problem statement will be published here.</Pending> },
          { id: "capability-needs", title: "Capability needs", content: <Pending>The capability areas the initiative is seeking will be listed here.</Pending> },
          {
            id: "requirements", title: "Submission requirements",
            content: <Bullets items={["A concise pitch video — five minutes or less.", "A clear statement of the autonomy or swarm need your capability addresses.", "Evidence of maturity: test results, demonstrations or fielding.", "A reference to Swarm Forge in your submission."]} />,
          },
          {
            id: "timeline", title: "Timeline",
            content: (
              <>
                <div className="-mx-1 mt-2"><ProcessSteps steps={[
                  { title: "Announce", body: "Problem statement and capability needs published." },
                  { title: "Submit", body: "Pitches collected through the portal." },
                  { title: "Assess", body: "Expert panels assess each submission." },
                  { title: "Prototype", body: "Selected teams move toward prototype efforts." },
                ]} /></div>
                <div className="mt-6"><Pending>Dates for each phase will be published here.</Pending></div>
              </>
            ),
          },
          {
            id: "resources", title: "Resources",
            content: (
              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/marketplace/videos" variant="secondary" arrow={false}>Instructional videos</ButtonLink>
                <ButtonLink href="/marketplace/exemplars" variant="secondary" arrow={false}>Exemplar submissions</ButtonLink>
                <ButtonLink href="/marketplace/submission-guide" variant="secondary" arrow={false}>Submission guide</ButtonLink>
              </div>
            ),
          },
          { id: "faq", title: "FAQ", content: <FaqList faqs={faqs} /> },
          {
            id: "submit", title: "Submit or ask a question",
            content: (
              <>
                <p>Submit through the solution-provider portal, or contact the Tradewinds team about fit and timing.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <ButtonLink href={EXTERNAL.submissionPortal} external variant="primary">Submit through the portal</ButtonLink>
                  <ButtonLink href={`mailto:${EXTERNAL.successEmail}?subject=${encodeURIComponent("Swarm Forge question")}`} variant="secondary" arrow={false}>Email {EXTERNAL.successEmail}</ButtonLink>
                </div>
              </>
            ),
          },
        ]}
      />
      <NextSteps steps={[
        { eyebrow: "Opportunities", title: "All current opportunities", href: "/opportunities" },
        { eyebrow: "Marketplace", title: "Prototype Transition Aisle", href: "/marketplace/prototype-transition" },
        { eyebrow: "Questions", title: "Contact the team", href: "/contact" },
      ]} />
    </>
  );
}

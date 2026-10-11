import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { Section, Callout } from "@/components/content/blocks";
import { FaqList } from "@/components/content/faq-list";
import { SubmissionChecklist } from "@/components/content/submission-checklist";
import { ResourceCard } from "@/components/cards/resource-card";
import { ButtonLink } from "@/components/ui/button";
import { getFaqs, getResources } from "@/lib/data";
import { formatDate, monthlyDeadline } from "@/lib/data/opportunity-status";
import { EXTERNAL } from "@/lib/site-config";

export const revalidate = 300;
export const metadata: Metadata = { title: "Submission Guide", description: "Checklist, requirements, timing and guidance for submitting to the Tradewinds Solutions Marketplace.", alternates: { canonical: "/marketplace/submission-guide" } };

export default async function Page() {
  const [faqs, resources] = await Promise.all([getFaqs(), getResources()]);
  const videos = resources.items.filter((r) => r.kind === "video" || r.kind === "exemplar" || r.slug === "im-awardable-now-what").slice(0, 3);
  const deadline = monthlyDeadline();
  return (
    <>
      <PageHero
        title="Everything you need to submit with confidence."
        lead="Work through the checklist, review requirements and timing, then submit through the official portal."
        crumbs={[{ label: "Marketplace", href: "/marketplace" }, { label: "Submission Guide", href: "/marketplace/submission-guide" }]}
        compact
      >
        <ButtonLink href={EXTERNAL.submissionPortal} external variant="accent">Official submission portal</ButtonLink>
      </PageHero>
      <Section>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="text-h3 font-bold">Submission checklist</h2>
            <p className="mt-3 text-ink-muted">Track your readiness. Progress is saved in this browser only.</p>
            <div className="mt-8">
              <SubmissionChecklist groups={[
                { title: "Eligibility & account", items: [
                  { id: "eligible", label: "Confirm your organization is eligible", detail: "U.S. businesses, non-traditional contractors, academia and certain foreign entities — check the current solicitation." },
                  { id: "account", label: "Create a solution-provider account", detail: "Provider accounts submit pitches; they do not provide access to view other solutions." },
                ] },
                { title: "Required materials", items: [
                  { id: "length", label: "Pitch video is 5:00 or shorter", detail: "Videos exceeding five minutes are not assessed." },
                  { id: "problem", label: "Pitch states the mission problem clearly" },
                  { id: "evidence", label: "Pitch shows evidence the solution works" },
                  { id: "diff", label: "Pitch explains differentiation and deployment considerations" },
                ] },
                { title: "Timing", items: [
                  { id: "deadline", label: `Upload before ${formatDate(deadline, true)}`, detail: "Deadline: 12:00 pm ET on the last day of each month." },
                ] },
              ]} />
            </div>
          </div>
          <aside className="space-y-6 lg:col-span-5">
            <div className="rounded-xl bg-navy p-7 text-white on-dark">
              <h2 className="eyebrow text-runway">Evaluation</h2>
              <p className="mt-4 text-lg font-semibold">Assessed by peer and subject-matter-expert panels each month.</p>
              <p className="mt-3 text-white/75">Every submission receives an outcome. If your solution isn&rsquo;t determined awardable, you&rsquo;ll receive feedback and can resubmit in a later period.</p>
            </div>
            <Callout title="Official requirements are authoritative">This guide summarizes public guidance. The current solicitation and submission portal always take precedence.</Callout>
          </aside>
        </div>
      </Section>
      <Section tone="cloud">
        <h2 className="text-h3 font-bold">Video guidance & resources</h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">{videos.map((r) => <li key={r.slug}><ResourceCard r={r} /></li>)}</ul>
      </Section>
      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          <h2 className="text-h3 font-bold lg:col-span-4">Submission FAQs</h2>
          <div className="lg:col-span-8"><FaqList faqs={faqs.items.filter((f) => f.category === "Submissions")} /></div>
        </div>
      </Section>
      <NextSteps steps={[
        { eyebrow: "Examples", title: "Exemplar submissions", href: "/resources/exemplars" },
        { eyebrow: "Prompts", title: "Outline your pitch with AI", href: "/ai-tools/prompt-library?q=pitch" },
        { eyebrow: "Opportunities", title: "Open calls", href: "/opportunities" },
      ]} />
    </>
  );
}

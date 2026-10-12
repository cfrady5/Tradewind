import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { Section, Split } from "@/components/content/blocks";
import { VideoCard } from "@/components/media/video-library";
import { ButtonLink } from "@/components/ui/button";
import { DataNotice } from "@/components/ui/data-notice";
import { EmptyState } from "@/components/ui/empty-state";
import { Check } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { getResources } from "@/lib/data";

export const revalidate = 300;
export const metadata: Metadata = { title: "Exemplar Submissions", description: "Example pitch videos that show what a strong Marketplace submission looks like, why they work and how to improve yours.", alternates: { canonical: "/marketplace/exemplars" } };

const QUALITIES = [
  { title: "Clarity", body: "One problem, one solution, said plainly in the first thirty seconds." },
  { title: "Mission fit", body: "A specific government need, described in the user's terms — not a product tour." },
  { title: "Technical credibility", body: "How it works, at the depth an expert assessor expects, without jargon for its own sake." },
  { title: "Proof", body: "Evidence it works: deployments, test results, measured outcomes." },
  { title: "Differentiation", body: "Why this approach over the alternatives a buyer already knows." },
  { title: "Realistic impact", body: "Outcomes you can stand behind, with honest maturity and limits." },
];

const CHECKLIST = [
  "The problem and the user are named in the first thirty seconds.",
  "The video is five minutes or less — longer submissions are not assessed.",
  "Every capability claim is backed by evidence shown on screen or stated plainly.",
  "Technology readiness and deployment status are stated honestly.",
  "The pitch explains what is different, not only what is new.",
  "Audio is clear and on-screen text is readable at normal playback size.",
  "No classified, CUI or proprietary third-party information appears anywhere.",
];

export default async function Page() {
  const data = await getResources();
  const exemplars = data.items.filter((r) => r.kind === "exemplar");
  return (
    <>
      <PageHero
        title="Exemplar submissions"
        lead="What strong pitches look like: clear problems, real evidence and realistic impact — all within five minutes."
        crumbs={[{ label: "Marketplace", href: "/marketplace" }, { label: "Exemplar Submissions", href: "/marketplace/exemplars" }]}
        compact
      >
        <ButtonLink href="/opportunities/solutions-marketplace-collection" variant="accent">Read the solicitation</ButtonLink>
      </PageHero>

      <Section>
        <SectionHeader title="What makes a strong pitch." lead="Assessors look for the same six qualities in every submission." align="split" />
        <ul className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {QUALITIES.map((q, i) => (
            <Reveal as="li" key={q.title} delay={i * 0.04} className="bg-white p-7">
              <span className="font-mono text-sm font-semibold text-cobalt">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-lg font-bold">{q.title}</h3>
              <p className="mt-1.5 text-[0.9375rem] text-ink-muted">{q.body}</p>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section tone="cloud">
        <SectionHeader title="Exemplar videos." lead="Each example is annotated with what it does well." />
        <DataNotice source={data.source} what="the exemplar library" className="mt-8" />
        {exemplars.length ? (
          <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{exemplars.map((v) => <li key={v.slug}><VideoCard v={v} /></li>)}</ul>
        ) : (
          <div className="mt-10"><EmptyState title="Exemplars are being prepared">Approved exemplar pitches will appear here.</EmptyState></div>
        )}
      </Section>

      <Section>
        <Split title="Why these examples work.">
          <p>The strongest pitches spend their five minutes on the buyer&rsquo;s problem, not the company&rsquo;s history. They show the solution working, quantify what changed, and are honest about maturity and limits.</p>
          <p>They also make the assessor&rsquo;s job easy: a clear structure, readable visuals and every claim tied to evidence. Use them as a pattern for structure and pacing, not as a script.</p>
        </Split>
      </Section>

      <Section tone="cloud">
        <Split title="Checklist before you submit.">
          <ul className="space-y-3">
            {CHECKLIST.map((c) => (
              <li key={c} className="flex gap-3 rounded-md border border-line bg-white p-4 text-[0.9375rem] text-navy">
                <span className="grid size-6 shrink-0 place-items-center rounded-sm bg-cobalt text-white"><Check width={14} height={14} /></span>{c}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/marketplace/submission-guide" variant="primary">Interactive submission checklist</ButtonLink>
            <ButtonLink href="/ai-playground/prompt-library?q=pitch" variant="secondary" arrow={false}>Outline your pitch with a prompt</ButtonLink>
          </div>
        </Split>
      </Section>

      <NextSteps steps={[
        { eyebrow: "Solicitation", title: "Current collection period", href: "/opportunities/solutions-marketplace-collection" },
        { eyebrow: "Learn", title: "Instructional videos", href: "/marketplace/videos" },
        { eyebrow: "Questions", title: "Vendor submission FAQs", href: "/marketplace/faqs?category=Vendor+Submission" },
      ]} />
    </>
  );
}

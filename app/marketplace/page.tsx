import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { Section, Split, Callout } from "@/components/content/blocks";
import { ProcessSteps } from "@/components/content/process-steps";
import { FaqList } from "@/components/content/faq-list";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { ArrowRight } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { getFaqs, getMetrics } from "@/lib/data";
import { formatMetric } from "@/lib/format";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Solutions Marketplace",
  description: "The Tradewinds Solutions Marketplace: a repository of competitively assessed, readily awardable AI, digital and data-analytics solutions for government buyers.",
  alternates: { canonical: "/marketplace" },
};

export default async function MarketplacePage() {
  const [faqs, metrics] = await Promise.all([getFaqs(), getMetrics()]);
  const m = Object.fromEntries(metrics.items.map((x) => [x.key, x]));
  return (
    <>
      <PageHero
        eyebrow="Solutions Marketplace"
        title={<>Assessed once. <span className="text-gradient-sky">Awardable when you need it</span><span className="text-runway">.</span></>}
        lead="A digital repository of post-competition, readily awardable pitch videos — giving government buyers a single place to find AI, digital and data-analytics solutions."
        crumbs={[{ label: "Marketplace", href: "/marketplace" }]}
        aside={m.awardable && (
          <div className="overflow-hidden rounded-lg border border-line-dark bg-line-dark">
          <dl className="grid grid-cols-2 gap-px">
            {[m.awardable, m.submitted, m.activities].filter(Boolean).map((x) => (
              <div key={x.key} className="bg-navy/70 p-5 backdrop-blur first:col-span-2">
                <dt className="text-sm text-white/70">{x.label}</dt>
                <dd className="mt-1 text-3xl font-extrabold tracking-tight">{formatMetric(x.value, x.format)}</dd>
              </div>
            ))}
          </dl>
            <p className="mt-px bg-navy/70 px-5 py-3 text-xs text-ink-subtle">{m.awardable.reportingPeriod}{!m.awardable.verified && " · pending verification"}</p>
          </div>
        )}
      >
        <ButtonLink href="/marketplace/government" variant="accent">I&rsquo;m a government buyer</ButtonLink>
        <ButtonLink href="/marketplace/providers" variant="secondary-dark">I&rsquo;m a solution provider</ButtonLink>
      </PageHero>

      <Section>
        <Split eyebrow="What it is" title="A marketplace built on competition">
          <p>The Tradewinds Solutions Marketplace is an ongoing solicitation. Solution providers submit short video pitches; expert panels assess them; solutions that meet the bar are designated <strong>awardable</strong> and placed in the Marketplace.</p>
          <p>Because every awardable solution has already been through a competitive assessment, government buyers can discover capabilities and move toward award without starting a new competition from scratch.</p>
        </Split>
      </Section>

      <Section tone="cloud">
        <SectionHeader eyebrow="How submissions work" title="From pitch to awardable" lead="Collection runs monthly. Every submission gets an outcome — and feedback if it isn't awardable yet." />
        <div className="mt-14">
          <ProcessSteps steps={[
            { title: "Prepare", body: "Develop a video pitch no longer than five minutes that explains the mission problem, your solution and the evidence it works." },
            { title: "Submit", body: "Upload through the solution-provider portal by 12:00 pm ET on the last day of the month." },
            { title: "Assess", body: "Peer and subject-matter-expert panels assess each pitch in that month's cycle." },
            { title: "Awardable", body: "Awardable solutions enter the Marketplace. Others receive feedback and may resubmit." },
          ]} />
        </div>
      </Section>

      <Section>
        <div className="grid gap-5 lg:grid-cols-2">
          {[
            { href: "/marketplace/government", eyebrow: "Government buyers", title: "Discover and acquire", body: "Government users with a .gov or .mil email sign in to search awardable pitch videos by title or company and move toward award with their contracting office.", dark: true },
            { href: "/marketplace/providers", eyebrow: "Solution providers", title: "Get assessed and discovered", body: "U.S. businesses, non-traditional contractors and academia — and certain foreign entities — submit pitches for assessment.", dark: false },
          ].map((c, i) => (
            <Reveal key={c.href} delay={i * 0.06}>
              <Link href={c.href} className={c.dark ? "on-dark group flex h-full flex-col rounded-xl bg-navy p-10 text-white transition-shadow hover:shadow-glow" : "group flex h-full flex-col rounded-xl border border-line bg-cloud/60 p-10 transition-[border-color,box-shadow] hover:border-signal/50 hover:shadow-lift"}>
                <span className={c.dark ? "eyebrow text-runway" : "eyebrow text-cobalt"}>{c.eyebrow}</span>
                <h2 className="mt-4 text-h3 font-bold">{c.title}</h2>
                <p className={c.dark ? "mt-3 text-white/75" : "mt-3 text-ink-muted"}>{c.body}</p>
                <span className={c.dark ? "mt-8 flex items-center gap-2 font-semibold text-sky" : "mt-8 flex items-center gap-2 font-semibold text-cobalt"}>
                  Continue <ArrowRight className="transition-transform group-hover:translate-x-1.5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="cloud">
        <Split eyebrow="Awardable status" title="What “awardable” means — and doesn't">
          <p>Awardable means a solution&rsquo;s pitch was assessed by an expert panel and met the Marketplace&rsquo;s criteria. It makes the solution discoverable to government buyers and eligible to pursue an award.</p>
          <p><strong>It is not a contract award</strong>, an endorsement, or a guarantee of one. Buyers still determine mission fit, negotiate terms and award through their contracting office.</p>
          <div className="mt-8"><Callout title="Acquisition pathways">Buying activities select an appropriate award mechanism with their contracting office. See <Link href="/acquisition">Acquisition</Link> for pathways and contract vehicles.</Callout></div>
        </Split>
      </Section>

      <Section>
        <Split eyebrow="Questions" title="Marketplace FAQs">
          <FaqList faqs={faqs.items.filter((f) => f.category === "Marketplace" || f.category === "Government Access")} />
          <div className="mt-8"><ButtonLink href="/resources/faqs" variant="text">All FAQs</ButtonLink></div>
        </Split>
      </Section>

      <NextSteps steps={[
        { eyebrow: "Browse", title: "Awardable solutions directory", href: "/marketplace/solutions" },
        { eyebrow: "Submit", title: "Submission guide", href: "/marketplace/submission-guide" },
        { eyebrow: "Now open", title: "Current opportunities", href: "/opportunities" },
      ]} />
    </>
  );
}

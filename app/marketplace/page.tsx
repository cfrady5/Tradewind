import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { Section, Split, Callout, PendingContent } from "@/components/content/blocks";
import { ProcessSteps } from "@/components/content/process-steps";
import { FinalCta } from "@/components/home/final-cta";
import { ButtonLink } from "@/components/ui/button";
import { Counter } from "@/components/ui/counter";
import { SectionHeader } from "@/components/ui/section-header";
import { ArrowRight, Building, Document, Layers, Play, Search, Spark, Users } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { getMetrics } from "@/lib/data";
import { formatDate } from "@/lib/data/opportunity-status";
import { EXTERNAL } from "@/lib/site-config";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Solutions Marketplace",
  description: "A repository of evaluated, post-competition pitch videos for AI, ML, digital and data-analytics solutions — discoverable by government users ready to move toward award.",
  alternates: { canonical: "/marketplace" },
};

const PATHS = [
  {
    id: "providers", label: "I am a solution provider", title: "Get assessed. Become discoverable.", dark: true,
    steps: ["Create a solution-provider account.", "Submit one solution per pitch, five minutes or less.", "Follow the stated requirements and rubric.", "Receive an awardable outcome — or feedback to improve and resubmit.", "Promote awardable status and engage when government users reach out."],
    primary: { label: "Submit a solution", href: EXTERNAL.submissionPortal, external: true }, secondary: { label: "Provider guide", href: "/marketplace/providers" },
  },
  {
    id: "government", label: "I am a government user", title: "Find evaluated capability. Move to award.", dark: false,
    steps: ["Sign in or register with an eligible .gov or .mil email.", "Search awardable solutions by need, title or company.", "Review pitch videos and supporting information.", "Contact the provider or request acquisition support.", "Move toward award with your contracting office."],
    primary: { label: "Access the Marketplace", href: EXTERNAL.marketplaceSignIn, external: true }, secondary: { label: "Buyer guide", href: "/marketplace/government" },
  },
];

const HUB = [
  { icon: Play, title: "Instructional videos", body: "How the Marketplace works, from first login to awardable.", href: "/marketplace/videos" },
  { icon: Spark, title: "Exemplar submissions", body: "What strong pitches look like — and why they work.", href: "/marketplace/exemplars" },
  { icon: Document, title: "Submission guide", body: "Requirements, timing and an interactive checklist.", href: "/marketplace/submission-guide" },
  { icon: Search, title: "Awardable companies", body: "Search public listings of awardable solutions.", href: "/marketplace/awardable-companies" },
  { icon: Building, title: "Awardees", body: "Public records of contracts awarded through Tradewinds.", href: "/marketplace/awardees" },
  { icon: Users, title: "FAQs", body: "Answers for vendors, buyers and acquisition teams.", href: "/marketplace/faqs" },
];

const AISLES = [
  { title: "General aisle", body: "The Marketplace's ongoing solicitation for AI, ML, digital and data-analytics solutions, assessed every month.", href: "/opportunities/solutions-marketplace-collection", cta: "Current collection period" },
  { title: "SBIR/STTR Aisle", body: "Pre-competed SBIR/STTR-developed technologies that can move toward Phase III faster.", href: "/marketplace/sbir-sttr", cta: "Explore the aisle" },
  { title: "Prototype Transition Aisle", body: "Completed, competitively awarded prototypes that may qualify for follow-on production.", href: "/marketplace/prototype-transition", cta: "Explore the aisle" },
];

export default async function MarketplacePage() {
  const metrics = await getMetrics();
  const m = Object.fromEntries(metrics.items.map((x) => [x.key, x]));
  const shown = [m.awardable, m.submitted, m.activities, m["award-value"]].filter(Boolean);
  return (
    <>
      <PageHero
        title={<>Competitively assessed. <span className="text-gradient-sky">Readily awardable</span><span className="text-runway">.</span></>}
        lead="A repository of evaluated, post-competition pitch videos for AI, ML, digital and data-analytics solutions — discoverable by government users ready to move toward award."
        crumbs={[{ label: "Marketplace", href: "/marketplace" }]}
      >
        <ButtonLink href="#government" variant="accent">I&rsquo;m a government user</ButtonLink>
        <ButtonLink href="#providers" variant="secondary-dark">I&rsquo;m a solution provider</ButtonLink>
      </PageHero>

      {/* 1 · Two-path entry */}
      <Section>
        <SectionHeader title="Two ways in." lead="Vendors and government users take different paths through the same evaluated marketplace." align="split" />
        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          {PATHS.map((p, i) => (
            <Reveal key={p.id} id={p.id} delay={i * 0.06} className="scroll-mt-28">
              <div className={p.dark ? "on-dark relative flex h-full flex-col overflow-hidden rounded-xl bg-navy p-8 text-white md:p-10" : "relative flex h-full flex-col rounded-xl border border-line bg-cloud/60 p-8 md:p-10"}>
                {p.dark && <span className="absolute inset-0 bg-grid-fine opacity-60" aria-hidden />}
                <span className={p.dark ? "relative eyebrow text-runway" : "relative eyebrow text-cobalt"}>{p.label}</span>
                <h2 className="relative mt-4 text-h3 font-bold">{p.title}</h2>
                <ol className="relative mt-8 space-y-4">
                  {p.steps.map((s, k) => (
                    <li key={s} className="flex gap-4">
                      <span className={p.dark ? "grid size-8 shrink-0 place-items-center rounded-sm bg-cobalt font-mono text-xs font-bold text-white" : "grid size-8 shrink-0 place-items-center rounded-sm bg-navy font-mono text-xs font-bold text-white"}>{String(k + 1).padStart(2, "0")}</span>
                      <span className={p.dark ? "pt-1 text-white/85" : "pt-1 text-navy"}>{s}</span>
                    </li>
                  ))}
                </ol>
                <div className="relative mt-auto flex flex-wrap gap-3 pt-10">
                  <ButtonLink href={p.primary.href} external={p.primary.external} variant={p.dark ? "accent" : "primary"}>{p.primary.label}</ButtonLink>
                  <ButtonLink href={p.secondary.href} variant={p.dark ? "secondary-dark" : "secondary"} arrow={false}>{p.secondary.label}</ButtonLink>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 2 · How it works */}
      <Section tone="cloud">
        <SectionHeader title="How it works." lead="Collection runs every month. Every submission gets an outcome — and feedback if it is not awardable yet." />
        <div className="mt-14">
          <ProcessSteps steps={[
            { title: "Submit", body: "A vendor submits a concise pitch video of five minutes or less." },
            { title: "Review", body: "The submission is checked for compliance and assessed by peer and subject-matter-expert panels." },
            { title: "Awardable", body: "Solutions that meet the criteria are added to the Marketplace." },
            { title: "Engage", body: "Government users search, evaluate and engage providers." },
            { title: "Award", body: "Contracting proceeds under the appropriate authority or vehicle." },
          ]} />
        </div>
        <div className="mt-14 max-w-3xl">
          <Callout title="What awardable means">
            An expert panel assessed the pitch and found it met the Marketplace&rsquo;s criteria. It is <strong>not a contract award</strong>, an endorsement or a guarantee of one — buyers still determine fit and award through their contracting office. See <Link href="/contract-vehicles">contract vehicles</Link> for pathways.
          </Callout>
        </div>
      </Section>

      {/* 3 · Metrics */}
      {shown.length > 0 && (
        <Section>
          <SectionHeader title="By the numbers." lead={`Cumulative Marketplace results${m.awardable ? `, as of ${formatDate(m.awardable.asOf)}` : ""}.`} align="split" />
          <dl className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {shown.map((x, i) => (
              <Reveal key={x.key} delay={i * 0.06} className="flex flex-col bg-white p-8">
                <dt className="order-2 mt-3 font-semibold">{x.label}</dt>
                <dd className="order-1 text-[clamp(2.25rem,1.7rem+2vw,3.5rem)] font-extrabold leading-none tracking-[-0.04em] text-navy"><Counter value={x.value} format={x.format} /></dd>
                <dd className="order-3 mt-auto pt-5 text-xs text-ink-muted">{x.reportingPeriod}{!x.verified && <span className="block text-[#8a4100]">Pending verification</span>}</dd>
              </Reveal>
            ))}
          </dl>
          <p className="mt-4 text-xs text-ink-muted">Sources: {[...new Set(shown.map((x) => x.source))].join("; ")}. Figures marked pending are replaced with program-office-verified values once confirmed.</p>
        </Section>
      )}

      {/* 4 · Resource hub */}
      <Section tone="cloud">
        <SectionHeader title="Resource hub." lead="Everything vendors and buyers need to use the Marketplace well." align="split" />
        <ul className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {HUB.map((h, i) => (
            <Reveal as="li" key={h.href} delay={i * 0.04} className="bg-white">
              <Link href={h.href} className="group flex h-full flex-col p-7 transition-colors duration-(--duration-ui) hover:bg-sky-tint/40">
                <h.icon className="text-cobalt" width={26} height={26} />
                <span className="mt-5 text-lg font-bold">{h.title}</span>
                <span className="mt-1.5 text-[0.9375rem] text-ink-muted">{h.body}</span>
                <ArrowRight className="mt-auto pt-5 text-cobalt transition-transform duration-(--duration-ui) group-hover:translate-x-1.5" width={40} height={40} />
              </Link>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* 5 · Aisles */}
      <Section>
        <SectionHeader title="Marketplace aisles." lead="Three entry points for different stages of technology maturity." align="split" />
        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {AISLES.map((a, i) => (
            <Reveal as="li" key={a.href} delay={i * 0.06}>
              <Link href={a.href} className="group flex h-full flex-col rounded-xl border border-line p-8 transition-[border-color,box-shadow,transform] duration-(--duration-ui) hover:-translate-y-1 hover:border-signal/50 hover:shadow-lift">
                <Layers className="text-cobalt" width={26} height={26} />
                <span className="mt-6 text-xl font-bold">{a.title}</span>
                <span className="mt-2 text-ink-muted">{a.body}</span>
                <span className="mt-auto flex items-center gap-2 pt-8 font-semibold text-cobalt">{a.cta}<ArrowRight className="transition-transform group-hover:translate-x-1.5" /></span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* 6 · Year in review */}
      <Section tone="cloud">
        <Split title="Year in review.">
          <p>Each year the program reports what moved through the Marketplace: submissions, awardable solutions, participating organizations and awards.</p>
          <div className="mt-8"><PendingContent what="The Marketplace year in review" /></div>
          <div className="mt-6"><ButtonLink href="/about/impact" variant="text">Current impact dashboard</ButtonLink></div>
        </Split>
      </Section>

      {/* 7 · CTA */}
      <FinalCta />
    </>
  );
}

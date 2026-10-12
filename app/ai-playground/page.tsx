import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { Callout, Section } from "@/components/content/blocks";
import { ToolCard } from "@/components/cards/tool-card";
import { ToolsDirectory } from "@/components/directory/tools-directory";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { DataNotice } from "@/components/ui/data-notice";
import { ArrowRight, Check } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { getPrompts, getTools } from "@/lib/data";

export const revalidate = 300;
export const metadata: Metadata = { title: "AI Playground", description: "AI tools and prompts that support acquisition, market research, requirements development, risk analysis, AI assurance and productivity — each labeled by authorization status and data limits.", alternates: { canonical: "/ai-playground" } };

const PRACTICES = [
  "Check the tool's authorization status and data limits before you paste anything in.",
  "Never enter classified, CUI, export-controlled, proprietary or personal information into a tool that is not authorized for it.",
  "Treat output as a draft. Verify facts, citations and figures against authoritative sources.",
  "Keep a human accountable for every decision an AI output informs.",
  "Record which tool and prompt you used when output feeds an official document.",
];

export default async function Page() {
  const [data, prompts] = await Promise.all([getTools(), getPrompts()]);
  const featured = [...data.items].sort((a, b) => Number(b.availability === "approved") - Number(a.availability === "approved")).slice(0, 3);
  return (
    <>
      <PageHero
        title="AI Playground"
        lead="Tools and prompts for acquisition work: market research, requirements, risk analysis, AI assurance and everyday productivity."
        crumbs={[{ label: "AI Playground", href: "/ai-playground" }]}
        compact
      >
        <ButtonLink href="#catalog" variant="accent">Browse the catalog</ButtonLink>
        <ButtonLink href="/ai-playground/prompt-library" variant="secondary-dark">Open the prompt library</ButtonLink>
      </PageHero>

      {/* Intro and disclaimer */}
      <Section>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <Reveal className="lg:col-span-6">
            <h2 className="text-h3 font-bold">Use AI where it helps. Know the limits first<span className="text-runway">.</span></h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-muted">Each listing states who the tool is for, who owns it, what access requires and whether it is authorized for sensitive data.</p>
          </Reveal>
          <Reveal className="lg:col-span-6" delay={0.06}>
            <Callout tone="pending" title="Disclaimer">
              Listing a tool here is not an endorsement or an authorization to use it with sensitive data. Do not enter classified, CUI or export-controlled information unless the tool is explicitly authorized for it, and review all output before use.
            </Callout>
          </Reveal>
        </div>
      </Section>

      {/* Featured tools */}
      <Section tone="cloud">
        <SectionHeader title="Featured tools." align="split" lead="A starting point for common acquisition tasks." />
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {featured.map((t, i) => <Reveal as="li" key={t.slug} delay={i * 0.06}><ToolCard tool={t} /></Reveal>)}
        </ul>
      </Section>

      {/* Catalog */}
      <section id="catalog" aria-labelledby="catalog-title" className="scroll-mt-24 bg-white">
        <div className="container-page py-16 md:py-24">
          <h2 id="catalog-title" className="mb-10 text-h2 font-bold">Tool catalog<span className="text-runway">.</span></h2>
          <DataNotice source={data.source} what="the tool catalog" className="mb-8" />
          <Suspense fallback={<p className="text-ink-muted">Loading tools…</p>}><ToolsDirectory items={data.items} /></Suspense>
        </div>
      </section>

      {/* Prompt library */}
      <Section tone="cloud">
        <SectionHeader title="Prompt library." lead="Copy-ready prompts for requirements, market research, evaluation and communication." align="split" action={<ButtonLink href="/ai-playground/prompt-library" variant="primary">Open the prompt library</ButtonLink>} />
        <ul className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-3">
          {prompts.items.slice(0, 3).map((p, i) => (
            <Reveal as="li" key={p.slug} delay={i * 0.06} className="bg-white">
              <Link href={`/ai-playground/prompt-library?q=${encodeURIComponent(p.title)}`} className="group flex h-full flex-col p-7 transition-colors hover:bg-sky-tint/40">
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-cobalt">{p.category}{p.sample && <Badge tone="accent">Sample</Badge>}</span>
                <span className="mt-3 text-lg font-semibold">{p.title}</span>
                <span className="mt-1.5 text-[0.9375rem] text-ink-muted">{p.description}</span>
                {p.intendedUser && <span className="mt-4 text-xs text-ink-muted">For {p.intendedUser.toLowerCase()}</span>}
                <ArrowRight className="mt-auto pt-4 text-cobalt transition-transform group-hover:translate-x-1.5" width={36} height={36} />
              </Link>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* Responsible use */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <h2 className="text-h3 font-bold">Responsible use<span className="text-runway">.</span></h2>
            <p className="mt-4 text-ink-muted">Five habits that keep AI-assisted acquisition work accurate and secure.</p>
          </Reveal>
          <ol className="space-y-3 lg:col-span-8">
            {PRACTICES.map((p, i) => (
              <Reveal as="li" key={p} delay={i * 0.04} className="flex gap-4 rounded-md border border-line p-5">
                <span className="grid size-7 shrink-0 place-items-center rounded-sm bg-navy text-white"><Check width={14} height={14} /></span>
                <span className="text-navy">{p}</span>
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>

      <NextSteps steps={[
        { eyebrow: "Prompts", title: "Searchable prompt library", href: "/ai-playground/prompt-library" },
        { eyebrow: "Acquisition", title: "Contract vehicles", href: "/contract-vehicles" },
        { eyebrow: "Support", title: "Questions about a tool?", href: "/contact" },
      ]} />
    </>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { ToolsDirectory } from "@/components/directory/tools-directory";
import { AVAILABILITY } from "@/components/cards/tool-card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { DataNotice } from "@/components/ui/data-notice";
import { getTools } from "@/lib/data";

export const revalidate = 300;
export const metadata: Metadata = { title: "AI Tools", description: "A catalog of AI tools that support acquisition workflows — clearly labeled as approved, externally hosted or experimental.", alternates: { canonical: "/ai-tools" } };

export default async function Page() {
  const data = await getTools();
  return (
    <>
      <PageHero
        title="AI tools for acquisition work"
        lead="Discover tools that support market research, requirements, evaluation and more — each clearly labeled by approval status."
        crumbs={[{ label: "AI Tools", href: "/ai-tools" }]}
        compact
        aside={
          <dl className="grid gap-3 rounded-lg border border-line-dark bg-white/[0.04] p-5 text-sm">
            {Object.values(AVAILABILITY).map((a) => (
              <div key={a.label} className="flex items-center justify-between gap-4"><dt><Badge tone={a.tone} dot>{a.label}</Badge></dt><dd className="text-right text-white/75">{a.description}</dd></div>
            ))}
          </dl>
        }
      >
        <ButtonLink href="/ai-tools/prompt-library" variant="accent">Open the prompt library</ButtonLink>
      </PageHero>
      <section className="bg-white">
        <div className="container-page py-14 md:py-20">
          <DataNotice source={data.source} what="the tool catalog" className="mb-8" />
          <Suspense fallback={<p className="text-ink-muted">Loading tools…</p>}><ToolsDirectory items={data.items} /></Suspense>
        </div>
      </section>
      <NextSteps steps={[
        { eyebrow: "Prompts", title: "Searchable prompt library", href: "/ai-tools/prompt-library" },
        { eyebrow: "Acquisition", title: "Acquisition guides", href: "/acquisition/guides" },
        { eyebrow: "Support", title: "Questions about a tool?", href: "/about/contact" },
      ]} />
    </>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { ToolsDirectory } from "@/components/directory/tools-directory";
import { ButtonLink } from "@/components/ui/button";
import { DataNotice } from "@/components/ui/data-notice";
import { getTools } from "@/lib/data";

export const revalidate = 300;
export const metadata: Metadata = { title: "AI Playground", description: "A catalog of AI tools that support acquisition workflows — clearly labeled as approved, externally hosted or experimental.", alternates: { canonical: "/ai-playground" } };

export default async function Page() {
  const data = await getTools();
  return (
    <>
      <PageHero
        title="AI Playground"
        lead="Tools that support market research, requirements and evaluation, each labeled by approval status."
        crumbs={[{ label: "AI Playground", href: "/ai-playground" }]}
        compact
      >
        <ButtonLink href="/ai-playground/prompt-library" variant="accent">Open the prompt library</ButtonLink>
      </PageHero>
      <section className="bg-white">
        <div className="container-page py-14 md:py-20">
          <DataNotice source={data.source} what="the tool catalog" className="mb-8" />
          <Suspense fallback={<p className="text-ink-muted">Loading tools…</p>}><ToolsDirectory items={data.items} /></Suspense>
        </div>
      </section>
      <NextSteps steps={[
        { eyebrow: "Prompts", title: "Searchable prompt library", href: "/ai-playground/prompt-library" },
        { eyebrow: "Acquisition", title: "Acquisition guides", href: "/contract-vehicles/guides" },
        { eyebrow: "Support", title: "Questions about a tool?", href: "/contact" },
      ]} />
    </>
  );
}

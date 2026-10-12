import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { PromptLibrary } from "@/components/directory/prompt-library";
import { DataNotice } from "@/components/ui/data-notice";
import { getPrompts } from "@/lib/data";

export const revalidate = 300;
export const metadata: Metadata = { title: "Prompt Library", description: "Searchable, copy-ready prompts for acquisition and program work.", alternates: { canonical: "/ai-playground/prompt-library" } };

export default async function Page() {
  const data = await getPrompts();
  return (
    <>
      <PageHero
        title="Prompt library"
        lead="Copy-ready prompts for requirements, market research, evaluation and communication — searchable and organized by task."
        crumbs={[{ label: "AI Playground", href: "/ai-playground" }, { label: "Prompt Library", href: "/ai-playground/prompt-library" }]}
        compact
      />
      <section className="bg-white">
        <div className="container-page py-14 md:py-20">
          {data.source !== "supabase" && (
            <DataNotice source={data.source} what={`this prompt list (${data.items.length} illustrative prompts; the live 78-prompt collection is migrated after verification)`} className="mb-8" />
          )}
          <Suspense fallback={<p className="text-ink-muted">Loading prompts…</p>}><PromptLibrary items={data.items} /></Suspense>
        </div>
      </section>
      <NextSteps steps={[
        { eyebrow: "AI Tools", title: "Browse the tool directory", href: "/ai-playground" },
        { eyebrow: "Requirements", title: "Write better problem statements", href: "/resources" },
        { eyebrow: "Marketplace", title: "Find awardable solutions", href: "/marketplace/awardable-companies" },
      ]} />
    </>
  );
}

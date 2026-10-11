import { ToolCard } from "@/components/cards/tool-card";
import { ButtonLink } from "@/components/ui/button";
import { DataNotice } from "@/components/ui/data-notice";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import type { AiTool, Loaded } from "@/lib/data/types";

export function ToolsPreview({ data }: { data: Loaded<AiTool> }) {
  const featured = data.items.slice(0, 3);
  return (
    <section aria-labelledby="tools-title" className="on-dark relative overflow-hidden bg-navy-900 text-white">
      <div className="absolute -left-40 top-1/3 size-[36rem] rounded-full bg-cobalt/25 blur-3xl" aria-hidden />
      <div className="container-page relative section-y">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeader
              dark
              eyebrow="AI Tools"
              title={<span id="tools-title">Tools built for acquisition work.</span>}
              lead="Approved, externally hosted and experimental tools — clearly labeled — plus a searchable prompt library."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/ai-tools" variant="accent">Browse AI tools</ButtonLink>
              <ButtonLink href="/ai-tools/prompt-library" variant="secondary-dark" arrow={false}>Prompt library</ButtonLink>
            </div>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
            {featured.map((t, i) => (
              <Reveal as="li" key={t.slug} delay={i * 0.08}>
                <ToolCard tool={t} dark />
              </Reveal>
            ))}
          </ul>
        </div>
        <DataNotice source={data.source} what="the tool catalog" className="mt-10 border-runway/40 bg-white/5 text-white [&_svg]:text-runway" />
      </div>
    </section>
  );
}

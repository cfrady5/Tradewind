import Link from "next/link";
import { DotTitle } from "@/components/brand/dot-title";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRight } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import type { AiTool, Loaded } from "@/lib/data/types";

/** AI Playground (brief §11): featured tools and a prompt library link. */
export function ToolsPreview({ data }: { data: Loaded<AiTool> }) {
  const featured = data.items.slice(0, 3);
  return (
    <section aria-labelledby="tools-title" className="on-dark relative overflow-hidden bg-navy-900 text-white">
      <div className="container-page section-y">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal><h2 id="tools-title" className="text-h2 font-bold"><DotTitle>{"AI Playground."}</DotTitle></h2></Reveal>
          <ButtonLink href="/ai-playground/prompt-library" variant="secondary-dark">Prompt library</ButtonLink>
        </div>
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {featured.map((t, i) => (
            <Reveal as="li" key={t.slug} delay={i * 0.08}>
              <Link href={`/ai-playground/${t.slug}`} className="group flex h-full items-center gap-4 rounded-lg border border-line-dark bg-white/[0.03] p-6 transition-[border-color,background-color] duration-(--duration-ui) hover:border-sky/40 hover:bg-white/[0.06]">
                <span className="grid size-11 shrink-0 place-items-center rounded-md bg-cobalt/40 font-mono text-sm font-bold text-sky" aria-hidden>
                  {t.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-semibold">{t.name}</span>
                  <span className="block text-sm text-ink-subtle">{t.category}</span>
                </span>
                <ArrowRight className="shrink-0 text-sky transition-transform duration-(--duration-ui) group-hover:translate-x-1" />
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

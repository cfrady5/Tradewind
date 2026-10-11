import Link from "next/link";
import { Badge, type Tone } from "@/components/ui/badge";
import { ArrowRight } from "@/components/ui/icons";
import type { AiTool, ToolAvailability } from "@/lib/data/types";
import { cn } from "@/lib/cn";

export const AVAILABILITY: Record<ToolAvailability, { label: string; tone: Tone; description: string }> = {
  approved: { label: "Approved", tone: "approved", description: "Officially approved for use" },
  external: { label: "Externally hosted", tone: "external", description: "Hosted by a third party — review its terms" },
  experimental: { label: "Experimental", tone: "experimental", description: "Pilot — outputs require human review" },
};

export function ToolCard({ tool, dark }: { tool: AiTool; dark?: boolean }) {
  const a = AVAILABILITY[tool.availability];
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-lg border p-6 transition-[border-color,background-color,transform] duration-(--duration-ui) ease-(--ease-out) hover:-translate-y-0.5",
        dark ? "border-line-dark bg-white/[0.03] hover:border-sky/40 hover:bg-white/[0.06]" : "border-line bg-white hover:border-signal/50 hover:shadow-lift",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span className={cn("grid size-10 place-items-center rounded-md font-mono text-sm font-bold", dark ? "bg-cobalt/40 text-sky" : "bg-sky-tint text-cobalt")} aria-hidden>
          {tool.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
        </span>
        <div className="flex flex-wrap justify-end gap-1.5">
          <Badge tone={a.tone} dot>{a.label}</Badge>
          {tool.sample && <Badge tone="accent">Sample</Badge>}
        </div>
      </div>
      <p className={cn("mt-6 eyebrow", dark ? "text-ink-subtle" : "text-ink-muted")}>{tool.category}</p>
      <h3 className="mt-2 text-lg font-semibold">
        <Link href={`/ai-tools/${tool.slug}`} className="after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none">{tool.name}</Link>
      </h3>
      <p className={cn("mt-2 text-[0.9375rem]", dark ? "text-white/70" : "text-ink-muted")}>{tool.summary}</p>
      <div className={cn("mt-auto flex items-center justify-between border-t pt-4 text-sm", dark ? "border-line-dark text-ink-subtle" : "border-line text-ink-muted")}>
        <span>{tool.access}</span>
        <ArrowRight width={16} height={16} className={cn("transition-transform duration-(--duration-ui) group-hover:translate-x-1", dark ? "text-sky" : "text-cobalt")} />
      </div>
    </article>
  );
}

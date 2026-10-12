import Link from "next/link";
import { Badge, type Tone } from "@/components/ui/badge";
import { ArrowRight, ArrowUpRight, Shield } from "@/components/ui/icons";
import { formatDate } from "@/lib/data/opportunity-status";
import type { AiTool, Audience, ToolAvailability } from "@/lib/data/types";
import { cn } from "@/lib/cn";

export const AVAILABILITY: Record<ToolAvailability, { label: string; tone: Tone; description: string }> = {
  approved: { label: "Approved", tone: "approved", description: "Officially approved for use" },
  external: { label: "Externally hosted", tone: "external", description: "Hosted by a third party — review its terms" },
  experimental: { label: "Experimental", tone: "experimental", description: "Pilot — outputs require human review" },
  pending: { label: "Details pending", tone: "neutral", description: "Listing awaiting approved content" },
};

const AUD: Record<Audience, string> = { all: "Everyone", government: "Government", industry: "Vendors" };
export const audienceLabel = (a?: Audience[]) => (a?.length ? a.map((x) => AUD[x]).join(", ") : "Pending");
/** Brief §6.12: say plainly, near the action, when a tool is not authorized for sensitive data. */
export const dataLimit = (t: AiTool) => t.authorizationLevel ?? "Not authorized for CUI or classified data unless stated";

/** Tool card with the catalog fields from the brief (§6.12). */
export function ToolCard({ tool, dark }: { tool: AiTool; dark?: boolean }) {
  const a = AVAILABILITY[tool.availability];
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-lg border p-6 transition-[border-color,background-color,box-shadow] duration-(--duration-ui) ease-(--ease-out)",
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
        <Link href={`/ai-playground/${tool.slug}`} className="after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none">{tool.name}</Link>
      </h3>
      <p className={cn("mt-2 text-[0.9375rem]", dark ? "text-white/70" : "text-ink-muted")}>{tool.summary}</p>
      <dl className={cn("mt-5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs", dark ? "text-ink-subtle" : "text-ink-muted")}>
        <dt>Audience</dt><dd className={dark ? "text-white/85" : "text-navy"}>{audienceLabel(tool.audiences)}</dd>
        <dt>Access</dt><dd className={dark ? "text-white/85" : "text-navy"}>{tool.access}</dd>
        <dt>Owner</dt><dd className={dark ? "text-white/85" : "text-navy"}>{tool.owner ?? "Pending"}</dd>
        {tool.updatedAt && <><dt>Updated</dt><dd className={dark ? "text-white/85" : "text-navy"}>{formatDate(tool.updatedAt)}</dd></>}
      </dl>
      <div className={cn("mt-auto border-t pt-4", dark ? "border-line-dark" : "border-line")}>
        <p className={cn("flex items-start gap-1.5 text-xs font-medium", dark ? "text-runway" : "text-[#8a4100]")}>
          <Shield width={14} height={14} className="mt-px shrink-0" />{dataLimit(tool)}
        </p>
        <div className="mt-3 flex items-center justify-between text-sm font-semibold">
          {tool.accessUrl ? (
            <a href={tool.accessUrl} target="_blank" rel="noopener noreferrer" className={cn("relative z-10 inline-flex items-center gap-1 hover:underline", dark ? "text-sky" : "text-cobalt")}>
              Open tool<ArrowUpRight width={14} height={14} /><span className="sr-only">(opens external site)</span>
            </a>
          ) : <span className={dark ? "text-ink-subtle" : "text-ink-muted"}>Link pending</span>}
          <span className={cn("inline-flex items-center gap-1", dark ? "text-sky" : "text-cobalt")} aria-hidden>
            Learn more<ArrowRight width={16} height={16} className="transition-transform duration-(--duration-ui) group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </article>
  );
}

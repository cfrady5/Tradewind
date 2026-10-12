import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Building, Calendar } from "@/components/ui/icons";
import type { Opportunity, OpportunityStatus } from "@/lib/data/types";
import { STATUS_LABEL, TYPE_LABEL, daysUntil, formatDate, resolveDates } from "@/lib/data/opportunity-status";
import { cn } from "@/lib/cn";

export function OpportunityCard({ o, status, now, variant = "card" }: { o: Opportunity; status: OpportunityStatus; now: Date; variant?: "card" | "row" }) {
  const { opensAt, closesAt } = resolveDates(o, now);
  const keyDate = status === "upcoming" ? opensAt : closesAt;
  const keyLabel = status === "upcoming" ? "Opens" : status === "closed" ? "Closed" : o.recurrence ? "Next deadline" : "Closes";
  const days = keyDate && status === "open" ? daysUntil(keyDate, now) : null;

  return (
    <article
      className={cn(
        "group relative flex rounded-lg border border-line bg-white transition-[border-color,box-shadow,transform] duration-(--duration-ui) ease-(--ease-out) hover:border-signal/50 hover:shadow-lift focus-within:border-signal",
        variant === "row" ? "flex-col gap-6 p-6 md:flex-row md:items-center md:gap-10 md:p-8" : "flex-col p-6",
      )}
    >
      {variant === "row" && keyDate && (
        <div className="flex shrink-0 items-baseline gap-3 md:w-40 md:flex-col md:gap-1">
          <span className="eyebrow text-ink-muted">{keyLabel}</span>
          <span className="text-2xl font-bold tracking-tight">{formatDate(keyDate)}</span>
          {days !== null && <span className={cn("text-sm font-semibold", days <= 7 ? "text-[#8a4100]" : "text-cobalt")}>{days} day{days === 1 ? "" : "s"} left</span>}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={status} dot>{STATUS_LABEL[status]}</Badge>
          <Badge tone="neutral">{TYPE_LABEL[o.type]}</Badge>
          {o.sample && <Badge tone="accent">Sample</Badge>}
        </div>
        <h3 className="mt-4 text-xl font-semibold leading-snug tracking-[-0.01em]">
          <Link href={`/opportunities/${o.slug}`} className="after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none">
            {o.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-ink-muted">{o.summary}</p>
        <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
          <div className="flex items-center gap-1.5"><dt className="sr-only">Sponsor</dt><Building width={16} height={16} /><dd>{o.sponsor}</dd></div>
          {variant === "card" && keyDate && (
            <div className="flex items-center gap-1.5"><dt className="sr-only">{keyLabel}</dt><Calendar width={16} height={16} /><dd>{keyLabel} {formatDate(keyDate)}</dd></div>
          )}
          {o.topics[0] && <div><dt className="sr-only">Topic</dt><dd className="font-medium text-navy">{o.topics.slice(0, 2).join(" · ")}</dd></div>}
        </dl>
      </div>
      <span className={cn("flex items-center gap-1.5 text-sm font-semibold text-cobalt", variant === "card" ? "mt-6" : "shrink-0")} aria-hidden>
        View details <ArrowRight width={16} height={16} className="transition-transform duration-(--duration-ui) group-hover:translate-x-1" />
      </span>
    </article>
  );
}

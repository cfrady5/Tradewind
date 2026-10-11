import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Tone = "open" | "upcoming" | "closed" | "info" | "neutral" | "accent" | "approved" | "external" | "experimental";

const tones: Record<Tone, string> = {
  open: "bg-[#e3f4ea] text-[#155c34] ring-[#155c34]/15",
  upcoming: "bg-sky-tint text-cobalt ring-cobalt/15",
  closed: "bg-cloud text-ink-muted ring-navy/10",
  info: "bg-sky-tint text-cobalt ring-cobalt/15",
  neutral: "bg-cloud text-navy ring-navy/10",
  accent: "bg-runway-tint text-[#8a4100] ring-[#8a4100]/15",
  approved: "bg-[#e3f4ea] text-[#155c34] ring-[#155c34]/15",
  external: "bg-sky-tint text-cobalt ring-cobalt/15",
  experimental: "bg-runway-tint text-[#8a4100] ring-[#8a4100]/15",
};
const dots: Partial<Record<Tone, string>> = {
  open: "bg-[#1f8a4c]",
  upcoming: "bg-signal",
  closed: "bg-ink-muted/60",
  experimental: "bg-runway",
  approved: "bg-[#1f8a4c]",
};

export function Badge({ tone = "neutral", children, className, dot }: { tone?: Tone; children: ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={cn("inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold ring-1 ring-inset", tones[tone], className)}>
      {dot && dots[tone] && (
        <span className="relative flex size-1.5">
          {tone === "open" && <span className={cn("absolute inset-0 rounded-full opacity-60 motion-safe:animate-ping", dots[tone])} />}
          <span className={cn("relative size-1.5 rounded-full", dots[tone])} />
        </span>
      )}
      {children}
    </span>
  );
}

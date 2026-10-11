import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "./reveal";

export function SectionHeader({
  eyebrow, title, lead, dark, align = "left", action, className, as: H = "h2",
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  dark?: boolean;
  align?: "left" | "split";
  action?: ReactNode;
  className?: string;
  as?: "h2" | "h3";
}) {
  return (
    <Reveal className={cn(align === "split" ? "grid gap-6 lg:grid-cols-12 lg:items-end" : "max-w-3xl", className)}>
      <div className={align === "split" ? "lg:col-span-7" : undefined}>
        {eyebrow && (
          <p className={cn("eyebrow flex items-center gap-3", dark ? "text-runway" : "text-cobalt")}>
            <span className={cn("h-px w-8", dark ? "bg-runway" : "bg-cobalt")} aria-hidden />
            {eyebrow}
          </p>
        )}
        <H className="mt-5 text-h2 font-bold">{title}</H>
      </div>
      {(lead || action) && (
        <div className={cn(align === "split" ? "lg:col-span-5 lg:pb-2" : "mt-6")}>
          {lead && <p className={cn("text-lead", dark ? "text-white/75" : "text-ink-muted")}>{lead}</p>}
          {action && <div className="mt-6">{action}</div>}
        </div>
      )}
    </Reveal>
  );
}

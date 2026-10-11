import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";

export type ProcessStep = { title: string; body: ReactNode; meta?: string };

/**
 * Directional process: horizontal track on desktop (≤ 6 steps), vertical stepper on mobile.
 * The connecting line echoes the pathways motif.
 */
export function ProcessSteps({ steps, dark }: { steps: ProcessStep[]; dark?: boolean }) {
  return (
    <ol className={cn("relative grid gap-10 md:gap-6", steps.length > 4 ? "lg:grid-cols-3 xl:grid-cols-6" : "md:grid-cols-2 lg:grid-cols-4")}>
      <span aria-hidden className={cn("absolute left-5 top-5 bottom-5 w-px md:hidden", dark ? "bg-sky/25" : "bg-line")} />
      {steps.map((s, i) => (
        <Reveal as="li" key={s.title} delay={i * 0.06} className="relative flex gap-5 md:flex-col md:gap-0">
          <div className="relative flex items-center md:mb-6">
            <span
              className={cn(
                "relative z-10 grid size-10 shrink-0 place-items-center rounded-full font-mono text-sm font-bold",
                i === steps.length - 1 ? "bg-runway text-navy" : dark ? "bg-cobalt text-white" : "bg-navy text-white",
              )}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            {i < steps.length - 1 && (
              <span aria-hidden className={cn("ml-3 hidden h-px flex-1 md:block", dark ? "bg-gradient-to-r from-sky/50 to-sky/5" : "bg-gradient-to-r from-cobalt/40 to-line")} />
            )}
          </div>
          <div>
            {s.meta && <p className={cn("eyebrow mb-2", dark ? "text-sky" : "text-cobalt")}>{s.meta}</p>}
            <h3 className="text-lg font-bold">{s.title}</h3>
            <div className={cn("mt-2 text-[0.9375rem] leading-relaxed", dark ? "text-white/75" : "text-ink-muted")}>{s.body}</div>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}

import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/reveal";
import { Info } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { DotTitle } from "@/components/brand/dot-title";

/** Light / cloud / dark section wrapper keeps the page rhythm consistent. */
export function Section({ tone = "white", children, className, id, labelledBy }: { tone?: "white" | "cloud" | "dark"; children: ReactNode; className?: string; id?: string; labelledBy?: string }) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(tone === "white" && "bg-white", tone === "cloud" && "bg-cloud", tone === "dark" && "on-dark relative overflow-hidden bg-navy text-white", className)}
    >
      {tone === "dark" && <div className="absolute inset-0 bg-grid-fine opacity-60" aria-hidden />}
      <div className="container-page relative py-16 md:py-24">{children}</div>
    </section>
  );
}

/** Editorial split: sticky heading left, content right. */
export function Split({ eyebrow, title, children, id }: { eyebrow?: string; title: ReactNode; children: ReactNode; id?: string }) {
  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
      <Reveal className="lg:col-span-4">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
          {eyebrow && <p className="eyebrow text-cobalt">{eyebrow}</p>}
          <h2 id={id} className="mt-4 text-h3 font-bold"><DotTitle>{title}</DotTitle></h2>
        </div>
      </Reveal>
      <Reveal className="text-lg leading-relaxed text-ink-muted lg:col-span-8 [&_p+p]:mt-4 [&_strong]:text-navy" delay={0.06}>{children}</Reveal>
    </div>
  );
}

export function Callout({ title, children, tone = "info" }: { title: string; children: ReactNode; tone?: "info" | "pending" }) {
  return (
    <div className={cn("flex gap-4 rounded-lg border p-5", tone === "info" ? "border-cobalt/20 bg-sky-tint/50" : "border-dashed border-runway/70 bg-runway-tint/40")}>
      <Info className={cn("mt-0.5 shrink-0", tone === "info" ? "text-cobalt" : "text-[#8a4100]")} />
      <div>
        <p className="font-semibold">{title}</p>
        <div className="mt-1 text-[0.9375rem] text-ink-muted [&_a]:font-semibold [&_a]:text-cobalt [&_a:hover]:underline">{children}</div>
      </div>
    </div>
  );
}

/** Explicit marker for content awaiting program-office approval (never silently faked). */
export function PendingContent({ what }: { what: string }) {
  return (
    <Callout tone="pending" title="Awaiting approved content">
      {what} will be published here once provided and approved by the program office.
    </Callout>
  );
}

export function FeatureList({ items, dark }: { items: { title: string; body: ReactNode }[]; dark?: boolean }) {
  return (
    <ul className={cn("grid gap-px overflow-hidden rounded-xl border sm:grid-cols-2", dark ? "border-line-dark bg-line-dark" : "border-line bg-line")}>
      {items.map((it, i) => (
        <Reveal as="li" key={it.title} delay={i * 0.05} className={cn("p-7", dark ? "bg-navy" : "bg-white")}>
          <h3 className="text-lg font-bold">{it.title}</h3>
          <div className={cn("mt-2", dark ? "text-white/75" : "text-ink-muted")}>{it.body}</div>
        </Reveal>
      ))}
    </ul>
  );
}

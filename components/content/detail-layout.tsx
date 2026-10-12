import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type DetailSection = { id: string; title: string; content: ReactNode; muted?: boolean };

/**
 * Long-form detail template used by initiative, aisle and vehicle pages: sticky "on this page"
 * navigation beside a column of titled sections. Section order follows the rebuild brief.
 */
export function DetailLayout({ sections, intro }: { sections: DetailSection[]; intro?: ReactNode }) {
  return (
    <section className="bg-white">
      <div className="container-page grid gap-12 py-14 md:py-20 lg:grid-cols-12">
        <nav aria-label="On this page" className="hidden lg:col-span-3 lg:block">
          <ul className="sticky top-[calc(var(--header-h)+2rem)] space-y-1 border-l border-line text-sm">
            {sections.map((s) => (
              <li key={s.id}><a href={`#${s.id}`} className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-ink-muted transition-colors hover:border-cobalt hover:text-navy">{s.title}</a></li>
            ))}
          </ul>
        </nav>
        <div className="min-w-0 space-y-16 lg:col-span-9">
          {intro}
          {sections.map((s) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className={cn("scroll-mt-32", s.muted && "rounded-xl border border-dashed border-line bg-cloud/40 p-7")}>
              <h2 id={`${s.id}-title`} className="text-h3 font-bold">{s.title}</h2>
              <div className="mt-5 max-w-3xl text-lg leading-relaxed text-ink-muted [&_p+p]:mt-4 [&_strong]:text-navy">{s.content}</div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Bulleted list with the brand's orange markers. */
export function Bullets({ items, cols }: { items: ReactNode[]; cols?: boolean }) {
  return (
    <ul className={cn("grid gap-3 text-base", cols && "sm:grid-cols-2")}>
      {items.map((it, i) => <li key={i} className="flex gap-3 rounded-md border border-line bg-white p-4 text-navy"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-runway" />{it}</li>)}
    </ul>
  );
}

/** Inline marker for a single field still awaiting approved content. */
export function Pending({ children }: { children: ReactNode }) {
  return <p className="rounded-md border border-dashed border-runway/50 bg-runway-tint/50 px-4 py-3 text-base text-[#8a4100]">{children}</p>;
}

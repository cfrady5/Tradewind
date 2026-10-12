"use client";

import { useEffect, useMemo, useRef } from "react";
import { AccordionItem } from "@/components/ui/accordion";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowUpRight } from "@/components/ui/icons";
import { formatDate } from "@/lib/data/opportunity-status";
import { FAQ_CATEGORIES, type Faq } from "@/lib/data/types";
import { ChipGroup, ResultsBar, SearchField, countBy } from "./controls";
import { matches, useQueryState } from "./use-query-state";

const AUDIENCE: Record<string, string> = { all: "Everyone", government: "Government", industry: "Vendors" };

/** FAQ directory (brief §6.5): search, category filter, expand/collapse, last updated, related links. */
export function FaqDirectory({ items }: { items: Faq[] }) {
  const { state, set, clear, active } = useQueryState({ q: "", category: "" });
  const listRef = useRef<HTMLDivElement>(null);
  const base = useMemo(() => items.filter((f) => matches(state.q, f.question, f.answer, f.category)), [items, state.q]);
  const filtered = base.filter((f) => !state.category || f.category === state.category);
  const counts = countBy(base, (f) => f.category);
  const setAll = (open: boolean) => listRef.current?.querySelectorAll("details").forEach((d) => { d.open = open; });

  // Deep links (#slug) open the targeted answer.
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    const el = id && document.getElementById(id);
    if (el instanceof HTMLDetailsElement) { el.open = true; el.scrollIntoView({ block: "start" }); }
  }, []);

  return (
    <div>
      <SearchField label="Search FAQs" value={state.q} onChange={(q) => set({ q })} placeholder="Ask a question — e.g. “video length” or “who can view”" />
      <div className="mt-6">
        <ChipGroup
          label="Category" value={state.category} onChange={(category) => set({ category })}
          options={[{ value: "", label: "All", count: base.length }, ...FAQ_CATEGORIES.map((c) => ({ value: c, label: c, count: counts.get(c) ?? 0 }))]}
        />
      </div>
      <div className="mt-10">
        <ResultsBar
          count={filtered.length} total={items.length} noun="questions" active={active} onClear={clear}
          sort={filtered.length > 0 ? (
            <div className="flex items-center gap-3 text-sm font-semibold text-cobalt">
              <button type="button" onClick={() => setAll(true)} className="hover:underline">Expand all</button>
              <span className="text-line" aria-hidden>|</span>
              <button type="button" onClick={() => setAll(false)} className="hover:underline">Collapse all</button>
            </div>
          ) : undefined}
        />
        {filtered.length === 0 ? (
          <div className="mt-8">
            <EmptyState title={state.category && !state.q ? `No ${state.category} questions published yet` : "No matching questions"}>
              Still stuck? <a className="font-semibold text-cobalt" href="/contact">Contact the team</a>.
            </EmptyState>
          </div>
        ) : (
          <div ref={listRef}>
            {filtered.map((f) => (
              <AccordionItem key={f.slug} id={f.slug} title={<span><span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-cobalt">{f.category}</span>{f.question}</span>} defaultOpen={!!state.q && filtered.length <= 3}>
                {f.answer.split("\n\n").map((p) => <p key={p}>{p}</p>)}
                {f.relatedLinks && f.relatedLinks.length > 0 && (
                  <div className="!mt-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">Related</p>
                    <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                      {f.relatedLinks.map((l) => {
                        const ext = /^https?:/.test(l.href);
                        return <li key={l.href}><a href={l.href} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="inline-flex items-center gap-1">{l.label}{ext && <ArrowUpRight width={14} height={14} />}</a></li>;
                      })}
                    </ul>
                  </div>
                )}
                <p className="!mt-5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  <span>For: {f.audiences.map((a) => AUDIENCE[a] ?? a).join(", ")}</span>
                  {f.updatedAt && <span>Last updated {formatDate(f.updatedAt)}</span>}
                  <a href={`#${f.slug}`}>Link to this answer</a>
                </p>
              </AccordionItem>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

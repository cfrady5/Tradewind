"use client";

import { useEffect, useMemo } from "react";
import { AccordionItem } from "@/components/ui/accordion";
import { EmptyState } from "@/components/ui/empty-state";
import type { Faq } from "@/lib/data/types";
import { ChipGroup, ResultsBar, SearchField, countBy } from "./controls";
import { matches, useQueryState } from "./use-query-state";

const CATS: Faq["category"][] = ["Marketplace", "Submissions", "Government Access", "Acquisition", "General"];

export function FaqDirectory({ items }: { items: Faq[] }) {
  const { state, set, clear, active } = useQueryState({ q: "", category: "" });
  const base = useMemo(() => items.filter((f) => matches(state.q, f.question, f.answer)), [items, state.q]);
  const filtered = base.filter((f) => !state.category || f.category === state.category);
  const counts = countBy(base, (f) => f.category);

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
        <ChipGroup label="Category" value={state.category} onChange={(category) => set({ category })} options={[{ value: "", label: "All", count: base.length }, ...CATS.filter((c) => items.some((f) => f.category === c)).map((c) => ({ value: c, label: c, count: counts.get(c) ?? 0 }))]} />
      </div>
      <div className="mt-10">
        <ResultsBar count={filtered.length} total={items.length} noun="questions" active={active} onClear={clear} />
        {filtered.length === 0 ? (
          <div className="mt-8"><EmptyState title="No matching questions">Still stuck? <a className="font-semibold text-cobalt" href="/about/contact">Contact the team</a>.</EmptyState></div>
        ) : (
          <div>
            {filtered.map((f) => (
              <AccordionItem key={f.slug} id={f.slug} title={<span><span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-cobalt">{f.category}</span>{f.question}</span>} defaultOpen={!!state.q && filtered.length <= 3}>
                {f.answer.split("\n\n").map((p) => <p key={p}>{p}</p>)}
                <p className="!mt-4 text-xs"><a href={`#${f.slug}`}>Link to this answer</a></p>
              </AccordionItem>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

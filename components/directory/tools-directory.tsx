"use client";

import { useMemo } from "react";
import { AVAILABILITY, ToolCard } from "@/components/cards/tool-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { AiTool, ToolAvailability } from "@/lib/data/types";
import { ChipGroup, FacetSelect, ResultsBar, SearchField, countBy } from "./controls";
import { matches, uniq, useQueryState } from "./use-query-state";

export function ToolsDirectory({ items }: { items: AiTool[] }) {
  const { state, set, clear, active } = useQueryState({ q: "", category: "", availability: "" });
  const base = useMemo(() => items.filter((t) => matches(state.q, t.name, t.summary, t.description, t.category, t.useCases) && (!state.category || t.category === state.category)), [items, state.q, state.category]);
  const filtered = base.filter((t) => !state.availability || t.availability === state.availability);
  const aCounts = countBy(base, (t) => t.availability);
  const cCounts = countBy(items.filter((t) => matches(state.q, t.name, t.summary, t.description, t.category, t.useCases)), (t) => t.category);

  return (
    <div>
      <SearchField label="Search AI tools" value={state.q} onChange={(q) => set({ q })} placeholder="Search tools by name, task or use case" />
      <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <ChipGroup
          label="Availability"
          value={state.availability}
          onChange={(availability) => set({ availability })}
          options={[{ value: "", label: "All", count: base.length }, ...(Object.keys(AVAILABILITY) as ToolAvailability[]).map((k) => ({ value: k, label: AVAILABILITY[k].label, count: aCounts.get(k) ?? 0 }))]}
        />
        <div className="md:w-72">
          <FacetSelect label="Category" value={state.category} onChange={(category) => set({ category })} options={uniq(items.map((t) => t.category)).map((c) => ({ value: c, label: c, count: cCounts.get(c) ?? 0 }))} />
        </div>
      </div>
      <div className="mt-10">
        <ResultsBar count={filtered.length} total={items.length} noun="tools" active={active} onClear={clear} />
        {filtered.length === 0 ? (
          <div className="mt-8"><EmptyState title="No tools match" action={<button type="button" onClick={clear} className="font-semibold text-cobalt hover:underline">Clear filters</button>} /></div>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => <li key={t.slug}><ToolCard tool={t} /></li>)}
          </ul>
        )}
      </div>
    </div>
  );
}

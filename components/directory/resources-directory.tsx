"use client";

import { useMemo } from "react";
import { KIND_LABEL, ResourceCard } from "@/components/cards/resource-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { Resource } from "@/lib/data/types";
import { ChipGroup, FacetSelect, ResultsBar, SearchField, countBy } from "./controls";
import { matches, useQueryState } from "./use-query-state";

export function ResourcesDirectory({ items, lockKinds }: { items: Resource[]; lockKinds?: Resource["kind"][] }) {
  const { state, set, clear, active } = useQueryState({ q: "", kind: "", audience: "" });
  const pool = useMemo(() => (lockKinds ? items.filter((r) => lockKinds.includes(r.kind)) : items), [items, lockKinds]);
  const base = pool.filter((r) => matches(state.q, r.title, r.summary, r.kind) && (!state.audience || r.audiences.includes(state.audience as never) || r.audiences.includes("all")));
  const filtered = base.filter((r) => !state.kind || r.kind === state.kind);
  const kCounts = countBy(base, (r) => r.kind);
  const kinds = (Object.keys(KIND_LABEL) as Resource["kind"][]).filter((k) => pool.some((r) => r.kind === k));

  return (
    <div>
      <SearchField label="Search resources" value={state.q} onChange={(q) => set({ q })} placeholder="Search guides, videos, documents and news" />
      <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        {kinds.length > 1 ? (
          <ChipGroup label="Content type" value={state.kind} onChange={(kind) => set({ kind })} options={[{ value: "", label: "All", count: base.length }, ...kinds.map((k) => ({ value: k, label: KIND_LABEL[k], count: kCounts.get(k) ?? 0 }))]} />
        ) : <span />}
        <div className="md:w-64">
          <FacetSelect label="Audience" value={state.audience} onChange={(audience) => set({ audience })} allLabel="Everyone" options={[{ value: "government", label: "Government" }, { value: "industry", label: "Industry" }]} />
        </div>
      </div>
      <div className="mt-10">
        <ResultsBar count={filtered.length} total={pool.length} noun="resources" active={active} onClear={clear} />
        {filtered.length === 0 ? (
          <div className="mt-8"><EmptyState title="Nothing matches yet" action={<button type="button" onClick={clear} className="font-semibold text-cobalt hover:underline">Clear filters</button>} /></div>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((r) => <li key={r.slug}><ResourceCard r={r} /></li>)}</ul>
        )}
      </div>
    </div>
  );
}

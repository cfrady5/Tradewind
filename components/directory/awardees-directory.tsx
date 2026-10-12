"use client";

import { useMemo } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowUpRight } from "@/components/ui/icons";
import { formatDate } from "@/lib/data/opportunity-status";
import type { Award } from "@/lib/data/types";
import { formatMetric } from "@/lib/format";
import { FacetSelect, ResultsBar, SearchField, SortSelect, countBy } from "./controls";
import { matches, uniq, useQueryState } from "./use-query-state";

/** Public award records (brief §6.7). Only rows cleared as public ever reach this component. */
export function AwardeesDirectory({ items }: { items: Award[] }) {
  const { state, set, clear, active } = useQueryState({ q: "", category: "", sort: "newest" });
  const base = useMemo(() => items.filter((a) => matches(state.q, a.vendor, a.solution, a.awardingActivity, a.category ?? "", a.description ?? "")), [items, state.q]);
  const filtered = base
    .filter((a) => !state.category || a.category === state.category)
    .sort((a, b) => (state.sort === "company" ? a.vendor.localeCompare(b.vendor) : b.awardDate.localeCompare(a.awardDate)));
  const counts = countBy(base, (a) => a.category ?? "Uncategorized");

  return (
    <div>
      <SearchField label="Search awardees" value={state.q} onChange={(q) => set({ q })} placeholder="Search by company, award or awarding organization" />
      <div className="mt-6 max-w-xs">
        <FacetSelect label="Capability category" value={state.category} onChange={(category) => set({ category })}
          options={uniq(items.map((a) => a.category ?? "Uncategorized")).map((c) => ({ value: c, label: c, count: counts.get(c) ?? 0 }))} />
      </div>
      <div className="mt-10">
        <ResultsBar count={filtered.length} total={items.length} noun="awards" active={active} onClear={clear}
          sort={<SortSelect value={state.sort} onChange={(sort) => set({ sort })} options={[{ value: "newest", label: "Most recent" }, { value: "company", label: "Company (A–Z)" }]} />} />
        {filtered.length === 0 ? (
          <div className="mt-8"><EmptyState title="No awards match">Try a broader term.</EmptyState></div>
        ) : (
          <ul className="divide-y divide-line">
            {filtered.map((a) => (
              <li key={a.slug} className="grid gap-4 py-6 md:grid-cols-12 md:gap-8">
                <div className="md:col-span-4">
                  <p className="text-lg font-bold">{a.website ? <a href={a.website} target="_blank" rel="noopener noreferrer" className="hover:text-cobalt">{a.vendor}<span className="sr-only"> (opens external site)</span></a> : a.vendor}</p>
                  {a.category && <p className="mt-1 text-sm font-semibold text-cobalt">{a.category}</p>}
                </div>
                <div className="md:col-span-5">
                  <p className="font-semibold">{a.solution}</p>
                  {a.description && <p className="mt-1 text-ink-muted">{a.description}</p>}
                  {a.caseStudyUrl && <a href={a.caseStudyUrl} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-cobalt hover:underline">Case study<ArrowUpRight width={14} height={14} /></a>}
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm md:col-span-3 md:text-right">
                  <dt className="text-ink-muted">Awarded</dt><dd className="font-semibold">{formatDate(a.awardDate)}</dd>
                  <dt className="text-ink-muted">By</dt><dd className="font-semibold">{a.awardingActivity}</dd>
                  <dt className="text-ink-muted">Value</dt><dd className="font-semibold tabular-nums">{a.valueUsd ? formatMetric(a.valueUsd, "currency-compact") : "Not public"}</dd>
                </dl>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

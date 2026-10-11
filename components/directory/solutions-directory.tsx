"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { Solution } from "@/lib/data/types";
import { FacetSelect, FilterPanel, Pagination, ResultsBar, SearchField, SortSelect, countBy, } from "./controls";
import { matches, uniq, useQueryState } from "./use-query-state";

const PER_PAGE = 10;
const fmtMonth = (ym: string) => new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(ym + "-01"));

export function SolutionsDirectory({ items }: { items: Solution[] }) {
  const { state, set, clear, active } = useQueryState({ q: "", focus: "", category: "", type: "", sort: "name", page: "1" });

  const facets = useMemo(() => ({
    focus: uniq(items.map((s) => s.focusArea)),
    category: uniq(items.map((s) => s.technologyCategory)),
    type: uniq(items.map((s) => s.solutionType)),
  }), [items]);

  const filtered = useMemo(() => {
    const out = items.filter((s) =>
      matches(state.q, s.name, s.company, s.summary, s.technologyCategory, s.focusArea) &&
      (!state.focus || s.focusArea === state.focus) &&
      (!state.category || s.technologyCategory === state.category) &&
      (!state.type || s.solutionType === state.type),
    );
    return out.sort((a, b) => (state.sort === "newest" ? b.awardableSince.localeCompare(a.awardableSince) : a.name.localeCompare(b.name)));
  }, [items, state]);

  // Facet counts reflect the other active filters, so users never pick a dead end.
  const counts = (k: "focus" | "category" | "type") => {
    const base = items.filter((s) =>
      matches(state.q, s.name, s.company, s.summary, s.technologyCategory, s.focusArea) &&
      (k === "focus" || !state.focus || s.focusArea === state.focus) &&
      (k === "category" || !state.category || s.technologyCategory === state.category) &&
      (k === "type" || !state.type || s.solutionType === state.type),
    );
    return countBy(base, (s) => (k === "focus" ? s.focusArea : k === "category" ? s.technologyCategory : s.solutionType));
  };
  const opts = (k: "focus" | "category" | "type") => {
    const c = counts(k);
    return facets[k].map((v) => ({ value: v, label: v, count: c.get(v) ?? 0 }));
  };

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const page = Math.min(pages, Math.max(1, Number(state.page) || 1));
  const shown = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div>
      <SearchField label="Search solutions" value={state.q} onChange={(q) => set({ q })} placeholder="Search by solution, company or capability" />
      <div className="mt-6">
        <FilterPanel active={active}>
          <div className="grid gap-4 md:grid-cols-3">
            <FacetSelect label="Strategic focus area" value={state.focus} onChange={(focus) => set({ focus })} options={opts("focus")} />
            <FacetSelect label="Technology category" value={state.category} onChange={(category) => set({ category })} options={opts("category")} />
            <FacetSelect label="Solution type" value={state.type} onChange={(type) => set({ type })} options={opts("type")} />
          </div>
        </FilterPanel>
      </div>

      <div className="mt-10">
        <ResultsBar
          count={filtered.length} total={items.length} noun="solutions" active={active} onClear={clear}
          range={[(page - 1) * PER_PAGE + 1, Math.min(page * PER_PAGE, filtered.length)]}
          sort={<SortSelect value={state.sort} onChange={(sort) => set({ sort })} options={[{ value: "name", label: "Name (A–Z)" }, { value: "newest", label: "Recently awardable" }]} />}
        />
        {shown.length === 0 ? (
          <div className="mt-8">
            <EmptyState title="No solutions match those filters" action={<button type="button" onClick={clear} className="font-semibold text-cobalt hover:underline">Clear all filters</button>}>
              Try a broader term, or remove a filter.
            </EmptyState>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {shown.map((s) => (
              <li key={s.slug} className="group grid gap-4 py-6 transition-colors md:grid-cols-12 md:items-start md:gap-8">
                <div className="md:col-span-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold">{s.name}</h3>
                    {s.sample && <Badge tone="accent">Sample</Badge>}
                  </div>
                  <p className="mt-1 text-sm font-medium text-ink-muted">{s.company}</p>
                </div>
                <p className="text-ink-muted md:col-span-4">{s.summary}</p>
                <dl className="flex flex-wrap gap-2 md:col-span-3 md:justify-end">
                  <dt className="sr-only">Technology category</dt><dd><Badge tone="info">{s.technologyCategory}</Badge></dd>
                  {s.focusArea !== s.technologyCategory && <><dt className="sr-only">Focus area</dt><dd><Badge tone="neutral">{s.focusArea}</Badge></dd></>}
                  <dt className="sr-only">Awardable since</dt><dd className="w-full text-xs text-ink-muted md:text-right">Awardable since {fmtMonth(s.awardableSince)}</dd>
                </dl>
              </li>
            ))}
          </ul>
        )}
        <Pagination page={page} pages={pages} onPage={(p) => { set({ page: String(p) }, { resetPage: false }); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
      </div>
    </div>
  );
}

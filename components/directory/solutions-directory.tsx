"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowUpRight } from "@/components/ui/icons";
import type { Solution } from "@/lib/data/types";
import { ChipGroup, FacetSelect, FilterPanel, Pagination, ResultsBar, SearchField, SortSelect, countBy } from "./controls";
import { matches, uniq, useQueryState } from "./use-query-state";

const PER_PAGE = 10;
const fmtMonth = (ym: string) => new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(ym + "-01"));
const AISLES = ["General", "SBIR/STTR", "Prototype Transition"] as const;
type Facet = "focus" | "trl" | "size" | "month" | "status";
const DEFAULTS = { q: "", aisle: "", focus: "", trl: "", size: "", month: "", status: "", sort: "newest", page: "1" };

/**
 * Public awardable-companies search (brief §6.6). Public metadata only; pitch videos, full
 * descriptions and provider contacts stay behind the government sign-in.
 */
export function SolutionsDirectory({ items, signInUrl }: { items: Solution[]; signInUrl: string }) {
  const { state, set, clear, active } = useQueryState(DEFAULTS);

  const value = (s: Solution, k: Facet) =>
    k === "focus" ? s.focusArea : k === "trl" ? (s.trl ? `TRL ${s.trl}` : "") : k === "size" ? s.businessSize ?? "" : k === "month" ? s.awardableSince : s.listingStatus ?? "Awardable";
  const pass = (s: Solution, skip?: Facet | "aisle") =>
    matches(state.q, s.name, s.company, s.summary, s.technologyCategory, s.focusArea) &&
    (skip === "aisle" || !state.aisle || (s.aisle ?? "General") === state.aisle) &&
    (["focus", "trl", "size", "month", "status"] as Facet[]).every((k) => k === skip || !state[k] || value(s, k) === state[k]);

  const filtered = useMemo(() => {
    const out = items.filter((s) => pass(s));
    return out.sort((a, b) =>
      state.sort === "company" ? a.company.localeCompare(b.company) : state.sort === "name" ? a.name.localeCompare(b.name) : b.awardableSince.localeCompare(a.awardableSince));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, state]);

  // Facet counts reflect the other active filters, so users never pick a dead end.
  const opts = (k: Facet) => {
    const c = countBy(items.filter((s) => pass(s, k)), (s) => value(s, k));
    const vals = uniq(items.map((s) => value(s, k)).filter(Boolean));
    const ordered = k === "month" ? [...vals].sort().reverse() : k === "trl" ? [...vals].sort((a, b) => Number(a.slice(4)) - Number(b.slice(4))) : vals;
    return ordered.map((v) => ({ value: v, label: k === "month" ? fmtMonth(v) : v, count: c.get(v) ?? 0 }));
  };
  const aisleCounts = countBy(items.filter((s) => pass(s, "aisle")), (s) => s.aisle ?? "General");

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const page = Math.min(pages, Math.max(1, Number(state.page) || 1));
  const shown = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div>
      <SearchField label="Search solutions" value={state.q} onChange={(q) => set({ q })} placeholder="Search by company, solution or capability" />
      <div className="mt-6">
        <ChipGroup label="Aisle" value={state.aisle} onChange={(aisle) => set({ aisle })}
          options={[{ value: "", label: "All aisles", count: [...aisleCounts.values()].reduce((a, b) => a + b, 0) }, ...AISLES.map((a) => ({ value: a, label: a, count: aisleCounts.get(a) ?? 0 }))]} />
      </div>
      <div className="mt-6">
        <FilterPanel active={active}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <FacetSelect label="Strategic focus area" value={state.focus} onChange={(focus) => set({ focus })} options={opts("focus")} />
            <FacetSelect label="Technology readiness" value={state.trl} onChange={(trl) => set({ trl })} options={opts("trl")} />
            <FacetSelect label="Business size" value={state.size} onChange={(size) => set({ size })} options={opts("size")} />
            <FacetSelect label="Awardable month" value={state.month} onChange={(month) => set({ month })} options={opts("month")} />
            <FacetSelect label="Status" value={state.status} onChange={(status) => set({ status })} options={opts("status")} />
          </div>
        </FilterPanel>
      </div>

      <div className="mt-10">
        <ResultsBar
          count={filtered.length} total={items.length} noun="solutions" active={active} onClear={clear}
          range={[(page - 1) * PER_PAGE + 1, Math.min(page * PER_PAGE, filtered.length)]}
          sort={<SortSelect value={state.sort} onChange={(sort) => set({ sort })} options={[{ value: "newest", label: "Recently awardable" }, { value: "company", label: "Company (A–Z)" }, { value: "name", label: "Solution (A–Z)" }]} />}
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
              <li key={s.slug} className="grid gap-4 py-6 md:grid-cols-12 md:items-start md:gap-8">
                <div className="md:col-span-4">
                  <p className="text-lg font-bold">{s.company}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-cobalt">{s.name}</h3>
                    {s.sample && <Badge tone="accent">Sample</Badge>}
                  </div>
                </div>
                <div className="md:col-span-5">
                  <p className="text-ink-muted">{s.summary}</p>
                  <dl className="mt-3 flex flex-wrap gap-2">
                    <dt className="sr-only">Strategic focus area</dt><dd><Badge tone="info">{s.focusArea}</Badge></dd>
                    {s.aisle && s.aisle !== "General" && <><dt className="sr-only">Aisle</dt><dd><Badge tone="neutral">{s.aisle} Aisle</Badge></dd></>}
                    {s.listingStatus && s.listingStatus !== "Awardable" && <><dt className="sr-only">Status</dt><dd><Badge tone={s.listingStatus === "Archived" ? "closed" : "upcoming"}>{s.listingStatus}</Badge></dd></>}
                  </dl>
                </div>
                <div className="flex flex-col gap-2 text-sm md:col-span-3 md:items-end md:text-right">
                  <p className="text-ink-muted">Awardable <strong className="font-semibold text-navy">{fmtMonth(s.awardableSince)}</strong></p>
                  <p className="text-xs text-ink-muted">{[s.trl && `TRL ${s.trl}`, s.businessSize && `${s.businessSize} business`].filter(Boolean).join(" · ")}</p>
                  <a href={signInUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-cobalt hover:underline">
                    Sign in for full details<ArrowUpRight width={14} height={14} />
                    <span className="sr-only">(government users; opens external site)</span>
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Pagination page={page} pages={pages} onPage={(p) => { set({ page: String(p) }, { resetPage: false }); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
      </div>
    </div>
  );
}

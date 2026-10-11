"use client";

import { useMemo } from "react";
import { OpportunityCard } from "@/components/cards/opportunity-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { Opportunity, OpportunityStatus } from "@/lib/data/types";
import { TYPE_LABEL } from "@/lib/data/opportunity-status";
import { ChipGroup, FacetSelect, FilterPanel, ResultsBar, SearchField, SortSelect, countBy } from "./controls";
import { matches, uniq, useQueryState } from "./use-query-state";

export type OppRow = { o: Opportunity; status: OpportunityStatus; opensAt?: string; closesAt?: string };

export function OpportunitiesDirectory({ rows, now, lockType, defaultStatus = "current" }: {
  rows: OppRow[]; now: string; lockType?: Opportunity["type"]; defaultStatus?: "current" | "closed" | "all";
}) {
  const { state, set, clear, active } = useQueryState({ q: "", status: defaultStatus, type: lockType ?? "", sponsor: "", topic: "", sort: "deadline" });
  const nowDate = useMemo(() => new Date(now), [now]);

  const base = useMemo(() => rows.filter(({ o }) =>
    matches(state.q, o.title, o.summary, o.sponsor, o.topics) &&
    (!state.type || o.type === state.type) &&
    (!state.sponsor || o.sponsor === state.sponsor) &&
    (!state.topic || o.topics.includes(state.topic)),
  ), [rows, state.q, state.type, state.sponsor, state.topic]);

  const inStatus = (s: OpportunityStatus, f: string) => f === "all" || (f === "current" ? s !== "closed" : s === f);
  const statusCounts = countBy(base, (r) => r.status);

  const filtered = useMemo(() => base.filter((r) => inStatus(r.status, state.status)).sort((a, b) => {
    if (state.sort === "newest") return (b.opensAt ?? "").localeCompare(a.opensAt ?? "");
    // Deadline: soonest first; closed items most-recent first.
    if (a.status === "closed" && b.status === "closed") return (b.closesAt ?? "").localeCompare(a.closesAt ?? "");
    return (a.closesAt ?? "9999").localeCompare(b.closesAt ?? "9999");
  }), [base, state.status, state.sort]);

  const types = uniq(rows.map((r) => r.o.type));
  const sponsors = uniq(rows.map((r) => r.o.sponsor));
  const topics = uniq(rows.flatMap((r) => r.o.topics));

  return (
    <div>
      <SearchField label="Search opportunities" value={state.q} onChange={(q) => set({ q })} placeholder="Search by title, topic or sponsor" />
      <div className="mt-6 flex flex-col gap-6">
        <ChipGroup
          label="Status"
          value={state.status}
          onChange={(status) => set({ status })}
          options={[
            { value: "current", label: "Open & upcoming", count: (statusCounts.get("open") ?? 0) + (statusCounts.get("upcoming") ?? 0) },
            { value: "open", label: "Open", count: statusCounts.get("open") ?? 0 },
            { value: "upcoming", label: "Upcoming", count: statusCounts.get("upcoming") ?? 0 },
            { value: "closed", label: "Closed", count: statusCounts.get("closed") ?? 0 },
            { value: "all", label: "All", count: base.length },
          ]}
        />
        <FilterPanel active={active}>
          <div className="grid gap-4 md:grid-cols-3">
            {!lockType && (
              <FacetSelect label="Opportunity type" value={state.type} onChange={(type) => set({ type })} options={types.map((t) => ({ value: t, label: TYPE_LABEL[t as Opportunity["type"]] }))} />
            )}
            <FacetSelect label="Sponsoring organization" value={state.sponsor} onChange={(sponsor) => set({ sponsor })} options={sponsors.map((s) => ({ value: s, label: s }))} />
            <FacetSelect label="Topic" value={state.topic} onChange={(topic) => set({ topic })} options={topics.map((t) => ({ value: t, label: t }))} />
          </div>
        </FilterPanel>
      </div>
      <div className="mt-10">
        <ResultsBar
          count={filtered.length} total={rows.length} noun="opportunities" active={active} onClear={clear}
          sort={<SortSelect value={state.sort} onChange={(sort) => set({ sort })} options={[{ value: "deadline", label: "Deadline" }, { value: "newest", label: "Newest" }]} />}
        />
        {filtered.length === 0 ? (
          <div className="mt-8">
            <EmptyState title="No opportunities match" action={<button type="button" onClick={clear} className="font-semibold text-cobalt hover:underline">Reset filters</button>}>
              {state.status === "current" ? "There are no open or upcoming opportunities with these filters. Check closed opportunities or broaden your search." : "Try broadening your search."}
            </EmptyState>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {filtered.map((r) => (
              <li key={r.o.slug}><OpportunityCard o={r.o} status={r.status} now={nowDate} variant="row" /></li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

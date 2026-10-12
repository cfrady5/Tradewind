"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowUpRight, Play } from "@/components/ui/icons";
import { ChipGroup, ResultsBar, SearchField } from "@/components/directory/controls";
import { matches, useQueryState } from "@/components/directory/use-query-state";
import { formatDate } from "@/lib/data/opportunity-status";
import { VIDEO_CATEGORIES, type Resource } from "@/lib/data/types";

export type AudienceTag = "Vendor" | "Government" | "Both";
export function audienceTag(r: Pick<Resource, "audiences">): AudienceTag {
  const a = r.audiences;
  if (a.includes("all") || (a.includes("government") && a.includes("industry"))) return "Both";
  return a.includes("government") ? "Government" : "Vendor";
}

/** One video entry with every field the brief lists (§6.3). */
export function VideoCard({ v }: { v: Resource }) {
  const tag = audienceTag(v);
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition-[border-color,box-shadow] duration-(--duration-ui) hover:border-signal/50 hover:shadow-lift">
      <div className="on-dark relative grid aspect-video place-items-center overflow-hidden bg-hero text-white">
        <span className="absolute inset-0 bg-grid-fine opacity-50" aria-hidden />
        <span className="relative grid size-14 place-items-center rounded-full bg-white/10 ring-1 ring-white/30 transition-transform duration-(--duration-ui) group-hover:scale-110"><Play width={30} height={30} /></span>
        {v.duration && <span className="absolute bottom-3 right-3 rounded-sm bg-navy-900/80 px-2 py-0.5 font-mono text-xs">{v.duration}</span>}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={tag === "Government" ? "info" : tag === "Vendor" ? "neutral" : "approved"}>{tag}</Badge>
          {v.category && <span className="text-xs font-semibold uppercase tracking-[0.1em] text-cobalt">{v.category}</span>}
          {v.sample && <Badge tone="accent">Sample</Badge>}
        </div>
        <h3 className="mt-3 text-lg font-semibold leading-snug">
          {v.url ? <a href={v.url} target="_blank" rel="noopener noreferrer" className="hover:text-cobalt">{v.title}<span className="sr-only"> (opens external site)</span></a> : v.title}
        </h3>
        <p className="mt-2 text-[0.9375rem] text-ink-muted">{v.summary}</p>
        <dl className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-muted">
          {v.duration && <div className="flex gap-1"><dt>Runtime</dt><dd className="font-semibold text-navy">{v.duration}</dd></div>}
          {v.updatedAt && <div className="flex gap-1"><dt>Updated</dt><dd className="font-semibold text-navy">{formatDate(v.updatedAt)}</dd></div>}
          <div className="flex gap-1"><dt>Captions</dt><dd className="font-semibold text-navy">{v.hasCaptions ? "Yes" : "No"}</dd></div>
          <div className="flex gap-1"><dt>Transcript</dt><dd className="font-semibold text-navy">{v.hasTranscript ? "Available" : "Not yet"}</dd></div>
        </dl>
        {v.related && v.related.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-4 text-sm">
            {v.related.map((l) => {
              const ext = /^https?:/.test(l.href);
              return (
                <li key={l.href}>
                  <a href={l.href} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="inline-flex items-center gap-1 font-semibold text-cobalt hover:underline">
                    {l.label}{ext && <ArrowUpRight width={14} height={14} />}
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </article>
  );
}

/** Instructional video library: six categories, audience tags, search (brief §6.3). */
export function VideoLibrary({ items }: { items: Resource[] }) {
  const { state, set, clear, active } = useQueryState({ q: "", category: "", audience: "" });
  const filtered = useMemo(
    () => items.filter((v) =>
      matches(state.q, v.title, v.summary, v.category ?? "") &&
      (!state.category || v.category === state.category) &&
      (!state.audience || audienceTag(v) === state.audience || (state.audience !== "Both" && audienceTag(v) === "Both")),
    ),
    [items, state],
  );
  const grouped = !state.q && !state.category;

  return (
    <div>
      <SearchField label="Search videos" value={state.q} onChange={(q) => set({ q })} placeholder="Search videos — e.g. “upload” or “feedback”" />
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <ChipGroup label="Category" value={state.category} onChange={(category) => set({ category })}
          options={[{ value: "", label: "All" }, ...VIDEO_CATEGORIES.map((c) => ({ value: c, label: c, count: items.filter((v) => v.category === c).length }))]} />
        <ChipGroup label="Audience" value={state.audience} onChange={(audience) => set({ audience })}
          options={[{ value: "", label: "Everyone" }, { value: "Vendor", label: "Vendors" }, { value: "Government", label: "Government" }, { value: "Both", label: "Both" }]} />
      </div>
      <div className="mt-10">
        <ResultsBar count={filtered.length} total={items.length} noun="videos" active={active} onClear={clear} />
        {filtered.length === 0 ? (
          <div className="mt-8"><EmptyState title="No videos match" action={<button type="button" onClick={clear} className="font-semibold text-cobalt hover:underline">Show all videos</button>}>Try another keyword or category.</EmptyState></div>
        ) : grouped ? (
          <div className="mt-4 space-y-14">
            {VIDEO_CATEGORIES.map((c) => {
              const vids = filtered.filter((v) => v.category === c);
              return (
                <section key={c} aria-labelledby={`cat-${c}`} className="scroll-mt-28" id={c.toLowerCase().replace(/[^a-z]+/g, "-")}>
                  <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                    <h2 id={`cat-${c}`} className="text-xl font-bold">{c}</h2>
                    <span className="text-sm text-ink-muted">{vids.length} video{vids.length === 1 ? "" : "s"}</span>
                  </div>
                  {vids.length ? (
                    <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{vids.map((v) => <li key={v.slug}><VideoCard v={v} /></li>)}</ul>
                  ) : <p className="mt-4 text-sm text-ink-muted">Videos for this category are being prepared.</p>}
                </section>
              );
            })}
          </div>
        ) : (
          <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{filtered.map((v) => <li key={v.slug}><VideoCard v={v} /></li>)}</ul>
        )}
      </div>
    </div>
  );
}

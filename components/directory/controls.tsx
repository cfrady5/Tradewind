"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, Close, Filter, Search } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/** Debounced search input bound to URL state; "/" focuses it. */
export function SearchField({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder: string; label: string }) {
  const [local, setLocal] = useState(value);
  const ref = useRef<HTMLInputElement>(null);
  const id = useId();
  // Re-sync when the URL value changes externally (back/forward, "clear filters").
  const [synced, setSynced] = useState(value);
  if (synced !== value) {
    setSynced(value);
    setLocal(value);
  }
  useEffect(() => {
    if (local === value) return;
    const t = setTimeout(() => onChange(local), 180);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(tag)) { e.preventDefault(); ref.current?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">{label}</label>
      <Search className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-cobalt" width={22} height={22} />
      <input
        ref={ref}
        id={id}
        type="search"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="h-16 w-full rounded-lg border border-line bg-white pl-14 pr-24 text-lg font-medium text-navy shadow-card outline-none transition-[border-color,box-shadow] duration-(--duration-ui) placeholder:font-normal placeholder:text-ink-muted focus:border-signal focus:shadow-[0_0_0_4px_rgb(51_125_229/0.15)] [&::-webkit-search-cancel-button]:hidden"
      />
      <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
        {local ? (
          <button type="button" onClick={() => { setLocal(""); onChange(""); ref.current?.focus(); }} className="grid size-8 place-items-center rounded-full text-ink-muted hover:bg-cloud hover:text-navy" aria-label="Clear search">
            <Close width={16} height={16} />
          </button>
        ) : (
          <kbd className="hidden rounded border border-line bg-cloud px-2 py-0.5 font-mono text-xs text-ink-muted sm:block" aria-hidden>/</kbd>
        )}
      </div>
    </div>
  );
}

export function FacetSelect({ label, value, onChange, options, allLabel = "All" }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string; count?: number }[]; allLabel?: string;
}) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{label}</label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-11 w-full appearance-none truncate rounded-md border bg-white pl-3.5 pr-9 text-[0.9375rem] font-medium outline-none transition-colors focus:border-signal",
            value ? "border-cobalt/60 text-cobalt" : "border-line text-navy",
          )}
        >
          <option value="">{allLabel}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}{o.count !== undefined ? ` (${o.count})` : ""}</option>
          ))}
        </select>
        <ChevronDown width={16} height={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted" />
      </div>
    </div>
  );
}

/** Segmented single-choice chips (e.g. status). */
export function ChipGroup({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string; count?: number }[] }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-[background-color,border-color,color] duration-(--duration-micro)",
              on ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy/40",
            )}
          >
            {o.label}
            {o.count !== undefined && <span className={cn("rounded-full px-1.5 text-xs tabular-nums", on ? "bg-white/15" : "bg-cloud text-ink-muted")}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Collapsible filter panel on mobile, inline on desktop. */
export function FilterPanel({ children, active }: { children: ReactNode; active: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex h-11 w-full items-center justify-between rounded-md border border-line bg-white px-4 font-semibold md:hidden"
      >
        <span className="flex items-center gap-2"><Filter width={18} height={18} /> Filters{active > 0 && <span className="rounded-full bg-cobalt px-2 text-xs text-white">{active}</span>}</span>
        <ChevronDown width={18} height={18} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      <div className={cn("mt-3 gap-4 md:mt-0 md:grid", open ? "grid" : "hidden")}>{children}</div>
    </div>
  );
}

export function ResultsBar({ count, total, noun, active, onClear, sort, range }: { count: number; total: number; noun: string; active: number; onClear: () => void; sort?: ReactNode; range?: [number, number] }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
      <p className="text-sm text-ink-muted" role="status" aria-live="polite">
        {range && count > range[1] - range[0] + 1 ? (
          <>Showing <strong className="font-semibold text-navy tabular-nums">{range[0]}–{range[1]}</strong> of <span className="tabular-nums">{count}</span> matching {noun}{count !== total && <> ({total} total)</>}</>
        ) : (
          <>Showing <strong className="font-semibold text-navy tabular-nums">{count}</strong> of <span className="tabular-nums">{total}</span> {noun}</>
        )}
        {active > 0 && (
          <button type="button" onClick={onClear} className="ml-3 font-semibold text-cobalt hover:underline">Clear filters</button>
        )}
      </p>
      {sort}
    </div>
  );
}

export function SortSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  const id = useId();
  return (
    <div className="flex items-center gap-2 text-sm">
      <label htmlFor={id} className="text-ink-muted">Sort</label>
      <div className="relative">
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="h-9 appearance-none rounded-md border border-line bg-white pl-3 pr-8 font-semibold outline-none focus:border-signal">
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown width={14} height={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
      </div>
    </div>
  );
}

export function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  const btn = "grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm font-semibold transition-colors";
  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-1">
      <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} className={cn(btn, "hover:bg-cloud disabled:opacity-40")} aria-label="Previous page">
        <ChevronRight width={16} height={16} className="rotate-180" />
      </button>
      {nums.map((n, i) => (
        <span key={n} className="flex items-center gap-1">
          {i > 0 && n - nums[i - 1] > 1 && <span className="px-1 text-ink-muted" aria-hidden>…</span>}
          <button type="button" onClick={() => onPage(n)} aria-current={n === page ? "page" : undefined} className={cn(btn, n === page ? "bg-navy text-white" : "hover:bg-cloud")}>
            {n}
          </button>
        </span>
      ))}
      <button type="button" disabled={page >= pages} onClick={() => onPage(page + 1)} className={cn(btn, "hover:bg-cloud disabled:opacity-40")} aria-label="Next page">
        <ChevronRight width={16} height={16} />
      </button>
    </nav>
  );
}

export function countBy<T>(items: T[], key: (t: T) => string | string[]) {
  const m = new Map<string, number>();
  for (const it of items) for (const k of [key(it)].flat()) m.set(k, (m.get(k) ?? 0) + 1);
  return m;
}

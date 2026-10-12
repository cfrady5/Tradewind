"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Check, ChevronDown, Copy } from "@/components/ui/icons";
import type { Prompt } from "@/lib/data/types";
import { cn } from "@/lib/cn";
import { ResultsBar, SearchField, countBy } from "./controls";
import { matches, uniq, useQueryState } from "./use-query-state";

/** Clipboard API with a legacy fallback (some embedded/mobile browsers block or stall the async API). */
async function copyText(text: string) {
  try {
    await Promise.race([
      navigator.clipboard.writeText(text),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 1200)),
    ]);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");
  return (
    <button
      type="button"
      onClick={async () => {
        setState((await copyText(text)) ? "done" : "failed");
        setTimeout(() => setState("idle"), 2200);
      }}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-2 rounded-sm px-4 text-sm font-semibold transition-colors duration-(--duration-micro)",
        state === "done" ? "bg-[#e3f4ea] text-[#155c34]" : state === "failed" ? "bg-runway-tint text-[#8a4100]" : "bg-navy text-white hover:bg-cobalt",
      )}
      aria-label={state === "done" ? "Copied" : state === "failed" ? "Copy failed — expand and select the text" : `Copy prompt: ${label}`}
    >
      {state === "done" ? <Check width={16} height={16} /> : <Copy width={16} height={16} />}
      {state === "done" ? "Copied" : state === "failed" ? "Select text" : "Copy"}
      <span className="sr-only" aria-live="polite">{state === "done" ? "Prompt copied to clipboard" : state === "failed" ? "Copy failed. Expand the prompt and select the text." : ""}</span>
    </button>
  );
}

export function PromptLibrary({ items }: { items: Prompt[] }) {
  const { state, set, clear, active } = useQueryState({ q: "", category: "" });
  const [open, setOpen] = useState<string | null>(null);
  const searched = useMemo(() => items.filter((p) => matches(state.q, p.title, p.description, p.body, p.category)), [items, state.q]);
  const filtered = searched.filter((p) => !state.category || p.category === state.category);
  const counts = countBy(searched, (p) => p.category);
  const categories = uniq(items.map((p) => p.category));

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
      <aside className="min-w-0 lg:col-span-3">
        <nav aria-label="Prompt categories" className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
          <h2 className="eyebrow text-ink-muted">Categories</h2>
          <ul className="mt-4 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-0.5 lg:overflow-visible">
            {[{ v: "", l: "All prompts", c: searched.length }, ...categories.map((c) => ({ v: c, l: c, c: counts.get(c) ?? 0 }))].map((c) => (
              <li key={c.v} className="shrink-0">
                <button
                  type="button"
                  onClick={() => set({ category: c.v })}
                  aria-current={state.category === c.v ? "true" : undefined}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 whitespace-nowrap rounded-md px-3 py-2 text-left text-[0.9375rem] transition-colors",
                    state.category === c.v ? "bg-navy font-semibold text-white" : "text-navy hover:bg-cloud",
                  )}
                >
                  {c.l}<span className={cn("text-xs tabular-nums", state.category === c.v ? "text-white/70" : "text-ink-muted")}>{c.c}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className="min-w-0 lg:col-span-9">
        <SearchField label="Search prompts" value={state.q} onChange={(q) => set({ q })} placeholder="Search prompts by keyword or task" />
        <div className="mt-8">
          <ResultsBar count={filtered.length} total={items.length} noun="prompts" active={active} onClear={clear} />
          {filtered.length === 0 ? (
            <div className="mt-8"><EmptyState title="No prompts found" action={<button type="button" onClick={clear} className="font-semibold text-cobalt hover:underline">Show all prompts</button>}>Try another keyword or category.</EmptyState></div>
          ) : (
            <ul className="mt-6 space-y-3">
              {filtered.map((p) => {
                const isOpen = open === p.slug;
                return (
                  <li key={p.slug} id={p.slug} className={cn("scroll-mt-32 rounded-lg border bg-white transition-[border-color,box-shadow] duration-(--duration-ui)", isOpen ? "border-signal/60 shadow-lift" : "border-line hover:border-navy/25")}>
                    <div className="flex items-start gap-4 p-5 md:p-6">
                      <button type="button" onClick={() => setOpen(isOpen ? null : p.slug)} aria-expanded={isOpen} aria-controls={`${p.slug}-body`} className="flex flex-1 items-start gap-4 text-left">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-cobalt">{p.category}</span>
                            {p.sample && <Badge tone="accent">Sample</Badge>}
                          </div>
                          <h3 className="mt-2 text-lg font-semibold">{p.title}</h3>
                          <p className="mt-1 text-ink-muted">{p.description}</p>
                        </div>
                        <ChevronDown className={cn("mt-1 shrink-0 text-ink-muted transition-transform duration-(--duration-ui)", isOpen && "rotate-180")} />
                      </button>
                      <CopyButton text={p.body} label={p.title} />
                    </div>
                    {isOpen && (
                      <div id={`${p.slug}-body`} className="border-t border-line px-5 pb-6 pt-5 md:px-6">
                        <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-md bg-navy-900 p-5 font-mono text-sm leading-relaxed text-white/90">{p.body}</pre>
                        {p.usageNotes && <p className="mt-4 rounded-md bg-sky-tint/60 p-4 text-sm"><strong className="font-semibold">Intended use: </strong>{p.usageNotes}</p>}
                        <p className="mt-4 text-xs text-ink-muted">Never paste classified, CUI or proprietary information into tools that are not approved for it. Review all AI output before use.</p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

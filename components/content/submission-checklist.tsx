"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Check } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

const KEY = "tw-submission-checklist";

// localStorage-backed store; falls back to in-memory when storage is unavailable (private mode, blocked).
let memory = "{}";
const listeners = new Set<() => void>();
function readStore() {
  try { return localStorage.getItem(KEY) ?? memory; } catch { return memory; }
}
function writeStore(v: Record<string, boolean>) {
  memory = JSON.stringify(v);
  try { localStorage.setItem(KEY, memory); } catch { /* keep in memory */ }
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  window.addEventListener("storage", l);
  return () => { listeners.delete(l); window.removeEventListener("storage", l); };
}

export type ChecklistGroup = { title: string; items: { id: string; label: string; detail?: string }[] };

/** Per-viewer progress is remembered in this browser only (convenience; no data leaves the device). */
export function SubmissionChecklist({ groups }: { groups: ChecklistGroup[] }) {
  const raw = useSyncExternalStore(subscribe, readStore, () => "{}");
  const done = useMemo<Record<string, boolean>>(() => { try { return JSON.parse(raw); } catch { return {}; } }, [raw]);
  const toggle = (id: string) => writeStore({ ...done, [id]: !done[id] });
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const count = Object.values(done).filter(Boolean).length;
  const pct = Math.round((count / total) * 100);

  return (
    <div className="rounded-xl border border-line bg-white shadow-card">
      <div className="sticky top-[calc(var(--header-h))] z-10 rounded-t-xl border-b border-line bg-white/95 p-6 backdrop-blur">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">Submission readiness</span>
          <span className="tabular-nums text-ink-muted" aria-live="polite">{count} of {total} complete</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-sm bg-cloud" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Checklist progress">
          <div className="h-full rounded-sm bg-gradient-to-r from-cobalt to-signal transition-[width] duration-(--duration-enter) ease-(--ease-out)" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="divide-y divide-line">
        {groups.map((g) => (
          <fieldset key={g.title} className="p-6">
            <legend className="eyebrow text-cobalt">{g.title}</legend>
            <ul className="mt-4 space-y-2">
              {g.items.map((it) => (
                <li key={it.id}>
                  <label className="group flex cursor-pointer items-start gap-4 rounded-md p-3 transition-colors hover:bg-cloud/60">
                    <input type="checkbox" className="peer sr-only" checked={!!done[it.id]} onChange={() => toggle(it.id)} />
                    <span className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border-2 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-signal", done[it.id] ? "border-cobalt bg-cobalt text-white" : "border-line bg-white")}>
                      {done[it.id] && <Check width={14} height={14} strokeWidth={3} />}
                    </span>
                    <span>
                      <span className={cn("font-semibold", done[it.id] && "text-ink-muted line-through decoration-ink-muted/50")}>{it.label}</span>
                      {it.detail && <span className="mt-0.5 block text-sm text-ink-muted">{it.detail}</span>}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        ))}
      </div>
      <div className="flex justify-end rounded-b-xl border-t border-line bg-cloud/40 p-4">
        <button type="button" onClick={() => writeStore({})} className="text-sm font-semibold text-ink-muted hover:text-navy">Reset checklist</button>
      </div>
    </div>
  );
}

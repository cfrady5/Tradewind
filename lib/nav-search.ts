/**
 * Menu search (mobile navigation overhaul §4). Pure, synchronous and dependency-free so it runs
 * instantly on every keystroke. The UI consumes `SearchEntry[]`; today the entries come from the
 * navigation config, and a future full-site index can supply more entries without UI changes.
 */
import type { NavGroup } from "./site-config";

export type SearchEntry = {
  id: string;
  /** Text shown in results. */
  title: string;
  href: string;
  /** Category shown as secondary text (e.g. "Marketplace"). */
  parent?: string;
  keywords?: readonly string[];
};

export type SearchHit = SearchEntry & { rank: number; highlight: [number, number][] };

/* ------------------------------------------------------------------ normalization */
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
/** "TurboInnovate" → "Turbo Innovate", "GenAI.mil" → "Gen AI.mil" (acronyms like "FAQs" stay whole). */
const splitCamel = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
/** Light plural folding so "videos" finds "Video" and "faq" finds "FAQs". */
const stem = (t: string) => (t.length > 3 && t.endsWith("s") && !t.endsWith("ss") ? t.slice(0, -1) : t);
export const tokenize = (s: string) => fold(splitCamel(s)).split(/[^a-z0-9]+/).filter(Boolean).map(stem);
/** Punctuation- and space-insensitive form: "GenAI.mil", "genai mil" and "genaimil" all agree. */
export const compact = (s: string) => fold(s).replace(/[^a-z0-9]+/g, "");

/** Short query tokens (1–2 chars, e.g. "ai") must match whole words; longer ones may match word prefixes. */
const tokenMatches = (q: string, t: string) => t === q || (q.length >= 3 && t.startsWith(q));
const allMatched = (qs: string[], pool: string[]) => qs.every((q) => pool.some((t) => tokenMatches(q, t)));
const covers = (qs: string[], alias: string[]) => alias.every((t) => qs.some((q) => tokenMatches(q, t)));

/* ------------------------------------------------------------------ ranking */
type Prepared = { entry: SearchEntry; order: number; titleCompact: string; title: string[]; aliases: string[][]; aliasTokens: string[]; parent: string[]; parentCompact: string };

const prepare = (entries: SearchEntry[]): Prepared[] =>
  entries.map((entry, order) => {
    const aliases = (entry.keywords ?? []).map(tokenize);
    return {
      entry, order,
      titleCompact: compact(entry.title),
      title: tokenize(entry.title),
      aliases,
      aliasTokens: aliases.flat(),
      parent: entry.parent ? tokenize(entry.parent) : [],
      parentCompact: entry.parent ? compact(entry.parent) : "",
    };
  });

/**
 * Rank order: 1 exact title · 2 title prefix · 3 title words · 4 keyword/alias · 5 parent category ·
 * 6 partial alias (a query that only covers part of a multi-word alias, e.g. "marketplace" vs
 * "marketplace minute", is weaker evidence than a matching parent category).
 */
function rankOf(p: Prepared, qc: string, qt: string[]): number | null {
  if (p.titleCompact === qc) return 1;
  if (p.titleCompact.startsWith(qc)) return 2;
  if (allMatched(qt, p.title)) return 3;
  const withAliases = [...p.title, ...p.aliasTokens];
  if (allMatched(qt, withAliases) && p.aliases.some((a) => a.length > 0 && covers(qt, a))) return 4;
  if (p.parent.length && (p.parentCompact.startsWith(qc) || allMatched(qt, [...p.title, ...p.parent]))) return 5;
  if (allMatched(qt, [...withAliases, ...p.parent])) return 6;
  return null;
}

/** Character ranges of `title` to emphasize for this query. */
export function highlightRanges(title: string, query: string): [number, number][] {
  const qc = compact(query);
  if (!qc) return [];
  if (compact(title).startsWith(qc)) {
    // Whole-prefix match across punctuation/spaces: highlight until qc.length alphanumerics are covered.
    let seen = 0;
    for (let i = 0; i < title.length; i++) {
      if (/[a-z0-9]/i.test(title[i])) seen++;
      if (seen === qc.length) return [[0, i + 1]];
    }
  }
  const qt = tokenize(query);
  const out: [number, number][] = [];
  const word = /[A-Za-z0-9]+/g;
  for (let m = word.exec(title); m; m = word.exec(title)) {
    // Split camelCase segments so "Innovate" in "TurboInnovate" can be highlighted on its own.
    const parts = m[0].split(/(?<=[a-z0-9])(?=[A-Z])/);
    let offset = m.index;
    for (const part of parts) {
      const f = fold(part);
      const q = qt.find((q) => tokenMatches(q, stem(f)) || (q.length >= 3 && f.startsWith(q)));
      if (q) out.push([offset, offset + Math.min(part.length, q.length === f.length ? part.length : q.length)]);
      offset += part.length;
    }
  }
  return out;
}

/** Ranked, de-duplicated results (by destination) for a query. Empty query → no results. */
export function searchEntries(entries: SearchEntry[], query: string, limit = 50): SearchHit[] {
  const qc = compact(query);
  const qt = tokenize(query);
  if (!qc || !qt.length) return [];
  const seen = new Set<string>();
  const hits: { p: Prepared; rank: number; parentBoost: number }[] = [];
  for (const p of prepare(entries)) {
    const rank = rankOf(p, qc, qt);
    if (rank === null || seen.has(p.entry.href)) continue;
    seen.add(p.entry.href);
    hits.push({ p, rank, parentBoost: p.parent.some((t) => qt.some((q) => tokenMatches(q, t))) ? 0 : 1 });
  }
  hits.sort((a, b) => a.rank - b.rank || a.parentBoost - b.parentBoost || a.p.order - b.p.order);
  return hits.slice(0, limit).map(({ p, rank }) => ({ ...p.entry, rank, highlight: highlightRanges(p.entry.title, query) }));
}

/** Adapter: every destination in the navigation config, once, with its category. */
export function navSearchEntries(nav: NavGroup[], extra: SearchEntry[] = []): SearchEntry[] {
  const out: SearchEntry[] = [];
  for (const g of nav) {
    if (!g.links.length) out.push({ id: g.href, title: g.label, href: g.href, keywords: g.keywords });
    for (const l of g.links) out.push({ id: `${g.label}:${l.href}`, title: l.searchLabel ?? l.label, href: l.href, parent: g.label, keywords: l.keywords });
  }
  return [...out, ...extra];
}

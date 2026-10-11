"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

/**
 * URL-backed filter state: every filter is shareable and survives reload/back.
 * Uses router.replace so typing doesn't spam history; scroll position is preserved.
 */
export function useQueryState<K extends string>(defaults: Record<K, string>) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const state = useMemo(() => {
    const out = { ...defaults };
    for (const k of Object.keys(defaults) as K[]) {
      const v = params.get(k);
      if (v !== null) out[k] = v;
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const set = useCallback(
    (patch: Partial<Record<K, string>>, opts: { resetPage?: boolean } = { resetPage: true }) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(patch) as [K, string][]) {
        if (!v || v === defaults[k]) next.delete(k);
        else next.set(k, v);
      }
      if (opts.resetPage && !("page" in patch)) next.delete("page");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params, pathname, router],
  );

  const clear = useCallback(() => router.replace(pathname, { scroll: false }), [pathname, router]);
  const active = (Object.keys(defaults) as K[]).filter((k) => k !== "page" && k !== "sort" && state[k] !== defaults[k]).length;

  return { state, set, clear, active };
}

export const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
export const matches = (q: string, ...fields: (string | undefined | string[])[]) => {
  if (!q.trim()) return true;
  const hay = norm(fields.flat().filter(Boolean).join(" "));
  return norm(q).split(/\s+/).filter(Boolean).every((t) => hay.includes(t));
};
export const uniq = (xs: string[]) => [...new Set(xs)].sort((a, b) => a.localeCompare(b));

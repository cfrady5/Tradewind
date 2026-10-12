"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ArrowRight, ArrowUpRight, ChevronDown, Close, Menu, Search } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { navSearchEntries, searchEntries, type SearchHit } from "@/lib/nav-search";
import { EXTERNAL, NAV, PORTAL } from "@/lib/site-config";

/** Built once from the shared navigation config; the accordion reads NAV directly. */
const ENTRIES = navSearchEntries(NAV, [{ id: "portal", title: PORTAL.label, href: PORTAL.href, parent: "Staff", keywords: PORTAL.keywords }]);
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
/**
 * Visible-height breakpoints for the action bar. Below SHORT (landscape phones, keyboard open) it
 * joins the scroll flow; below COMPACT (small phones) only the CTA stays pinned and the Employee
 * Portal link moves to the end of the list.
 */
const SHORT_VIEWPORT = 520;
const COMPACT_VIEWPORT = 640;

/* ------------------------------------------------------------------ scroll lock */
function lockScroll() {
  const root = document.documentElement;
  root.style.setProperty("--scroll-gap", `${window.innerWidth - root.clientWidth}px`);
  root.setAttribute("data-scroll-locked", "");
}
function unlockScroll() {
  const root = document.documentElement;
  root.removeAttribute("data-scroll-locked");
  root.style.removeProperty("--scroll-gap");
}

/* ------------------------------------------------------------------ highlight */
function Highlighted({ text, ranges }: { text: string; ranges: [number, number][] }) {
  if (!ranges.length) return <>{text}</>;
  const out: ReactNode[] = [];
  let at = 0;
  [...ranges].sort((a, b) => a[0] - b[0]).forEach(([s, e], i) => {
    if (s < at) return;
    if (s > at) out.push(text.slice(at, s));
    out.push(<mark key={i} className="rounded-[2px] bg-sky/15 text-sky">{text.slice(s, e)}</mark>);
    at = e;
  });
  if (at < text.length) out.push(text.slice(at));
  return <>{out}</>;
}

/**
 * Mobile-first navigation (mobile navigation overhaul brief). A native modal <dialog> provides the
 * focus trap, inert background and Escape handling; it slides in from the right as a full-screen
 * sheet on phones and a 420px panel on wider screens. Three regions: fixed header + search,
 * scrolling accordion or search results, and a fixed action bar.
 */
export function MobileNav({ light }: { light: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const reduce = useReducedMotion();
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLUListElement>(null);
  const pendingClose = useRef<(() => void) | null>(null);
  const navScroll = useRef(0);

  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchEntries(ENTRIES, query), [query]);
  const searching = query.trim().length > 0;

  const isCurrent = (href: string) => pathname === href;
  const groupIsCurrent = (hrefs: string[]) => hrefs.some((h) => pathname === h || (h !== "/" && pathname.startsWith(h + "/")));

  /* -------------------------------------------------- visual viewport (keyboard, browser chrome) */
  const syncViewport = useCallback(() => {
    const el = dialogRef.current;
    const vv = window.visualViewport;
    if (!el) return;
    const h = vv?.height ?? window.innerHeight;
    el.style.height = `${h}px`;
    el.style.top = `${vv?.offsetTop ?? 0}px`;
    el.dataset.size = h < SHORT_VIEWPORT ? "short" : h < COMPACT_VIEWPORT ? "compact" : "regular";
  }, []);

  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;
    let raf = 0;
    const onChange = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(syncViewport); };
    vv?.addEventListener("resize", onChange);
    vv?.addEventListener("scroll", onChange);
    window.addEventListener("resize", onChange);
    return () => {
      cancelAnimationFrame(raf);
      vv?.removeEventListener("resize", onChange);
      vv?.removeEventListener("scroll", onChange);
      window.removeEventListener("resize", onChange);
    };
  }, [open, syncViewport]);

  /* -------------------------------------------------- open / close */
  const finishClose = useCallback(() => {
    const el = dialogRef.current;
    pendingClose.current = null;
    if (el?.open) el.close();
    el?.style.removeProperty("height");
    el?.style.removeProperty("top");
    unlockScroll();
    setQuery("");
    setExpanded(null);
    triggerRef.current?.focus({ preventScroll: true });
  }, []);

  const openMenu = () => {
    const el = dialogRef.current;
    if (!el) return;
    if (pendingClose.current) { pendingClose.current(); pendingClose.current = null; } // reopened mid-exit
    syncViewport();
    if (!el.open) el.showModal();
    lockScroll();
    setOpen(true);
    // Focus the close control, never the search field: the keyboard must not pop up on open.
    closeRef.current?.focus({ preventScroll: true });
  };

  const closeMenu = useCallback(() => {
    const el = dialogRef.current;
    if (!el?.open || pendingClose.current) return;
    setOpen(false);
    if (reduce) { finishClose(); return; }
    let timer = 0;
    const onEnd = (e: AnimationEvent) => {
      if (e.target !== el || e.pseudoElement) return; // ignore child and ::backdrop animations
      done();
    };
    const cleanup = () => { el.removeEventListener("animationend", onEnd); window.clearTimeout(timer); };
    const done = () => { cleanup(); finishClose(); };
    timer = window.setTimeout(done, 450); // safety net if animationend never fires
    el.addEventListener("animationend", onEnd);
    pendingClose.current = cleanup;
  }, [reduce, finishClose]);

  // Navigating away (including from a search result) closes the menu once the new route renders.
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    const raf = requestAnimationFrame(() => closeMenu());
    return () => cancelAnimationFrame(raf);
  }, [pathname, closeMenu]);
  // Never leave the page locked if the header unmounts mid-animation.
  useEffect(() => () => unlockScroll(), []);

  /* -------------------------------------------------- search mode */
  // Remember where the accordion list was, show results from the top, and restore on return.
  useLayoutEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    if (searching) sc.scrollTop = 0;
    else sc.scrollTop = navScroll.current;
  }, [searching]);

  const go = (hit: SearchHit) => {
    if (hit.href === pathname) closeMenu();
    else router.push(hit.href);
  };

  const onInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" && query) { e.preventDefault(); e.stopPropagation(); setQuery(""); }
    else if (e.key === "ArrowDown" && results.length) { e.preventDefault(); resultsRef.current?.querySelector<HTMLAnchorElement>("a")?.focus(); }
    else if (e.key === "Enter" && results[0]) { e.preventDefault(); go(results[0]); }
  };
  const onResultsKey = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const links = [...(resultsRef.current?.querySelectorAll<HTMLAnchorElement>("a") ?? [])];
    const i = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (i < 0) return;
    e.preventDefault();
    if (e.key === "ArrowDown") links[Math.min(i + 1, links.length - 1)].focus();
    else if (i === 0) inputRef.current?.focus();
    else links[i - 1].focus();
  };

  /* -------------------------------------------------- render */
  const linkClose = (href: string) => () => { if (href === pathname) closeMenu(); };

  const toggle = (label: string, panelId: string) => {
    const opening = expanded !== label;
    setExpanded(opening ? label : null);
    if (!opening) return;
    // After the height transition, bring the opened links into view while keeping the parent row visible.
    window.setTimeout(() => {
      const sc = scrollRef.current;
      const panel = document.getElementById(panelId);
      const trigger = panel?.previousElementSibling as HTMLElement | null;
      if (!sc || !panel || !trigger) return;
      const box = sc.getBoundingClientRect();
      const overflow = panel.getBoundingClientRect().bottom - box.bottom;
      if (overflow <= 0) return;
      const headroom = trigger.getBoundingClientRect().top - box.top;
      sc.scrollBy({ top: Math.min(overflow + 8, headroom), behavior: reduce ? "auto" : "smooth" });
    }, reduce ? 0 : 290);
  };

  const portal = (className?: string) => (
    <Link href={PORTAL.href} onClick={linkClose(PORTAL.href)} className={cn("group min-h-11 items-center gap-1.5 self-start text-sm font-medium text-ink-subtle transition-colors hover:text-white", className)}>
      {PORTAL.label}
      <ArrowRight width={14} height={14} className="transition-transform duration-(--duration-ui) group-hover:translate-x-0.5" />
    </Link>
  );
  const cta = (
      <a
        href={EXTERNAL.marketplaceSignIn}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[10px] bg-runway text-[0.9375rem] font-semibold uppercase tracking-[0.04em] text-navy transition-[background-color,transform] duration-(--duration-micro) hover:bg-[#ffa957] active:scale-[0.98]"
      >
        Access the Marketplace
        <ArrowUpRight width={16} height={16} />
        <span className="sr-only">(opens external site)</span>
      </a>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openMenu}
        className={cn("group flex h-11 items-center gap-2 rounded-lg px-2.5 text-sm font-semibold transition-colors", light ? "hover:bg-navy/[0.05]" : "hover:bg-white/10")}
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
      >
        {/* Text label only while the compact desktop link row is hidden; the icon is always there. */}
        <span className="hidden sm:inline xl:hidden">Menu</span>
        <Menu className="transition-transform duration-(--duration-ui) group-hover:scale-x-110" />
      </button>

      <dialog
        ref={dialogRef}
        id={`${id}-menu`}
        aria-label="Site menu"
        data-state={open ? "open" : "closed"}
        className="nav-drawer on-dark fixed bottom-auto left-auto right-0 top-0 m-0 max-h-none w-full max-w-none overflow-hidden bg-navy-900 p-0 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] text-white backdrop:bg-navy-900/60 open:flex open:flex-col sm:w-[420px] sm:border-l sm:border-white/10"
        onCancel={(e) => {
          e.preventDefault();
          if (query) { setQuery(""); inputRef.current?.focus(); } // Escape clears an active search first
          else closeMenu();
        }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-grid-fine opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />

        {/* Region A — header + search (fixed) */}
        <div className="relative shrink-0 border-b border-white/[0.08] pt-[env(safe-area-inset-top)]">
          <div className="flex h-16 items-center justify-between px-5">
            <Link href="/" onClick={linkClose("/")} aria-label="Tradewinds home" className="flex min-h-11 items-center rounded-sm">
              <BrandLogo variant="wordmark-reversed" className="w-[150px]" />
            </Link>
            <button
              ref={closeRef}
              type="button"
              onClick={closeMenu}
              className="grid size-11 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-white/85 transition-[background-color,color,transform] duration-(--duration-micro) hover:bg-white/[0.08] hover:text-white active:scale-95"
              aria-label="Close menu"
            >
              <Close width={18} height={18} />
            </button>
          </div>
          <div className="px-5 pb-4">
            <div className="relative">
              <label htmlFor={`${id}-q`} className="sr-only">Search Tradewinds</label>
              <Search width={18} height={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle" />
              <input
                ref={inputRef}
                id={`${id}-q`}
                type="search"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="Search Tradewinds…"
                value={query}
                onChange={(e) => {
                  if (!searching && scrollRef.current) navScroll.current = scrollRef.current.scrollTop;
                  setQuery(e.target.value);
                }}
                onKeyDown={onInputKey}
                aria-controls={searching ? `${id}-results` : undefined}
                aria-describedby={searching ? `${id}-count` : undefined}
                className="h-12 w-full rounded-[11px] border border-white/[0.12] bg-white/[0.06] pl-11 pr-11 text-base text-white outline-none transition-[border-color,background-color] duration-(--duration-micro) placeholder:text-ink-subtle focus:border-sky focus:bg-white/[0.08] [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                  className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-ink-subtle transition-colors hover:text-white active:scale-95"
                  aria-label="Clear search"
                >
                  <Close width={16} height={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Region B — accordion navigation or search results (scrolls) */}
        <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {searching ? (
            <div key="results" id={`${id}-results`} className="nav-fade px-3 py-4" role="region" aria-label="Search results">
              <p id={`${id}-count`} className="px-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-subtle" role="status" aria-live="polite">
                Search results — {results.length} {results.length === 1 ? "match" : "matches"}
              </p>
              {results.length > 0 ? (
                <ul ref={resultsRef} className="mt-2" onKeyDown={onResultsKey}>
                  {results.map((r) => (
                    <li key={r.href}>
                      <Link
                        href={r.href}
                        onClick={(e) => { if (r.href === pathname) { e.preventDefault(); closeMenu(); } }}
                        aria-current={isCurrent(r.href) ? "page" : undefined}
                        className="group flex min-h-14 items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-white/[0.05] focus-visible:bg-white/[0.06] active:bg-white/[0.08]"
                      >
                        <span className="min-w-0">
                          <span className="block text-base font-medium text-white"><Highlighted text={r.title} ranges={r.highlight} /></span>
                          {r.parent && <span className="mt-0.5 block text-[0.8125rem] text-ink-subtle">{r.parent}</span>}
                        </span>
                        <ArrowRight width={16} height={16} className="shrink-0 text-ink-subtle transition-transform duration-(--duration-ui) group-hover:translate-x-0.5 group-hover:text-sky" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-2 py-10 text-center">
                  <p className="font-semibold text-white">No matching pages</p>
                  <p className="mt-1 text-sm text-ink-subtle">Try a different search term.</p>
                </div>
              )}
            </div>
          ) : (
            <nav key="nav" aria-label="Main" className="nav-fade px-5 py-2">
              <ul>
                {NAV.map((g) => {
                  const hrefs = g.links.length ? g.links.map((l) => l.href) : [g.href];
                  const current = g.href === "/" ? pathname === "/" : groupIsCurrent(hrefs);
                  const rowText = cn("text-[1.1875rem] font-semibold leading-tight", current ? "text-sky" : "text-white");
                  const marker = current && <span className="absolute -left-5 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-runway" aria-hidden />;

                  if (!g.links.length) {
                    return (
                      <li key={g.label} className="border-b border-white/[0.07]">
                        <Link
                          href={g.href}
                          onClick={linkClose(g.href)}
                          aria-current={isCurrent(g.href) ? "page" : undefined}
                          className={cn("relative flex min-h-14 items-center justify-between gap-4 py-3 transition-colors active:bg-white/[0.04]", rowText)}
                        >
                          {marker}
                          {g.label}
                        </Link>
                      </li>
                    );
                  }

                  const isOpen = expanded === g.label;
                  const panelId = `${id}-${slug(g.label)}-panel`;
                  const triggerId = `${id}-${slug(g.label)}-trigger`;
                  return (
                    <li key={g.label} className="border-b border-white/[0.07]">
                      <button
                        id={triggerId}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => toggle(g.label, panelId)}
                        className={cn("relative flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left transition-colors active:bg-white/[0.04]", rowText, isOpen && "text-sky")}
                      >
                        {marker}
                        <span>
                          {g.label}
                          {current && <span className="sr-only"> (current section)</span>}
                        </span>
                        <ChevronDown
                          width={18}
                          height={18}
                          className={cn("shrink-0 text-ink-subtle transition-transform duration-[260ms] ease-(--ease-out)", isOpen && "rotate-180 text-sky")}
                        />
                      </button>
                      {/* Height animates via grid rows (no measuring, no nested scroll); collapsed panels are inert. */}
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={triggerId}
                        inert={!isOpen}
                        // visibility flips to hidden only after the collapse finishes, so closed links leave the accessibility tree.
                        className={cn("grid transition-[grid-template-rows,visibility] duration-[280ms] ease-(--ease-out)", isOpen ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]")}
                      >
                        <div className="min-h-0 overflow-hidden">
                          <ul
                            className={cn(
                              "mb-3 ml-1 border-l border-white/[0.12] transition-[opacity,transform] duration-[280ms] ease-(--ease-out)",
                              isOpen ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
                            )}
                          >
                            {g.links.map((l) => {
                              const here = isCurrent(l.href);
                              return (
                                <li key={l.href}>
                                  <Link
                                    href={l.href}
                                    onClick={linkClose(l.href)}
                                    aria-current={here ? "page" : undefined}
                                    className={cn(
                                      "relative -ml-px flex min-h-11 items-center rounded-r-md border-l-2 py-2 pl-4 pr-3 text-base transition-colors active:bg-white/[0.06]",
                                      here ? "border-runway bg-white/[0.05] font-medium text-sky" : "border-transparent text-ink-subtle hover:text-white",
                                    )}
                                  >
                                    {l.label}
                                    {here && <span className="sr-only"> (current page)</span>}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {/* Short screens: the action bar joins the scroll flow. Compact screens: only the portal link does. */}
              {portal("nav-drawer-inline-portal hidden pt-3")}
              <div className="nav-drawer-inline-actions hidden flex-col gap-1 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">{portal("inline-flex")}{cta}</div>
            </nav>
          )}
        </div>

        {/* Region C — actions (fixed) */}
        <div className="nav-drawer-actions relative flex shrink-0 flex-col gap-1 border-t border-white/[0.08] bg-navy-900/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
          {portal("nav-drawer-pinned-portal inline-flex")}
          {cta}
        </div>
      </dialog>
    </>
  );
}

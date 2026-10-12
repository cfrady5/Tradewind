"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { preload } from "react-dom";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ArrowRight, ArrowUpRight, ChevronDown, Close, Menu } from "@/components/ui/icons";
import { EXTERNAL, NAV, PORTAL } from "@/lib/site-config";

/** Header items: every top-level group except Home (the logo). */
const ITEMS = NAV.filter((g) => g.href !== "/");
import { cn } from "@/lib/cn";

const EASE = [0.22, 1, 0.36, 1] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const navRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduce = useReducedMotion();
  const panelId = useId();

  useEffect(() => {
    // Both lockups are preloaded so the swap on scroll never shows an empty slot.
    preload("/brand/tradewinds-wordmark-navy.png", { as: "image" });
    preload("/brand/tradewinds-wordmark-reversed.png", { as: "image" });
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change (state adjusted during render, not in an effect).
  const [routeSeen, setRouteSeen] = useState(pathname);
  if (routeSeen !== pathname) {
    setRouteSeen(pathname);
    setOpen(null);
  }

  const close = useCallback((refocus = false) => {
    setOpen((cur) => {
      if (refocus && cur !== null) triggerRefs.current[cur]?.focus();
      return null;
    });
  }, []);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close(true);
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, close]);

  const activeIndex = ITEMS.findIndex((g) => pathname === g.href || pathname.startsWith(g.href + "/"));
  const solid = scrolled || open !== null;
  // Pages whose hero is light get navy text at the top instead of the reversed treatment.
  const lightTop = pathname === "/";
  const light = solid || lightTop;
  const group = open !== null ? ITEMS[open] : null;

  const scheduleOpen = (i: number | null) => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpen(i), i === null ? 160 : 90);
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,color] duration-(--duration-ui) ease-(--ease-out)",
        solid ? "bg-white/92 text-navy shadow-[0_1px_0_var(--color-line)] backdrop-blur-xl" : light ? "bg-transparent text-navy" : "on-dark bg-transparent text-white",
      )}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-sm focus:bg-runway focus:px-4 focus:py-2 focus:font-semibold focus:text-navy">
        Skip to content
      </a>
      <div ref={navRef} onMouseLeave={() => scheduleOpen(null)}>
        <div
          className={cn(
            "container-page flex items-center gap-4 transition-[height] duration-(--duration-ui) ease-(--ease-out) 2xl:gap-6",
            scrolled ? "h-16" : "h-19",
          )}
        >
          <Link href="/" className="shrink-0 rounded-sm" aria-label="Tradewinds home">
            {/* One image whose source switches: full-colour lockup on light/solid headers, reversed on dark. */}
            <BrandLogo variant={light ? "wordmark-navy" : "wordmark-reversed"} priority className="w-[160px] sm:w-[186px] xl:w-[164px] 2xl:w-[186px]" />
          </Link>

          <nav aria-label="Primary" className="ml-auto hidden xl:block">
            <ul className="flex items-center gap-0.5">
              {ITEMS.map((g, i) => (
                <li key={g.label} className="relative" onMouseEnter={() => scheduleOpen(g.links.length ? i : null)}>
                  {g.links.length === 0 ? (
                    <Link
                      href={g.href}
                      aria-current={activeIndex === i ? "page" : undefined}
                      className={cn(
                        "relative flex h-10 items-center whitespace-nowrap rounded-sm px-2 text-[0.9375rem] 2xl:px-3.5 font-medium transition-colors duration-(--duration-micro)",
                        light ? "hover:bg-navy/[0.05]" : "hover:bg-white/8",
                      )}
                    >
                      {g.label}
                      {activeIndex === i && (
                        <motion.span layoutId="nav-active" className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-sm bg-runway 2xl:inset-x-3.5" transition={{ duration: reduce ? 0 : 0.35, ease: EASE }} />
                      )}
                    </Link>
                  ) : (
                  <button
                    ref={(el) => { triggerRefs.current[i] = el; }}
                    type="button"
                    aria-expanded={open === i}
                    aria-controls={open === i ? panelId : undefined}
                    onClick={() => setOpen(open === i ? null : i)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setOpen(i);
                        requestAnimationFrame(() => document.querySelector<HTMLAnchorElement>(`#${CSS.escape(panelId)} a`)?.focus());
                      }
                    }}
                    className={cn(
                      "relative flex h-10 items-center gap-1 whitespace-nowrap rounded-sm px-2 text-[0.9375rem] 2xl:px-3.5 font-medium transition-colors duration-(--duration-micro)",
                      light ? "hover:bg-navy/[0.05]" : "hover:bg-white/8",
                      open === i && (light ? "bg-cloud" : "bg-white/8"),
                    )}
                  >
                    {g.label}
                    <ChevronDown width={16} height={16} className={cn("opacity-60 transition-transform duration-(--duration-ui)", open === i && "rotate-180")} />
                    {activeIndex === i && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-sm bg-runway 2xl:inset-x-3.5"
                        transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
                      />
                    )}
                  </button>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2 xl:ml-2">
            <a
              href={EXTERNAL.marketplaceSignIn}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group hidden h-10 items-center gap-1.5 whitespace-nowrap rounded-sm px-4 text-sm font-semibold transition-colors duration-(--duration-ui) sm:inline-flex",
                solid ? "bg-cobalt text-white hover:bg-navy" : "bg-runway text-navy hover:bg-[#ffa957]",
              )}
            >
              Access Marketplace
              <ArrowUpRight width={16} height={16} className="transition-transform duration-(--duration-ui) group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              <span className="sr-only">(opens external site)</span>
            </a>
            <OverlayMenu light={light} />
          </div>
        </div>

        {/* Mega menu panel */}
        <AnimatePresence>
          {group && (
            <motion.div
              key="mega"
              id={panelId}
              initial={reduce ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.24, ease: EASE }}
              className="absolute inset-x-0 top-full hidden border-t border-line bg-white text-navy shadow-lift xl:block"
              onMouseEnter={() => clearTimeout(hoverTimer.current)}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={group.label}
                  initial={reduce ? false : { opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  className="container-page grid grid-cols-12 gap-10 py-10"
                >
                  <div className="col-span-3 border-r border-line pr-8">
                    <p className="eyebrow text-cobalt">{group.label}</p>
                    <p className="mt-4 text-lg font-semibold leading-snug">{group.summary}</p>
                    <Link href={group.href} className="group mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-cobalt hover:text-navy">
                      {group.label} overview
                      <ArrowRight width={16} height={16} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                  <ul className={cn("grid gap-x-8 gap-y-1", group.feature ? "col-span-6 grid-cols-2" : "col-span-9 grid-cols-3")}>
                    {group.links.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          aria-current={pathname === l.href ? "page" : undefined}
                          className="group block rounded-md px-3 py-3 transition-colors duration-(--duration-micro) hover:bg-cloud focus-visible:bg-cloud aria-[current=page]:bg-sky-tint"
                        >
                          <span className="flex items-center gap-1.5 font-semibold">
                            {l.label}
                            <ArrowRight width={14} height={14} className="-translate-x-1 opacity-0 transition-all duration-(--duration-ui) group-hover:translate-x-0 group-hover:opacity-100" />
                          </span>
                          {l.description && <span className="mt-0.5 block text-sm text-ink-muted">{l.description}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {group.feature && (
                    <Link
                      href={group.feature.href}
                      className="group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-lg bg-navy p-6 text-white"
                    >
                      <span className="absolute inset-0 bg-grid-fine opacity-60" aria-hidden />
                      <span className="relative eyebrow text-runway">{group.feature.eyebrow}</span>
                      <span className="relative mt-10 text-xl font-semibold leading-tight">{group.feature.title}</span>
                      <span className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-sky">
                        {group.feature.cta}
                        <ArrowRight width={16} height={16} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </Link>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

/**
 * Full-site menu (rebuild brief §5): a full-screen navy overlay with large uppercase parent rows,
 * hairline dividers, indented child links and a full-width Access the Marketplace button.
 * Available at every width. Native <dialog> gives focus trapping, Escape and an inert page;
 * CSS handles the enter/exit and the staggered rows (instant under reduced motion).
 */
function OverlayMenu({ light }: { light: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  const openMenu = () => {
    ref.current?.showModal();
    setOpen(true);
  };
  // Play the exit animation, then close the native dialog.
  const closeMenu = useCallback(() => {
    const el = ref.current;
    if (!el?.open) return;
    setOpen(false);
    if (reduce) { el.close(); return; }
    const done = () => { el.close(); el.removeEventListener("animationend", done); };
    el.addEventListener("animationend", done);
  }, [reduce]);

  useEffect(() => { closeMenu(); }, [pathname, closeMenu]);

  let k = 0;
  const row = () => ({ "--k": k++ }) as CSSProperties;
  const isCurrent = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

  return (
    <>
      <button
        type="button"
        onClick={openMenu}
        className={cn("group flex h-10 items-center gap-2 rounded-sm px-2.5 text-sm font-semibold transition-colors", light ? "hover:bg-navy/[0.05]" : "hover:bg-white/10")}
        aria-label="Open menu"
        aria-haspopup="dialog"
      >
        {/* Text label only while the compact link row is hidden; the icon is always there. */}
        <span className="hidden sm:inline xl:hidden">Menu</span>
        <Menu className="transition-transform duration-(--duration-ui) group-hover:scale-x-110" />
      </button>
      <dialog
        ref={ref}
        aria-label="Site menu"
        data-state={open ? "open" : "closed"}
        className="menu-overlay on-dark m-0 h-dvh max-h-none w-full max-w-none bg-navy-900 p-0 text-white backdrop:bg-navy-900/50 open:flex open:flex-col"
        onCancel={(e) => { e.preventDefault(); closeMenu(); }}
      >
        <div className="pointer-events-none absolute inset-0 bg-grid-fine opacity-60 [mask-image:radial-gradient(80%_70%_at_50%_0%,black,transparent)]" aria-hidden />
        <div className="relative border-b border-line-dark">
          <div className="container-page flex h-19 items-center justify-between">
            <BrandLogo variant="wordmark-reversed" decorative className="w-[160px] sm:w-[186px]" />
            <button type="button" onClick={closeMenu} className="group flex h-10 items-center gap-2 rounded-sm px-2.5 text-sm font-semibold hover:bg-white/10" aria-label="Close menu" autoFocus>
              <span className="hidden sm:inline">Close</span>
              <Close className="transition-transform duration-(--duration-ui) ease-(--ease-out) group-hover:rotate-90" />
            </button>
          </div>
        </div>

        <nav aria-label="All pages" className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <ul className="container-page">
            {NAV.map((g) => (
              <li key={g.label} className="menu-row border-b border-line-dark" style={row()}>
                <Link
                  href={g.href}
                  aria-current={pathname === g.href ? "page" : undefined}
                  className={cn(
                    "group flex items-center justify-between gap-6 py-4 text-[clamp(1.5rem,1.1rem+1.6vw,2.5rem)] font-extrabold uppercase leading-none tracking-[-0.01em] transition-colors duration-(--duration-micro) sm:py-5",
                    isCurrent(g.href) ? "text-sky" : "text-white hover:text-sky",
                  )}
                >
                  <span className="flex items-center gap-4">
                    {isCurrent(g.href) && <span className="h-0.5 w-6 bg-runway" aria-hidden />}
                    {g.label}
                  </span>
                  <ArrowRight className="shrink-0 -translate-x-2 text-runway opacity-0 transition-[opacity,transform] duration-(--duration-ui) group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
                {g.links.length > 0 && (
                  <ul className="grid gap-x-8 border-l border-line-dark pb-5 pl-5 sm:grid-cols-2 lg:ml-1 lg:grid-cols-4 lg:pl-8">
                    {g.links.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          aria-current={pathname === l.href ? "page" : undefined}
                          className={cn(
                            "link-underline inline-block py-1.5 text-[0.9375rem] transition-colors",
                            pathname === l.href ? "font-semibold text-white" : "text-white/70 hover:text-white",
                          )}
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            <li className="menu-row" style={row()}>
              <Link href={PORTAL.href} className="group inline-flex items-center gap-2 py-5 text-xs font-semibold uppercase tracking-[0.16em] text-ink-subtle transition-colors hover:text-white">
                {PORTAL.label}
                <ArrowRight width={14} height={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </li>
          </ul>
        </nav>

        <div className="menu-row relative border-t border-line-dark" style={row()}>
          <div className="container-page py-4">
            <a
              href={EXTERNAL.marketplaceSignIn}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-14 w-full items-center justify-center gap-2 rounded-sm bg-runway text-base font-bold uppercase tracking-[0.08em] text-navy transition-colors duration-(--duration-ui) hover:bg-[#ffa957]"
            >
              Access the Marketplace
              <ArrowUpRight className="transition-transform duration-(--duration-ui) group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              <span className="sr-only">(opens external site)</span>
            </a>
          </div>
        </div>
      </dialog>
    </>
  );
}

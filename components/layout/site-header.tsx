"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ArrowRight, ArrowUpRight, ChevronDown, Close, Menu } from "@/components/ui/icons";
import { EXTERNAL, NAV } from "@/lib/site-config";
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

  const activeIndex = NAV.findIndex((g) => pathname === g.href || pathname.startsWith(g.href + "/"));
  const solid = scrolled || open !== null;
  // Pages whose hero is light get navy text at the top instead of the reversed treatment.
  const lightTop = pathname === "/";
  const light = solid || lightTop;
  const group = open !== null ? NAV[open] : null;

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
            "container-page flex items-center gap-6 transition-[height] duration-(--duration-ui) ease-(--ease-out)",
            scrolled ? "h-16" : "h-19",
          )}
        >
          <Link href="/" className="shrink-0 rounded-sm" aria-label="Tradewinds home">
            <span className="relative block w-[160px] sm:w-[186px]">
              <BrandLogo variant="wordmark-reversed" priority={!lightTop} className={cn("w-full transition-opacity duration-(--duration-ui)", light && "opacity-0")} decorative={light} />
              <BrandLogo variant="wordmark-navy" priority={lightTop} className={cn("absolute inset-0 w-full transition-opacity duration-(--duration-ui)", !light && "opacity-0")} decorative={!light} />
            </span>
          </Link>

          <nav aria-label="Primary" className="ml-auto hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((g, i) => (
                <li key={g.label} className="relative" onMouseEnter={() => scheduleOpen(i)}>
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
                      "relative flex h-10 items-center gap-1 rounded-sm px-3.5 text-[0.9375rem] font-medium transition-colors duration-(--duration-micro)",
                      light ? "hover:bg-navy/[0.05]" : "hover:bg-white/8",
                      open === i && (light ? "bg-cloud" : "bg-white/8"),
                    )}
                  >
                    {g.label}
                    <ChevronDown width={16} height={16} className={cn("opacity-60 transition-transform duration-(--duration-ui)", open === i && "rotate-180")} />
                    {activeIndex === i && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-sm bg-runway"
                        transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
                      />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-2">
            <a
              href={EXTERNAL.marketplaceSignIn}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group hidden h-10 items-center gap-1.5 rounded-sm px-4 text-sm font-semibold transition-colors duration-(--duration-ui) sm:inline-flex",
                solid ? "bg-cobalt text-white hover:bg-navy" : "bg-runway text-navy hover:bg-[#ffa957]",
              )}
            >
              Marketplace Login
              <ArrowUpRight width={16} height={16} className="transition-transform duration-(--duration-ui) group-group-hover:translate-x-0.5" />
              <span className="sr-only">(opens external site)</span>
            </a>
            <MobileMenu solid={light} />
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
              className="absolute inset-x-0 top-full hidden border-t border-line bg-white text-navy shadow-lift lg:block"
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

function MobileMenu({ solid }: { solid: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  useEffect(() => ref.current?.close(), [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className={cn("grid size-10 place-items-center rounded-sm lg:hidden", solid ? "hover:bg-cloud" : "hover:bg-white/10")}
        aria-label="Open menu"
        aria-haspopup="dialog"
      >
        <Menu />
      </button>
      <dialog
        ref={ref}
        aria-label="Site menu"
        className="m-0 h-dvh max-h-none w-full max-w-none bg-white p-0 text-navy backdrop:bg-navy/40 open:flex open:flex-col lg:hidden"
        onClick={(e) => e.target === ref.current && ref.current?.close()}
      >
        <div className="container-page flex h-16 shrink-0 items-center justify-between border-b border-line">
          <BrandLogo variant="wordmark-navy" className="w-[160px]" />
          <button type="button" onClick={() => ref.current?.close()} className="grid size-10 place-items-center rounded-sm hover:bg-cloud" aria-label="Close menu" autoFocus>
            <Close />
          </button>
        </div>
        <nav aria-label="Mobile" className="container-page flex-1 overflow-y-auto py-4">
          <ul className="divide-y divide-line">
            {NAV.map((g) => (
              <li key={g.label}>
                <details className="group" open={pathname.startsWith(g.href)}>
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between text-lg font-semibold [&::-webkit-details-marker]:hidden">
                    {g.label}
                    <ChevronDown className="transition-transform duration-(--duration-ui) group-open:rotate-180" />
                  </summary>
                  <ul className="pb-4">
                    {g.links.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          aria-current={pathname === l.href ? "page" : undefined}
                          className="flex min-h-11 items-center rounded-md px-3 text-[0.9375rem] text-ink-muted hover:bg-cloud hover:text-navy aria-[current=page]:font-semibold aria-[current=page]:text-cobalt"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ))}
          </ul>
        </nav>
        <div className="container-page grid shrink-0 gap-3 border-t border-line py-4">
          <a href={EXTERNAL.marketplaceSignIn} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center gap-2 rounded-sm bg-cobalt font-semibold text-white">
            Marketplace Login <ArrowUpRight width={18} height={18} />
            <span className="sr-only">(opens external site)</span>
          </a>
          <Link href="/marketplace/providers" className="flex h-12 items-center justify-center rounded-sm border border-navy/20 font-semibold">
            Submit a Solution
          </Link>
        </div>
      </dialog>
    </>
  );
}

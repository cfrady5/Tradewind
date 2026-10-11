import type { CSSProperties } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Clock } from "@/components/ui/icons";
import { formatDate, monthlyDeadline } from "@/lib/data/opportunity-status";
import { formatMetric } from "@/lib/format";
import type { Metric } from "@/lib/data/types";
import { HeroTile } from "./hero-tiles";

const i = (n: number) => ({ "--i": n }) as CSSProperties;

/* Converging pathways into the mission card — coordinates in % of the collage box (extends left by 40%). */
const F = { x: 50, y: 61 };
const STARTS = [8, 22, 36, 50, 64, 78, 92];
const pathFor = (y0: number, k: number) => `M ${k % 2 ? 2 : 10} ${y0} C 26 ${y0}, 36 ${F.y + (y0 - F.y) * 0.35}, ${F.x} ${F.y + (k - 3) * 0.8}`;
const nodeAt = (y0: number) => ({ x: 33, y: y0 * 0.42 + F.y * 0.58 });

function StatIcon({ kind }: { kind: "cube" | "people" | "bolt" | "chart" }) {
  const p = { width: 26, height: 26, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  return (
    <span className="grid size-14 shrink-0 place-items-center rounded-full bg-sky-tint text-cobalt">
      {kind === "cube" && <svg {...p}><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></svg>}
      {kind === "people" && <svg {...p}><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.4" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0M14.5 15.2a4.5 4.5 0 0 1 6 3.8" /></svg>}
      {kind === "bolt" && <svg {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg>}
      {kind === "chart" && <svg {...p}><path d="M5 20V14M10 20V9M15 20v-6M20 20V5M3 20h18" /></svg>}
    </span>
  );
}

export function Hero({ now, metrics }: { now: Date; metrics: Metric[] }) {
  const deadline = monthlyDeadline(now);
  const by = Object.fromEntries(metrics.map((m) => [m.key, m]));
  const awardable = by["awardable"];
  const activities = by["activities"];
  const asOf = awardable ? formatDate(awardable.asOf) : null;

  const stats = [
    awardable && { icon: "cube" as const, value: formatMetric(awardable.value, awardable.format), label: "Solutions determined awardable" },
    activities && { icon: "people" as const, value: formatMetric(activities.value, activities.format), label: "Participating DoW activities" },
    { icon: "bolt" as const, value: "Faster", label: "Acquisition pathways" },
    { icon: "chart" as const, value: "Stronger", label: "Mission outcomes" },
  ].filter(Boolean) as { icon: "cube" | "people" | "bolt" | "chart"; value: string; label: string }[];

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#f7fbff_0%,#eef5fd_55%,#e8f1fb_100%)]">
      {/* Ambient light + fine grid */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_78%_35%,rgb(127_189_242/0.45),transparent_70%),radial-gradient(40%_40%_at_10%_10%,rgb(255_255_255/0.9),transparent_70%)]" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-grid-light opacity-60 [mask-image:radial-gradient(70%_60%_at_50%_40%,black,transparent)]" aria-hidden />

      <div className="container-page grid items-center gap-12 pb-8 pt-[calc(var(--header-h)+2rem)] lg:grid-cols-12 lg:gap-6 lg:pb-10 lg:pt-[calc(var(--header-h)+2rem)]">
        {/* Copy */}
        <div className="relative z-10 lg:col-span-7 xl:col-span-6">
          <h1 id="hero-title" className="text-[clamp(2.6rem,1.3rem+4vw,4.75rem)] font-extrabold leading-[1.03] lg:whitespace-nowrap tracking-[-0.04em] text-navy">
            <span className="enter block" style={i(1)}>Accelerating the</span>
            <span className="enter block" style={i(2)}>Acquisition of</span>
            <span className="enter block" style={i(3)}>
              <span className="bg-gradient-to-r from-cobalt via-signal to-signal bg-clip-text text-transparent">Innovation</span>
              <span className="text-runway">.</span>
            </span>
          </h1>
          <p className="enter mt-7 max-w-xl text-lead text-ink-muted" style={i(4)}>
            Discover, assess, and acquire mission-ready AI, digital, and data-driven technologies through the Tradewinds ecosystem.
          </p>
          <div className="enter mt-9 flex flex-wrap items-center gap-3" style={{ ...i(4), animationDuration: "500ms" }}>
            <ButtonLink href="/marketplace" variant="accent" size="lg" className="shadow-[0_10px_24px_-10px_rgb(249_148_59/0.8)]">Explore the Marketplace</ButtonLink>
            <ButtonLink href="/marketplace/providers" variant="secondary" size="lg" arrow={false} className="bg-white">Submit a Solution</ButtonLink>
          </div>
          <div className="enter mt-5" style={i(5)}>
            <ButtonLink href="#how-it-works" variant="text">See how Tradewinds works</ButtonLink>
          </div>
        </div>

        {/* Collage */}
        <div className="relative lg:col-span-5 xl:col-span-6">
          <div className="relative mx-auto aspect-[10/9] w-full max-w-[640px] lg:mr-[-6%] lg:max-w-none">
            {/* pathway lines (desktop) */}
            <svg viewBox="0 0 140 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-y-0 left-[-40%] hidden h-full w-[140%] lg:block" aria-hidden>
              <defs>
                <linearGradient id="hl" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0" stopColor="#7FBDF2" stopOpacity="0" />
                  <stop offset=".6" stopColor="#337DE5" stopOpacity=".55" />
                  <stop offset="1" stopColor="#004AAD" stopOpacity=".9" />
                </linearGradient>
              </defs>
              {STARTS.map((y0, k) => (
                <path
                  key={y0} d={pathFor(y0, k)} fill="none" stroke="url(#hl)" strokeWidth={k === 3 ? 1.6 : 1}
                  vectorEffect="non-scaling-stroke"
                  className="opacity-0 motion-safe:animate-[fade-in_900ms_var(--ease-out)_forwards] motion-reduce:opacity-100"
                  style={{ animationDelay: `${300 + Math.abs(k - 3) * 90}ms` }}
                />
              ))}
            </svg>
            {STARTS.filter((_, k) => k % 2 === 0).map((y0, k) => {
              const n = nodeAt(y0);
              return (
                <span
                  key={y0} aria-hidden
                  className="absolute hidden size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal opacity-0 shadow-[0_0_0_4px_rgb(51_125_229/0.15)] motion-safe:animate-[fade-in_600ms_var(--ease-out)_forwards] motion-reduce:opacity-100 lg:block"
                  style={{ left: `${((n.x - 40) / 100) * 100}%`, top: `${n.y}%`, animationDelay: `${900 + k * 120}ms` }}
                />
              );
            })}

            {/* tiles — slight 3D tilt toward the copy */}
            <div className="absolute inset-0 [perspective:1600px]">
              <div className="absolute inset-0 [transform:rotateY(-9deg)_rotateX(2deg)] [transform-style:preserve-3d]">
                <div className="enter absolute left-[2%] top-[6%] h-[34%] w-[46%]" style={i(2)}>
                  <HeroTile name="jet" priority sizes="(min-width:1024px) 300px, 45vw" className="h-full w-full -rotate-[3deg]" />
                </div>
                <div className="enter absolute left-[51%] top-[1%] h-[45%] w-[30%]" style={i(3)}>
                  <HeroTile name="satellite" sizes="(min-width:1024px) 200px, 30vw" className="h-full w-full -rotate-[3deg]" />
                </div>
                <div className="enter absolute left-[84%] top-[6%] h-[39%] w-[22%]" style={i(4)}>
                  <HeroTile name="network" sizes="(min-width:1024px) 150px, 22vw" className="h-full w-full -rotate-[3deg]" />
                </div>
                <div className="enter absolute left-[38%] top-[48%] h-[42%] w-[66%]" style={i(5)}>
                  <HeroTile name="ship" sizes="(min-width:1024px) 440px, 66vw" className="h-full w-full -rotate-[2deg]" />
                </div>
              </div>
            </div>

            {/* mission card */}
            <div className="enter absolute left-[8%] top-[39%] z-10 w-[50%] min-w-[220px]" style={i(4)}>
              <div className="relative overflow-hidden rounded-[20px] bg-navy p-[clamp(1.25rem,2.4vw,2.25rem)] text-white shadow-[0_30px_70px_-20px_rgb(2_44_73/0.65)] ring-1 ring-white/10">
                <div className="absolute inset-0 bg-grid-fine opacity-50" aria-hidden />
                <div className="absolute -right-10 -top-10 size-40 rounded-full bg-cobalt/50 blur-2xl" aria-hidden />
                <p className="relative text-[clamp(1.25rem,0.9rem+1.3vw,2rem)] font-extrabold leading-[1.1] tracking-[-0.02em]">
                  Real solutions for real <span className="text-sky">missions</span><span className="text-runway">.</span>
                </p>
                <span className="relative mt-5 block h-0.5 w-10 rounded-full bg-runway" aria-hidden />
                <p className="relative mt-5 text-[clamp(0.875rem,0.8rem+0.3vw,1.0625rem)] leading-relaxed text-white/80">Bridging innovative technology and mission outcomes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="container-page relative z-10 pb-12">
        <div className="enter rounded-2xl border border-white bg-white/90 shadow-[0_20px_50px_-25px_rgb(2_44_73/0.35)] backdrop-blur" style={i(6)}>
          <ul className="grid divide-line sm:grid-cols-2 lg:grid-cols-4 lg:divide-x">
            {stats.map((s) => (
              <li key={s.label} className="flex items-center gap-5 px-7 py-6">
                <StatIcon kind={s.icon} />
                <p className="flex flex-col">
                  <span className="text-[1.75rem] font-extrabold leading-none tracking-[-0.03em] text-navy tabular-nums">{s.value}</span>
                  <span className="mt-1.5 text-[0.9375rem] text-ink-muted">{s.label}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 flex flex-col gap-2 px-2 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2">
            <Clock width={16} height={16} className="text-runway" />
            Current Marketplace collection period closes <strong className="font-semibold text-navy">{formatDate(deadline, true)}</strong>
          </p>
          {asOf && <p className="text-xs">Figures cumulative as of {asOf}{awardable && !awardable.verified && " · pending verification"}</p>}
        </div>
      </div>
    </section>
  );
}

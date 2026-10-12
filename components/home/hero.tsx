import type { CSSProperties } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Clock } from "@/components/ui/icons";
import { formatDate, monthlyDeadline } from "@/lib/data/opportunity-status";
import { formatMetric } from "@/lib/format";
import type { Metric } from "@/lib/data/types";
import { HeroTile } from "./hero-tiles";

const i = (n: number) => ({ "--i": n }) as CSSProperties;

function StatIcon({ kind }: { kind: "cube" | "people" | "bolt" | "chart" }) {
  const p = { width: 26, height: 26, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  return (
    <span className="grid size-11 shrink-0 place-items-center rounded-sm bg-sky-tint text-cobalt">
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
  ].filter(Boolean) as { icon: "cube" | "people" | "bolt" | "chart"; value: string; label: string }[];

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#f7fbff_0%,#eef5fd_55%,#e8f1fb_100%)]">
      {/* Ambient light + fine grid */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_78%_35%,rgb(127_189_242/0.45),transparent_70%),radial-gradient(40%_40%_at_10%_10%,rgb(255_255_255/0.9),transparent_70%)]" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-grid-light opacity-60 [mask-image:radial-gradient(70%_60%_at_50%_40%,black,transparent)]" aria-hidden />

      <div className="container-page grid items-center gap-10 pb-6 pt-[calc(var(--header-h)+1.25rem)] lg:grid-cols-12 lg:gap-6 lg:pb-6 lg:pt-[calc(var(--header-h)+1rem)]">
        {/* Copy */}
        <div className="relative z-10 lg:col-span-7 xl:col-span-6">
          <h1 id="hero-title" className="text-[clamp(2.4rem,1.2rem+3.4vw,4rem)] font-extrabold leading-[1.05] lg:whitespace-nowrap tracking-[-0.04em] text-navy">
            <span className="enter block" style={i(1)}>Accelerating the</span>
            <span className="enter block" style={i(2)}>Acquisition of</span>
            <span className="enter block" style={i(3)}>
              <span className="text-cobalt">Innovation</span>
              <span className="text-runway">.</span>
            </span>
          </h1>
          <p className="enter mt-5 max-w-lg text-[1.0625rem] leading-relaxed text-ink-muted" style={i(4)}>
            Discover, assess, and acquire mission-ready AI, digital, and data-driven technologies through the Tradewinds ecosystem.
          </p>
          <div className="enter mt-7 flex flex-wrap items-center gap-3" style={{ ...i(4), animationDuration: "500ms" }}>
            <ButtonLink href="/marketplace" variant="accent">Explore the Marketplace</ButtonLink>
            <ButtonLink href="/marketplace/providers" variant="secondary" arrow={false} className="bg-white">Submit a Solution</ButtonLink>
          </div>
          <div className="enter mt-4" style={i(5)}>
            <ButtonLink href="#how-it-works" variant="text">See how Tradewinds works</ButtonLink>
          </div>
        </div>

        {/* Collage — slanted left edge; two stripes beneath it slide in opposite directions */}
        <div className="relative lg:col-span-5 xl:col-span-6">
          <div className="relative mx-auto w-full max-w-[560px] lg:ml-auto lg:mr-0 lg:max-w-[600px]">
            {/* Dashed lines parallel to the cut, sliding in opposite directions (desktop only) */}
            <svg viewBox="0 0 100 94" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block" aria-hidden>
              {[
                { d: 4, cls: "animate-[dash-fwd_6s_linear_infinite]", c: "#7FBDF2", o: 0.55 },
                { d: 8.5, cls: "animate-[dash-back_6s_linear_infinite]", c: "#337DE5", o: 0.3 },
                { d: 13, cls: "animate-[dash-fwd_8s_linear_infinite]", c: "#7FBDF2", o: 0.35 },
              ].map((l) => (
                <line
                  key={l.d}
                  x1={-l.d} y1={62} x2={20 - l.d} y2={104}
                  stroke={l.c} strokeOpacity={l.o} strokeWidth={2.4} strokeLinecap="round"
                  strokeDasharray="5 3.5" className={`motion-safe:${l.cls}`}
                />
              ))}
              {/* thin dashed hairline along the slanted edge */}
              <line x1={0} y1={62} x2={20} y2={104} stroke="#337DE5" strokeOpacity={0.5} strokeWidth={0.5} strokeDasharray="1.2 1.2" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="relative grid grid-cols-2 gap-3 lg:gap-4 lg:[clip-path:polygon(0_0,100%_0,100%_100%,20%_100%,0_62%)]">
              <div className="enter col-span-2 aspect-[16/8]" style={i(2)}>
                <HeroTile name="jet" priority sizes="(min-width:1024px) 720px, 100vw" className="h-full w-full" />
              </div>
              <div className="enter aspect-[6/5]" style={i(3)}>
                <HeroTile name="launch" sizes="(min-width:1024px) 350px, 50vw" className="h-full w-full" />
              </div>
              <div className="enter aspect-[6/5]" style={i(4)}>
                <HeroTile name="ship" sizes="(min-width:1024px) 350px, 50vw" className="h-full w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="container-page relative z-10 pb-10">
        <div className="enter rounded-md border border-line bg-white shadow-card" style={i(6)}>
          <ul className="grid divide-line sm:grid-cols-2 sm:divide-x lg:grid-cols-4">
            {[...stats, ...stats].map((s, k) => (
              <li key={`${s.label}-${k}`} className="flex items-center gap-4 px-6 py-5" aria-hidden={k >= stats.length || undefined}>
                <StatIcon kind={s.icon} />
                <p className="flex flex-col">
                  <span className="text-[1.5rem] font-extrabold leading-none tracking-[-0.03em] text-navy tabular-nums">{s.value}</span>
                  <span className="mt-1 text-sm text-ink-muted">{s.label}</span>
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

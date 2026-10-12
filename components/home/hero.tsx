import type { CSSProperties } from "react";
import { ButtonLink } from "@/components/ui/button";
import { formatDate } from "@/lib/data/opportunity-status";
import { Counter } from "@/components/ui/counter";
import type { Metric } from "@/lib/data/types";
import { EXTERNAL } from "@/lib/site-config";
import { HeroTile } from "./hero-tiles";

const i = (n: number) => ({ "--i": n }) as CSSProperties;

type StatKind = "cube" | "people" | "upload" | "chart";
function StatIcon({ kind }: { kind: StatKind }) {
  const p = { width: 26, height: 26, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  return (
    <span className="grid size-11 shrink-0 place-items-center rounded-sm bg-sky-tint text-cobalt">
      {kind === "cube" && <svg {...p}><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></svg>}
      {kind === "people" && <svg {...p}><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.4" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0M14.5 15.2a4.5 4.5 0 0 1 6 3.8" /></svg>}
      {kind === "upload" && <svg {...p}><path d="M12 16V4m0 0 5 5m-5-5-5 5M4 20h16" /></svg>}
      {kind === "chart" && <svg {...p}><path d="M5 20V14M10 20V9M15 20v-6M20 20V5M3 20h18" /></svg>}
    </span>
  );
}

export function Hero({ metrics }: { metrics: Metric[] }) {
  const by = Object.fromEntries(metrics.map((m) => [m.key, m]));
  const awardable = by["awardable"];
  const asOf = awardable ? formatDate(awardable.asOf) : null;

  const stat = (key: string, icon: StatKind, label: string) => {
    const m = by[key];
    return m ? { icon, value: m.value, format: m.format, label } : null;
  };
  const stats = [
    stat("activities", "people", "Participating organizations"),
    stat("awardable", "cube", "Awardable solutions"),
    stat("submitted", "upload", "Submitted solutions"),
    stat("award-value", "chart", "Award value facilitated"),
  ].filter(Boolean) as { icon: StatKind; value: number; format: Metric["format"]; label: string }[];

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#f7fbff_0%,#eef5fd_55%,#e8f1fb_100%)]">
      {/* Ambient light + fine grid */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_78%_35%,rgb(127_189_242/0.45),transparent_70%),radial-gradient(40%_40%_at_10%_10%,rgb(255_255_255/0.9),transparent_70%)]" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-grid-light opacity-60 [mask-image:radial-gradient(70%_60%_at_50%_40%,black,transparent)]" aria-hidden />

      <div className="container-page grid items-center gap-10 pb-6 pt-[calc(var(--header-h)+1.25rem)] lg:grid-cols-12 lg:gap-6 lg:pb-6 lg:pt-[calc(var(--header-h)+1rem)]">
        {/* Copy */}
        <div className="relative z-10 lg:col-span-7 xl:col-span-6">
          <h1 id="hero-title" className="text-[clamp(2.4rem,1.2rem+3.4vw,4rem)] font-extrabold leading-[1.05] lg:whitespace-nowrap tracking-[-0.04em] text-navy">
            {/* Three measured lines on large screens; a naturally wrapping sentence below that. */}
            <span className="enter inline lg:block" style={i(1)}>Accelerating access</span>{" "}
            <span className="enter inline lg:block" style={i(2)}>to evaluated AI and</span>{" "}
            <span className="enter inline lg:block" style={i(3)}>
              <span className="text-cobalt">data solutions</span>
              <span className="text-runway">.</span>
            </span>
          </h1>
          <p className="enter mt-5 max-w-lg text-[1.0625rem] leading-relaxed text-ink-muted" style={i(4)}>
            A defense acquisition ecosystem that helps government teams discover, assess and award AI, digital and data capabilities faster — and gives solution providers a clearer path to visibility.
          </p>
          <div className="enter mt-7 flex flex-wrap items-center gap-3" style={{ ...i(4), animationDuration: "500ms" }}>
            <ButtonLink href={EXTERNAL.marketplaceSignIn} external variant="accent">Access Marketplace</ButtonLink>
            <ButtonLink href="/marketplace/providers" variant="secondary" arrow={false} className="bg-white">Submit a Solution</ButtonLink>
          </div>
          <div className="enter mt-4" style={i(5)}>
            <ButtonLink href="/opportunities" variant="text">View Opportunities</ButtonLink>
          </div>
        </div>

        {/* Collage — slanted left edge; two stripes beneath it slide in opposite directions */}
        <div className="relative lg:col-span-5 xl:col-span-6">
          <div className="relative mx-auto w-full max-w-[560px] lg:ml-auto lg:mr-0 lg:max-w-[600px]">
            <div className="relative grid grid-cols-2 gap-3 lg:gap-4 lg:[clip-path:polygon(0_0,100%_0,100%_100%,10%_100%,0_80%)]">
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
            {stats.map((s) => (
              <li key={s.label} className="flex items-center gap-4 px-6 py-5">
                <StatIcon kind={s.icon} />
                <p className="flex flex-col">
                  <span className="text-[1.5rem] font-extrabold leading-none tracking-[-0.03em] text-navy tabular-nums"><Counter value={s.value} format={s.format} /></span>
                  <span className="mt-1 text-sm text-ink-muted">{s.label}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
        {asOf && <p className="mt-3 px-2 text-right text-xs text-ink-muted">Cumulative as of {asOf}{awardable && !awardable.verified && " · pending verification"}</p>}
      </div>
    </section>
  );
}

import { Pathways } from "@/components/brand/pathways";
import { ButtonLink } from "@/components/ui/button";
import { ChevronDown, Clock } from "@/components/ui/icons";
import { formatDate, monthlyDeadline } from "@/lib/data/opportunity-status";
import type { CSSProperties } from "react";

const i = (n: number) => ({ "--i": n }) as CSSProperties;

export function Hero({ now }: { now: Date }) {
  const deadline = monthlyDeadline(now);
  return (
    <section className="on-dark relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-hero text-white" aria-labelledby="hero-title">
      <div className="absolute inset-0 -z-10 bg-grid-fine [mask-image:radial-gradient(80%_70%_at_70%_40%,black,transparent)]" aria-hidden />
      <Pathways variant="hero" className="absolute inset-0 -z-10 h-full w-full opacity-40 [mask-image:linear-gradient(to_right,transparent_8%,black_60%)] md:left-[8%] md:opacity-100 lg:left-[14%]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-navy-900/80 to-transparent" aria-hidden />

      <div className="container-page flex flex-1 flex-col justify-center pb-16 pt-[calc(var(--header-h)+3rem)]">
        <div className="max-w-[46rem]">
          <p className="enter eyebrow flex items-center gap-3 text-sky" style={i(0)}>
            <span className="h-px w-8 bg-runway" aria-hidden />
            Chief Digital and AI Office · Tradewinds
          </p>
          <h1 id="hero-title" className="mt-7 text-display font-extrabold">
            <span className="enter block" style={i(1)}>Accelerating the</span>
            <span className="enter block" style={i(2)}>Acquisition of</span>
            <span className="enter block text-gradient-sky" style={i(3)}>Innovation.</span>
          </h1>
          <p className="enter mt-8 max-w-xl text-lead text-white/80" style={i(4)}>
            Discover, assess, and acquire mission-ready AI, digital, and data-driven technologies through the Tradewinds ecosystem.
          </p>
          {/* CTAs: short delay only — always interactive. */}
          <div className="enter mt-10 flex flex-wrap items-center gap-3" style={{ ...i(4), animationDuration: "500ms" }}>
            <ButtonLink href="/marketplace" variant="accent" size="lg">Explore the Marketplace</ButtonLink>
            <ButtonLink href="/marketplace/providers" variant="secondary-dark" size="lg" arrow={false}>Submit a Solution</ButtonLink>
            <ButtonLink href="#how-it-works" variant="text-dark" className="ml-2">See how Tradewinds works</ButtonLink>
          </div>
        </div>
      </div>

      <div className="enter container-page pb-8" style={i(7)}>
        <div className="flex flex-col gap-4 border-t border-line-dark pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2.5 text-white/80">
            <Clock width={18} height={18} className="text-runway" />
            <span>
              Current Marketplace collection period closes <strong className="font-semibold text-white">{formatDate(deadline, true)}</strong>
            </span>
          </p>
          <a href="#paths" className="group hidden items-center gap-2 text-ink-subtle hover:text-white sm:flex">
            Explore
            <ChevronDown width={18} height={18} className="motion-safe:animate-[nudge_2.4s_var(--ease-in-out)_infinite]" />
          </a>
        </div>
      </div>
    </section>
  );
}

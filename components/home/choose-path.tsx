import Link from "next/link";
import { ArrowRight, Search } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";

const STEPS = ["Prepare", "Submit", "Assess", "Awardable"];
const RESULTS = [
  { k: "Computer Vision", w: "w-2/5" },
  { k: "Predictive Analytics", w: "w-1/3" },
  { k: "Data Engineering", w: "w-1/4" },
];

export function ChoosePath() {
  return (
    <section id="paths" aria-labelledby="paths-title" className="section-y bg-white">
      <div className="container-page">
        <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow flex items-center gap-3 text-cobalt"><span className="h-px w-8 bg-cobalt" aria-hidden />Choose your path</p>
            <h2 id="paths-title" className="mt-5 max-w-2xl text-h2 font-bold">Two journeys. One ecosystem.</h2>
          </div>
          <p className="max-w-sm text-lead text-ink-muted">Start where you are — Tradewinds routes buyers and builders to exactly what they need.</p>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          {/* Government */}
          <Reveal>
            <Link
              href="/marketplace/government"
              className="group relative flex h-full min-h-[30rem] flex-col overflow-hidden rounded-xl border border-line bg-cloud/60 p-8 transition-[border-color,box-shadow] duration-(--duration-ui) ease-(--ease-out) hover:border-signal/60 hover:shadow-lift md:p-10"
            >
              <span className="eyebrow text-cobalt">For Government Buyers</span>
              <h3 className="mt-4 max-w-md text-h3 font-bold">Discover capabilities that address your mission.</h3>

              {/* Visual: capability search */}
              <span className="relative mt-10 block rounded-lg border border-line bg-white p-4 shadow-card" aria-hidden>
                <span className="flex h-11 items-center gap-3 rounded-md border border-line px-3 text-sm text-ink-muted">
                  <Search width={18} height={18} className="text-cobalt" />
                  Search mission capabilities
                  <span className="ml-auto h-5 w-px bg-cobalt motion-safe:animate-[pulse-node_1.2s_steps(2)_infinite]" />
                </span>
                <span className="mt-3 block space-y-2">
                  {RESULTS.map((r, i) => (
                    <span
                      key={r.k}
                      className="flex items-center gap-3 rounded-md px-2 py-2 transition-[transform,background-color] duration-(--duration-enter) ease-(--ease-out) group-hover:bg-sky-tint/60"
                      style={{ transitionDelay: `${i * 60}ms` }}
                    >
                      <span className="size-2 rounded-full bg-signal" />
                      <span className="whitespace-nowrap text-sm font-semibold text-navy">{r.k}</span>
                      <span className={`ml-auto h-1.5 rounded-full bg-cloud ${r.w}`}>
                        <span className="block h-full w-0 rounded-full bg-cobalt transition-[width] duration-700 ease-(--ease-out) group-hover:w-full" style={{ transitionDelay: `${120 + i * 80}ms` }} />
                      </span>
                    </span>
                  ))}
                </span>
              </span>

              <span className="mt-auto flex items-center gap-2 pt-10 font-semibold text-cobalt">
                Explore Government Solutions
                <ArrowRight className="transition-transform duration-(--duration-ui) group-hover:translate-x-1.5" />
              </span>
            </Link>
          </Reveal>

          {/* Industry */}
          <Reveal delay={0.08}>
            <Link
              href="/marketplace/providers"
              className="on-dark group relative flex h-full min-h-[30rem] flex-col overflow-hidden rounded-xl bg-navy p-8 text-white transition-shadow duration-(--duration-ui) hover:shadow-glow md:p-10"
            >
              <span className="absolute inset-0 bg-grid-fine opacity-70" aria-hidden />
              <span className="absolute -right-24 -top-24 size-72 rounded-full bg-cobalt/50 blur-3xl transition-transform duration-700 ease-(--ease-out) group-hover:scale-125" aria-hidden />
              <span className="relative eyebrow text-runway">For Solution Providers</span>
              <h3 className="relative mt-4 max-w-md text-h3 font-bold">Bring your technology to the mission.</h3>

              {/* Visual: submission progression */}
              <span className="relative mt-10 block rounded-lg border border-line-dark bg-white/[0.04] p-6 backdrop-blur-sm" aria-hidden>
                <span className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                  <span>Submission</span><span className="text-runway">≤ 5:00 pitch</span>
                </span>
                <span className="relative mt-6 block">
                  <span className="absolute left-2 right-2 top-[7px] h-0.5 bg-white/10" />
                  <span className="absolute left-2 top-[7px] h-0.5 w-[8%] bg-gradient-to-r from-signal to-runway transition-[width] duration-1000 ease-(--ease-out) group-hover:w-[calc(100%-1rem)]" />
                  <span className="relative flex justify-between">
                    {STEPS.map((s, i) => (
                      <span key={s} className="flex flex-col items-center gap-3">
                        <span
                          className="size-4 rounded-full border-2 border-sky/50 bg-navy transition-[background-color,border-color] duration-(--duration-ui) group-hover:border-runway group-hover:bg-runway"
                          style={{ transitionDelay: `${i * 220}ms` }}
                        />
                        <span className="text-xs font-semibold text-white/80">{s}</span>
                      </span>
                    ))}
                  </span>
                </span>
                <span className="mt-6 grid grid-cols-3 gap-3 border-t border-line-dark pt-5 text-xs text-ink-subtle">
                  <span><strong className="block text-sm font-semibold text-white">Monthly</strong>collection periods</span>
                  <span><strong className="block text-sm font-semibold text-white">Expert</strong>peer/SME panels</span>
                  <span><strong className="block text-sm font-semibold text-white">Feedback</strong>on every outcome</span>
                </span>
              </span>

              <span className="relative mt-auto flex items-center gap-2 pt-10 font-semibold text-sky group-hover:text-white">
                Learn How to Submit
                <ArrowRight className="transition-transform duration-(--duration-ui) group-hover:translate-x-1.5" />
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

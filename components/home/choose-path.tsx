import { DotTitle } from "@/components/brand/dot-title";
import Link from "next/link";
import { ArrowRight, Layers, Search, Spark } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";

const STEPS = ["Submit", "Assess", "Awardable", "Discovered"];
const RESULTS = [
  { k: "Computer Vision", w: "w-2/5" },
  { k: "Predictive Analytics", w: "w-1/3" },
  { k: "Data Engineering", w: "w-1/4" },
];
const PATHWAYS = ["DRAID", "AI Talent 2.0", "T&E"];

/** User pathways (brief §6.1): government buyers, solution providers, acquisition professionals. */
export function ChoosePath() {
  return (
    <section id="paths" aria-labelledby="paths-title" className="section-y bg-white">
      <div className="container-page">
        <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 id="paths-title" className="max-w-2xl text-h2 font-bold"><DotTitle>{"Choose your path."}</DotTitle></h2>
          <p className="max-w-sm text-lead text-ink-muted">Three defined routes through one acquisition ecosystem.</p>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {/* Government buyer */}
          <Reveal>
            <Link
              href="/marketplace/government"
              className="group relative flex h-full min-h-[29rem] flex-col overflow-hidden rounded-xl border border-line bg-cloud/60 p-8 transition-[border-color,box-shadow] duration-(--duration-ui) ease-(--ease-out) hover:border-signal/60 hover:shadow-lift"
            >
              <span className="eyebrow text-cobalt">Government buyer</span>
              <h3 className="mt-4 text-h3 font-bold">Search evaluated solutions.</h3>
              <p className="mt-3 text-ink-muted">Search evaluated solutions, view awardable vendors and request acquisition support.</p>

              <span className="relative mt-8 block rounded-lg border border-line bg-white p-4 shadow-card" aria-hidden>
                <span className="flex h-10 items-center gap-3 rounded-md border border-line px-3 text-sm text-ink-muted">
                  <Search width={16} height={16} className="text-cobalt" />
                  Search mission capabilities
                  <span className="ml-auto h-5 w-px bg-cobalt motion-safe:animate-[pulse-node_1.2s_steps(2)_infinite]" />
                </span>
                <span className="mt-3 block space-y-1.5">
                  {RESULTS.map((r, i) => (
                    <span
                      key={r.k}
                      className="flex items-center gap-3 rounded-md px-2 py-1.5 transition-[background-color] duration-(--duration-enter) ease-(--ease-out) group-hover:bg-sky-tint/60"
                      style={{ transitionDelay: `${i * 60}ms` }}
                    >
                      <span className="size-2 rounded-full bg-signal" />
                      <span className="whitespace-nowrap text-sm font-semibold text-navy">{r.k}</span>
                      <span className={`ml-auto h-1.5 rounded-sm bg-cloud ${r.w}`}>
                        <span className="block h-full w-0 rounded-sm bg-cobalt transition-[width] duration-700 ease-(--ease-out) group-hover:w-full" style={{ transitionDelay: `${120 + i * 80}ms` }} />
                      </span>
                    </span>
                  ))}
                </span>
              </span>

              <span className="mt-auto flex items-center gap-2 pt-8 font-semibold text-cobalt">
                Start as a buyer
                <ArrowRight className="transition-transform duration-(--duration-ui) group-hover:translate-x-1.5" />
              </span>
            </Link>
          </Reveal>

          {/* Solution provider */}
          <Reveal delay={0.08}>
            <Link
              href="/marketplace/providers"
              className="on-dark group relative flex h-full min-h-[29rem] flex-col overflow-hidden rounded-xl bg-navy p-8 text-white transition-shadow duration-(--duration-ui) hover:shadow-glow"
            >
              <span className="absolute inset-0 bg-grid-fine opacity-70" aria-hidden />
              <span className="relative eyebrow text-runway">Solution provider</span>
              <h3 className="relative mt-4 text-h3 font-bold">Submit once. Get assessed.</h3>
              <p className="relative mt-3 text-white/75">Submit a five-minute pitch, get assessed and become discoverable to government users.</p>

              <span className="relative mt-8 block rounded-lg border border-line-dark bg-white/[0.04] p-5 backdrop-blur-sm" aria-hidden>
                <span className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                  <span>Submission</span><span className="text-runway">≤ 5:00 pitch</span>
                </span>
                <span className="relative mt-5 block">
                  <span className="absolute left-2 right-2 top-[7px] h-0.5 bg-white/10" />
                  <span className="absolute left-2 top-[7px] h-0.5 w-[8%] bg-gradient-to-r from-signal to-runway transition-[width] duration-1000 ease-(--ease-out) group-hover:w-[calc(100%-1rem)]" />
                  <span className="relative flex justify-between">
                    {STEPS.map((s, i) => (
                      <span key={s} className="flex flex-col items-center gap-2.5">
                        <span
                          className="size-4 rounded-sm border-2 border-sky/50 bg-navy transition-[background-color,border-color] duration-(--duration-ui) group-hover:border-runway group-hover:bg-runway"
                          style={{ transitionDelay: `${i * 220}ms` }}
                        />
                        <span className="text-[0.7rem] font-semibold text-white/80">{s}</span>
                      </span>
                    ))}
                  </span>
                </span>
              </span>

              <span className="relative mt-auto flex items-center gap-2 pt-8 font-semibold text-sky group-hover:text-white">
                Learn how to submit
                <ArrowRight className="transition-transform duration-(--duration-ui) group-hover:translate-x-1.5" />
              </span>
            </Link>
          </Reveal>

          {/* Acquisition professional */}
          <Reveal delay={0.16}>
            <Link
              href="/contract-vehicles"
              className="group relative flex h-full min-h-[29rem] flex-col overflow-hidden rounded-xl border border-line bg-white p-8 transition-[border-color,box-shadow] duration-(--duration-ui) ease-(--ease-out) hover:border-signal/60 hover:shadow-lift"
            >
              <span className="eyebrow text-cobalt">Acquisition professional</span>
              <h3 className="mt-4 text-h3 font-bold">Move faster with confidence.</h3>
              <p className="mt-3 text-ink-muted">Use guides, contract vehicles and AI tools built for acquisition work.</p>

              <span className="relative mt-8 block space-y-2" aria-hidden>
                {PATHWAYS.map((v, i) => (
                  <span
                    key={v}
                    className="flex items-center justify-between rounded-md border border-line bg-cloud/50 px-4 py-2.5 text-sm transition-transform duration-(--duration-ui) ease-(--ease-out) group-hover:translate-x-1.5"
                    style={{ transitionDelay: `${i * 60}ms` }}
                  >
                    <span className="flex items-center gap-2 font-semibold text-navy"><Layers width={16} height={16} className="text-cobalt" />{v}</span>
                    <span className="text-xs font-semibold text-ink-muted">Vehicle</span>
                  </span>
                ))}
                <span className="flex items-center gap-2 rounded-md border border-dashed border-cobalt/40 px-4 py-2.5 text-sm font-semibold text-cobalt transition-colors duration-(--duration-ui) group-hover:bg-sky-tint/60">
                  <Spark width={16} height={16} className="text-runway" /> AI Playground · prompt library
                </span>
              </span>

              <span className="mt-auto flex items-center gap-2 pt-8 font-semibold text-cobalt">
                Vehicles and tools
                <ArrowRight className="transition-transform duration-(--duration-ui) group-hover:translate-x-1.5" />
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

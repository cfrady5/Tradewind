"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const EASE = [0.22, 1, 0.36, 1] as const;

const STAGES = [
  {
    key: "discover",
    title: "Discover",
    lead: "Technology enters the ecosystem.",
    body: "Solution providers submit five-minute video pitches during monthly collection periods. Every submission joins a structured field of AI, digital and data-analytics capabilities.",
  },
  {
    key: "assess",
    title: "Assess",
    lead: "Experts separate signal from noise.",
    body: "Peer and subject-matter-expert panels assess each pitch. Solutions that meet the bar are determined awardable and placed in the Marketplace; others receive feedback and may resubmit.",
  },
  {
    key: "connect",
    title: "Connect",
    lead: "Mission needs meet proven capability.",
    body: "Government buyers with .gov or .mil access search awardable pitch videos. Special Topics and Shopping Notices focus the field on specific mission challenges.",
  },
  {
    key: "acquire",
    title: "Acquire",
    lead: "From discovery to award, faster.",
    body: "Because solutions were assessed through a competitive process, buyers work with their contracting office to select an award mechanism and move to award — with Tradewinds support along the way.",
  },
] as const;

/* ---------------- geometry (viewBox 640×480) ---------------- */
const GATE_X = 292;
const NEEDS = [{ x: 566, y: 130 }, { x: 566, y: 240 }, { x: 566, y: 350 }];
const AWARD = { x: 548, y: 240 };
const SOLUTIONS = Array.from({ length: 15 }, (_, i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  const jx = [8, -10, 4, -6, 12, -4, 6, -12, 2, 10, -8, 0, -2, 6, -10][i];
  const jy = [-6, 10, -2, 6, -10, 4, 12, -8, 0, -4, 8, -12, 6, -6, 2][i];
  return { x: 70 + col * 72 + jx, y: 70 + row * 84 + jy };
});
const SELECTED = [1, 4, 6, 8, 10, 13];
const MATCHED: Record<number, number> = { 4: 0, 8: 1, 13: 2 };
const assessPos = (k: number) => ({ x: 380, y: 90 + k * 60 });
const acquirePos = (n: number) => ({ x: 452, y: 210 + n * 30 });

function nodeState(i: number, stage: number) {
  const base = SOLUTIONS[i];
  const k = SELECTED.indexOf(i);
  const matched = MATCHED[i];
  if (stage === 0) return { ...base, r: 5, fill: "#7FBDF2", opacity: 0.95 };
  if (k === -1) return { ...base, r: 4, fill: "#7FBDF2", opacity: stage === 1 ? 0.28 : 0.14 };
  if (stage === 1) return { ...assessPos(k), r: 6, fill: "#337DE5", opacity: 1 };
  if (stage === 2) return { ...assessPos(k), r: matched !== undefined ? 7 : 5, fill: matched !== undefined ? "#7FBDF2" : "#337DE5", opacity: matched !== undefined ? 1 : 0.4 };
  if (matched !== undefined) return { ...acquirePos(matched), r: 6, fill: "#7FBDF2", opacity: 1 };
  return { ...assessPos(k), r: 4, fill: "#337DE5", opacity: 0.18 };
}

const curve = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const mx = (a.x + b.x) / 2;
  return `M${a.x} ${a.y} C${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}`;
};

const NETWORK = SOLUTIONS.flatMap((s, i) => {
  const out: string[] = [];
  if (i % 3 !== 2) out.push(`M${s.x} ${s.y} L${SOLUTIONS[i + 1].x} ${SOLUTIONS[i + 1].y}`);
  if (i + 3 < SOLUTIONS.length) out.push(`M${s.x} ${s.y} L${SOLUTIONS[i + 3].x} ${SOLUTIONS[i + 3].y}`);
  return out;
});

function JourneyVisual({ stage }: { stage: number }) {
  const reduce = useReducedMotion();
  const t = (delay = 0) => ({ duration: reduce ? 0 : 0.8, ease: EASE, delay: reduce ? 0 : delay });
  const label = (show: boolean) => ({ opacity: show ? 1 : 0.25 });

  return (
    <svg viewBox="0 0 640 480" className="h-auto w-full" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="hw-award"><stop offset="0" stopColor="#F9943B" stopOpacity="0.5" /><stop offset="1" stopColor="#F9943B" stopOpacity="0" /></radialGradient>
      </defs>

      {/* column labels */}
      <g fontSize="11" fontWeight="600" letterSpacing="1.8" fill="#A9BED0">
        <motion.text x={142} y={26} textAnchor="middle" animate={label(stage === 0)} transition={t()}>TECHNOLOGY SOLUTIONS</motion.text>
        <motion.text x={GATE_X} y={26} textAnchor="middle" animate={label(stage === 1)} transition={t()}>ASSESSMENT</motion.text>
        <motion.text x={566} y={26} textAnchor="middle" animate={label(stage >= 2)} transition={t()}>MISSION NEEDS</motion.text>
      </g>

      {/* discovery network */}
      <motion.g stroke="#7FBDF2" strokeWidth="1" animate={{ opacity: stage === 0 ? 0.35 : 0.08 }} transition={t()}>
        {NETWORK.map((d) => <path key={d} d={d} />)}
      </motion.g>

      {/* assessment gate */}
      <motion.g animate={{ opacity: stage >= 1 ? 1 : 0.2 }} transition={t()}>
        <line x1={GATE_X} x2={GATE_X} y1={50} y2={440} stroke="#7FBDF2" strokeOpacity="0.35" strokeDasharray="3 7" />
        <motion.rect x={GATE_X - 3} width={6} rx={3} fill="#337DE5" animate={{ y: stage === 1 ? 60 : 50, height: stage === 1 ? 360 : 0 }} transition={t(0.1)} />
      </motion.g>

      {/* mission needs */}
      {NEEDS.map((n, j) => (
        <motion.g key={j} initial={false} animate={{ opacity: stage === 2 ? 1 : stage === 3 ? 0.25 : 0 }} transition={t(0.15 + j * 0.08)}>
          <circle cx={n.x} cy={n.y} r="20" fill="none" stroke="#F9943B" strokeOpacity="0.35" />
          <rect x={n.x - 7} y={n.y - 7} width="14" height="14" rx="3" fill="#F9943B" transform={`rotate(45 ${n.x} ${n.y})`} />
        </motion.g>
      ))}

      {/* connections: matched solution → need */}
      {Object.entries(MATCHED).map(([i, j]) => (
        <motion.path
          key={`c-${i}`}
          d={curve(assessPos(SELECTED.indexOf(Number(i))), NEEDS[j])}
          fill="none" stroke="#F9943B" strokeWidth="1.75"
          initial={false}
          animate={{ pathLength: stage === 2 ? 1 : 0, opacity: stage === 2 ? 0.9 : 0 }}
          transition={t(0.25 + j * 0.1)}
        />
      ))}

      {/* acquisition: matched → award → outcome */}
      {Object.values(MATCHED).map((j) => (
        <motion.path
          key={`a-${j}`}
          d={curve(acquirePos(j), AWARD)}
          fill="none" stroke="#7FBDF2" strokeWidth="1.5"
          initial={false}
          animate={{ pathLength: stage === 3 ? 1 : 0, opacity: stage === 3 ? 0.9 : 0 }}
          transition={t(0.3)}
        />
      ))}
      <motion.g initial={false} animate={{ opacity: stage === 3 ? 1 : 0, scale: stage === 3 ? 1 : 0.6 }} style={{ transformOrigin: `${AWARD.x}px ${AWARD.y}px` }} transition={t(0.45)}>
        <circle cx={AWARD.x} cy={AWARD.y} r="64" fill="url(#hw-award)" />
        <circle cx={AWARD.x} cy={AWARD.y} r="22" fill="#022C49" stroke="#F9943B" strokeWidth="2" />
        <circle cx={AWARD.x} cy={AWARD.y} r="7" fill="#F9943B" />
        <text x={AWARD.x} y={AWARD.y + 50} textAnchor="middle" fontSize="11" fontWeight="600" letterSpacing="1.8" fill="#F9943B">AWARD</text>
      </motion.g>
      <motion.path
        d={`M${AWARD.x + 22} ${AWARD.y} L640 ${AWARD.y}`}
        stroke="#F9943B" strokeWidth="2.5" strokeLinecap="round"
        initial={false}
        animate={{ pathLength: stage === 3 ? 1 : 0 }}
        transition={t(0.7)}
      />

      {/* solution nodes */}
      {SOLUTIONS.map((_, i) => {
        const s = nodeState(i, stage);
        return (
          <motion.circle
            key={i}
            initial={false}
            animate={{ cx: s.x, cy: s.y, r: s.r, fill: s.fill, opacity: s.opacity }}
            transition={t(SELECTED.includes(i) ? SELECTED.indexOf(i) * 0.05 : 0)}
          />
        );
      })}
    </svg>
  );
}

export function HowItWorks() {
  const [stage, setStage] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  const reduce = useReducedMotion();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setStage(Number((e.target as HTMLElement).dataset.stage));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const goTo = (i: number) => {
    setStage(i);
    refs.current[i]?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  };

  return (
    <section id="how-it-works" aria-labelledby="how-title" className="on-dark relative bg-navy text-white">
      <div className="absolute inset-0 bg-grid-fine opacity-60 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]" aria-hidden />
      <div className="container-page relative section-y">
        <div className="max-w-3xl">
          <p className="eyebrow flex items-center gap-3 text-runway"><span className="h-px w-8 bg-runway" aria-hidden />How Tradewinds works</p>
          <h2 id="how-title" className="mt-5 text-h2 font-bold">One pathway from discovery to award.</h2>
          <p className="mt-6 text-lead text-white/75">Four stages turn a crowded technology landscape into a clear procurement outcome.</p>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Sticky visual — desktop */}
          <div className="hidden lg:col-span-7 lg:block">
            <div className="sticky top-[calc(var(--header-h)+2rem)] rounded-xl border border-line-dark bg-navy-900/60 p-6 shadow-glow backdrop-blur">
              <JourneyVisual stage={stage} />
              <div className="mt-4 flex items-center gap-2 border-t border-line-dark pt-4" role="group" aria-label="Journey stages">
                {STAGES.map((s, i) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={stage === i ? "step" : undefined}
                    className={cn(
                      "relative flex-1 rounded-md px-3 py-2.5 text-left text-sm font-semibold transition-colors duration-(--duration-ui)",
                      stage === i ? "text-white" : "text-ink-subtle hover:text-white",
                    )}
                  >
                    {stage === i && <motion.span layoutId="stage-pill" className="absolute inset-0 -z-0 rounded-md bg-white/[0.08] ring-1 ring-sky/30" transition={{ duration: reduce ? 0 : 0.35, ease: EASE }} />}
                    <span className="relative"><span className="mr-2 font-mono text-xs text-runway">0{i + 1}</span>{s.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Steps — vertical stepper on all sizes; drives the visual on desktop */}
          <ol className="relative lg:col-span-5">
            <span className="absolute bottom-6 left-[19px] top-6 w-px bg-gradient-to-b from-signal via-sky/40 to-runway" aria-hidden />
            {STAGES.map((s, i) => (
              <li
                key={s.key}
                ref={(el) => { refs.current[i] = el; }}
                data-stage={i}
                className="relative flex gap-6 pb-14 last:pb-0 lg:min-h-[56vh] lg:pb-0 lg:pt-[14vh] lg:first:pt-0"
              >
                <span
                  className={cn(
                    "relative z-10 grid size-10 shrink-0 place-items-center rounded-full border font-mono text-sm font-bold transition-[background-color,border-color,color] duration-(--duration-ui)",
                    stage === i ? "border-runway bg-runway text-navy" : "border-sky/40 bg-navy text-sky",
                  )}
                  aria-hidden
                >
                  0{i + 1}
                </span>
                <div className={cn("transition-opacity duration-(--duration-enter)", stage === i ? "lg:opacity-100" : "lg:opacity-40")}>
                  <h3 className="text-h3 font-bold">{s.title}</h3>
                  <p className="mt-2 text-lg font-semibold text-sky">{s.lead}</p>
                  <p className="mt-4 text-white/75">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

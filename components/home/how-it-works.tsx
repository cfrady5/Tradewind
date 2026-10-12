"use client";

import { DotTitle } from "@/components/brand/dot-title";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useReducedMotion } from "motion/react";
import { memo, useEffect, useRef, useState } from "react";
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

/* ------------------------------------------------------------------ geometry
 * One progress value p ∈ [0,1] determines every attribute below, so the same
 * scroll position always produces the same frame — forward or reverse.
 * 0–.25 Discover · .25–.5 Assess · .5–.75 Connect · .75–1 Acquire
 */
const SIZE = 600;
const C = SIZE / 2;
const SIGNAL = "#337DE5";
const RUNWAY = "#F9943B";
const NODE_R = 9;

type Ring = { r: number; color: string; dir: 1 | -1; turns: number; start: number; count: number };
const RINGS: Ring[] = [
  { r: 240, color: SIGNAL, dir: 1, turns: 0.75, start: -90, count: 4 },
  { r: 185, color: RUNWAY, dir: -1, turns: 0.9, start: -30, count: 3 },
  { r: 130, color: SIGNAL, dir: 1, turns: 1.1, start: 20, count: 2 },
  { r: 74, color: RUNWAY, dir: -1, turns: 1.3, start: -90, count: 1 },
];

type Node = { id: string; ring: number; base: number };
const NODES: Node[] = RINGS.flatMap((ring, ri) =>
  Array.from({ length: ring.count }, (_, k) => ({ id: `r${ri}n${k}`, ring: ri, base: ring.start + (360 / ring.count) * k })),
);
const CANDIDATES = ["r0n0", "r0n2"]; // shortlisted in Assess
const CHOSEN = "r0n0"; // becomes the match in Connect, the award in Acquire

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);
const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const bump = (p: number, center: number, width: number) => Math.max(0, 1 - Math.abs(p - center) / width);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Cumulative rotation of a ring. Angular velocity ∝ (1-p)^1.4: fast in Discover,
 *  decelerating through Assess, slow in Connect, near-stop in Acquire. */
const rotation = (ring: Ring, p: number) => ring.dir * ring.turns * 360 * (1 - Math.pow(1 - p, 2.4));
const angleOn = (ri: number, base: number, p: number) => base + rotation(RINGS[ri], p);

type NodeFrame = { x: number; y: number; color: string; opacity: number; glow: number; r: number };

function nodeFrame(n: Node, p: number): NodeFrame {
  const own = RINGS[n.ring];
  let color = own.color;
  let opacity = n.ring === 0 ? 0.95 : 0.7;
  let glow = 0;
  let radius = own.r;
  let angle = angleOn(n.ring, n.base, p);

  const isCand = CANDIDATES.includes(n.id);
  const isChosen = n.id === CHOSEN;
  const acquire = seg(p, 0.76, 0.91);

  if (n.ring === 0) {
    if (!isCand) {
      // The field narrows: unselected outer nodes dim rather than vanish.
      opacity = lerp(0.95, 0.3, smooth(seg(p, 0.27, 0.4)));
    } else {
      // Shortlisted: emphasised, then carried in to ring 2.
      glow = smooth(seg(p, 0.27, 0.38));
      opacity = 1;
      const toR2 = inOut(seg(p, 0.36, 0.5));
      radius = lerp(RINGS[0].r, RINGS[1].r, toR2);
      angle = lerp(angleOn(0, n.base, p), angleOn(1, n.base, p), toR2);

      if (isChosen) {
        // The match: turns orange as the scan passes, then descends to ring 3.
        const toR3 = inOut(seg(p, 0.64, 0.75));
        radius = lerp(radius, RINGS[2].r, toR3);
        angle = lerp(angle, angleOn(2, n.base, p), toR3);
        const orange = smooth(seg(p, 0.6, 0.68));
        color = orange > 0.5 ? RUNWAY : SIGNAL;
        glow = Math.max(glow, orange);
        // Award: from orbit to the centre.
        const toCenter = inOut(seg(p, 0.78, 0.92));
        radius = lerp(radius, 0, toCenter);
        glow = Math.max(glow, toCenter);
      } else {
        // The runner-up recedes once the match is identified.
        opacity = lerp(1, 0.4, smooth(seg(p, 0.62, 0.72)));
        glow *= 1 - smooth(seg(p, 0.6, 0.7));
        opacity *= 1 - 0.55 * acquire;
      }
    }
  } else {
    opacity *= 1 - 0.55 * acquire;
  }

  // Connect: nodes light briefly as the scanning line crosses them.
  const scan = scanFrame(p);
  if (scan.opacity > 0 && !(isChosen && p > 0.64)) {
    const d = Math.abs((((angle - scan.angle) % 360) + 540) % 360 - 180);
    const flash = Math.max(0, 1 - d / 22) * scan.opacity;
    glow = Math.max(glow, flash * 0.9);
    opacity = Math.min(1, opacity + flash * 0.5);
  }

  return { x: C + radius * Math.cos(rad(angle)), y: C + radius * Math.sin(rad(angle)), color, opacity, glow, r: NODE_R };
}

function scanFrame(p: number) {
  const t = seg(p, 0.52, 0.72);
  const opacity = Math.min(smooth(seg(p, 0.5, 0.54)), 1 - smooth(seg(p, 0.7, 0.75)));
  return { angle: -90 + 360 * t, opacity: opacity * 0.9 };
}

function ringFrame(ri: number, p: number) {
  const base = 0.2;
  const illuminate = ri === 1 ? 0.35 * bump(p, 0.43, 0.1) : 0; // the active ring glows briefly in Assess
  const fade = 1 - 0.45 * seg(p, 0.76, 0.9);
  return { opacity: (base + illuminate) * fade, width: ri === 1 && illuminate > 0 ? 1 + illuminate : 1 };
}

function pulseFrame(p: number) {
  const t = seg(p, 0.88, 1);
  return { r: lerp(12, 120, inOut(t)), opacity: t > 0 ? 0.55 * (1 - t) : 0 };
}

/* ------------------------------------------------------------- SVG (memoised)
 * Rendered once at p = 0 for SSR; afterwards updated imperatively through refs
 * so scroll frames never re-render React.
 */
type Refs = {
  nodes: Map<string, { g: SVGGElement; glow: SVGCircleElement; ring: SVGCircleElement }>;
  rings: SVGCircleElement[];
  scan: SVGLineElement | null;
  pulse: SVGCircleElement | null;
};

function paint(refs: Refs, p: number, glowScale: number) {
  RINGS.forEach((_, ri) => {
    const el = refs.rings[ri];
    if (!el) return;
    const f = ringFrame(ri, p);
    el.setAttribute("stroke-opacity", f.opacity.toFixed(3));
    el.setAttribute("stroke-width", f.width.toFixed(2));
  });
  for (const n of NODES) {
    const el = refs.nodes.get(n.id);
    if (!el) continue;
    const f = nodeFrame(n, p);
    el.g.setAttribute("transform", `translate(${f.x.toFixed(2)} ${f.y.toFixed(2)})`);
    el.g.setAttribute("opacity", f.opacity.toFixed(3));
    el.ring.setAttribute("stroke", f.color);
    el.glow.setAttribute("fill", f.color);
    el.glow.setAttribute("fill-opacity", (f.glow * 0.16 * glowScale).toFixed(3));
  }
  if (refs.scan) {
    const s = scanFrame(p);
    refs.scan.setAttribute("transform", `rotate(${s.angle.toFixed(2)} ${C} ${C})`);
    refs.scan.setAttribute("stroke-opacity", s.opacity.toFixed(3));
  }
  if (refs.pulse) {
    const pu = pulseFrame(p);
    refs.pulse.setAttribute("r", pu.r.toFixed(2));
    refs.pulse.setAttribute("stroke-opacity", pu.opacity.toFixed(3));
  }
}

type Register = {
  ring: (i: number, el: SVGCircleElement | null) => void;
  node: (id: string, el: SVGGElement | null) => void;
  scan: (el: SVGLineElement | null) => void;
  pulse: (el: SVGCircleElement | null) => void;
};

const OrbitSvg = memo(function OrbitSvg({ register }: { register: Register }) {
  const p0 = 0;
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="orbit-scan" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7FBDF2" stopOpacity="0" />
          <stop offset="1" stopColor="#7FBDF2" />
        </linearGradient>
      </defs>

      {RINGS.map((ring, ri) => (
        <circle
          key={ring.r}
          ref={(el) => register.ring(ri, el)}
          cx={C} cy={C} r={ring.r}
          fill="none" stroke={ring.color} strokeWidth={1} strokeOpacity={ringFrame(ri, p0).opacity}
          vectorEffect="non-scaling-stroke"
        />
      ))}

      <line
        ref={(el) => register.scan(el)}
        x1={C} y1={C} x2={C + RINGS[0].r + 10} y2={C}
        stroke="url(#orbit-scan)" strokeWidth={1} strokeOpacity={0} strokeLinecap="round"
        transform={`rotate(-90 ${C} ${C})`}
        vectorEffect="non-scaling-stroke"
      />

      <circle
        ref={(el) => register.pulse(el)}
        cx={C} cy={C} r={12} fill="none" stroke={RUNWAY} strokeWidth={1.25} strokeOpacity={0}
        vectorEffect="non-scaling-stroke"
      />

      {NODES.map((n) => {
        const f = nodeFrame(n, p0);
        return (
          <g
            key={n.id}
            ref={(el) => register.node(n.id, el)}
            transform={`translate(${f.x.toFixed(2)} ${f.y.toFixed(2)})`}
            opacity={f.opacity}
          >
            <circle r={NODE_R * 2.6} fill={f.color} fillOpacity={0} />
            <circle r={NODE_R} fill="#022C49" stroke={f.color} strokeWidth={1.75} vectorEffect="non-scaling-stroke" />
          </g>
        );
      })}
    </svg>
  );
});

/* ------------------------------------------------------------------ section */
const stageCenter = (i: number) => (i + 0.5) / 4;

export function HowItWorks() {
  const [stage, setStage] = useState(0);
  const reduce = useReducedMotion();
  const refs = useRef<Refs>({ nodes: new Map(), rings: [], scan: null, pulse: null });
  const [register] = useState<Register>(() => ({
    ring: (i, el) => { if (el) refs.current.rings[i] = el; },
    node: (id, el) => {
      if (!el) { refs.current.nodes.delete(id); return; }
      refs.current.nodes.set(id, { g: el, glow: el.firstElementChild as SVGCircleElement, ring: el.lastElementChild as SVGCircleElement });
    },
    scan: (el) => { refs.current.scan = el; },
    pulse: (el) => { refs.current.pulse = el; },
  }));
  const pinRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const proxyRef = useRef({ p: 0 });
  const modeRef = useRef<"pinned" | "stages">("stages");
  const stageRef = useRef(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const coarse = window.matchMedia("(max-width: 1023px)").matches;
    const glowScale = coarse ? 0.5 : 1;
    const draw = (p: number) => {
      paint(refs.current, p, glowScale);
      const s = Math.min(3, Math.floor(p * 4));
      if (s !== stageRef.current) { stageRef.current = s; setStage(s); }
    };
    draw(0);

    const mm = gsap.matchMedia();

    // Desktop: pin the two-column block and scrub one master timeline through the four stages.
    mm.add("(min-width: 1024px) and (min-height: 760px) and (prefers-reduced-motion: no-preference)", () => {
      modeRef.current = "pinned";
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinRef.current,
          start: "top 92px",
          end: "+=320%",
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      tl.to(proxyRef.current, { p: 1, ease: "none", duration: 1, onUpdate: () => draw(proxyRef.current.p) });
      triggerRef.current = tl.scrollTrigger ?? null;
      return () => { triggerRef.current = null; };
    });

    // Everything else: stage-based. Steps in view select the stage; the visual tweens to that
    // stage's resting state (or jumps straight to it under reduced motion).
    mm.add("(max-width: 1023px), (max-height: 759px), (prefers-reduced-motion: reduce)", (ctx) => {
      modeRef.current = "stages";
      const reduced = ctx.conditions?.["(prefers-reduced-motion: reduce)"] ?? false;
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            const i = Number((e.target as HTMLElement).dataset.stage);
            if (reduced) { proxyRef.current.p = stageCenter(i); draw(proxyRef.current.p); }
            else gsap.to(proxyRef.current, { p: stageCenter(i), duration: 1.4, ease: "power2.inOut", overwrite: true, onUpdate: () => draw(proxyRef.current.p) });
          }
        },
        { rootMargin: "-40% 0px -40% 0px" },
      );
      stepRefs.current.forEach((el) => el && io.observe(el));
      return () => io.disconnect();
    });

    return () => mm.revert();
  }, []);

  const goTo = (i: number) => {
    const st = triggerRef.current;
    if (modeRef.current === "pinned" && st) {
      window.scrollTo({ top: st.start + (st.end - st.start) * stageCenter(i), behavior: reduce ? "auto" : "smooth" });
      return;
    }
    stepRefs.current[i]?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  };

  return (
    <section id="how-it-works" aria-labelledby="how-title" className="on-dark relative bg-navy text-white">
      <div className="absolute inset-0 bg-grid-fine opacity-60 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]" aria-hidden />
      <div className="container-page relative section-y">
        <div className="max-w-3xl">
          <h2 id="how-title" className="text-h2 font-bold"><DotTitle>{"One pathway from discovery to award."}</DotTitle></h2>
          <p className="mt-6 text-lead text-white/75">Four stages turn a crowded technology landscape into a clear procurement outcome.</p>
        </div>

        <div ref={pinRef} className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:items-center lg:gap-16">
          {/* Orbital visualization */}
          <div className="lg:col-span-7">
            <div className="flex flex-col rounded-xl border border-line-dark bg-navy-900 p-4 shadow-glow sm:p-6 lg:h-[min(640px,calc(100svh-var(--header-h)-6.5rem))] lg:bg-navy-900/70 lg:backdrop-blur">
              <div className="min-h-0 lg:flex-1">
                <div className="mx-auto aspect-square w-full max-w-[420px] lg:h-full lg:w-auto lg:max-w-full">
                  <OrbitSvg register={register} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 border-t border-line-dark pt-3 sm:gap-2 sm:pt-4" role="group" aria-label="Journey stages">
                {STAGES.map((s, i) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={stage === i ? "step" : undefined}
                    className={cn(
                      "relative flex-1 rounded-md px-2 py-2 text-left text-xs font-semibold transition-colors duration-(--duration-ui) sm:px-3 sm:py-2.5 sm:text-sm",
                      stage === i ? "text-white" : "text-ink-subtle hover:text-white",
                    )}
                  >
                    {stage === i && <motion.span layoutId="stage-pill" className="absolute inset-0 -z-0 rounded-md bg-white/[0.08] ring-1 ring-sky/30" transition={{ duration: reduce ? 0 : 0.35, ease: EASE }} />}
                    <span className="relative"><span className="mr-1.5 font-mono text-[0.65rem] text-runway sm:mr-2 sm:text-xs">0{i + 1}</span>{s.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Process timeline */}
          <ol className="relative lg:col-span-5">
            <span className="absolute bottom-6 left-[19px] top-6 w-px bg-gradient-to-b from-signal via-sky/40 to-runway" aria-hidden />
            {STAGES.map((s, i) => (
              <li
                key={s.key}
                ref={(el) => { stepRefs.current[i] = el; }}
                data-stage={i}
                className="relative flex gap-6 pb-12 last:pb-0 lg:pb-8"
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
                <div className={cn("transition-opacity duration-(--duration-enter)", stage === i ? "opacity-100" : "lg:opacity-40")}>
                  <h3 className="text-h3 font-bold">{s.title}</h3>
                  <p className="mt-1.5 text-lg font-semibold text-sky">{s.lead}</p>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-white/75">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

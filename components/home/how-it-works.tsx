"use client";

import { DotTitle } from "@/components/brand/dot-title";
import { ButtonLink } from "@/components/ui/button";
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
 * Two inputs drive every frame:
 *   t — seconds on a clock: the rings spin continuously, independent of scroll.
 *   p — scroll progress ∈ [0,1]: selection state only. Same p ⇒ same selection,
 *       so scrolling backwards reverses it exactly.
 * 0–.25 Discover · .25–.5 Assess (highlight) · .5–.75 Connect (pull out) · .75–1 Acquire (select)
 */
const SIZE = 600;
const C = SIZE / 2;
const SIGNAL = "#337DE5";
const RUNWAY = "#F9943B";
const SKY = "#7FBDF2";
const NODE_R = 7;
const FILL = 0.15; // share of each ring's circumference occupied by nodes

type Ring = { r: number; color: string; dir: 1 | -1; speed: number };
const RINGS: Ring[] = [
  { r: 240, color: SIGNAL, dir: 1, speed: 4.5 },   // deg/s — outer clockwise
  { r: 185, color: RUNWAY, dir: -1, speed: 6 },
  { r: 130, color: SIGNAL, dir: 1, speed: 8 },
  { r: 74, color: RUNWAY, dir: -1, speed: 11 },
];

type Node = { id: string; ring: number; base: number };
const NODES: Node[] = RINGS.flatMap((ring, ri) => {
  const count = Math.round((FILL * 2 * Math.PI * ring.r) / (NODE_R * 2));
  const step = 360 / count;
  return Array.from({ length: count }, (_, k) => {
    // Deterministic jitter so the population reads as organic, never overlapping.
    const jitter = (Math.sin((ri + 1) * 7.3 + k * 2.1) * 0.5) * step * 0.45;
    return { id: `r${ri}n${k}`, ring: ri, base: ri * 23 + k * step + jitter };
  });
});

// Assess highlights these; Connect pulls them out; Acquire takes three of them.
const HIGHLIGHT = ["r0n1", "r0n5", "r0n9", "r0n13", "r1n2", "r1n8", "r2n1", "r2n6"];
const CHOSEN = ["r0n5", "r1n8", "r2n1"];
const STAGING_R = 42; // holding orbit inside the innermost ring
const CLUSTER_R = 24; // final cluster around the centre

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);
const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const bump = (p: number, center: number, width: number) => Math.max(0, 1 - Math.abs(p - center) / width);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rad = (deg: number) => (deg * Math.PI) / 180;
const polar = (r: number, deg: number) => ({ x: C + r * Math.cos(rad(deg)), y: C + r * Math.sin(rad(deg)) });

/** Spin eases toward a near-stop once the award is made. */
const spinScale = (p: number) => 1 - 0.7 * smooth(seg(p, 0.78, 0.95));

type NodeFrame = { x: number; y: number; color: string; opacity: number; glow: number };

function nodeFrame(n: Node, p: number, t: number): NodeFrame {
  const ring = RINGS[n.ring];
  const orbit = polar(ring.r, n.base + ring.dir * ring.speed * t * spinScale(p));
  let { x, y } = orbit;
  let color = ring.color;
  let opacity = n.ring === 0 ? 0.9 : 0.7;
  let glow = 0;

  const hi = HIGHLIGHT.indexOf(n.id);
  const chosen = CHOSEN.indexOf(n.id);
  if (hi === -1) {
    // The wider field recedes as the story narrows.
    opacity *= lerp(1, 0.45, smooth(seg(p, 0.27, 0.4)));
    // Once the pull-in begins the background field fades out completely so nothing
    // overlaps the gathered nodes; it fades back in as the user scrolls up.
    opacity *= 1 - smooth(seg(p, 0.54, 0.7));
    return { x, y, color, opacity, glow };
  }

  // Assess — highlighted.
  glow = smooth(seg(p, 0.27 + hi * 0.012, 0.37 + hi * 0.012));
  opacity = 1;

  // Connect — pulled out of its ring onto a slow holding orbit.
  const pull = inOut(seg(p, 0.5 + hi * 0.012, 0.64 + hi * 0.012));
  const hold = polar(STAGING_R, hi * (360 / HIGHLIGHT.length) + 9 * t * spinScale(p));
  x = lerp(x, hold.x, pull);
  y = lerp(y, hold.y, pull);
  color = pull > 0.5 ? SKY : color;

  if (chosen === -1) {
    // Pulled but not selected: stays in the holding orbit and fades back.
    opacity = lerp(1, 0.3, smooth(seg(p, 0.8, 0.9)));
    glow *= 1 - smooth(seg(p, 0.78, 0.86));
    return { x, y, color, opacity, glow };
  }

  // Acquire — three are selected and drawn into the centre.
  const orange = smooth(seg(p, 0.77 + chosen * 0.015, 0.83 + chosen * 0.015));
  color = orange > 0.5 ? RUNWAY : color;
  const gather = inOut(seg(p, 0.82 + chosen * 0.015, 0.93 + chosen * 0.015));
  const final = polar(CLUSTER_R, -90 + chosen * 120 + 6 * t * spinScale(p));
  x = lerp(x, final.x, gather);
  y = lerp(y, final.y, gather);
  glow = Math.max(glow, orange);
  return { x, y, color, opacity: 1, glow };
}

function ringFrame(ri: number, p: number) {
  const base = 0.2;
  const illuminate = 0.3 * bump(p, 0.33, 0.1) * (ri === 0 ? 1 : 0.4); // outer ring lifts as highlights appear
  const fade = 1 - 0.45 * seg(p, 0.76, 0.9);
  return { opacity: (base + illuminate) * fade };
}

function pulseFrame(p: number) {
  const t = seg(p, 0.9, 1);
  return { r: lerp(20, 130, inOut(t)), opacity: t > 0 ? 0.5 * (1 - t) : 0 };
}

/* ------------------------------------------------------------- SVG (memoised)
 * Rendered once at t = 0, p = 0 for SSR; afterwards updated imperatively through
 * refs on a GSAP ticker so frames never re-render React.
 */
type Refs = {
  nodes: Map<string, { g: SVGGElement; glow: SVGCircleElement; ring: SVGCircleElement }>;
  rings: SVGCircleElement[];
  pulse: SVGCircleElement | null;
};

function paint(refs: Refs, p: number, t: number, glowScale: number) {
  RINGS.forEach((_, ri) => {
    const el = refs.rings[ri];
    if (el) el.setAttribute("stroke-opacity", ringFrame(ri, p).opacity.toFixed(3));
  });
  for (const n of NODES) {
    const el = refs.nodes.get(n.id);
    if (!el) continue;
    const f = nodeFrame(n, p, t);
    el.g.setAttribute("transform", `translate(${f.x.toFixed(2)} ${f.y.toFixed(2)})`);
    el.g.setAttribute("opacity", f.opacity.toFixed(3));
    el.ring.setAttribute("stroke", f.color);
    el.glow.setAttribute("fill", f.color);
    el.glow.setAttribute("fill-opacity", (f.glow * 0.16 * glowScale).toFixed(3));
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
  pulse: (el: SVGCircleElement | null) => void;
};

const OrbitSvg = memo(function OrbitSvg({ register }: { register: Register }) {
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full" aria-hidden="true" focusable="false">
      {RINGS.map((ring, ri) => (
        <circle
          key={ring.r}
          ref={(el) => register.ring(ri, el)}
          cx={C} cy={C} r={ring.r}
          fill="none" stroke={ring.color} strokeWidth={1} strokeOpacity={ringFrame(ri, 0).opacity}
          vectorEffect="non-scaling-stroke"
        />
      ))}

      <circle
        ref={(el) => register.pulse(el)}
        cx={C} cy={C} r={20} fill="none" stroke={RUNWAY} strokeWidth={1.25} strokeOpacity={0}
        vectorEffect="non-scaling-stroke"
      />

      {NODES.map((n) => {
        const f = nodeFrame(n, 0, 0);
        return (
          <g key={n.id} ref={(el) => register.node(n.id, el)} transform={`translate(${f.x.toFixed(2)} ${f.y.toFixed(2)})`} opacity={f.opacity}>
            <circle r={NODE_R * 2.6} fill={f.color} fillOpacity={0} />
            <circle r={NODE_R} fill="#022C49" stroke={f.color} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
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
  const refs = useRef<Refs>({ nodes: new Map(), rings: [], pulse: null });
  const [register] = useState<Register>(() => ({
    ring: (i, el) => { if (el) refs.current.rings[i] = el; },
    node: (id, el) => {
      if (!el) { refs.current.nodes.delete(id); return; }
      refs.current.nodes.set(id, { g: el, glow: el.firstElementChild as SVGCircleElement, ring: el.lastElementChild as SVGCircleElement });
    },
    pulse: (el) => { refs.current.pulse = el; },
  }));
  const pinRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const proxyRef = useRef({ p: 0 });
  const modeRef = useRef<"pinned" | "stages">("stages");
  const stageRef = useRef(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const coarse = window.matchMedia("(max-width: 1023px)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const glowScale = coarse ? 0.5 : 1;
    let clock = 0;
    const draw = (p: number) => {
      paint(refs.current, p, clock, glowScale);
      const s = Math.min(3, Math.floor(p * 4));
      if (s !== stageRef.current) { stageRef.current = s; setStage(s); }
    };
    draw(0);

    // Continuous spin: runs only while the section is on screen, never under reduced motion.
    let visible = false;
    const tick = (_time: number, delta: number) => {
      if (!visible) return;
      clock += delta / 1000;
      draw(proxyRef.current.p);
    };
    const vis = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: "100px" });
    if (sectionRef.current) vis.observe(sectionRef.current);
    if (!reducedMotion) gsap.ticker.add(tick);

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

    return () => {
      gsap.ticker.remove(tick);
      vis.disconnect();
      mm.revert();
    };
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
    <section ref={sectionRef} id="how-it-works" aria-labelledby="how-title" className="on-dark relative bg-navy text-white">
      <div className="absolute inset-0 bg-grid-fine opacity-60 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]" aria-hidden />
      <div className="container-page relative section-y">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <h2 id="how-title" className="text-h2 font-bold"><DotTitle>{"One pathway from discovery to award."}</DotTitle></h2>
            <p className="mt-6 max-w-2xl text-lead text-white/75">
              The Marketplace is a repository of evaluated, post-competition pitch videos. Vendors submit short pitches, expert assessors review them against stated criteria, and awardable solutions become discoverable to government users.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end lg:pb-2">
            <ButtonLink href="/marketplace" variant="accent">Explore the Marketplace</ButtonLink>
            <ButtonLink href="/marketplace/providers" variant="secondary-dark" arrow={false}>Submit a Solution</ButtonLink>
          </div>
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
                    "relative z-10 grid size-10 shrink-0 place-items-center rounded-sm border font-mono text-sm font-bold transition-[background-color,border-color,color] duration-(--duration-ui)",
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

import { cn } from "@/lib/cn";

/**
 * Signature Tradewinds motif: many technology pathways converging on a single point,
 * then resolving into one directional outcome — Discover → Assess → Connect → Acquire.
 * Inspired by the monogram's directional geometry; it is NOT the logo.
 *
 * Pure SVG + CSS animation (no JS). Uses pathLength=1 so draw/pulse timing is
 * independent of geometry. Reduced motion: drawn instantly, pulses hidden.
 */

const W = 1200;
const H = 800;
const F = { x: 820, y: 400 };
const STARTS = [70, 150, 235, 315, 400, 485, 565, 650, 730];

type Pt = { x: number; y: number };
const bez = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
};

const inbound = STARTS.map((y0, i) => {
  const end = { x: F.x, y: F.y + (i - 4) * 2.5 };
  const p0 = { x: -20, y: y0 };
  const p1 = { x: 260, y: y0 };
  const p2 = { x: 560, y: y0 * 0.25 + F.y * 0.75 };
  return {
    d: `M${p0.x} ${p0.y} C${p1.x} ${p1.y} ${p2.x} ${p2.y} ${end.x} ${end.y}`,
    nodes: [bez(p0, p1, p2, end, 0.32), bez(p0, p1, p2, end, 0.62)],
    i,
  };
});

const STAGES = [
  { x: 150, label: "Discover" },
  { x: 470, label: "Assess" },
  { x: F.x, label: "Connect" },
  { x: 1090, label: "Acquire" },
];

export function Pathways({
  variant = "hero",
  className,
  labels = false,
}: {
  variant?: "hero" | "cta" | "page";
  className?: string;
  labels?: boolean;
}) {
  const id = `pw-${variant}`;
  const dim = variant === "hero" ? 1 : variant === "cta" ? 0.55 : 0.7;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={cn("pointer-events-none select-none", className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-in`} x1="0" y1="0" x2={F.x} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7FBDF2" stopOpacity="0" />
          <stop offset="0.45" stopColor="#7FBDF2" stopOpacity={0.35 * dim} />
          <stop offset="1" stopColor="#337DE5" stopOpacity={0.95 * dim} />
        </linearGradient>
        <linearGradient id={`${id}-out`} x1={F.x} y1="0" x2={W} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F9943B" />
          <stop offset="1" stopColor="#F9943B" stopOpacity="0.15" />
        </linearGradient>
        <radialGradient id={`${id}-focal`}>
          <stop offset="0" stopColor="#337DE5" stopOpacity={0.55 * dim} />
          <stop offset="1" stopColor="#337DE5" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Stage guides */}
      {labels &&
        STAGES.map((s, i) => (
          <g key={s.label} className="opacity-0 motion-safe:animate-[fade-in_800ms_var(--ease-out)_forwards] motion-reduce:opacity-100" style={{ animationDelay: `${900 + i * 160}ms` }}>
            <line x1={s.x} x2={s.x} y1={110} y2={H - 90} stroke="#7FBDF2" strokeOpacity="0.12" strokeDasharray="2 8" />
            <text x={s.x} y={H - 56} textAnchor="middle" fill="#A9BED0" fontSize="13" fontWeight="600" letterSpacing="2.6">
              {`0${i + 1}  ${s.label.toUpperCase()}`}
            </text>
          </g>
        ))}

      {/* Focal glow */}
      <circle cx={F.x} cy={F.y} r="190" fill={`url(#${id}-focal)`} />

      {/* Inbound pathways */}
      <g fill="none" strokeLinecap="round">
        {inbound.map((p) => (
          <path
            key={p.i}
            d={p.d}
            pathLength={1}
            stroke={`url(#${id}-in)`}
            strokeWidth={p.i === 4 ? 1.8 : 1.15}
            strokeDasharray="1"
            strokeDashoffset="1"
            className="animate-draw"
            style={{ animationDelay: `${120 + Math.abs(p.i - 4) * 90}ms` }}
          />
        ))}
      </g>

      {/* Signal pulses travelling toward the focal point */}
      <g fill="none" strokeLinecap="round" className="motion-reduce:hidden">
        {inbound
          .filter((p) => p.i % 2 === 0)
          .map((p, k) => (
            <path
              key={p.i}
              d={p.d}
              pathLength={1}
              stroke="#7FBDF2"
              strokeOpacity={0.9 * dim}
              strokeWidth="2"
              strokeDasharray="0.05 0.95"
              strokeDashoffset="1"
              className="animate-[travel_5.5s_linear_infinite_both]"
              style={{ animationDelay: `${1800 + k * 1100}ms` }}
            />
          ))}
      </g>

      {/* Waypoint nodes */}
      <g>
        {inbound.flatMap((p) =>
          p.nodes.map((n, j) => (
            <circle
              key={`${p.i}-${j}`}
              cx={n.x}
              cy={n.y}
              r={j === 1 ? 3 : 2.25}
              fill={j === 1 ? "#7FBDF2" : "#337DE5"}
              fillOpacity={dim}
              className="opacity-0 motion-safe:animate-[fade-in_600ms_var(--ease-out)_forwards] motion-reduce:opacity-100"
              style={{ animationDelay: `${700 + p.i * 60 + j * 240}ms` }}
            />
          )),
        )}
      </g>

      {/* Outcome vector */}
      <path
        d={`M${F.x} ${F.y} C ${F.x + 120} ${F.y}, ${F.x + 220} ${F.y}, ${W + 20} ${F.y}`}
        pathLength={1}
        fill="none"
        stroke={`url(#${id}-out)`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="1"
        strokeDashoffset="1"
        className="animate-draw"
        style={{ animationDelay: "1300ms" }}
      />

      {/* Focal node */}
      <g style={{ transformOrigin: `${F.x}px ${F.y}px` }}>
        <circle cx={F.x} cy={F.y} r="34" fill="none" stroke="#7FBDF2" strokeOpacity={0.25 * dim} className="origin-center [transform-box:fill-box] motion-safe:animate-[ring_4s_var(--ease-out)_infinite]" />
        <circle cx={F.x} cy={F.y} r="16" fill="#022C49" stroke="#337DE5" strokeWidth="1.5" />
        <circle cx={F.x} cy={F.y} r="5.5" fill="#F9943B" />
      </g>
    </svg>
  );
}

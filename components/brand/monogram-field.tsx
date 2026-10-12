import { cn } from "@/lib/cn";

/**
 * Background motif: the approved Tradewinds monogram with radial lines whose pulses
 * travel slowly in toward its centre. The monogram is the official PNG export, placed
 * as an <image> — never redrawn. Pure SVG/CSS; pulses are hidden under reduced motion.
 */
const W = 1200;
const H = 800;
const LOGO_W = 220;
const LOGO_H = Math.round(LOGO_W * (160 / 166)); // intrinsic ratio of the exported monogram
const LINES = 18;
const R_OUT = 1000; // comfortably beyond the viewBox on every side
const R_IN = LOGO_W * 0.78; // pulses vanish just outside the mark
// Centre of the mark per placement, chosen to sit clear of foreground content.
const CENTRE = { cta: { cx: 960, cy: 400 }, page: { cx: 900, cy: 295 } };

export function MonogramField({ variant = "cta", className }: { variant?: "cta" | "page"; className?: string }) {
  const { cx, cy } = CENTRE[variant];
  const id = `mf-${variant}`;
  const lines = Array.from({ length: LINES }, (_, i) => {
    const a = ((i / LINES) * 360 + 7) * (Math.PI / 180);
    return {
      i,
      x1: cx + Math.cos(a) * R_OUT, y1: cy + Math.sin(a) * R_OUT,
      x2: cx + Math.cos(a) * R_IN, y2: cy + Math.sin(a) * R_IN,
    };
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={cn("pointer-events-none select-none", className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`${id}-line`} gradientUnits="userSpaceOnUse" cx={cx} cy={cy} r={R_OUT}>
          <stop offset="0" stopColor="#7FBDF2" stopOpacity="0.32" />
          <stop offset="0.45" stopColor="#7FBDF2" stopOpacity="0.1" />
          <stop offset="1" stopColor="#7FBDF2" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-halo`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#004AAD" stopOpacity="0.3" />
          <stop offset="1" stopColor="#004AAD" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient cast behind the mark */}
      <circle cx={cx} cy={cy} r={LOGO_W * 1.2} fill={`url(#${id}-halo)`} />

      {/* Static radial lines, fading outward */}
      <g stroke={`url(#${id}-line)`} strokeWidth="1" vectorEffect="non-scaling-stroke">
        {lines.map((l) => <line key={l.i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />)}
      </g>

      {/* Pulses: short dashes travelling from the edge toward the centre */}
      <g stroke="#7FBDF2" strokeWidth="1.5" strokeLinecap="round" className="motion-reduce:hidden">
        {lines.map((l) => (
          <line
            key={l.i}
            x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            pathLength={1}
            strokeDasharray="0.05 0.95"
            strokeDashoffset="1"
            className="animate-[travel_9s_linear_infinite_both]"
            style={{ animationDelay: `${(l.i * 1.37) % 9}s`, animationDuration: `${8 + (l.i % 4)}s` }}
          />
        ))}
      </g>

      {/* Arrival ring, breathing slowly */}
      <circle
        cx={cx} cy={cy} r={R_IN} fill="none" stroke="#7FBDF2" strokeOpacity="0.22" strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        className="origin-center [transform-box:fill-box] motion-safe:animate-[breathe_6s_var(--ease-in-out)_infinite]"
      />

      {/* The approved monogram */}
      <image
        href="/brand/tradewinds-monogram-white.png"
        x={cx - LOGO_W / 2} y={cy - LOGO_H / 2} width={LOGO_W} height={LOGO_H}
        opacity="0.42"
      />
    </svg>
  );
}

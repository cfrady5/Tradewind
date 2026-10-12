import { cn } from "@/lib/cn";

/**
 * Background motif: the approved Tradewinds monogram, lit from within.
 * The official PNG export is used as a luminance mask, so bands of light contracting
 * toward the centre illuminate the mark's own strokes — the logo is never redrawn.
 * Pure SVG/CSS; the pulses are hidden under reduced motion (a steady mark remains).
 */
const W = 1200;
const H = 800;
const LOGO_W = 260;
const LOGO_H = Math.round(LOGO_W * (160 / 166)); // intrinsic ratio of the exported monogram
// Centre of the mark per placement, chosen to sit clear of foreground content.
const CENTRE = { cta: { cx: 960, cy: 400 }, page: { cx: 900, cy: 295 } };
const PULSES = [0, 2.4, 4.8]; // seconds of stagger across a 7.2s cycle

export function MonogramField({ variant = "cta", className }: { variant?: "cta" | "page"; className?: string }) {
  const { cx, cy } = CENTRE[variant];
  const id = `mf-${variant}`;
  const x = cx - LOGO_W / 2;
  const y = cy - LOGO_H / 2;
  const reach = LOGO_W * 0.8; // pulse starts just outside the mark and ends at its centre

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={cn("pointer-events-none select-none", className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x={x} y={y} width={LOGO_W} height={LOGO_H}>
          <image href="/brand/tradewinds-monogram-white.png" x={x} y={y} width={LOGO_W} height={LOGO_H} />
        </mask>
        {/* A thin bright band near the rim of a circle; scaling the circle down moves the band inward. */}
        <radialGradient id={`${id}-band`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.78" stopColor="#7FBDF2" stopOpacity="0" />
          <stop offset="0.9" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="1" stopColor="#7FBDF2" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* The mark at rest */}
      <image href="/brand/tradewinds-monogram-white.png" x={x} y={y} width={LOGO_W} height={LOGO_H} opacity="0.3" />

      {/* Light travelling inward through the mark's strokes */}
      <g mask={`url(#${id}-mask)`} className="motion-reduce:hidden">
        {PULSES.map((delay) => (
          <circle
            key={delay}
            cx={cx} cy={cy} r={reach}
            fill={`url(#${id}-band)`}
            className="origin-center [transform-box:fill-box] animate-[contract_7.2s_var(--ease-in-out)_infinite_both]"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </g>
    </svg>
  );
}

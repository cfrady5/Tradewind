import { cn } from "@/lib/cn";
import { MONOGRAM_RATIO, MONOGRAM_VIEWBOX, MonogramPaths } from "./monogram";

/**
 * Background motif: the Tradewinds monogram, oversized and cropped by the section
 * edges, lit from within. The vector mark (components/brand/monogram.tsx) is used both
 * as the resting image and as a luminance mask, so a horizontal band of light rising
 * from the bottom fills its strokes — pixel-sharp at any size. Pure SVG/CSS; the sweep
 * is hidden under reduced motion.
 */
const W = 1200;
const H = 800;
const RATIO = MONOGRAM_RATIO;
// Placement per surface: the mark deliberately runs past the right and bottom edges.
const PLACE = { cta: { cx: 900, cy: 415, w: 664 }, page: { cx: 930, cy: 385, w: 560 } };

export function MonogramField({ variant = "cta", className }: { variant?: "cta" | "page"; className?: string }) {
  const { cx, cy, w: LOGO_W } = PLACE[variant];
  const LOGO_H = Math.round(LOGO_W * RATIO);
  const id = `mf-${variant}`;
  const x = cx - LOGO_W / 2;
  const y = cy - LOGO_H / 2;

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
          <svg viewBox={MONOGRAM_VIEWBOX} x={x} y={y} width={LOGO_W} height={LOGO_H} color="#fff"><MonogramPaths /></svg>
        </mask>
        {/* A bright leading edge with a soft fill trailing below it; translating upward fills the mark from the bottom. */}
        <linearGradient id={`${id}-sweep`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.015" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="0.06" stopColor="#7FBDF2" stopOpacity="0.55" />
          <stop offset="1" stopColor="#7FBDF2" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* The mark at rest */}
      <svg viewBox={MONOGRAM_VIEWBOX} x={x} y={y} width={LOGO_W} height={LOGO_H} color="#fff" opacity="0.26"><MonogramPaths /></svg>

      {/* Light rising from the bottom through the mark's strokes */}
      <g mask={`url(#${id}-mask)`} className="motion-reduce:hidden">
        <rect
          x={x} y={y} width={LOGO_W} height={LOGO_H}
          fill={`url(#${id}-sweep)`}
          className="[transform-box:fill-box] animate-[rise-fill_10s_var(--ease-in-out)_infinite_both]"
        />
      </g>
    </svg>
  );
}

import type { SVGProps } from "react";

/**
 * The Tradewinds monogram as resolution-independent vector paths.
 * Geometry was measured from the approved artwork (stroke centrelines, 96-unit stroke,
 * round caps and joins) so it renders pixel-sharp at any size. Colour comes from `color`
 * (currentColor) unless `fill` is given. Do not alter the geometry.
 */
export const MONOGRAM_VIEWBOX = "0 0 1217.56 1152.98";
export const MONOGRAM_RATIO = 0.94696; // height / width

export function MonogramPaths() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth={96} strokeLinecap="round" strokeLinejoin="round">
      <path d="M608.78 48 L608.78 1102.66" />
      <path d="M423.01 171.12 L423.01 854.23 L104.77 1023.62" />
      <path d="M794.55 171.12 L794.55 854.23 L1112.79 1023.62" />
      <path d="M224.18 288.08 L224.18 758.69 L48 852.46" />
      <path d="M993.38 288.08 L993.38 758.69 L1169.56 852.46" />
      <path d="M430.32 1015.67 L261.24 1104.98" />
      <path d="M787.24 1015.67 L956.32 1104.98" />
    </g>
  );
}

export function Monogram({ className, title, ...rest }: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg viewBox={MONOGRAM_VIEWBOX} className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} focusable="false" {...rest}>
      {title && <title>{title}</title>}
      <MonogramPaths />
    </svg>
  );
}

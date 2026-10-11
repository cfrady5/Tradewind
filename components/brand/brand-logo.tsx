import { cn } from "@/lib/cn";

/**
 * Official Tradewinds logo artwork (Brand Guidelines, Sep 24 2026), exported from the
 * approved source files by scripts/export-brand-assets.py. Never recreate the logo in text or CSS.
 *  - wordmark-navy:     blue monogram + navy wordmark — white / Cloud Gray surfaces
 *  - wordmark-reversed: all-white lockup — Navy / dark surfaces
 *  - monogram-*:        monogram alone, for compact or decorative use
 */
type Variant = "wordmark-navy" | "wordmark-reversed" | "monogram-blue" | "monogram-white";

const files: Record<Variant, { src: string; w: number; h: number }> = {
  "wordmark-navy": { src: "/brand/tradewinds-wordmark-navy.png", w: 596, h: 96 },
  "wordmark-reversed": { src: "/brand/tradewinds-wordmark-reversed.png", w: 596, h: 96 },
  "monogram-blue": { src: "/brand/tradewinds-monogram-blue.png", w: 166, h: 160 },
  "monogram-white": { src: "/brand/tradewinds-monogram-white.png", w: 166, h: 160 },
};

export function BrandLogo({ variant, className, decorative, priority }: { variant: Variant; className?: string; decorative?: boolean; priority?: boolean }) {
  const f = files[variant];
  return (
    // Plain <img>: tiny pre-sized PNGs; intrinsic width/height reserve space (no CLS).
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={f.src}
      width={f.w}
      height={f.h}
      alt={decorative ? "" : "Tradewinds"}
      aria-hidden={decorative || undefined}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={cn("block h-auto select-none", className)}
      draggable={false}
    />
  );
}

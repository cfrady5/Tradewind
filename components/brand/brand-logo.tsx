import { cn } from "@/lib/cn";

/**
 * Renders ONLY approved logo files from /public/brand (see public/brand/README.md).
 * The logo is never recreated in text or CSS. Until the approved files are supplied,
 * the files at these paths are clearly marked placeholders.
 */
type Variant = "wordmark-navy" | "wordmark-reversed" | "monogram-blue" | "monogram-orange";

const files: Record<Variant, { src: string; w: number; h: number }> = {
  "wordmark-navy": { src: "/brand/tradewinds-wordmark-navy.svg", w: 188, h: 36 },
  "wordmark-reversed": { src: "/brand/tradewinds-wordmark-reversed.svg", w: 188, h: 36 },
  "monogram-blue": { src: "/brand/tradewinds-monogram-blue.svg", w: 40, h: 40 },
  "monogram-orange": { src: "/brand/tradewinds-monogram-orange.svg", w: 40, h: 40 },
};

export function BrandLogo({ variant, className }: { variant: Variant; className?: string }) {
  const f = files[variant];
  return (
    // Plain <img> keeps SVG crisp and avoids optimizer overhead for a tiny vector asset.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={f.src} width={f.w} height={f.h} alt="Tradewinds" className={cn("block h-auto", className)} />
  );
}

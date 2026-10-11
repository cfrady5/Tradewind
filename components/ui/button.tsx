import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ArrowRight, ArrowUpRight } from "./icons";

/**
 * Buttons. Color pairings are AA-verified (docs/03-DESIGN-SYSTEM.md):
 *  primary  — Cobalt / white (8.1:1); hover Navy
 *  accent   — Runway Orange / Navy (6.4:1) — for dark surfaces & the single most important action
 *  secondary— outline; light or dark surface
 *  text     — inline arrow link
 */
type Variant = "primary" | "accent" | "secondary" | "secondary-dark" | "text" | "text-dark";
type Size = "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-cobalt text-white hover:bg-navy shadow-[0_1px_0_rgb(255_255_255/0.12)_inset]",
  accent: "bg-runway text-navy hover:bg-[#ffa957]",
  secondary: "border border-navy/20 text-navy hover:border-navy hover:bg-navy/[0.03]",
  "secondary-dark": "border border-white/25 text-white hover:border-white/70 hover:bg-white/[0.06]",
  text: "text-cobalt hover:text-navy px-0",
  "text-dark": "text-sky hover:text-white px-0",
};
const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-13 px-6 text-base",
};

type Props = {
  href: string;
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  external?: boolean;
  arrow?: boolean;
  className?: string;
} & Omit<ComponentProps<"a">, "href">;

export function ButtonLink({ href, variant = "primary", size = "md", children, external, arrow = true, className, ...rest }: Props) {
  const isText = variant === "text" || variant === "text-dark";
  const classes = cn(
    "group inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[-0.005em] whitespace-nowrap",
    "transition-[background-color,border-color,color,box-shadow] duration-(--duration-ui) ease-(--ease-out)",
    !isText && sizes[size],
    isText && "h-auto",
    variants[variant],
    className,
  );
  const Icon = external ? ArrowUpRight : ArrowRight;
  const content = (
    <>
      <span>{children}</span>
      {arrow && (
        <Icon
          width={18}
          height={18}
          className={cn(
            "shrink-0 transition-transform duration-(--duration-ui) ease-(--ease-out)",
            external ? "group-hover:-translate-y-0.5 group-hover:translate-x-0.5" : "group-hover:translate-x-1",
          )}
        />
      )}
      {external && <span className="sr-only"> (opens external site)</span>}
    </>
  );
  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...rest}>
        {content}
      </a>
    );
  }
  if (href.startsWith("mailto:")) {
    return <a href={href} className={classes} {...rest}>{content}</a>;
  }
  return (
    <Link href={href} className={classes} {...rest}>
      {content}
    </Link>
  );
}

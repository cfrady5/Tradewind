import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Client-safe primitives (no server imports) shared by portal pages and client components. */
const BTN: Record<string, string> = {
  primary: "bg-cobalt text-white hover:bg-navy",
  accent: "bg-runway text-navy hover:bg-[#ffa957]",
  secondary: "border border-navy/20 bg-white text-navy hover:border-navy",
  danger: "border border-[#f3b4b4] bg-white text-[#8a1c1c] hover:bg-[#fff2f2]",
  ghost: "text-cobalt hover:bg-sky-tint",
};
export function Btn({ variant = "primary", small, className, ...rest }: ComponentProps<"button"> & { variant?: keyof typeof BTN; small?: boolean }) {
  return <button {...rest} className={cn("inline-flex items-center justify-center gap-1.5 rounded-sm font-semibold transition-colors disabled:opacity-50", small ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm", BTN[variant], className)} />;
}
export function BtnLink({ variant = "primary", small, className, ...rest }: ComponentProps<typeof Link> & { variant?: keyof typeof BTN; small?: boolean }) {
  return <Link {...rest} className={cn("inline-flex items-center justify-center gap-1.5 rounded-sm font-semibold transition-colors", small ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm", BTN[variant], className)} />;
}
export const inputClass = "w-full rounded-sm border border-line bg-white px-3 py-2 text-sm text-navy placeholder:text-ink-muted/70 focus:border-cobalt focus:outline-none focus:ring-2 focus:ring-cobalt/20 disabled:bg-cloud";

import type { ReactNode } from "react";
import { ChevronDown } from "./icons";
import { cn } from "@/lib/cn";

/** Native <details> accordion: keyboard + screen-reader accessible without JS. */
export function AccordionItem({ id, title, children, defaultOpen, className }: { id?: string; title: ReactNode; children: ReactNode; defaultOpen?: boolean; className?: string }) {
  return (
    <details id={id} open={defaultOpen} className={cn("group scroll-mt-32 border-b border-line", className)}>
      <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-left text-[1.0625rem] font-semibold transition-colors hover:text-cobalt [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-sm border border-line transition-[transform,background-color] duration-(--duration-ui) ease-(--ease-out) group-open:rotate-180 group-open:bg-navy group-open:text-white">
          <ChevronDown width={16} height={16} />
        </span>
      </summary>
      <div className="pb-6 pr-12 leading-relaxed text-ink-muted [&_a]:font-semibold [&_a]:text-cobalt [&_a:hover]:underline [&_p+p]:mt-3">{children}</div>
    </details>
  );
}

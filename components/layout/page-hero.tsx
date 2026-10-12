import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { MonogramField } from "@/components/brand/monogram-field";
import { cn } from "@/lib/cn";
import { DotTitle } from "@/components/brand/dot-title";

/** Interior page header — Navy band with the monogram field set to the right. */
export function PageHero({
  title, lead, crumbs, children, aside, compact,
}: {
  title: ReactNode;
  lead?: ReactNode;
  crumbs: Crumb[];
  children?: ReactNode;
  aside?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className="on-dark relative isolate overflow-hidden bg-hero text-white">
      <div className="absolute inset-0 -z-10 bg-grid-fine [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
      <MonogramField variant="page" className="absolute inset-0 -z-10 hidden h-full w-full md:block" />
      <div className={cn("container-page pt-[calc(var(--header-h)+2.5rem)]", compact ? "pb-14" : "pb-20 md:pb-24")}>
        <Breadcrumbs items={crumbs} />
        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className={aside ? "lg:col-span-7" : "lg:col-span-9"}>
            <h1 className="text-h1 font-bold"><DotTitle>{title}</DotTitle></h1>
            {lead && <p className="mt-6 max-w-2xl text-lead text-white/80">{lead}</p>}
            {children && <div className="mt-8 flex flex-wrap items-center gap-4">{children}</div>}
          </div>
          {aside && <div className="lg:col-span-5">{aside}</div>}
        </div>
      </div>
    </section>
  );
}

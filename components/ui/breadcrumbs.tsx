import Link from "next/link";
import { ChevronRight } from "./icons";
import { SITE } from "@/lib/site-config";
import { cn } from "@/lib/cn";

export type Crumb = { label: string; href: string };

export function Breadcrumbs({ items, dark = true }: { items: Crumb[]; dark?: boolean }) {
  const all = [{ label: "Home", href: "/" }, ...items];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: SITE.url + c.href })),
  };
  return (
    <nav aria-label="Breadcrumb">
      <ol className={cn("flex flex-wrap items-center gap-1.5 text-sm", dark ? "text-ink-subtle" : "text-ink-muted")}>
        {all.map((c, i) => {
          const last = i === all.length - 1;
          return (
            <li key={c.href} className="flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className={dark ? "text-white" : "text-navy"}>{c.label}</span>
              ) : (
                <>
                  <Link href={c.href} className={cn("link-underline", dark ? "hover:text-white" : "hover:text-navy")}>{c.label}</Link>
                  <ChevronRight width={14} height={14} className="opacity-60" />
                </>
              )}
            </li>
          );
        })}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </nav>
  );
}

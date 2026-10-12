import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, Play } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { formatDate } from "@/lib/data/opportunity-status";
import type { EventItem, Resource } from "@/lib/data/types";

function ColHead({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between border-b border-navy pb-4">
      <h3 className="text-lg font-bold">{title}</h3>
      <Link href={href} className="group flex items-center gap-1 text-sm font-semibold text-cobalt hover:text-navy">
        View all <ArrowRight width={16} height={16} className="transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

export function ResourcesEvents({ events, resources, now }: { events: EventItem[]; resources: Resource[]; now: Date }) {
  const upcoming = events.filter((e) => new Date(e.startsAt) > now).slice(0, 3);
  const learning = resources.filter((r) => ["guide", "video", "tutorial", "exemplar"].includes(r.kind)).slice(0, 3);
  const news = resources.filter((r) => r.kind === "news").slice(0, 3);

  return (
    <section aria-labelledby="learn-title" className="section-y bg-cloud">
      <div className="container-page">
        <SectionHeader id="learn-title" title="Resources and events." />
        <div className="mt-14 grid gap-12 lg:grid-cols-3">
          <Reveal>
            <ColHead title="Upcoming events" href="/resources/events" />
            <ul className="divide-y divide-line">
              {upcoming.length === 0 && <li className="py-6 text-ink-muted">No upcoming events scheduled.</li>}
              {upcoming.map((e) => {
                const d = new Date(e.startsAt);
                return (
                  <li key={e.slug} className="flex gap-5 py-6">
                    <span className="flex w-14 shrink-0 flex-col items-center rounded-md bg-white py-2 shadow-card">
                      <span className="eyebrow text-[0.625rem] text-cobalt">{new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "America/New_York" }).format(d)}</span>
                      <span className="text-2xl font-bold">{new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: "America/New_York" }).format(d)}</span>
                    </span>
                    <div>
                      <p className="font-semibold leading-snug">{e.title}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm capitalize text-ink-muted"><Calendar width={14} height={14} />{e.format} · {e.location}</p>
                      {e.sample && <Badge tone="accent" className="mt-2">Sample</Badge>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Reveal>
          <Reveal delay={0.06}>
            <ColHead title="Featured learning" href="/resources" />
            <ul className="divide-y divide-line">
              {learning.map((r) => (
                <li key={r.slug} className="py-6">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-cobalt">
                    {(r.kind === "video" || r.kind === "exemplar") && <Play width={14} height={14} />}{r.kind}{r.duration && ` · ${r.duration}`}
                  </p>
                  {r.url ? (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="link-underline mt-2 inline font-semibold leading-snug">{r.title}<span className="sr-only"> (opens external site)</span></a>
                  ) : (
                    <p className="mt-2 font-semibold leading-snug">{r.title}</p>
                  )}
                  <p className="mt-1 text-sm text-ink-muted">{r.summary}</p>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.12}>
            <ColHead title="Program updates" href="/resources/news" />
            <ul className="divide-y divide-line">
              {news.map((r) => (
                <li key={r.slug} className="py-6">
                  {r.date && <p className="text-xs font-semibold text-ink-muted">{formatDate(r.date)}</p>}
                  <p className="mt-2 font-semibold leading-snug">{r.title}</p>
                  <p className="mt-1 text-sm text-ink-muted">{r.summary}</p>
                  {r.sample && <Badge tone="accent" className="mt-2">Sample</Badge>}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

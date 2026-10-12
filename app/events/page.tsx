import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { Section } from "@/components/content/blocks";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { DataNotice } from "@/components/ui/data-notice";
import { EmptyState } from "@/components/ui/empty-state";
import { Calendar, Check, Download, Play, Users } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { getEvents } from "@/lib/data";
import { formatDate } from "@/lib/data/opportunity-status";
import type { EventItem } from "@/lib/data/types";

export const revalidate = 300;
export const metadata: Metadata = { title: "Events", description: "Marketplace Minute sessions, office hours and workshops for vendors and government buyers — plus recordings of past sessions.", alternates: { canonical: "/events" } };

const time = (d: string, tz = "America/New_York") => new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: tz, timeZoneName: "short" }).format(new Date(d));
const day = (d: string, tz = "America/New_York") => new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: tz }).format(new Date(d));

const WHY = [
  "Get answers directly from the Marketplace team.",
  "Learn what assessors look for before you submit.",
  "Hear how buyers find, evaluate and award solutions.",
];

function Actions({ e }: { e: EventItem }) {
  return (
    <div className="flex flex-wrap gap-3">
      {e.registrationUrl ? <ButtonLink href={e.registrationUrl} external variant="accent">Register</ButtonLink> : <span className="inline-flex h-11 items-center rounded-sm border border-dashed border-current/40 px-4 text-sm opacity-80">Registration link coming soon</span>}
      <a href={`/events/${e.slug}/calendar`} download className="inline-flex h-11 items-center gap-2 rounded-sm border border-current/30 px-4 text-sm font-semibold hover:border-current">
        <Download width={16} height={16} />Add to calendar
      </a>
    </div>
  );
}

function Row({ e, past }: { e: EventItem; past?: boolean }) {
  const tz = e.timeZone ?? "America/New_York";
  return (
    <li id={e.slug} className="grid scroll-mt-28 gap-6 py-8 md:grid-cols-12 md:items-start">
      <div className="md:col-span-3">
        <p className="text-2xl font-bold tracking-tight">{formatDate(e.startsAt)}</p>
        <p className="mt-1 text-sm text-ink-muted">{time(e.startsAt, tz)}{e.endsAt && ` – ${time(e.endsAt, tz)}`}</p>
      </div>
      <div className="md:col-span-6">
        <div className="flex flex-wrap gap-2">
          {e.eventType && <Badge tone="info">{e.eventType}</Badge>}
          <Badge tone="neutral" className="capitalize">{e.format}</Badge>
          {e.sample && <Badge tone="accent">Sample</Badge>}
        </div>
        <h3 className="mt-3 text-xl font-semibold">{e.title}</h3>
        <p className="mt-1 text-ink-muted">{e.summary}</p>
        <p className="mt-2 text-sm text-ink-muted">{e.location}</p>
      </div>
      <div className="md:col-span-3 md:text-right">
        {past
          ? (e.recordingUrl ? <ButtonLink href={e.recordingUrl} external variant="secondary">Watch recording</ButtonLink> : <span className="text-sm text-ink-muted">Recording not available</span>)
          : <div className="text-navy md:flex md:justify-end"><Actions e={e} /></div>}
      </div>
    </li>
  );
}

export default async function Page() {
  const data = await getEvents();
  const now = new Date();
  const upcoming = data.items.filter((e) => new Date(e.endsAt ?? e.startsAt) >= now).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const past = data.items.filter((e) => new Date(e.endsAt ?? e.startsAt) < now).sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  const next = upcoming[0];
  const recordings = past.filter((e) => e.recordingUrl);
  const tz = next?.timeZone ?? "America/New_York";

  return (
    <>
      <PageHero title="Events" lead="Marketplace Minute sessions, office hours and workshops for vendors and government buyers." crumbs={[{ label: "Events", href: "/events" }]} compact />

      {/* Upcoming event */}
      <Section>
        <DataNotice source={data.source} what="the events list" className="mb-10" />
        {next ? (
          <Reveal className="on-dark relative overflow-hidden rounded-2xl bg-navy p-8 text-white md:p-12">
            <span className="absolute inset-0 bg-grid-fine opacity-60" aria-hidden />
            <div className="relative grid gap-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <p className="eyebrow text-runway">Next event</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {next.eventType && <Badge tone="info">{next.eventType}</Badge>}
                  <Badge tone="neutral" className="capitalize">{next.format}</Badge>
                  {next.sample && <Badge tone="accent">Sample</Badge>}
                </div>
                <h2 className="mt-4 text-h2 font-bold">{next.title}</h2>
                <p className="mt-4 max-w-2xl text-lead text-white/80">{next.description ?? next.summary}</p>
                <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-3">
                  <div className="flex gap-3">
                    <dt className="shrink-0 text-sky"><Calendar aria-hidden /><span className="sr-only">Date and time</span></dt>
                    <dd><span className="block font-semibold">{day(next.startsAt, tz)}</span><span className="block text-white/70">{time(next.startsAt, tz)}{next.endsAt && ` – ${time(next.endsAt, tz)}`}</span></dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="shrink-0 text-sky"><Play aria-hidden /><span className="sr-only">Format and location</span></dt>
                    <dd><span className="block font-semibold capitalize">{next.format}</span><span className="block text-white/70">{next.location}</span></dd>
                  </div>
                  {next.speakers?.length ? (
                    <div className="flex gap-3">
                      <dt className="shrink-0 text-sky"><Users aria-hidden /><span className="sr-only">Speakers</span></dt>
                      <dd>{next.speakers.map((sp) => <span key={sp.name} className="block font-semibold">{sp.name}{sp.title && <span className="block font-normal text-white/70">{sp.title}</span>}</span>)}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
              <div className="lg:col-span-4 lg:flex lg:justify-end"><Actions e={next} /></div>
            </div>
          </Reveal>
        ) : (
          <EmptyState title="No upcoming events scheduled">Check back soon — new sessions are announced here first.</EmptyState>
        )}
      </Section>

      {/* Why attend */}
      <Section tone="cloud">
        <SectionHeader title="Why attend." lead="Short, practical sessions with the people who run the Marketplace." align="split" />
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {WHY.map((w, i) => (
            <Reveal as="li" key={w} delay={i * 0.06} className="flex gap-4 rounded-xl border border-line bg-white p-7">
              <span className="grid size-8 shrink-0 place-items-center rounded-sm bg-navy text-white"><Check width={16} height={16} /></span>
              <span className="font-semibold text-navy">{w}</span>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* Upcoming list */}
      {upcoming.length > 1 && (
        <Section>
          <h2 className="text-h3 font-bold">More upcoming sessions</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">{upcoming.slice(1).map((e) => <Row key={e.slug} e={e} />)}</ul>
        </Section>
      )}

      {/* Recording library */}
      <Section tone={upcoming.length > 1 ? "cloud" : "white"}>
        <h2 className="text-h3 font-bold">Recording library</h2>
        {recordings.length ? (
          <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {recordings.map((e) => (
              <li key={e.slug} className="flex flex-col rounded-xl border border-line bg-white p-6">
                <Badge tone="info" className="self-start">{e.eventType ?? "Session"}</Badge>
                <p className="mt-3 font-semibold">{e.title}</p>
                <p className="mt-1 text-sm text-ink-muted">{formatDate(e.startsAt)}</p>
                <div className="mt-auto pt-5"><ButtonLink href={e.recordingUrl!} external variant="secondary">Watch recording</ButtonLink></div>
              </li>
            ))}
          </ul>
        ) : <p className="mt-4 text-ink-muted">Recordings are posted here after each session once approved for release.</p>}
      </Section>

      {/* Past sessions */}
      <Section>
        <h2 className="text-h3 font-bold">Past sessions</h2>
        {past.length ? <ul className="mt-4 divide-y divide-line border-y border-line">{past.map((e) => <Row key={e.slug} e={e} past />)}</ul> : <p className="mt-4 text-ink-muted">No past sessions yet.</p>}
      </Section>

      <NextSteps steps={[
        { eyebrow: "Learn", title: "Instructional videos", href: "/marketplace/videos" },
        { eyebrow: "Opportunities", title: "Current opportunities", href: "/opportunities" },
        { eyebrow: "Questions", title: "FAQs", href: "/marketplace/faqs" },
      ]} />
    </>
  );
}

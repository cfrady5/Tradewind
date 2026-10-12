import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { DataNotice } from "@/components/ui/data-notice";
import { EmptyState } from "@/components/ui/empty-state";
import { getEvents } from "@/lib/data";
import { formatDate } from "@/lib/data/opportunity-status";
import type { EventItem } from "@/lib/data/types";

export const revalidate = 300;
export const metadata: Metadata = { title: "Events", description: "Upcoming Tradewinds events, workshops and office hours — plus recordings of past sessions.", alternates: { canonical: "/events" } };

const time = (d: string) => new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York", timeZoneName: "short" }).format(new Date(d));

function EventRow({ e, past }: { e: EventItem; past?: boolean }) {
  const d = new Date(e.startsAt);
  return (
    <li className="grid gap-6 py-8 md:grid-cols-12 md:items-start">
      <div className="md:col-span-3">
        <p className="text-2xl font-bold tracking-tight">{formatDate(d)}</p>
        <p className="mt-1 text-sm text-ink-muted">{time(e.startsAt)}{e.endsAt && ` – ${time(e.endsAt)}`}</p>
      </div>
      <div className="md:col-span-6">
        <div className="flex flex-wrap gap-2"><Badge tone="info" className="capitalize">{e.format}</Badge>{e.sample && <Badge tone="accent">Sample</Badge>}</div>
        <h3 className="mt-3 text-xl font-semibold">{e.title}</h3>
        <p className="mt-1 text-ink-muted">{e.summary}</p>
        <p className="mt-2 text-sm text-ink-muted">{e.location}</p>
      </div>
      <div className="md:col-span-3 md:text-right">
        {!past && (e.registrationUrl ? <ButtonLink href={e.registrationUrl} external variant="primary">Register</ButtonLink> : <span className="text-sm text-ink-muted">Registration link coming soon</span>)}
        {past && (e.recordingUrl ? <ButtonLink href={e.recordingUrl} external variant="secondary">Watch recording</ButtonLink> : <span className="text-sm text-ink-muted">Recording not available</span>)}
      </div>
    </li>
  );
}

export default async function Page() {
  const data = await getEvents();
  const now = new Date();
  const upcoming = data.items.filter((e) => new Date(e.endsAt ?? e.startsAt) >= now).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const past = data.items.filter((e) => new Date(e.endsAt ?? e.startsAt) < now).sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  return (
    <>
      <PageHero title="Events" lead="Workshops, office hours and summits for buyers and solution providers." crumbs={[{ label: "Events", href: "/events" }]} compact />
      <section className="bg-white">
        <div className="container-page py-14 md:py-20">
          <DataNotice source={data.source} what="the events list" className="mb-8" />
          <h2 className="text-h3 font-bold">Upcoming</h2>
          {upcoming.length ? <ul className="mt-4 divide-y divide-line border-y border-line">{upcoming.map((e) => <EventRow key={e.slug} e={e} />)}</ul> : <div className="mt-6"><EmptyState title="No upcoming events scheduled">Check back soon, or follow program news.</EmptyState></div>}
          <h2 className="mt-20 text-h3 font-bold">Past events</h2>
          {past.length ? <ul className="mt-4 divide-y divide-line border-y border-line">{past.map((e) => <EventRow key={e.slug} e={e} past />)}</ul> : <p className="mt-4 text-ink-muted">No past events yet.</p>}
        </div>
      </section>
      <NextSteps steps={[
        { eyebrow: "Learn", title: "Videos & tutorials", href: "/marketplace/videos" },
        { eyebrow: "News", title: "Program updates", href: "/resources/news" },
        { eyebrow: "Questions", title: "FAQs", href: "/marketplace/faqs" },
      ]} />
    </>
  );
}

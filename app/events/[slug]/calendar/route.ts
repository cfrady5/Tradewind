import { getEvents } from "@/lib/data";
import { SITE } from "@/lib/site-config";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getEvents()).items.map((e) => ({ slug: e.slug }));
}

/** iCalendar text escaping (RFC 5545 §3.3.11) and 75-octet line folding. */
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const fold = (line: string) => line.match(/.{1,73}/g)?.join("\r\n ") ?? line;
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** "Add to calendar" download for one event (brief §6.17). */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = (await getEvents()).items.find((x) => x.slug === slug);
  if (!e) return new Response("Not found", { status: 404 });
  const start = new Date(e.startsAt);
  const end = e.endsAt ? new Date(e.endsAt) : new Date(start.getTime() + 60 * 60 * 1000);
  const url = e.registrationUrl ?? `${SITE.url}/events#${e.slug}`;
  const body = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Tradewinds//Events//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.slug}@tradewindai.com`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(e.title)}`,
    `DESCRIPTION:${esc(`${e.description ?? e.summary}\n\n${url}`)}`,
    `LOCATION:${esc(e.location)}`,
    `URL:${url}`,
    "END:VEVENT", "END:VCALENDAR", "",
  ].map(fold).join("\r\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${e.slug}.ics"`,
    },
  });
}

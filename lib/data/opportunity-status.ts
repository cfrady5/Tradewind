import type { Opportunity, OpportunityStatus } from "./types";

/** 12:00 pm America/New_York on the last day of the month containing `now`. */
export function monthlyDeadline(now = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "numeric" }).formatToParts(now);
  const y = Number(parts.find((p) => p.type === "year")!.value);
  const m = Number(parts.find((p) => p.type === "month")!.value);
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  // Noon ET is 16:00Z (EDT) or 17:00Z (EST); resolve the offset for that date.
  const probe = new Date(Date.UTC(y, m - 1, lastDay, 16));
  const offset = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", timeZoneName: "shortOffset" })
    .formatToParts(probe).find((p) => p.type === "timeZoneName")!.value; // e.g. "GMT-4"
  const hours = -Number(offset.replace("GMT", "") || 0);
  const deadline = new Date(Date.UTC(y, m - 1, lastDay, 12 + hours));
  if (deadline <= now) {
    // Past this month's cutoff → next month's deadline.
    return monthlyDeadline(new Date(Date.UTC(y, m, 2, 12)));
  }
  return deadline;
}

export function resolveDates(o: Opportunity, now = new Date()): { opensAt?: Date; closesAt?: Date } {
  if (o.recurrence === "monthly") return { closesAt: monthlyDeadline(now) };
  return { opensAt: o.opensAt ? new Date(o.opensAt) : undefined, closesAt: o.closesAt ? new Date(o.closesAt) : undefined };
}

export function opportunityStatus(o: Opportunity, now = new Date()): OpportunityStatus {
  const { opensAt, closesAt } = resolveDates(o, now);
  if (opensAt && opensAt > now) return "upcoming";
  if (closesAt && closesAt <= now) return "closed";
  return "open";
}

export const STATUS_LABEL: Record<OpportunityStatus, string> = { open: "Open", upcoming: "Upcoming", closed: "Closed" };

export const TYPE_LABEL: Record<Opportunity["type"], string> = {
  "marketplace-collection": "Marketplace Collection",
  "special-topic": "Special Topic",
  "shopping-notice": "Shopping Notice",
  external: "Other Opportunity",
};

export function formatDate(d: Date | string, withTime = false) {
  const date = typeof d === "string" ? new Date(d) : d;
  // Date-only values (YYYY-MM-DD) are calendar dates, not instants — don't shift them across time zones.
  const dateOnly = typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: dateOnly ? "UTC" : "America/New_York",
    month: "short", day: "numeric", year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit", timeZoneName: "short" } : {}),
  }).format(date);
}

export function daysUntil(d: Date, now = new Date()) {
  return Math.ceil((d.getTime() - now.getTime()) / 86_400_000);
}

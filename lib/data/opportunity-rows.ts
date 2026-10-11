import { opportunityStatus, resolveDates } from "./opportunity-status";
import type { Opportunity } from "./types";
import type { OppRow } from "@/components/directory/opportunities-directory";

export function toRows(items: Opportunity[], now: Date): OppRow[] {
  return items.map((o) => {
    const d = resolveDates(o, now);
    return { o, status: opportunityStatus(o, now), opensAt: d.opensAt?.toISOString(), closesAt: d.closesAt?.toISOString() };
  });
}

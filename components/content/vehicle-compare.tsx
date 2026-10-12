import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "@/components/ui/icons";
import type { ContractVehicle } from "@/lib/data/types";
import { VEHICLE_STATUS } from "@/lib/data/vehicle-status";

const ROWS: { label: string; get: (v: ContractVehicle) => React.ReactNode }[] = [
  { label: "Vehicle type", get: (v) => v.vehicleType },
  { label: "Status", get: (v) => <Badge tone={VEHICLE_STATUS[v.status].tone} dot>{VEHICLE_STATUS[v.status].label}</Badge> },
  { label: "Purpose", get: (v) => v.tagline },
  { label: "Scope", get: (v) => <ul className="space-y-1">{v.scope.slice(0, 4).map((s) => <li key={s}>{s}</li>)}{v.scope.length > 4 && <li className="text-ink-muted">+{v.scope.length - 4} more</li>}</ul> },
  { label: "Eligible users", get: (v) => v.eligibleUsers },
  { label: "Ordering", get: (v) => v.orderingProcess[0] },
  { label: "Availability", get: (v) => v.availability },
];

/** Accessible comparison table on desktop; stacked cards on mobile (no sideways scrolling). */
export function VehicleCompare({ vehicles }: { vehicles: ContractVehicle[] }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-line lg:block">
        <table className="w-full table-fixed border-collapse text-left text-[0.9375rem]">
          <caption className="sr-only">Comparison of CDAO contract vehicles</caption>
          <thead>
            <tr className="bg-navy text-white">
              <th scope="col" className="w-48 p-5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-subtle">Compare</th>
              {vehicles.map((v) => (
                <th key={v.slug} scope="col" className="p-5 align-bottom">
                  <span className="block text-xl font-bold">{v.shortName}</span>
                  <span className="block text-sm font-medium text-white/70">{v.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => (
              <tr key={r.label} className={i % 2 ? "bg-cloud/50" : "bg-white"}>
                <th scope="row" className="p-5 align-top text-sm font-semibold text-ink-muted">{r.label}</th>
                {vehicles.map((v) => <td key={v.slug} className="p-5 align-top">{r.get(v)}</td>)}
              </tr>
            ))}
            <tr className="border-t border-line">
              <td />
              {vehicles.map((v) => (
                <td key={v.slug} className="p-5">
                  <Link href={`/contract-vehicles/${v.slug}`} className="group inline-flex items-center gap-1.5 font-semibold text-cobalt hover:text-navy">
                    {v.shortName} details<ArrowRight width={16} height={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <ul className="grid gap-4 lg:hidden">
        {vehicles.map((v) => (
          <li key={v.slug} className="rounded-xl border border-line bg-white p-6">
            <p className="text-xl font-bold">{v.shortName}</p>
            <p className="text-sm text-ink-muted">{v.name}</p>
            <dl className="mt-5 space-y-4 text-[0.9375rem]">
              {ROWS.map((r) => (
                <div key={r.label}><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{r.label}</dt><dd className="mt-1">{r.get(v)}</dd></div>
              ))}
            </dl>
            <Link href={`/contract-vehicles/${v.slug}`} className="mt-6 inline-flex items-center gap-1.5 font-semibold text-cobalt">Details<ArrowRight width={16} height={16} /></Link>
          </li>
        ))}
      </ul>
    </>
  );
}

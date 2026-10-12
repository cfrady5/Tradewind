import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { Section } from "@/components/content/blocks";
import { VehicleCompare } from "@/components/content/vehicle-compare";
import { Badge } from "@/components/ui/badge";
import { DataNotice } from "@/components/ui/data-notice";
import { ArrowRight } from "@/components/ui/icons";
import { getVehicles } from "@/lib/data";
import { VEHICLE_STATUS } from "@/lib/data/vehicle-status";

export const revalidate = 300;
export const metadata: Metadata = { title: "Contract Vehicles", description: "Compare CDAO contract vehicles: scope, purpose, eligible users, ordering and availability.", alternates: { canonical: "/contract-vehicles" } };

export default async function Page() {
  const vehicles = await getVehicles();
  return (
    <>
      <PageHero
        title="Contract vehicles"
        lead="Compare scope, purpose, eligible users, ordering processes and current availability."
        crumbs={[{ label: "Contract Vehicles", href: "/contract-vehicles" }]}
        compact
      />
      <Section>
        <DataNotice source={vehicles.source} what="vehicle information" className="mb-8" />
        <ul className="mb-14 grid gap-4 md:grid-cols-3">
          {vehicles.items.map((v) => (
            <li key={v.slug}>
              <Link href={`/contract-vehicles/${v.slug}`} className="group flex h-full flex-col rounded-xl border border-line p-6 transition-[border-color,box-shadow] hover:border-signal/50 hover:shadow-lift">
                <Badge tone={VEHICLE_STATUS[v.status].tone} dot className="self-start">{VEHICLE_STATUS[v.status].label}</Badge>
                <span className="mt-5 text-2xl font-bold">{v.shortName}</span>
                <span className="mt-1 text-sm font-medium text-ink-muted">{v.vehicleType}</span>
                <span className="mt-4 text-ink-muted">{v.tagline}</span>
                <ArrowRight className="mt-auto pt-2 text-cobalt transition-transform group-hover:translate-x-1.5" width={28} height={28} />
              </Link>
            </li>
          ))}
        </ul>
        <h2 className="mb-8 text-h3 font-bold">Side-by-side comparison</h2>
        <VehicleCompare vehicles={vehicles.items} />
      </Section>
      <NextSteps steps={[
        { eyebrow: "Overview", title: "Acquisition pathways", href: "/contract-vehicles" },
        { eyebrow: "Guides", title: "Official documents", href: "/contract-vehicles/guides" },
        { eyebrow: "Support", title: "Ordering questions", href: "/contact" },
      ]} />
    </>
  );
}

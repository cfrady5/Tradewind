import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { Section } from "@/components/content/blocks";
import { VehicleCompare } from "@/components/content/vehicle-compare";
import { Badge } from "@/components/ui/badge";
import { DataNotice } from "@/components/ui/data-notice";
import { ArrowRight, ArrowUpRight, Mail } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { getVehicles } from "@/lib/data";
import { VEHICLE_STATUS } from "@/lib/data/vehicle-status";

export const revalidate = 300;
export const metadata: Metadata = { title: "Contract Vehicles", description: "CDAO contract vehicles — DRAID, AI Talent 2.0 and T&E: what each is, who it serves, what it can procure, how to order and current status.", alternates: { canonical: "/contract-vehicles" } };

const ORDER = ["draid", "ai-talent-2", "test-and-evaluation"];

export default async function Page() {
  const vehicles = await getVehicles();
  const rank = (s: string) => (ORDER.includes(s) ? ORDER.indexOf(s) : ORDER.length);
  const items = [...vehicles.items].sort((a, b) => rank(a.slug) - rank(b.slug));
  return (
    <>
      <PageHero
        title="Contract vehicles"
        lead="Established agreements for data readiness, AI talent and test & evaluation. See what each covers, who it serves and how to order."
        crumbs={[{ label: "Contract Vehicles", href: "/contract-vehicles" }]}
        compact
      />
      <Section>
        <DataNotice source={vehicles.source} what="vehicle information" className="mb-10" />
        <ul className="grid gap-5 lg:grid-cols-3">
          {items.map((v, i) => {
            const st = VEHICLE_STATUS[v.status];
            const procure = (v.capabilityCategories?.length ? v.capabilityCategories : v.scope).slice(0, 4);
            return (
              <Reveal as="li" key={v.slug} delay={i * 0.06} className="flex flex-col rounded-xl border border-line bg-white p-7 transition-[border-color,box-shadow] duration-(--duration-ui) hover:border-signal/50 hover:shadow-lift">
                <div className="flex items-center justify-between gap-3">
                  <Badge tone={st.tone} dot>{st.label}</Badge>
                  <span className="text-xs font-semibold text-ink-muted">{v.vehicleType}</span>
                </div>
                <h2 className="mt-5 text-2xl font-extrabold tracking-[-0.02em]">
                  <Link href={`/contract-vehicles/${v.slug}`} className="hover:text-cobalt">{v.shortName}</Link>
                </h2>
                <dl className="mt-5 space-y-4 text-[0.9375rem]">
                  <div><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">What it is</dt><dd className="mt-1">{v.tagline}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">Who it serves</dt><dd className="mt-1">{v.whoItServes ?? v.eligibleUsers}</dd></div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">What it can procure</dt>
                    <dd className="mt-1"><ul className="space-y-0.5">{procure.map((p) => <li key={p} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-runway" />{p}</li>)}</ul></dd>
                  </div>
                </dl>
                <ul className="mt-6 space-y-2 border-t border-line pt-5 text-sm">
                  <li>{v.orderingGuideUrl ? <a href={v.orderingGuideUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-cobalt hover:underline">Ordering guide<ArrowUpRight width={14} height={14} /></a> : <span className="text-ink-muted">Ordering guide — pending</span>}</li>
                  <li>{v.holderListUrl ? <a href={v.holderListUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-cobalt hover:underline">Holder list<ArrowUpRight width={14} height={14} /></a> : <span className="text-ink-muted">Holder list — pending</span>}</li>
                  {v.contacts[0] && <li><a href={`mailto:${v.contacts[0].email}?subject=${encodeURIComponent(`${v.shortName} question`)}`} className="inline-flex items-center gap-1.5 font-semibold text-cobalt hover:underline"><Mail width={14} height={14} />{v.contacts[0].email}</a></li>}
                </ul>
                <Link href={`/contract-vehicles/${v.slug}`} className="group mt-auto inline-flex items-center gap-1.5 pt-6 font-semibold text-cobalt">
                  {v.shortName} details<ArrowRight width={18} height={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </Section>
      <Section tone="cloud">
        <SectionHeader title="Side-by-side comparison." />
        <div className="mt-10"><VehicleCompare vehicles={items} /></div>
      </Section>
      <NextSteps steps={[
        { eyebrow: "Guides", title: "Acquisition guides", href: "/contract-vehicles/guides" },
        { eyebrow: "Marketplace", title: "Awardable solutions", href: "/marketplace/awardable-companies" },
        { eyebrow: "Support", title: "Ordering questions", href: "/contact" },
      ]} />
    </>
  );
}

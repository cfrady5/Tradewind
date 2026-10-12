import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { Callout } from "@/components/content/blocks";
import { Bullets, DetailLayout, Pending, type DetailSection } from "@/components/content/detail-layout";
import { ProcessSteps } from "@/components/content/process-steps";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { DataNotice } from "@/components/ui/data-notice";
import { Document, Mail } from "@/components/ui/icons";
import { getBySlug, getVehicles } from "@/lib/data";
import { VEHICLE_STATUS } from "@/lib/data/vehicle-status";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getVehicles()).items.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: PageProps<"/contract-vehicles/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { item } = await getBySlug(getVehicles, slug);
  return item ? { title: `${item.shortName} — ${item.name}`, description: item.tagline, alternates: { canonical: `/contract-vehicles/${slug}` } } : {};
}

/** Vehicle detail (brief §6.14–6.16). Sections render only when the vehicle has that content. */
export default async function Page({ params }: PageProps<"/contract-vehicles/[slug]">) {
  const { slug } = await params;
  const { item: v, source } = await getBySlug(getVehicles, slug);
  if (!v) notFound();
  const st = VEHICLE_STATUS[v.status];
  const link = (href: string, label: string) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 rounded-md border border-line p-4 text-base font-semibold text-navy hover:border-signal hover:bg-sky-tint/40">
      <Document className="text-cobalt" />{label}<span className="sr-only"> (opens external site)</span>
    </a>
  );

  const sections: (DetailSection | false | undefined)[] = [
    {
      id: "overview", title: "Overview",
      content: (
        <>
          <p>{v.overview}</p>
          <dl className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line text-base sm:grid-cols-3">
            {[["Vehicle type", v.vehicleType], ["Who it serves", v.whoItServes ?? v.eligibleUsers], ["Current status", v.availability]].map(([k, val]) => (
              <div key={k} className="bg-cloud/50 p-5"><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{k}</dt><dd className="mt-2 font-medium text-navy">{val}</dd></div>
            ))}
          </dl>
        </>
      ),
    },
    v.background ? { id: "background", title: "Background", content: <p>{v.background}</p> } : undefined,
    v.problem ? { id: "problem", title: "The problem", content: <p>{v.problem}</p> } : undefined,
    v.howItHelps ? { id: "how-it-helps", title: "How the vehicle helps", content: <p>{v.howItHelps}</p> } : undefined,
    { id: "scope", title: "Scope", content: <Bullets items={v.scope} cols={v.scope.length > 3} /> },
    v.capabilityCategories?.length ? { id: "capabilities", title: v.capabilityLabel ?? "Covered capabilities", content: <Bullets items={v.capabilityCategories} cols /> } : undefined,
    ...(v.serviceGroups ?? []).map((g) => ({
      id: g.title.toLowerCase().replace(/[^a-z]+/g, "-"), title: g.title,
      content: <><p>{g.body}</p><div className="mt-5"><Pending>Detailed task areas will be published once confirmed by the program office.</Pending></div></>,
    })),
    {
      id: "ordering", title: "Ordering resources",
      content: (
        <>
          <div className="flex flex-wrap gap-3">
            {v.orderingGuideUrl ? link(v.orderingGuideUrl, "Ordering guide") : <Pending>The ordering guide will be linked here once published.</Pending>}
            {v.documents.map((d) => <span key={d.url}>{link(d.url, d.label)}</span>)}
          </div>
          <div className="-mx-1 mt-8"><ProcessSteps steps={v.orderingProcess.map((s, i) => ({ title: `Step ${i + 1}`, body: s }))} /></div>
        </>
      ),
    },
    {
      id: "holders", title: "Holder list",
      content: v.holderListUrl ? link(v.holderListUrl, "Current holder list") : v.holders ? <p>{v.holders}</p> : <Pending>The current holder list will be published here once approved.</Pending>,
    },
    {
      id: "status", title: "Current status",
      content: (
        <>
          <p className="flex flex-wrap items-center gap-3"><Badge tone={st.tone} dot>{st.label}</Badge><span className="text-navy">{v.availability}</span></p>
          {v.updateNotice && <div className="mt-5"><Callout title="Update notice">{v.updateNotice}</Callout></div>}
          {v.pendingFields?.length ? <p className="mt-5 text-base">Being confirmed with the program office: {v.pendingFields.join(", ")}.</p> : null}
        </>
      ),
    },
    {
      id: "contacts", title: "Contact",
      content: (
        <ul className="space-y-3">
          {v.contacts.map((c) => <li key={c.email}><a href={`mailto:${c.email}?subject=${encodeURIComponent(`${v.shortName} ordering question`)}`} className="inline-flex items-center gap-3 font-semibold text-cobalt hover:underline"><Mail />{c.label} — {c.email}</a></li>)}
        </ul>
      ),
    },
    v.historicalNotes ? { id: "history", title: "Historical information", muted: true, content: <p>{v.historicalNotes}</p> } : undefined,
    {
      id: "marketplace", title: "Related: the Marketplace",
      content: (
        <>
          <p>Looking for a specific capability rather than services? Awardable solutions in the Marketplace have already been through a competitive assessment.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/marketplace" variant="primary">Explore the Marketplace</ButtonLink>
            <ButtonLink href="/marketplace/awardable-companies" variant="secondary" arrow={false}>Awardable companies</ButtonLink>
          </div>
        </>
      ),
    },
  ];

  return (
    <>
      <PageHero
        title={<>{v.shortName}{v.shortName !== v.name && <span className="block text-[0.5em] font-semibold text-white/75">{v.name}</span>}</>}
        lead={v.tagline}
        crumbs={[{ label: "Contract Vehicles", href: "/contract-vehicles" }, { label: v.shortName, href: `/contract-vehicles/${v.slug}` }]}
        compact
      >
        <Badge tone={st.tone} dot>{st.label}</Badge>
        <Badge tone="neutral">{v.vehicleType}</Badge>
      </PageHero>
      <DetailLayout intro={<DataNotice source={source} what="this vehicle page" />} sections={sections.filter((s): s is DetailSection => !!s)} />
      <NextSteps steps={[
        { eyebrow: "Compare", title: "All contract vehicles", href: "/contract-vehicles" },
        { eyebrow: "Guides", title: "Acquisition guides", href: "/contract-vehicles/guides" },
        { eyebrow: "Support", title: "Ordering questions", href: "/contact" },
      ]} />
    </>
  );
}

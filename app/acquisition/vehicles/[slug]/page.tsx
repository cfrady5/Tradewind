import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { Callout, PendingContent } from "@/components/content/blocks";
import { ProcessSteps } from "@/components/content/process-steps";
import { Badge } from "@/components/ui/badge";
import { DataNotice } from "@/components/ui/data-notice";
import { Document, Mail } from "@/components/ui/icons";
import { getBySlug, getVehicles } from "@/lib/data";
import { VEHICLE_STATUS } from "@/lib/data/vehicle-status";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getVehicles()).items.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: PageProps<"/acquisition/vehicles/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { item } = await getBySlug(getVehicles, slug);
  return item ? { title: `${item.shortName} — ${item.name}`, description: item.tagline, alternates: { canonical: `/acquisition/vehicles/${slug}` } } : {};
}

export default async function Page({ params }: PageProps<"/acquisition/vehicles/[slug]">) {
  const { slug } = await params;
  const { item: v, source } = await getBySlug(getVehicles, slug);
  if (!v) notFound();
  const st = VEHICLE_STATUS[v.status];
  const nav = [["overview", "Overview"], ["scope", "Scope"], ["ordering", "Ordering"], ["documents", "Documents"], ["contacts", "Contacts"], ...(v.historicalNotes ? [["history", "Historical information"]] : [])];

  return (
    <>
      <PageHero
        eyebrow={v.vehicleType}
        title={<>{v.shortName}{v.shortName !== v.name && <span className="block text-[0.5em] font-semibold text-white/75">{v.name}</span>}</>}
        lead={v.tagline}
        crumbs={[{ label: "Acquisition", href: "/acquisition" }, { label: "Contract Vehicles", href: "/acquisition/vehicles" }, { label: v.shortName, href: `/acquisition/vehicles/${v.slug}` }]}
        compact
      >
        <Badge tone={st.tone} dot>{st.label}</Badge>
      </PageHero>
      <section className="bg-white">
        <div className="container-page grid gap-12 py-14 md:py-20 lg:grid-cols-12">
          <nav aria-label="On this page" className="hidden lg:col-span-3 lg:block">
            <ul className="sticky top-[calc(var(--header-h)+2rem)] space-y-1 border-l border-line text-sm">
              {nav.map(([id, label]) => <li key={id}><a href={`#${id}`} className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-ink-muted hover:border-cobalt hover:text-navy">{label}</a></li>)}
            </ul>
          </nav>
          <div className="space-y-16 lg:col-span-9">
            <DataNotice source={source} what="this vehicle page" />
            {v.pendingFields?.length ? (
              <Callout tone="pending" title="Details being confirmed">The following will be published once approved: {v.pendingFields.join(", ")}.</Callout>
            ) : null}
            <section id="overview" className="scroll-mt-32">
              <h2 className="text-h3 font-bold">Overview</h2>
              <p className="mt-4 max-w-prose text-lg leading-relaxed text-ink-muted">{v.overview}</p>
              <dl className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
                {[["Current status", v.availability], ["Eligible users", v.eligibleUsers], ["Holders", v.holders ?? "Awaiting approved content"]].map(([k, val]) => (
                  <div key={k} className="bg-cloud/50 p-5"><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{k}</dt><dd className="mt-2 font-medium">{val}</dd></div>
                ))}
              </dl>
            </section>
            <section id="scope" className="scroll-mt-32">
              <h2 className="text-h3 font-bold">Scope and supported requirements</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {v.scope.map((s) => <li key={s} className="flex gap-3 rounded-md border border-line p-4"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-runway" />{s}</li>)}
              </ul>
            </section>
            <section id="ordering" className="scroll-mt-32">
              <h2 className="text-h3 font-bold">Ordering instructions</h2>
              <div className="mt-8"><ProcessSteps steps={v.orderingProcess.map((s, i) => ({ title: `Step ${i + 1}`, body: s }))} /></div>
            </section>
            <section id="documents" className="scroll-mt-32">
              <h2 className="text-h3 font-bold">Official documents</h2>
              <div className="mt-6">
                {v.documents.length ? (
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {v.documents.map((d) => (
                      <li key={d.url}><a href={d.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-md border border-line p-4 font-semibold hover:border-signal hover:bg-sky-tint/40"><Document className="text-cobalt" />{d.label}<span className="sr-only"> (opens external site)</span></a></li>
                    ))}
                  </ul>
                ) : <PendingContent what="Official documents for this vehicle" />}
              </div>
            </section>
            <section id="contacts" className="scroll-mt-32">
              <h2 className="text-h3 font-bold">Support contacts</h2>
              <ul className="mt-6 space-y-3">
                {v.contacts.map((c) => <li key={c.email}><a href={`mailto:${c.email}`} className="inline-flex items-center gap-3 font-semibold text-cobalt hover:underline"><Mail />{c.label} — {c.email}</a></li>)}
              </ul>
            </section>
            {v.historicalNotes && (
              <section id="history" className="scroll-mt-32 rounded-xl border border-dashed border-line bg-cloud/40 p-7">
                <p className="eyebrow text-ink-muted">Historical information</p>
                <p className="mt-3 text-ink-muted">{v.historicalNotes}</p>
              </section>
            )}
          </div>
        </div>
      </section>
      <NextSteps steps={[
        { eyebrow: "Compare", title: "All contract vehicles", href: "/acquisition/vehicles" },
        { eyebrow: "Marketplace", title: "Awardable solutions", href: "/marketplace" },
        { eyebrow: "Guides", title: "Acquisition guides", href: "/acquisition/guides" },
      ]} />
    </>
  );
}

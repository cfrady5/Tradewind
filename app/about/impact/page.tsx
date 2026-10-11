import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { Section, PendingContent } from "@/components/content/blocks";
import { Counter } from "@/components/ui/counter";
import { DataNotice } from "@/components/ui/data-notice";
import { Badge } from "@/components/ui/badge";
import { getMetrics } from "@/lib/data";
import { formatDate } from "@/lib/data/opportunity-status";
import { formatMetric } from "@/lib/format";

export const revalidate = 300;
export const metadata: Metadata = { title: "Impact & Results", description: "Tradewinds program metrics with reporting periods, sources and methodology.", alternates: { canonical: "/about/impact" } };

export default async function Page() {
  const data = await getMetrics();
  const by = Object.fromEntries(data.items.map((m) => [m.key, m]));
  const funnel = [by.submitted, by.awardable].filter(Boolean);
  const max = funnel[0]?.value ?? 1;

  return (
    <>
      <PageHero eyebrow="About" title="Impact & results" lead="Program performance reported with its period, source and verification status — never rounded up, never invented." crumbs={[{ label: "About", href: "/about" }, { label: "Impact", href: "/about/impact" }]} compact />
      <Section>
        <DataNotice source={data.source} what="metric data" className="mb-10" />
        <dl className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {data.items.map((m) => (
            <div key={m.key} className="flex flex-col bg-white p-8">
              <dd className="text-[clamp(2.25rem,1.8rem+1.6vw,3.5rem)] font-extrabold leading-none tracking-[-0.04em]"><Counter value={m.value} format={m.format} /></dd>
              <dt className="mt-4 font-semibold">{m.label}</dt>
              <dd className="mt-auto pt-6"><Badge tone={m.verified ? "approved" : "accent"}>{m.verified ? "Verified" : "Pending verification"}</Badge></dd>
            </div>
          ))}
        </dl>

        {funnel.length === 2 && (
          <figure className="mt-16 rounded-xl border border-line p-8">
            <figcaption className="text-xl font-bold">From submission to awardable</figcaption>
            <p className="mt-1 text-sm text-ink-muted">{funnel[0].reportingPeriod}</p>
            <div className="mt-8 space-y-5" aria-hidden>
              {funnel.map((m, i) => (
                <div key={m.key}>
                  <div className="flex justify-between text-sm font-semibold"><span>{m.label}</span><span className="tabular-nums">{formatMetric(m.value, m.format)}</span></div>
                  <div className="mt-2 h-4 overflow-hidden rounded-full bg-cloud">
                    <div className={i ? "h-full rounded-full bg-runway" : "h-full rounded-full bg-cobalt"} style={{ width: `${(m.value / max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <table className="sr-only">
              <caption>Submissions and awardable determinations</caption>
              <thead><tr><th scope="col">Metric</th><th scope="col">Value</th></tr></thead>
              <tbody>{funnel.map((m) => <tr key={m.key}><th scope="row">{m.label}</th><td>{formatMetric(m.value, m.format)}</td></tr>)}</tbody>
            </table>
          </figure>
        )}

        <div className="mt-16">
          <h2 className="text-h3 font-bold">Methodology & sources</h2>
          <div className="mt-6 hidden overflow-hidden rounded-xl border border-line md:block">
            <table className="w-full text-left text-[0.9375rem]">
              <thead className="bg-cloud text-xs uppercase tracking-[0.12em] text-ink-muted">
                <tr><th scope="col" className="p-4">Metric</th><th scope="col" className="p-4">Value</th><th scope="col" className="p-4">As of</th><th scope="col" className="p-4">Period</th><th scope="col" className="p-4">Source</th><th scope="col" className="p-4">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.items.map((m) => (
                  <tr key={m.key}>
                    <th scope="row" className="p-4 font-semibold">{m.label}</th>
                    <td className="p-4 tabular-nums">{formatMetric(m.value, m.format)}</td>
                    <td className="p-4">{formatDate(m.asOf)}</td>
                    <td className="p-4">{m.reportingPeriod}</td>
                    <td className="p-4 text-ink-muted">{m.source}</td>
                    <td className="p-4">{m.verified ? "Verified" : "Pending"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-6 space-y-3 md:hidden">
            {data.items.map((m) => <li key={m.key} className="rounded-lg border border-line p-4 text-sm"><p className="font-semibold">{m.label}: {formatMetric(m.value, m.format)}</p><p className="mt-1 text-ink-muted">As of {formatDate(m.asOf)} · {m.source}</p></li>)}
          </ul>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          <PendingContent what="Annual comparisons and a program timeline (requires approved time-series data)" />
          <PendingContent what="Acquisition outcome summaries and success stories" />
        </div>
      </Section>
      <NextSteps steps={[
        { eyebrow: "Awards", title: "Awarded solutions", href: "/about/awarded-solutions" },
        { eyebrow: "Marketplace", title: "Browse awardables", href: "/marketplace/solutions" },
        { eyebrow: "About", title: "The program", href: "/about" },
      ]} />
    </>
  );
}

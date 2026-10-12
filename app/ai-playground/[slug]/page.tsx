import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { AVAILABILITY, ToolCard } from "@/components/cards/tool-card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { DataNotice } from "@/components/ui/data-notice";
import { getBySlug, getTools } from "@/lib/data";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getTools()).items.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/ai-playground/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { item } = await getBySlug(getTools, slug);
  return item ? { title: item.name, description: item.summary, alternates: { canonical: `/ai-playground/${slug}` } } : {};
}

export default async function Page({ params }: PageProps<"/ai-playground/[slug]">) {
  const { slug } = await params;
  const { item: t, source } = await getBySlug(getTools, slug);
  if (!t) notFound();
  const a = AVAILABILITY[t.availability];
  const related = (await getTools()).items.filter((x) => x.slug !== t.slug && x.category === t.category).slice(0, 3);

  return (
    <>
      <PageHero title={t.name} lead={t.summary} crumbs={[{ label: "AI Playground", href: "/ai-playground" }, { label: t.name, href: `/ai-playground/${t.slug}` }]} compact>
        <Badge tone={a.tone} dot>{a.label}</Badge>
        <Badge tone="neutral">{t.category}</Badge>
        {t.sample && <Badge tone="accent">Sample</Badge>}
      </PageHero>
      <section className="bg-white">
        <div className="container-page grid gap-12 py-14 md:py-20 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <DataNotice source={source} what="this tool listing" className="mb-10" />
            <h2 className="text-h3 font-bold">About this tool</h2>
            <p className="mt-4 max-w-prose text-lg leading-relaxed text-ink-muted">{t.description}</p>
            {t.useCases.length > 0 && (
              <>
                <h2 className="mt-12 text-h3 font-bold">Use cases</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {t.useCases.map((u) => <li key={u} className="rounded-md border border-line bg-cloud/50 px-4 py-3 font-medium">{u}</li>)}
                </ul>
              </>
            )}
            {t.dataSensitivity && (
              <p className="mt-10 flex gap-3 rounded-md border border-runway/50 bg-runway-tint p-4 text-sm text-navy"><span className="eyebrow mt-0.5 shrink-0 text-[#8a4100]">Data sensitivity</span>{t.dataSensitivity}</p>
            )}
          </div>
          <aside className="lg:col-span-4">
            <div className="rounded-lg border border-line p-6">
              <h2 className="eyebrow text-ink-muted">Access</h2>
              <p className="mt-3 font-semibold">{t.access}</p>
              <p className="mt-2 text-sm text-ink-muted">{a.description}.</p>
              <div className="mt-6">
                {t.accessUrl ? (
                  <ButtonLink href={t.accessUrl} external variant="primary">Open tool</ButtonLink>
                ) : (
                  <p className="rounded-md bg-cloud p-3 text-sm text-ink-muted">Access link awaiting external integration.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
        {related.length > 0 && (
          <div className="container-page pb-20">
            <h2 className="text-xl font-bold">Related tools</h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-3">{related.map((r) => <li key={r.slug}><ToolCard tool={r} /></li>)}</ul>
          </div>
        )}
      </section>
      <NextSteps steps={[
        { eyebrow: "AI Tools", title: "All tools", href: "/ai-playground" },
        { eyebrow: "Prompts", title: "Prompt library", href: "/ai-playground/prompt-library" },
        { eyebrow: "Support", title: "Contact the team", href: "/contact" },
      ]} />
    </>
  );
}

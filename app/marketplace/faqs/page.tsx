import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { FaqDirectory } from "@/components/directory/faq-directory";
import { DataNotice } from "@/components/ui/data-notice";
import { getFaqs } from "@/lib/data";
import { formatDate } from "@/lib/data/opportunity-status";

export const revalidate = 300;
export const metadata: Metadata = { title: "FAQs", description: "Answers to common questions from government buyers and solution providers about Tradewinds.", alternates: { canonical: "/marketplace/faqs" } };

export default async function Page() {
  const data = await getFaqs();
  const updated = data.items.map((f) => f.updatedAt).filter((d): d is string => !!d).sort().at(-1);
  const jsonLd = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: data.items.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };
  return (
    <>
      <PageHero title="Frequently asked questions" lead={<>Answers for vendors, government buyers and acquisition teams. Every answer has its own link to share.{updated && <span className="mt-2 block text-sm text-white/60">Last updated {formatDate(updated)}</span>}</>} crumbs={[{ label: "Marketplace", href: "/marketplace" }, { label: "FAQs", href: "/marketplace/faqs" }]} compact />
      <section className="bg-white">
        <div className="container-page max-w-4xl py-14 md:py-20">
          <DataNotice source={data.source} what="the FAQ list" className="mb-8" />
          <Suspense fallback={<p className="text-ink-muted">Loading…</p>}><FaqDirectory items={data.items} /></Suspense>
        </div>
      </section>
      <NextSteps steps={[
        { eyebrow: "Support", title: "Contact the right team", href: "/contact" },
        { eyebrow: "Submit", title: "Submission guide", href: "/marketplace/submission-guide" },
        { eyebrow: "Buy", title: "For government buyers", href: "/marketplace/government" },
      ]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}

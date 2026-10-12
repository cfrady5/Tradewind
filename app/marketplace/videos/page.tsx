import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { VideoLibrary } from "@/components/media/video-library";
import { DataNotice } from "@/components/ui/data-notice";
import { getResources } from "@/lib/data";

export const revalidate = 300;
export const metadata: Metadata = { title: "Instructional Videos", description: "Short videos on how the Tradewinds Marketplace works — from getting started and submission format to assessment, feedback and communications.", alternates: { canonical: "/marketplace/videos" } };

export default async function Page() {
  const data = await getResources();
  const videos = data.items.filter((r) => r.kind === "video");
  return (
    <>
      <PageHero
        title="Instructional videos"
        lead="Learn how the Marketplace works, from getting started to communicating awardable status. Every video lists its audience, runtime and last update."
        crumbs={[{ label: "Marketplace", href: "/marketplace" }, { label: "Instructional Videos", href: "/marketplace/videos" }]}
        compact
      />
      <section className="bg-white">
        <div className="container-page py-14 md:py-20">
          <DataNotice source={data.source} what="the video library" className="mb-8" />
          <Suspense fallback={<p className="text-ink-muted">Loading videos…</p>}><VideoLibrary items={videos} /></Suspense>
        </div>
      </section>
      <NextSteps steps={[
        { eyebrow: "Examples", title: "Exemplar submissions", href: "/marketplace/exemplars" },
        { eyebrow: "Prepare", title: "Submission guide", href: "/marketplace/submission-guide" },
        { eyebrow: "Questions", title: "FAQs", href: "/marketplace/faqs" },
      ]} />
    </>
  );
}

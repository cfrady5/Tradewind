import type { Metadata } from "next";
import { ResourcesPage } from "@/components/layout/resources-page";

export const revalidate = 300;
export const metadata: Metadata = { title: "Videos & Tutorials", description: "Walkthroughs and tutorials for using the Tradewinds Solutions Marketplace.", alternates: { canonical: "/marketplace/videos" } };

export default function Page() {
  return <ResourcesPage title="Instructional videos" lead="Step-by-step walkthroughs with captions and transcripts where available." crumbs={[{ label: "Marketplace", href: "/marketplace" }, { label: "Instructional Videos", href: "/marketplace/videos" }]} lockKinds={["video", "tutorial"]} steps={[
    { eyebrow: "Examples", title: "Exemplar submissions", href: "/marketplace/exemplars" },
    { eyebrow: "Submit", title: "Submission guide", href: "/marketplace/submission-guide" },
    { eyebrow: "Questions", title: "FAQs", href: "/marketplace/faqs" },
  ]} />;
}

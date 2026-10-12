import type { Metadata } from "next";
import { ResourcesPage } from "@/components/layout/resources-page";

export const revalidate = 300;
export const metadata: Metadata = { title: "Exemplar Submissions", description: "Example pitch videos that show what a strong Marketplace submission looks like.", alternates: { canonical: "/marketplace/exemplars" } };

export default function Page() {
  return <ResourcesPage title="Exemplar submissions" lead="What strong pitches look like — clear problems, real evidence, all within five minutes." crumbs={[{ label: "Marketplace", href: "/marketplace" }, { label: "Exemplar Submissions", href: "/marketplace/exemplars" }]} lockKinds={["exemplar"]} steps={[
    { eyebrow: "Prepare", title: "Submission checklist", href: "/marketplace/submission-guide" },
    { eyebrow: "Prompts", title: "Outline your pitch", href: "/ai-playground/prompt-library?q=pitch" },
    { eyebrow: "Opportunities", title: "Open calls", href: "/opportunities" },
  ]} />;
}

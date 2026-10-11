import type { Metadata } from "next";
import { ResourcesPage } from "@/components/layout/resources-page";

export const revalidate = 300;
export const metadata: Metadata = { title: "Resource Library", description: "Guides, videos, tutorials, exemplars, documents and news for Tradewinds buyers and solution providers.", alternates: { canonical: "/resources" } };

export default function Page() {
  return <ResourcesPage title="Resource library" lead="Guides, videos, exemplars, documents and program news — searchable in one place." crumbs={[]} steps={[
    { eyebrow: "Questions", title: "Searchable FAQs", href: "/resources/faqs" },
    { eyebrow: "Events", title: "Upcoming sessions", href: "/resources/events" },
    { eyebrow: "Submit", title: "Submission guide", href: "/marketplace/submission-guide" },
  ]} />;
}

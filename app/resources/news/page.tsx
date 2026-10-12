import type { Metadata } from "next";
import { ResourcesPage } from "@/components/layout/resources-page";

export const revalidate = 300;
export const metadata: Metadata = { title: "News & Updates", description: "Tradewinds program announcements and updates.", alternates: { canonical: "/resources/news" } };

export default function Page() {
  return <ResourcesPage title="News & updates" lead="Program announcements, Marketplace changes and reminders." crumbs={[{ label: "News", href: "/resources/news" }]} lockKinds={["news"]} steps={[
    { eyebrow: "Events", title: "Upcoming events", href: "/events" },
    { eyebrow: "Opportunities", title: "Open calls", href: "/opportunities" },
    { eyebrow: "About", title: "Impact & results", href: "/about/impact" },
  ]} />;
}

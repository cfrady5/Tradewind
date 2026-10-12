import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Section, Split, PendingContent } from "@/components/content/blocks";

export const metadata: Metadata = { title: "Employee Portal", description: "Secure content management for Tradewinds staff.", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <PageHero title="Employee portal" lead="Secure, invite-only content management for Tradewinds staff." crumbs={[{ label: "Employee Portal", href: "/employee" }]} compact />
      <Section>
        <Split title="Sign in.">
          <PendingContent what="The employee portal sign-in" />
        </Split>
      </Section>
    </>
  );
}

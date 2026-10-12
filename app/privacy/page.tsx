import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Section, Split, PendingContent } from "@/components/content/blocks";

export const metadata: Metadata = { title: "Privacy Notice", description: "How this website handles information.", alternates: { canonical: "/privacy" } };

export default function Page() {
  return (
    <>
      <PageHero title="Privacy notice" lead="How this website handles information." crumbs={[{ label: "Privacy", href: "/privacy" }]} compact />
      <Section>
        <Split title="Information practices.">
          <p>This public website does not set tracking cookies and does not collect personal information unless you choose to contact the program by email. Marketplace accounts are managed in the separate Marketplace system under its own terms.</p>
          <div className="mt-8"><PendingContent what="The approved privacy and accessibility statements" /></div>
        </Split>
      </Section>
    </>
  );
}

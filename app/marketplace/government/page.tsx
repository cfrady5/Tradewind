import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { Section, Split, Callout } from "@/components/content/blocks";
import { ProcessSteps } from "@/components/content/process-steps";
import { FaqList } from "@/components/content/faq-list";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { Shield } from "@/components/ui/icons";
import { getFaqs } from "@/lib/data";
import { EXTERNAL } from "@/lib/site-config";

export const revalidate = 300;
export const metadata: Metadata = { title: "For Government Buyers", description: "How government buyers discover awardable solutions in the Tradewinds Solutions Marketplace and move toward award.", alternates: { canonical: "/marketplace/government" } };

export default async function Page() {
  const faqs = await getFaqs();
  return (
    <>
      <PageHero
        title="Find capability for your mission — faster."
        lead="Search competitively assessed AI, digital and data-analytics solutions, then move to award with your contracting office."
        crumbs={[{ label: "Marketplace", href: "/marketplace" }, { label: "For Government Buyers", href: "/marketplace/government" }]}
        aside={
          <div className="rounded-xl border border-line-dark bg-white/[0.05] p-6 backdrop-blur">
            <p className="flex items-center gap-2 font-semibold"><Shield className="text-runway" />Marketplace access</p>
            <p className="mt-2 text-sm text-white/75">Available to government users with a .gov or .mil email address.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <ButtonLink href={EXTERNAL.marketplaceSignIn} external variant="accent">Sign in</ButtonLink>
              <ButtonLink href={EXTERNAL.marketplaceSignIn} external variant="secondary-dark">Register</ButtonLink>
            </div>
          </div>
        }
      />
      <Section>
        <SectionHeader title="Five steps from requirement to award" />
        <div className="mt-14">
          <ProcessSteps steps={[
            { title: "Identify mission requirements", body: "Frame the need as an outcome-based problem statement — what must improve, for whom, and how you'll measure it." },
            { title: "Explore relevant solutions", body: "Sign in and search awardable pitch videos by title or company. Shortlist the capabilities that fit." },
            { title: "Review eligible capabilities", body: "Watch pitches, compare approaches and engage vendors to confirm fit, maturity and integration needs." },
            { title: "Understand acquisition options", body: "Work with your contracting office to choose an award mechanism appropriate to your requirement." },
            { title: "Connect with support", body: "The Tradewinds team supports buyers throughout — from search strategy to award." },
          ]} />
        </div>
      </Section>
      <Section tone="cloud">
        <Split title="Make the Marketplace work for you">
          <p>The strongest searches start from a clear mission problem rather than a product name. Use the <Link className="font-semibold text-cobalt hover:underline" href="/ai-tools/prompt-library">prompt library</Link> to draft outcome-based problem statements and vendor questions.</p>
          <p>If you need the market to come to you, a <strong>Shopping Notice</strong> or <strong>Special Topic</strong> can focus submissions on a specific challenge.</p>
          <div className="mt-8"><Callout title="Need help getting started?">Email <a href={`mailto:${EXTERNAL.successEmail}`}>{EXTERNAL.successEmail}</a> for acquisition support, or <a href={`mailto:${EXTERNAL.supportEmail}`}>{EXTERNAL.supportEmail}</a> for account access issues.</Callout></div>
        </Split>
      </Section>
      <Section>
        <Split title="For government users">
          <FaqList faqs={faqs.items.filter((f) => f.audiences.includes("government") || f.slug === "what-does-awardable-mean")} />
        </Split>
      </Section>
      <NextSteps steps={[
        { eyebrow: "Acquisition", title: "Compare contract vehicles", href: "/acquisition/vehicles" },
        { eyebrow: "Guides", title: "Acquisition guides & handbook", href: "/acquisition/guides" },
        { eyebrow: "Browse", title: "Public solutions directory", href: "/marketplace/solutions" },
      ]} />
    </>
  );
}

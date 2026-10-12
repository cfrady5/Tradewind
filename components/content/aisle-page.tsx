import type { ReactNode } from "react";
import { PageHero } from "@/components/layout/page-hero";
import { NextSteps } from "@/components/layout/next-steps";
import { FaqList } from "@/components/content/faq-list";
import { ProcessSteps, type ProcessStep } from "@/components/content/process-steps";
import { DetailLayout, Pending, type DetailSection } from "@/components/content/detail-layout";
import { ButtonLink } from "@/components/ui/button";
import { getFaqs } from "@/lib/data";
import type { FaqCategory } from "@/lib/data/types";
import { EXTERNAL } from "@/lib/site-config";

/** Shared structure for the SBIR/STTR and Prototype Transition aisles (brief §6.10, §6.11). */
export async function AislePage({ title, lead, href, keyMessage, sections, steps, faqCategory }: {
  title: string; lead: string; href: string; keyMessage: string;
  sections: DetailSection[]; steps: ProcessStep[]; faqCategory: FaqCategory;
}) {
  const faqs = (await getFaqs()).items.filter((f) => f.category === faqCategory);
  const all: DetailSection[] = [
    { id: "overview", title: "Overview", content: <><p className="text-xl font-semibold leading-snug text-navy">{keyMessage}</p><p>{lead}</p></> },
    ...sections,
    { id: "submission-steps", title: "Submission steps", content: <div className="not-prose -mx-1 mt-2"><ProcessSteps steps={steps} /></div> },
    {
      id: "faq", title: "FAQ",
      content: faqs.length ? <FaqList faqs={faqs} /> : <Pending>Questions specific to this aisle will be published here. Until then, see the <a className="font-semibold underline" href="/marketplace/faqs">Marketplace FAQs</a>.</Pending>,
    },
    {
      id: "get-started", title: "Get started",
      content: (
        <>
          <p>Ready to submit, or need to confirm eligibility first? Start in the submission portal or talk to the Marketplace team.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href={EXTERNAL.submissionPortal} external variant="primary">Submit through the portal</ButtonLink>
            <ButtonLink href="/contact" variant="secondary" arrow={false}>Contact the team</ButtonLink>
          </div>
        </>
      ),
    },
  ];
  return (
    <>
      <PageHero title={title} lead={lead} crumbs={[{ label: "Marketplace", href: "/marketplace" }, { label: title, href }]} compact>
        <ButtonLink href={EXTERNAL.submissionPortal} external variant="accent">Submit a solution</ButtonLink>
        <ButtonLink href={EXTERNAL.marketplaceSignIn} external variant="secondary-dark">Government sign-in</ButtonLink>
      </PageHero>
      <DetailLayout sections={all} />
      <NextSteps steps={[
        { eyebrow: "Marketplace", title: "How the Marketplace works", href: "/marketplace" },
        { eyebrow: "Examples", title: "Exemplar submissions", href: "/marketplace/exemplars" },
        { eyebrow: "Browse", title: "Awardable companies", href: "/marketplace/awardable-companies" },
      ]} />
    </>
  );
}

export function TwoUp({ left, right }: { left: { title: string; body: ReactNode }; right: { title: string; body: ReactNode } }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[left, right].map((c) => (
        <div key={c.title} className="rounded-lg border border-line bg-cloud/50 p-6">
          <h3 className="text-lg font-bold text-navy">{c.title}</h3>
          <div className="mt-2 text-base">{c.body}</div>
        </div>
      ))}
    </div>
  );
}

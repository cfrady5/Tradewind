import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/content/blocks";
import { Reveal } from "@/components/ui/reveal";
import { ArrowRight, Building, Compass, Mail, Shield, Spark } from "@/components/ui/icons";
import { EXTERNAL } from "@/lib/site-config";

export const metadata: Metadata = { title: "Contact & Support", description: "Reach the right Tradewinds team for government assistance, submissions, Marketplace access or technical support.", alternates: { canonical: "/about/contact" } };

/** Routes only to published, approved channels. No form: requests are not collected by this site. */
const ROUTES = [
  { icon: Building, title: "Government assistance", body: "Search strategy, acquisition pathways and award support for buyers.", email: EXTERNAL.successEmail, help: { label: "Buyer journey", href: "/marketplace/government" } },
  { icon: Spark, title: "Submission support", body: "Questions about preparing or submitting a pitch, or about assessment outcomes.", email: EXTERNAL.successEmail, help: { label: "Submission guide", href: "/marketplace/submission-guide" } },
  { icon: Shield, title: "Marketplace access", body: "Account registration, sign-in and access issues for government users.", email: EXTERNAL.supportEmail, help: { label: "Access FAQs", href: "/resources/faqs?category=Government+Access" } },
  { icon: Compass, title: "Technical support", body: "Problems with the portal, uploads or this website.", email: EXTERNAL.supportEmail, help: { label: "FAQs", href: "/resources/faqs" } },
  { icon: Mail, title: "General questions", body: "Anything else about the Tradewinds program.", email: EXTERNAL.successEmail, help: { label: "About Tradewinds", href: "/about" } },
];

export default function Page() {
  return (
    <>
      <PageHero title="Contact & support" lead="Select a topic to reach the appropriate team." crumbs={[{ label: "About", href: "/about" }, { label: "Contact & Support", href: "/about/contact" }]} compact />
      <Section>
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ROUTES.map((r, i) => (
            <Reveal as="li" key={r.title} delay={i * 0.05} className="flex flex-col rounded-xl border border-line p-7">
              <r.icon className="text-cobalt" width={28} height={28} />
              <h2 className="mt-5 text-xl font-bold">{r.title}</h2>
              <p className="mt-2 text-ink-muted">{r.body}</p>
              <a href={`mailto:${r.email}?subject=${encodeURIComponent(`Tradewinds — ${r.title}`)}`} className="mt-6 inline-flex items-center gap-2 font-semibold text-cobalt hover:underline">
                <Mail width={18} height={18} />{r.email}
              </a>
              <Link href={r.help.href} className="group mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-ink-muted hover:text-navy">
                Self-serve: {r.help.label}<ArrowRight width={14} height={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>
          ))}
        </ul>
        <p className="mt-10 max-w-2xl text-sm text-ink-muted">Do not send classified information, controlled unclassified information (CUI) or proprietary material by email.</p>
      </Section>
    </>
  );
}

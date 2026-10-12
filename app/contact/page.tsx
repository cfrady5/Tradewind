import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/content/blocks";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { ArrowRight, Building, Calendar, Compass, Layers, Mail, Play, Shield, Spark } from "@/components/ui/icons";
import { EXTERNAL } from "@/lib/site-config";

export const metadata: Metadata = { title: "Contact & Support", description: "Reach the right Tradewinds team: vendor submission help, government Marketplace access, acquisition support, events, technical issues and press.", alternates: { canonical: "/contact" } };

const mail = (email: string, subject: string) => `mailto:${email}?subject=${encodeURIComponent(`Tradewinds — ${subject}`)}`;

/** Support categories from the brief (§6.18). Routes only to published channels; this site collects no requests. */
const CATEGORIES = [
  { icon: Spark, title: "Vendor submission help", body: "Preparing or submitting a pitch, eligibility and assessment outcomes.", email: EXTERNAL.successEmail, help: { label: "Submission guide", href: "/marketplace/submission-guide" } },
  { icon: Shield, title: "Government marketplace access", body: "Registering, signing in and access for .gov and .mil users.", email: EXTERNAL.supportEmail, help: { label: "Government buyer FAQs", href: "/marketplace/faqs?category=Government+Buyer" } },
  { icon: Building, title: "Acquisition support", body: "Search strategy, contract vehicles and moving from awardable to award.", email: EXTERNAL.successEmail, help: { label: "Contract vehicles", href: "/contract-vehicles" } },
  { icon: Calendar, title: "Events and training", body: "Marketplace Minute sessions, office hours and workshops.", email: EXTERNAL.successEmail, help: { label: "Upcoming events", href: "/events" } },
  { icon: Compass, title: "Technical issue", body: "Problems with the portal, uploads or this website.", email: EXTERNAL.supportEmail, help: { label: "All FAQs", href: "/marketplace/faqs" } },
  { icon: Layers, title: "Press and communications", body: "Media inquiries and approved language about Tradewinds and awardable status.", email: EXTERNAL.successEmail, help: { label: "Communications FAQs", href: "/marketplace/faqs?category=Communications+and+Press" } },
];

export default function Page() {
  return (
    <>
      <PageHero title="Contact & support" lead="Pick the closest topic and your message reaches the right Tradewinds team." crumbs={[{ label: "Contact", href: "/contact" }]} compact />

      {/* Helpdesk · schedule a call · self-serve */}
      <Section>
        <div className="grid gap-5 lg:grid-cols-3">
          <Reveal className="on-dark flex flex-col rounded-xl bg-navy p-8 text-white">
            <Mail className="text-runway" width={28} height={28} />
            <h2 className="mt-5 text-xl font-bold">Helpdesk</h2>
            <p className="mt-2 text-white/75">Account, access and technical questions.</p>
            <a href={mail(EXTERNAL.supportEmail, "Helpdesk")} className="mt-6 text-lg font-semibold text-sky hover:text-white hover:underline">{EXTERNAL.supportEmail}</a>
          </Reveal>
          <Reveal delay={0.06} className="flex flex-col rounded-xl border border-line p-8">
            <Calendar className="text-cobalt" width={28} height={28} />
            <h2 className="mt-5 text-xl font-bold">Schedule a call</h2>
            <p className="mt-2 text-ink-muted">Tell us the topic and a few times that work. The team replies with a meeting invitation.</p>
            <div className="mt-auto pt-6"><ButtonLink href={mail(EXTERNAL.successEmail, "Request a call")} variant="primary">Request a call</ButtonLink></div>
          </Reveal>
          <Reveal delay={0.12} className="flex flex-col rounded-xl border border-line bg-cloud/60 p-8">
            <Play className="text-cobalt" width={28} height={28} />
            <h2 className="mt-5 text-xl font-bold">Find it yourself</h2>
            <p className="mt-2 text-ink-muted">Most questions are answered in a short video or an FAQ.</p>
            <ul className="mt-auto space-y-2 pt-6 font-semibold">
              <li><Link href="/marketplace/videos" className="group inline-flex items-center gap-1.5 text-cobalt">Instructional videos<ArrowRight width={16} height={16} className="transition-transform group-hover:translate-x-1" /></Link></li>
              <li><Link href="/marketplace/faqs" className="group inline-flex items-center gap-1.5 text-cobalt">FAQs<ArrowRight width={16} height={16} className="transition-transform group-hover:translate-x-1" /></Link></li>
            </ul>
          </Reveal>
        </div>
      </Section>

      {/* Support categories */}
      <Section tone="cloud">
        <SectionHeader title="Support categories." lead="Each topic opens an email to the team that handles it." align="split" />
        <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((r, i) => (
            <Reveal as="li" key={r.title} delay={i * 0.05} className="flex flex-col rounded-xl border border-line bg-white p-7">
              <r.icon className="text-cobalt" width={28} height={28} />
              <h3 className="mt-5 text-xl font-bold">{r.title}</h3>
              <p className="mt-2 text-ink-muted">{r.body}</p>
              <a href={mail(r.email, r.title)} className="mt-6 inline-flex items-center gap-2 font-semibold text-cobalt hover:underline">
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

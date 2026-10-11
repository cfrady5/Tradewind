/**
 * Single source of truth for site-wide navigation and official external destinations.
 * External URLs are overridable by env so the program office can repoint them without a code change.
 */

export const SITE = {
  name: "Tradewinds",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.tradewindai.com",
  description:
    "Discover, assess, and acquire mission-ready AI, digital, and data-driven technologies through the Tradewinds ecosystem.",
  org: "Chief Digital and Artificial Intelligence Office (CDAO)",
} as const;

/**
 * Official destinations. These are NOT reproduced on this site — we only link to them.
 * Defaults point at the current official pages and must be confirmed by the program office
 * before launch (see docs/05-STATUS.md → "Awaiting external integration").
 */
export const EXTERNAL = {
  marketplaceSignIn: process.env.NEXT_PUBLIC_MARKETPLACE_URL || "https://www.tradewindai.com/tw-marketplace",
  submissionPortal: process.env.NEXT_PUBLIC_SUBMISSION_URL || "https://www.tradewindai.com/tw-marketplace",
  samGov: "https://sam.gov",
  aiMil: "https://www.ai.mil",
  supportEmail: "support@tradewindai.com",
  successEmail: "success@tradewindai.com",
  linkedIn: "https://www.linkedin.com/company/tradewind-ai",
} as const;

export type NavLink = { label: string; href: string; description?: string; external?: boolean };
export type NavGroup = {
  label: string;
  href: string;
  summary: string;
  links: NavLink[];
  feature?: { eyebrow: string; title: string; href: string; cta: string };
};

export const NAV: NavGroup[] = [
  {
    label: "Marketplace",
    href: "/marketplace",
    summary: "The DoW repository of assessed, readily awardable AI, digital and data solutions.",
    links: [
      { label: "Marketplace Overview", href: "/marketplace", description: "How the Solutions Marketplace works" },
      { label: "Browse Awardables", href: "/marketplace/solutions", description: "Search public solution metadata" },
      { label: "For Government Buyers", href: "/marketplace/government", description: "Find capabilities for your mission" },
      { label: "For Solution Providers", href: "/marketplace/providers", description: "Bring your technology to the mission" },
      { label: "Submission Guide", href: "/marketplace/submission-guide", description: "Checklist, requirements and timing" },
      { label: "SBIR/STTR Aisle", href: "/marketplace/sbir-sttr", description: "Small business innovation pathway" },
      { label: "Prototype Transition Aisle", href: "/marketplace/prototype-transition", description: "Move proven prototypes forward" },
    ],
    feature: { eyebrow: "Government users", title: "Sign in to the Solutions Marketplace", href: "/marketplace/government", cta: "Access options" },
  },
  {
    label: "Opportunities",
    href: "/opportunities",
    summary: "Open calls, special topics and shopping notices — with live status and deadlines.",
    links: [
      { label: "All Opportunities", href: "/opportunities", description: "Search and filter every open call" },
      { label: "Special Topics", href: "/opportunities/special-topics", description: "Targeted calls for specific challenges" },
      { label: "Shopping Notices", href: "/opportunities/shopping-notices", description: "Buyer-issued requests to the Marketplace" },
      { label: "Archive", href: "/opportunities/archive", description: "Closed and historical opportunities" },
    ],
  },
  {
    label: "Acquisition",
    href: "/acquisition",
    summary: "Procurement pathways and CDAO contract vehicles, compared side by side.",
    links: [
      { label: "Acquisition Overview", href: "/acquisition", description: "Pathways from discovery to award" },
      { label: "Contract Vehicles", href: "/acquisition/vehicles", description: "Compare scope, users and ordering" },
      { label: "DRAID", href: "/acquisition/vehicles/draid", description: "Data Readiness for AI Development" },
      { label: "AI Talent 2.0", href: "/acquisition/vehicles/ai-talent-2", description: "Access to AI technical talent" },
      { label: "Test & Evaluation", href: "/acquisition/vehicles/test-and-evaluation", description: "AI T&E Services BPA" },
      { label: "Acquisition Guides", href: "/acquisition/guides", description: "Handbooks and official documents" },
    ],
  },
  {
    label: "AI Tools",
    href: "/ai-tools",
    summary: "Tools and prompts that support effective acquisition workflows.",
    links: [
      { label: "AI Tools Directory", href: "/ai-tools", description: "Approved, external and experimental tools" },
      { label: "Prompt Library", href: "/ai-tools/prompt-library", description: "Searchable prompts for acquisition work" },
    ],
  },
  {
    label: "Resources",
    href: "/resources",
    summary: "Guides, videos, exemplars, FAQs, events and program news in one place.",
    links: [
      { label: "Resource Library", href: "/resources", description: "Search everything" },
      { label: "Videos & Tutorials", href: "/resources/videos", description: "Step-by-step walkthroughs" },
      { label: "Exemplar Submissions", href: "/resources/exemplars", description: "What strong pitches look like" },
      { label: "FAQs", href: "/resources/faqs", description: "Answers for buyers and providers" },
      { label: "Events", href: "/resources/events", description: "Upcoming sessions and recordings" },
      { label: "News & Updates", href: "/resources/news", description: "Program announcements" },
    ],
  },
  {
    label: "About",
    href: "/about",
    summary: "The program, its mission, and the results it delivers.",
    links: [
      { label: "About Tradewinds", href: "/about", description: "Mission and operating model" },
      { label: "Impact & Results", href: "/about/impact", description: "Program metrics over time" },
      { label: "Awarded Solutions", href: "/about/awarded-solutions", description: "Public award records" },
      { label: "Contact & Support", href: "/about/contact", description: "Reach the right team" },
    ],
  },
];

export const FOOTER_COLUMNS = NAV.map((g) => ({ label: g.label, links: g.links.slice(0, 5) }));

/**
 * Single source of truth for site-wide navigation and official external destinations.
 * External URLs are overridable by env so the program office can repoint them without a code change.
 */

export const SITE = {
  name: "Tradewinds",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.tradewindai.com",
  description:
    "A defense acquisition ecosystem that helps government teams discover, assess and award AI, digital and data capabilities faster — and gives solution providers a clearer path to visibility.",
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
  summary?: string;
  links: NavLink[];
  /** Optional promoted card in the desktop mega menu. */
  feature?: { eyebrow: string; title: string; href: string; cta: string };
};

/** Overlay-menu hierarchy (rebuild brief §5). Groups with no children render as single rows. */
export const NAV: NavGroup[] = [
  { label: "Home", href: "/", links: [] },
  {
    label: "Marketplace",
    href: "/marketplace",
    summary: "Evaluated, readily awardable AI, digital and data solutions.",
    links: [
      { label: "Marketplace Overview", href: "/marketplace" },
      { label: "Instructional Videos", href: "/marketplace/videos" },
      { label: "Exemplar Submissions", href: "/marketplace/exemplars" },
      { label: "FAQs", href: "/marketplace/faqs" },
      { label: "Awardable Companies", href: "/marketplace/awardable-companies" },
      { label: "Awardees", href: "/marketplace/awardees" },
      { label: "SBIR/STTR Aisle", href: "/marketplace/sbir-sttr" },
      { label: "Prototype Transition Aisle", href: "/marketplace/prototype-transition" },
    ],
    feature: { eyebrow: "Government users", title: "Sign in to the Solutions Marketplace", href: "/marketplace/government", cta: "Access options" },
  },
  {
    label: "Opportunities",
    href: "/opportunities",
    summary: "Open calls, special topics, shopping notices and initiatives.",
    links: [
      { label: "Current Opportunities", href: "/opportunities" },
      { label: "Special Topics", href: "/opportunities/special-topics" },
      { label: "Shopping Notices", href: "/opportunities/shopping-notices" },
      { label: "Swarm Forge", href: "/opportunities/swarm-forge" },
    ],
  },
  {
    label: "AI Playground",
    href: "/ai-playground",
    summary: "Tools and prompts that support acquisition work.",
    links: [
      { label: "Tool Catalog", href: "/ai-playground" },
      { label: "Prompt Library", href: "/ai-playground/prompt-library" },
      { label: "AcqBot", href: "/ai-playground/acqbot" },
      { label: "FOCI API", href: "/ai-playground/foci-api" },
      { label: "GenAI.mil", href: "/ai-playground/genai-mil" },
      { label: "ProcureSight", href: "/ai-playground/procuresight" },
      { label: "AI Acquisition Assistant", href: "/ai-playground/ai-acquisition-assistant" },
      { label: "PSC Predictor", href: "/ai-playground/psc-predictor" },
      { label: "AIA Toolkit", href: "/ai-playground/aia-toolkit" },
      { label: "TurboInnovate", href: "/ai-playground/turboinnovate" },
      { label: "PSF Intelligence", href: "/ai-playground/psf-intelligence" },
    ],
  },
  {
    label: "Contract Vehicles",
    href: "/contract-vehicles",
    summary: "DRAID, AI Talent 2.0 and T&E.",
    links: [
      { label: "Overview", href: "/contract-vehicles" },
      { label: "DRAID", href: "/contract-vehicles/draid" },
      { label: "AI Talent 2.0", href: "/contract-vehicles/ai-talent-2" },
      { label: "T&E", href: "/contract-vehicles/test-and-evaluation" },
    ],
  },
  { label: "Events", href: "/events", links: [] },
  { label: "Contact", href: "/contact", links: [] },
];

/** Compact desktop header links (top level only). */
export const HEADER_LINKS = NAV.filter((g) => g.href !== "/").map((g) => ({ label: g.label, href: g.href }));

export const PORTAL = { label: "Employee Portal", href: "/employee" } as const;

export const FOOTER_COLUMNS = [
  { label: "Tradewinds", links: [
    { label: "Home", href: "/" }, { label: "Marketplace", href: "/marketplace" }, { label: "Opportunities", href: "/opportunities" },
    { label: "AI Playground", href: "/ai-playground" }, { label: "Events", href: "/events" }, { label: "Contact", href: "/contact" },
  ] },
  { label: "Marketplace", links: [
    { label: "Browse Solutions", href: "/marketplace/awardable-companies" }, { label: "Instructional Videos", href: "/marketplace/videos" },
    { label: "Exemplar Submissions", href: "/marketplace/exemplars" }, { label: "Awardable Companies", href: "/marketplace/awardable-companies" },
    { label: "Awardees", href: "/marketplace/awardees" }, { label: "FAQs", href: "/marketplace/faqs" },
  ] },
  { label: "Contract Vehicles", links: [
    { label: "DRAID", href: "/contract-vehicles/draid" }, { label: "AI Talent 2.0", href: "/contract-vehicles/ai-talent-2" },
    { label: "T&E", href: "/contract-vehicles/test-and-evaluation" }, { label: "Contact", href: "/contact" },
  ] },
  { label: "Admin", links: [
    { label: "Employee Portal", href: "/employee" }, { label: "About Tradewinds", href: "/about" }, { label: "Impact & Results", href: "/about/impact" },
    { label: "Resource Library", href: "/resources" }, { label: "Privacy Notice", href: "/privacy" },
  ] },
];

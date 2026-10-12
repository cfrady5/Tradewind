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

export type NavLink = {
  label: string;
  href: string;
  description?: string;
  external?: boolean;
  /** Aliases and common terms used by the menu search. Never shown. */
  keywords?: string[];
  /** Fuller label for search results when the menu label relies on its parent (e.g. "Overview"). */
  searchLabel?: string;
};
export type NavGroup = {
  label: string;
  href: string;
  summary?: string;
  links: NavLink[];
  keywords?: string[];
  /** Optional promoted card in the desktop mega menu. */
  feature?: { eyebrow: string; title: string; href: string; cta: string };
};

/**
 * Single source of truth for navigation (rebuild brief §5). The desktop header, mega menu,
 * mobile menu, menu search and sitemap all read from this list. Groups with no children
 * render as direct links.
 */
export const NAV: NavGroup[] = [
  { label: "Home", href: "/", links: [], keywords: ["start", "main page", "homepage"] },
  {
    label: "Marketplace",
    href: "/marketplace",
    summary: "Evaluated, readily awardable AI, digital and data solutions.",
    links: [
      { label: "Marketplace Overview", href: "/marketplace", keywords: ["solutions marketplace", "how it works", "repository"] },
      { label: "Instructional Videos", href: "/marketplace/videos", keywords: ["video", "tutorial", "how to", "training", "learn", "walkthrough"] },
      { label: "Exemplar Submissions", href: "/marketplace/exemplars", keywords: ["examples", "sample pitch", "pitch video", "good pitch"] },
      { label: "FAQs", href: "/marketplace/faqs", keywords: ["questions", "frequently asked", "help", "answers"] },
      { label: "Awardable Companies", href: "/marketplace/awardable-companies", keywords: ["vendors", "companies", "solutions directory", "browse solutions"] },
      { label: "Awardees", href: "/marketplace/awardees", keywords: ["awards", "winners", "outcomes", "case studies"] },
      { label: "SBIR/STTR Aisle", href: "/marketplace/sbir-sttr", keywords: ["small business", "phase iii", "phase 3", "sbir", "sttr"] },
      { label: "Prototype Transition Aisle", href: "/marketplace/prototype-transition", keywords: ["follow-on production", "prototype", "transition", "ota"] },
    ],
    feature: { eyebrow: "Government users", title: "Sign in to the Solutions Marketplace", href: "/marketplace/government", cta: "Access options" },
  },
  {
    label: "Opportunities",
    href: "/opportunities",
    summary: "Open calls, special topics, shopping notices and initiatives.",
    links: [
      { label: "Current Opportunities", href: "/opportunities", keywords: ["open calls", "solicitations", "deadlines", "submit", "notices of intent"] },
      { label: "Special Topics", href: "/opportunities/special-topics", keywords: ["topics", "targeted calls"] },
      { label: "Shopping Notices", href: "/opportunities/shopping-notices", keywords: ["notices", "buyer requests"] },
      { label: "Swarm Forge", href: "/opportunities/swarm-forge", keywords: ["autonomy", "autonomous systems", "drones", "uas", "swarm"] },
    ],
  },
  {
    label: "AI Playground",
    href: "/ai-playground",
    summary: "Tools and prompts that support acquisition work.",
    links: [
      { label: "Tool Catalog", href: "/ai-playground", keywords: ["ai tools", "tools", "catalog"] },
      { label: "Prompt Library", href: "/ai-playground/prompt-library", keywords: ["prompts", "chatgpt", "llm", "templates"] },
      { label: "AcqBot", href: "/ai-playground/acqbot", keywords: ["chatbot", "acquisition bot", "assistant"] },
      { label: "FOCI API", href: "/ai-playground/foci-api", keywords: ["foreign ownership", "foreign influence", "risk", "compliance"] },
      { label: "GenAI.mil", href: "/ai-playground/genai-mil", keywords: ["generative ai", "genai", "llm", "chat"] },
      { label: "ProcureSight", href: "/ai-playground/procuresight", keywords: ["market research", "procurement analytics", "spend"] },
      { label: "AI Acquisition Assistant", href: "/ai-playground/ai-acquisition-assistant", keywords: ["assistant", "acquisition help"] },
      { label: "PSC Predictor", href: "/ai-playground/psc-predictor", keywords: ["product service code", "classification", "psc", "naics"] },
      { label: "AIA Toolkit", href: "/ai-playground/aia-toolkit", keywords: ["ai assurance", "assurance", "responsible ai"] },
      { label: "TurboInnovate", href: "/ai-playground/turboinnovate", keywords: ["innovation", "turbo innovate"] },
      { label: "PSF Intelligence", href: "/ai-playground/psf-intelligence", keywords: ["market research", "intelligence"] },
    ],
  },
  {
    label: "Contract Vehicles",
    href: "/contract-vehicles",
    summary: "DRAID, AI Talent 2.0 and T&E.",
    links: [
      { label: "Overview", href: "/contract-vehicles", searchLabel: "Contract Vehicles Overview", keywords: ["vehicles", "ordering", "compare vehicles", "procurement pathways"] },
      { label: "DRAID", href: "/contract-vehicles/draid", keywords: ["data readiness", "data", "boa", "basic ordering agreement"] },
      { label: "AI Talent 2.0", href: "/contract-vehicles/ai-talent-2", keywords: ["talent", "workforce", "staffing", "boa"] },
      { label: "T&E", href: "/contract-vehicles/test-and-evaluation", keywords: ["test and evaluation", "testing", "evaluation", "bpa", "blanket purchase agreement"] },
    ],
  },
  { label: "Events", href: "/events", links: [], keywords: ["webinars", "marketplace minute", "office hours", "workshops", "calendar", "recordings", "training"] },
  { label: "Contact", href: "/contact", links: [], keywords: ["help", "support", "email", "helpdesk", "schedule a call", "press"] },
];

/** Compact desktop header links (top level only). */
export const HEADER_LINKS = NAV.filter((g) => g.href !== "/").map((g) => ({ label: g.label, href: g.href }));

export const PORTAL = { label: "Employee Portal", href: "/employee", keywords: ["staff", "admin", "cms", "employee login", "edit content"] } as const;

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

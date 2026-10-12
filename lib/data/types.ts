export type DataSource = "supabase" | "development";
export type Loaded<T> = { items: T[]; source: DataSource };

/** `sample: true` marks illustrative records that are NOT real program data. */
type Base = { slug: string; sample?: boolean };

export type Metric = {
  key: string;
  label: string;
  value: number;
  format: "number" | "currency-compact";
  asOf: string; // ISO date
  reportingPeriod: string;
  source: string;
  verified: boolean;
};

export type OpportunityType = "marketplace-collection" | "special-topic" | "shopping-notice" | "notice-of-intent" | "initiative" | "external";
export type OpportunityStatus = "open" | "upcoming" | "closed";

export type Opportunity = Base & {
  title: string;
  type: OpportunityType;
  sponsor: string;
  summary: string;
  topics: string[];
  opensAt?: string;
  closesAt?: string;
  /** monthly = recurring collection period closing 12:00 pm ET on the last day of each month */
  recurrence?: "monthly";
  missionNeed?: string;
  eligibility?: string;
  requirements?: string[];
  submissionInstructions?: string;
  documents?: { label: string; url: string }[];
  contactEmail?: string;
  externalUrl?: string;
  issuingOffice?: string;
  /** Pinned to the top of the Opportunities page and the homepage. */
  featured?: boolean;
  ctaLabel?: string;
  ctaUrl?: string;
  updatedAt?: string;
};

export type Solution = Base & {
  name: string;
  company: string;
  summary: string;
  focusArea: string;
  technologyCategory: string;
  solutionType: string;
  awardableSince: string; // YYYY-MM
  aisle?: "General" | "SBIR/STTR" | "Prototype Transition";
  businessSize?: "Small" | "Large" | "Non-traditional" | "Academia";
  trl?: number;
  listingStatus?: "Awardable" | "Archived" | "Updated";
};

export type VehicleStatus = "active" | "limited" | "historical" | "pending-confirmation";

export type ContractVehicle = Base & {
  name: string;
  shortName: string;
  vehicleType: string;
  status: VehicleStatus;
  tagline: string;
  overview: string;
  scope: string[];
  eligibleUsers: string;
  orderingProcess: string[];
  availability: string;
  documents: { label: string; url: string }[];
  holders?: string;
  contacts: { label: string; email: string }[];
  historicalNotes?: string;
  pendingFields?: string[];
  /** Brief §6.13–6.16 detail sections — each renders only when present. */
  whoItServes?: string;
  background?: string;
  problem?: string;
  howItHelps?: string;
  capabilityLabel?: string;
  capabilityCategories?: string[];
  serviceGroups?: { title: string; body: string }[];
  orderingGuideUrl?: string;
  holderListUrl?: string;
  updateNotice?: string;
};

export type ToolAvailability = "approved" | "external" | "experimental" | "pending";
export type AiTool = Base & {
  name: string;
  category: string;
  summary: string;
  description: string;
  useCases: string[];
  availability: ToolAvailability;
  access: string;
  accessUrl?: string;
  dataSensitivity?: string;
  authorizationLevel?: string;
  owner?: string;
  audiences?: Audience[];
  learnMoreUrl?: string;
  updatedAt?: string;
};

export type Prompt = Base & {
  title: string;
  category: string;
  description: string;
  body: string;
  usageNotes?: string;
  intendedUser?: string;
  inputsRequired?: string;
  outputFormat?: string;
  warnings?: string;
  updatedAt?: string;
};

export type ResourceKind = "guide" | "video" | "tutorial" | "exemplar" | "document" | "news";
export type Audience = "government" | "industry" | "all";
export type Resource = Base & {
  title: string;
  kind: ResourceKind;
  audiences: Audience[];
  summary: string;
  url?: string;
  date?: string;
  duration?: string;
  hasCaptions?: boolean;
  hasTranscript?: boolean;
  /** Instructional-video category (brief §6.3). */
  category?: VideoCategory;
  updatedAt?: string;
  related?: { label: string; href: string }[];
};

export const VIDEO_CATEGORIES = [
  "Getting Started", "Submission Format", "Content and Criteria", "Competition Standards", "Assessment and Feedback", "Communications and Marketing",
] as const;
export type VideoCategory = (typeof VIDEO_CATEGORIES)[number];

export type EventItem = Base & {
  title: string;
  startsAt: string;
  endsAt?: string;
  format: "virtual" | "in-person" | "hybrid";
  location: string;
  summary: string;
  registrationUrl?: string;
  recordingUrl?: string;
  description?: string;
  timeZone?: string;
  eventType?: string;
  speakers?: { name: string; title?: string }[];
  resources?: { label: string; url: string }[];
};

export type Faq = Base & {
  question: string;
  answer: string; // plain text paragraphs separated by \n\n
  category: FaqCategory;
  audiences: Audience[];
  updatedAt?: string;
  relatedLinks?: { label: string; href: string }[];
};

/** FAQ organization from the rebuild brief §6.5. */
export const FAQ_CATEGORIES = [
  "General Marketplace", "Vendor Submission", "Government Buyer", "Assessment and Awardable Status",
  "SBIR/STTR Aisle", "Prototype Transition Aisle", "Contracting and Acquisition", "Communications and Press",
] as const;
export type FaqCategory = (typeof FAQ_CATEGORIES)[number];

export type Award = Base & {
  vendor: string;
  solution: string;
  awardingActivity: string;
  awardDate: string;
  valueUsd?: number;
  vehicle: string;
  website?: string;
  description?: string;
  category?: string;
  caseStudyUrl?: string;
};

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

export type OpportunityType = "marketplace-collection" | "special-topic" | "shopping-notice" | "external";
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
};

export type Solution = Base & {
  name: string;
  company: string;
  summary: string;
  focusArea: string;
  technologyCategory: string;
  solutionType: string;
  awardableSince: string; // YYYY-MM
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
};

export type ToolAvailability = "approved" | "external" | "experimental";
export type AiTool = Base & {
  name: string;
  category: string;
  summary: string;
  description: string;
  useCases: string[];
  availability: ToolAvailability;
  access: string;
  accessUrl?: string;
};

export type Prompt = Base & {
  title: string;
  category: string;
  description: string;
  body: string;
  usageNotes?: string;
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
};

export type EventItem = Base & {
  title: string;
  startsAt: string;
  endsAt?: string;
  format: "virtual" | "in-person" | "hybrid";
  location: string;
  summary: string;
  registrationUrl?: string;
  recordingUrl?: string;
};

export type Faq = Base & {
  question: string;
  answer: string; // plain text paragraphs separated by \n\n
  category: "Marketplace" | "Submissions" | "Government Access" | "Acquisition" | "General";
  audiences: Audience[];
};

export type Award = Base & {
  vendor: string;
  solution: string;
  awardingActivity: string;
  awardDate: string;
  valueUsd?: number;
  vehicle: string;
};

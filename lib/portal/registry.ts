/**
 * Content-type registry: drives the portal's list views and structured editors (brief §7.5, §8).
 * Field names are database columns; the editor never exposes a free-form "write SQL" surface.
 */
export type FieldType = "text" | "slug" | "textarea" | "select" | "list" | "tags" | "json" | "date" | "datetime" | "number" | "boolean" | "url" | "email";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: readonly string[];
  help?: string;
  /** Government-only / internal data: never selected by the public views. */
  restricted?: boolean;
  wide?: boolean;
};

export type ContentType = {
  table: string;
  label: string;
  singular: string;
  description: string;
  titleField: string;
  listColumns: { name: string; label: string }[];
  fields: Field[];
  /** Public URL of a live record (for the "View live" link and cache revalidation). */
  publicPath?: (row: Record<string, unknown>) => string | null;
  /** Optional list filter on one column. */
  filter?: { name: string; label: string; options: readonly string[] };
  defaultSort?: { column: string; ascending?: boolean };
};

const F = (name: string, label: string, type: FieldType = "text", extra: Partial<Field> = {}): Field => ({ name, label, type, ...extra });

export const STATUSES = ["draft", "in_review", "scheduled", "published", "archived"] as const;
export type Status = (typeof STATUSES)[number];
export const STATUS_LABEL: Record<Status, string> = { draft: "Draft", in_review: "In review", scheduled: "Scheduled", published: "Published", archived: "Archived" };

/** Columns every content table shares; edited in the sidebar of the editor. */
export const COMMON_FIELDS: Field[] = [
  F("publish_at", "Publish at", "datetime", { help: "Used when the status is Scheduled." }),
  F("unpublish_at", "Unpublish at", "datetime", { help: "Optional end of the live window." }),
  F("sort_order", "Sort order", "number"),
  F("seo_title", "SEO title"),
  F("seo_description", "SEO description", "textarea"),
  F("og_image_url", "Social image URL", "url"),
];

const AUDIENCES = ["all", "government", "industry"] as const;
const FAQ_CATS = ["General Marketplace", "Vendor Submission", "Government Buyer", "Assessment and Awardable Status", "SBIR/STTR Aisle", "Prototype Transition Aisle", "Contracting and Acquisition", "Communications and Press"] as const;

export const CONTENT_TYPES: Record<string, ContentType> = {
  pages: {
    table: "pages", label: "Pages", singular: "Page", titleField: "title",
    description: "Structured public pages: hero, sections, calls to action.",
    listColumns: [{ name: "slug", label: "Slug" }, { name: "parent_slug", label: "Parent" }],
    fields: [
      F("title", "Title", "text", { required: true }),
      F("slug", "Slug", "slug", { required: true }),
      F("parent_slug", "Parent page slug"),
      F("hero_eyebrow", "Hero eyebrow"),
      F("hero_title", "Hero title"),
      F("hero_lead", "Hero lead", "textarea", { wide: true }),
      F("sections", "Sections", "json", { wide: true, help: 'JSON array of { "type", "heading", "body", "items": [] }.' }),
      F("cta_label", "CTA label"), F("cta_url", "CTA URL", "url"),
      F("related_links", "Related links", "json", { help: 'JSON array of { "label", "href" }.' }),
      F("audiences", "Audiences", "tags", { options: AUDIENCES }),
    ],
    publicPath: (r) => (typeof r.slug === "string" ? `/${r.slug}` : null),
  },
  opportunities: {
    table: "opportunities", label: "Opportunities", singular: "Opportunity", titleField: "title",
    description: "Collection periods, special topics, shopping notices, notices of intent and initiatives.",
    listColumns: [{ name: "type", label: "Type" }, { name: "sponsor", label: "Sponsor" }, { name: "closes_at", label: "Closes" }],
    filter: { name: "type", label: "Type", options: ["marketplace-collection", "special-topic", "shopping-notice", "notice-of-intent", "initiative", "external"] },
    fields: [
      F("title", "Title", "text", { required: true }),
      F("slug", "Slug", "slug", { required: true }),
      F("type", "Type", "select", { required: true, options: ["marketplace-collection", "special-topic", "shopping-notice", "notice-of-intent", "initiative", "external"] }),
      F("sponsor", "Sponsor", "text", { required: true }),
      F("issuing_office", "Issuing office"),
      F("summary", "Summary", "textarea", { required: true, wide: true }),
      F("description", "Description", "textarea", { wide: true }),
      F("topics", "Topics", "tags"),
      F("opens_at", "Opens", "datetime"), F("closes_at", "Due date", "datetime"),
      F("recurrence", "Recurrence", "select", { options: ["", "monthly"] }),
      F("mission_need", "Mission need", "textarea", { wide: true }),
      F("eligibility", "Eligibility", "textarea", { wide: true }),
      F("requirements", "Requirements", "list", { wide: true, help: "One per line." }),
      F("submission_instructions", "Submission instructions", "textarea", { wide: true }),
      F("cta_label", "CTA label"), F("cta_url", "CTA URL", "url"),
      F("documents", "Related documents", "json", { help: 'JSON array of { "label", "url" }.' }),
      F("related_pages", "Related pages", "tags", { help: "Page slugs." }),
      F("contact_email", "Contact email", "email"), F("external_url", "External URL", "url"),
      F("featured", "Featured on the homepage", "boolean"),
    ],
    publicPath: (r) => (typeof r.slug === "string" ? `/opportunities/${r.slug}` : null),
    defaultSort: { column: "closes_at", ascending: false },
  },
  solutions: {
    table: "solutions", label: "Awardable Companies", singular: "Awardable company", titleField: "name",
    description: "Public listing data plus government-only detail. Only rows with visibility = public ever appear on the site.",
    listColumns: [{ name: "company", label: "Company" }, { name: "aisle", label: "Aisle" }, { name: "awardable_since", label: "Awardable" }, { name: "visibility", label: "Visibility" }],
    filter: { name: "aisle", label: "Aisle", options: ["General", "SBIR/STTR", "Prototype Transition"] },
    fields: [
      F("name", "Solution name", "text", { required: true }),
      F("slug", "Slug", "slug", { required: true }),
      F("company", "Company name", "text", { required: true }),
      F("company_website", "Company website", "url"),
      F("summary", "Short capability summary", "textarea", { required: true, wide: true }),
      F("focus_area", "Strategic focus area", "text", { required: true }),
      F("technology_category", "Technology category", "text", { required: true }),
      F("solution_type", "Solution type", "text", { required: true }),
      F("awardable_since", "Awardable month (YYYY-MM)", "text", { required: true }),
      F("aisle", "Aisle", "select", { required: true, options: ["General", "SBIR/STTR", "Prototype Transition"] }),
      F("business_size", "Business size", "select", { options: ["", "Small", "Large", "Non-traditional", "Academia"] }),
      F("trl", "Technology readiness level (1–9)", "number"),
      F("keywords", "Keywords", "tags"),
      F("listing_status", "Listing status", "select", { options: ["Awardable", "Archived", "Updated"] }),
      F("visibility", "Public visibility", "select", { required: true, options: ["internal", "public", "hidden"], help: "Only 'public' rows are listed on the website." }),
      F("gov_details", "Government-only details", "textarea", { restricted: true, wide: true }),
      F("pitch_video_url", "Pitch video URL", "url", { restricted: true }),
      F("provider_contact", "Provider contact", "json", { restricted: true, help: 'JSON { "name", "email", "phone" }.' }),
      F("attachments", "Supporting materials", "json", { restricted: true, help: 'JSON array of { "label", "url" }.' }),
      F("acquisition_notes", "Acquisition notes", "textarea", { restricted: true, wide: true }),
    ],
    publicPath: () => "/marketplace/awardable-companies",
    defaultSort: { column: "awardable_since", ascending: false },
  },
  awards: {
    table: "awards", label: "Awardees", singular: "Awardee", titleField: "vendor",
    description: "Contract outcomes. Never list classified awards; only visibility = public rows are shown.",
    listColumns: [{ name: "solution", label: "Award" }, { name: "award_date", label: "Date" }, { name: "visibility", label: "Visibility" }],
    fields: [
      F("vendor", "Company name", "text", { required: true }),
      F("slug", "Slug", "slug", { required: true }),
      F("website", "Website", "url"),
      F("solution", "Award title", "text", { required: true }),
      F("description", "Public description", "textarea", { wide: true }),
      F("awarding_activity", "Awarding organization", "text", { required: true }),
      F("award_date", "Award date", "date", { required: true }),
      F("value_usd", "Public value (USD)", "number"),
      F("category", "Capability category"),
      F("vehicle", "Vehicle / pathway", "text", { required: true }),
      F("case_study_url", "Case study link", "url"),
      F("visibility", "Visibility", "select", { required: true, options: ["internal", "public", "hidden"] }),
    ],
    publicPath: () => "/marketplace/awardees",
    defaultSort: { column: "award_date", ascending: false },
  },
  resources: {
    table: "resources", label: "Resources & Videos", singular: "Resource", titleField: "title",
    description: "Guides, instructional videos, tutorials, exemplar submissions, documents and news.",
    listColumns: [{ name: "kind", label: "Kind" }, { name: "category", label: "Category" }, { name: "date", label: "Date" }],
    filter: { name: "kind", label: "Kind", options: ["guide", "video", "tutorial", "exemplar", "document", "news"] },
    fields: [
      F("title", "Title", "text", { required: true }),
      F("slug", "Slug", "slug", { required: true }),
      F("kind", "Kind", "select", { required: true, options: ["guide", "video", "tutorial", "exemplar", "document", "news"] }),
      F("category", "Video category", "select", { options: ["", "Getting Started", "Submission Format", "Content and Criteria", "Competition Standards", "Assessment and Feedback", "Communications and Marketing"] }),
      F("audiences", "Audience", "tags", { options: AUDIENCES }),
      F("summary", "Short description", "textarea", { required: true, wide: true }),
      F("url", "Link / document URL", "url"),
      F("video_url", "Video URL", "url"), F("thumbnail_url", "Thumbnail URL", "url"),
      F("date", "Date updated", "date"), F("duration", "Runtime (e.g. 6:12)"),
      F("has_captions", "Captions available", "boolean"), F("has_transcript", "Transcript available", "boolean"),
      F("transcript", "Transcript", "textarea", { wide: true }),
      F("related", "Related links", "json", { help: 'JSON array of { "label", "href" }.' }),
    ],
    publicPath: (r) => (r.kind === "video" || r.kind === "tutorial" ? "/marketplace/videos" : r.kind === "exemplar" ? "/marketplace/exemplars" : "/resources"),
    defaultSort: { column: "date", ascending: false },
  },
  faqs: {
    table: "faqs", label: "FAQs", singular: "FAQ", titleField: "question",
    description: "Searchable answers. Order with the sort field; reorder from the list view.",
    listColumns: [{ name: "category", label: "Category" }, { name: "sort_order", label: "Order" }],
    filter: { name: "category", label: "Category", options: FAQ_CATS },
    fields: [
      F("question", "Question", "text", { required: true, wide: true }),
      F("slug", "Slug", "slug", { required: true }),
      F("category", "Category", "select", { required: true, options: FAQ_CATS }),
      F("audiences", "Audience", "tags", { options: AUDIENCES }),
      F("answer", "Answer", "textarea", { required: true, wide: true, help: "Plain text; separate paragraphs with a blank line." }),
      F("related_links", "Related links", "json", { help: 'JSON array of { "label", "href" }.' }),
    ],
    publicPath: (r) => (typeof r.slug === "string" ? `/marketplace/faqs#${r.slug}` : "/marketplace/faqs"),
    defaultSort: { column: "sort_order" },
  },
  ai_tools: {
    table: "ai_tools", label: "AI Playground — Tools", singular: "AI tool", titleField: "name",
    description: "Tool catalog. State data-sensitivity limits plainly; they render next to the action button.",
    listColumns: [{ name: "category", label: "Category" }, { name: "availability", label: "Authorization" }, { name: "provider", label: "Owner" }],
    filter: { name: "availability", label: "Authorization", options: ["approved", "external", "experimental", "pending"] },
    fields: [
      F("name", "Tool name", "text", { required: true }),
      F("slug", "Slug", "slug", { required: true }),
      F("provider", "Owner / provider"),
      F("category", "Capability category", "text", { required: true }),
      F("summary", "Short description", "textarea", { required: true, wide: true }),
      F("description", "Description", "textarea", { required: true, wide: true }),
      F("use_cases", "Use cases", "list", { help: "One per line." }),
      F("availability", "Authorization status", "select", { required: true, options: ["approved", "external", "experimental", "pending"] }),
      F("authorization_level", "Authorization level", "text", { help: "e.g. IL2 / IL4 / Not authorized for CUI." }),
      F("data_sensitivity", "Data sensitivity warning", "textarea", { wide: true }),
      F("audiences", "Audience", "tags", { options: AUDIENCES }),
      F("access", "Access requirements", "text", { required: true }),
      F("access_url", "Access URL", "url"), F("learn_more_url", "Learn more URL", "url"),
      F("logo_url", "Logo URL", "url"), F("user_guide_url", "User guide URL", "url"),
    ],
    publicPath: (r) => (typeof r.slug === "string" ? `/ai-playground/${r.slug}` : null),
  },
  prompts: {
    table: "prompts", label: "AI Playground — Prompts", singular: "Prompt", titleField: "title",
    description: "Copy-ready prompts for acquisition work.",
    listColumns: [{ name: "category", label: "Category" }, { name: "sort_order", label: "Order" }],
    fields: [
      F("title", "Prompt title", "text", { required: true }),
      F("slug", "Slug", "slug", { required: true }),
      F("category", "Category", "text", { required: true }),
      F("description", "Description", "textarea", { required: true, wide: true }),
      F("body", "Full prompt", "textarea", { required: true, wide: true }),
      F("intended_user", "Intended user"), F("inputs_required", "Inputs required", "textarea"),
      F("output_format", "Output format"), F("warnings", "Warnings", "textarea"),
      F("usage_notes", "Usage notes", "textarea"),
    ],
    publicPath: () => "/ai-playground/prompt-library",
    defaultSort: { column: "sort_order" },
  },
  contract_vehicles: {
    table: "contract_vehicles", label: "Contract Vehicles", singular: "Contract vehicle", titleField: "name",
    description: "DRAID, AI Talent 2.0, T&E and any future vehicle.",
    listColumns: [{ name: "short_name", label: "Short name" }, { name: "vehicle_status", label: "Vehicle status" }],
    fields: [
      F("name", "Name", "text", { required: true }),
      F("slug", "Slug", "slug", { required: true }),
      F("short_name", "Short name", "text", { required: true }),
      F("vehicle_type", "Vehicle type", "text", { required: true }),
      F("vehicle_status", "Vehicle status", "select", { required: true, options: ["active", "limited", "historical", "pending-confirmation"] }),
      F("tagline", "Tagline", "text", { required: true, wide: true }),
      F("overview", "Overview", "textarea", { required: true, wide: true }),
      F("scope", "Scope", "list", { help: "One per line." }),
      F("capability_categories", "Capability categories", "tags"),
      F("who_it_serves", "Who it serves", "textarea"),
      F("background", "Background", "textarea", { wide: true }),
      F("problem", "Problem it addresses", "textarea", { wide: true }),
      F("how_it_helps", "How the vehicle helps", "textarea", { wide: true }),
      F("capability_label", "Capability list heading", "text", { help: "e.g. Covered capabilities, Services covered." }),
      F("service_groups", "Service groups", "json", { wide: true, help: 'JSON array of { "title", "body" }.' }),
      F("eligible_users", "Eligible users", "textarea", { required: true }),
      F("ordering_process", "Ordering steps", "list", { help: "One per line." }),
      F("ordering_guide_url", "Ordering guide URL", "url"), F("holder_list_url", "Holder list URL", "url"),
      F("availability", "Current status text", "text", { required: true }),
      F("period_of_performance", "Period of performance"),
      F("documents", "Documents", "json", { help: 'JSON array of { "label", "url" }.' }),
      F("holders", "Holders", "textarea"),
      F("contacts", "Contacts", "json", { help: 'JSON array of { "label", "email" }.' }),
      F("historical_notes", "Historical notes", "textarea", { wide: true }),
      F("update_notice", "Update notice", "textarea"),
      F("pending_fields", "Fields awaiting confirmation", "tags"),
    ],
    publicPath: (r) => (typeof r.slug === "string" ? `/contract-vehicles/${r.slug}` : null),
    defaultSort: { column: "sort_order" },
  },
  events: {
    table: "events", label: "Events", singular: "Event", titleField: "title",
    description: "Workshops, office hours and summits.",
    listColumns: [{ name: "starts_at", label: "Starts" }, { name: "format", label: "Format" }, { name: "event_type", label: "Type" }],
    fields: [
      F("title", "Title", "text", { required: true }),
      F("slug", "Slug", "slug", { required: true }),
      F("starts_at", "Starts", "datetime", { required: true }), F("ends_at", "Ends", "datetime"),
      F("time_zone", "Time zone", "text", { help: "IANA name, e.g. America/New_York." }),
      F("format", "Format", "select", { required: true, options: ["virtual", "in-person", "hybrid"] }),
      F("event_type", "Event type"),
      F("location", "Location", "text", { required: true }),
      F("summary", "Summary", "textarea", { required: true, wide: true }),
      F("description", "Description", "textarea", { wide: true }),
      F("speakers", "Speakers", "json", { help: 'JSON array of { "name", "title" }.' }),
      F("resources", "Resources", "json", { help: 'JSON array of { "label", "url" }.' }),
      F("registration_url", "Registration URL", "url"), F("recording_url", "Recording URL", "url"),
      F("recap", "Recap", "textarea", { wide: true }),
    ],
    publicPath: () => "/events",
    defaultSort: { column: "starts_at", ascending: false },
  },
  metrics: {
    table: "metrics", label: "Marketplace Metrics", singular: "Metric", titleField: "label",
    description: "Homepage and impact figures. Keep the source note current; unverified figures display a notice.",
    listColumns: [{ name: "value", label: "Value" }, { name: "as_of", label: "As of" }, { name: "verified", label: "Verified" }],
    fields: [
      F("label", "Label", "text", { required: true }),
      F("slug", "Key", "slug", { required: true, help: "Stable key used by the site, e.g. awardable." }),
      F("value", "Value", "number", { required: true }),
      F("format", "Format", "select", { required: true, options: ["number", "currency-compact"] }),
      F("suffix", "Suffix"),
      F("description", "Description", "textarea"),
      F("as_of", "As-of date", "date", { required: true }),
      F("reporting_period", "Reporting period", "text", { required: true }),
      F("source", "Source note", "text", { required: true }),
      F("methodology", "Methodology", "textarea"),
      F("verified", "Verified by the program office", "boolean"),
      F("display_location", "Display locations", "tags", { options: ["home", "impact", "marketplace"] }),
    ],
    publicPath: () => "/about/impact",
    defaultSort: { column: "sort_order" },
  },
};

export const CONTENT_KEYS = Object.keys(CONTENT_TYPES);
export function getType(key: string): ContentType | null {
  return Object.prototype.hasOwnProperty.call(CONTENT_TYPES, key) ? CONTENT_TYPES[key] : null;
}

/** Portal navigation (brief §7.9). */
export const PORTAL_NAV: { label: string; href: string; min?: "viewer" | "contributor" | "editor" | "admin" | "super_admin" }[] = [
  { label: "Dashboard", href: "/employee/dashboard" },
  { label: "Pages", href: "/employee/content/pages" },
  { label: "Marketplace", href: "/employee/content/metrics" },
  { label: "Opportunities", href: "/employee/content/opportunities" },
  { label: "Awardables", href: "/employee/content/solutions" },
  { label: "Awardees", href: "/employee/content/awards" },
  { label: "Resources", href: "/employee/content/resources" },
  { label: "Videos", href: "/employee/content/resources?filter=video" },
  { label: "FAQs", href: "/employee/content/faqs" },
  { label: "AI Playground", href: "/employee/content/ai_tools" },
  { label: "Prompt Library", href: "/employee/content/prompts" },
  { label: "Contract Vehicles", href: "/employee/content/contract_vehicles" },
  { label: "Events", href: "/employee/content/events" },
  { label: "Media Library", href: "/employee/media" },
  { label: "Users", href: "/employee/users", min: "admin" },
  { label: "Settings", href: "/employee/settings", min: "admin" },
  { label: "Audit Logs", href: "/employee/audit", min: "admin" },
];

/** Uploads (brief §7.6): explicit allow-list, no SVG (no sanitizer in this environment). */
export const MEDIA_TYPES: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "text/csv": "csv", "video/mp4": "mp4",
};
export const MEDIA_MAX_BYTES = 50 * 1024 * 1024;

/** Parse an editor form into a row object according to the field definitions. */
export function parseFields(fields: Field[], form: FormData): { row: Record<string, unknown>; errors: string[] } {
  const row: Record<string, unknown> = {};
  const errors: string[] = [];
  for (const f of fields) {
    const raw = form.get(f.name);
    const v = typeof raw === "string" ? raw.trim() : "";
    switch (f.type) {
      case "boolean": row[f.name] = raw === "on" || raw === "true"; break;
      case "number": row[f.name] = v === "" ? null : Number(v); if (v !== "" && Number.isNaN(row[f.name])) errors.push(`${f.label} must be a number.`); break;
      case "list": row[f.name] = v === "" ? [] : v.split(/\r?\n/).map((s) => s.trim()).filter(Boolean); break;
      case "tags": row[f.name] = v === "" ? [] : v.split(/[,\n]/).map((s) => s.trim()).filter(Boolean); break;
      case "json":
        if (v === "") { row[f.name] = f.name === "provider_contact" ? null : []; break; }
        try { row[f.name] = JSON.parse(v); } catch { errors.push(`${f.label} must be valid JSON.`); }
        break;
      case "datetime": row[f.name] = v === "" ? null : new Date(v).toISOString(); break;
      case "date": row[f.name] = v === "" ? null : v; break;
      case "slug":
        row[f.name] = v.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
        if (!row[f.name]) errors.push(`${f.label} is required.`);
        break;
      case "select": row[f.name] = v === "" ? null : v; break;
      default: row[f.name] = v === "" ? null : v;
    }
    if (f.required && f.type !== "boolean" && f.type !== "slug" && (row[f.name] === null || row[f.name] === "")) errors.push(`${f.label} is required.`);
  }
  return { row, errors };
}

/** Render a stored value back into the editor's input. */
export function fieldValue(f: Field, v: unknown): string {
  if (v === null || v === undefined) return "";
  switch (f.type) {
    case "list": return Array.isArray(v) ? v.join("\n") : String(v);
    case "tags": return Array.isArray(v) ? v.join(", ") : String(v);
    case "json": return JSON.stringify(v, null, 2);
    case "datetime": { const d = new Date(String(v)); return Number.isNaN(d.getTime()) ? "" : new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); }
    default: return String(v);
  }
}

/** Admin-editable site settings (site_settings table). */
export const SETTING_KEYS = [
  { key: "marketplace_url", label: "Marketplace sign-in URL", type: "url" },
  { key: "submission_url", label: "Solution submission URL", type: "url" },
  { key: "announcement", label: "Site-wide announcement (blank to hide)", type: "text" },
  { key: "collection_deadline_note", label: "Collection-period note", type: "text" },
] as const;

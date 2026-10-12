# 06 — Response to the Tradewinds-Style Rebuild Brief

This document answers the brief's deliverables (§15): sitemap, wireframes, content direction,
employee-portal structure, data models, component list, security and publishing workflow, and the
implementation plan. Where the brief and the earlier approved design conflicted, the owner's later
decisions govern: **the light design system stays** (the dark tactical treatment was built, reviewed
and reverted on 2026-10-12) and the brief's **information architecture, copy, portal and data model**
are adopted in full.

## 1. Sitemap (as built)

| Section | Routes |
| --- | --- |
| Home | `/` |
| Marketplace | `/marketplace` (overview, two-path entry) · `/marketplace/videos` (instructional videos) · `/marketplace/exemplars` · `/marketplace/faqs` · `/marketplace/awardable-companies` · `/marketplace/awardees` · `/marketplace/sbir-sttr` · `/marketplace/prototype-transition` · `/marketplace/government` · `/marketplace/providers` · `/marketplace/submission-guide` |
| Opportunities | `/opportunities` (current) · `/opportunities/special-topics` · `/opportunities/shopping-notices` · `/opportunities/swarm-forge` · `/opportunities/archive` · `/opportunities/[slug]` |
| AI Playground | `/ai-playground` (tool catalog) · `/ai-playground/prompt-library` · `/ai-playground/[slug]` for AcqBot, FOCI API, GenAI.mil, ProcureSight, AI Acquisition Assistant, PSC Predictor, AIA Toolkit, TurboInnovate, PSF Intelligence |
| Contract Vehicles | `/contract-vehicles` (overview + comparison) · `/contract-vehicles/draid` · `/contract-vehicles/ai-talent-2` · `/contract-vehicles/test-and-evaluation` · `/contract-vehicles/guides` |
| Events | `/events` |
| Contact | `/contact` |
| Program | `/about` · `/about/impact` · `/resources` · `/resources/news` · `/privacy` |
| Employee Portal | `/employee` (sign-in) · `/employee/mfa` · `/employee/set-password` · `/employee/dashboard` · `/employee/content/{type}` · `/employee/content/{type}/new` · `/employee/content/{type}/{id}` · `/employee/preview/{type}/{id}` · `/employee/media` · `/employee/users` · `/employee/settings` · `/employee/audit` |

Permanent (308) redirects cover every Wix-era URL and every route from the first rebuild pass
(`next.config.ts`). The sitemap.xml is generated from the navigation plus live records; `/employee` is
excluded from indexing by robots.txt and per-page `noindex`.

## 2. Wireframes (text)

**Header (all pages).** Logo · top-level items (Marketplace, Opportunities, AI Playground, Contract
Vehicles open a mega menu; Events and Contact are direct links) · persistent **Access Marketplace**
button · hamburger on small screens opening a slide-in sheet with the full hierarchy and the Employee
Portal link. The bar turns solid white on scroll; the wordmark swaps to the full-colour lockup.

**Homepage.** Hero (headline, one-sentence explanation, Access Marketplace / Submit a Solution / View
Opportunities, photo collage) → metric strip (participating organizations, awardable solutions,
submitted solutions, award value) → pathway cards (government buyer / solution provider) → how it works
(orbital assess → connect → acquire animation) → ecosystem & contract vehicles → featured
opportunities → AI Playground preview → results → resources & events → final CTA.

**Interior pages.** Navy page header with breadcrumbs, title, lead and the monogram field; content in
a 12-column grid with sticky in-page navigation on long pages; "next steps" band; footer with the
brief's four columns (Tradewinds / Marketplace / Contract Vehicles / Admin).

**Directories** (awardable companies, awardees, FAQs, resources, tools, prompts, opportunities, events).
Search box + filter chips + sort, state synced to the URL, results as cards or rows, empty states that
say what is missing and why.

**Employee portal.** Dark sign-in card → authenticator step → sidebar app: Dashboard (quick actions,
pending approvals, drafts, scheduled, recently published, deadlines, events, uploads, global search);
content lists (search, status and type filters, status badges, bulk archive); editor (fields left,
status / workflow / versions right, version note at the bottom); media library (table + upload panel
with the data-handling warning); users; settings; audit log (immutable, filterable).

## 3. Content direction

Voice: direct, specific, government-grade. Headlines state what the platform does; subheads explain in
one sentence; every CTA is a verb phrase. Tone references the Tradewinds brand guidelines and the
approved light visual system.

- Home: "Accelerating access to evaluated AI and data solutions." + the brief's one-sentence
  explanation and CTA group.
- Marketplace: the repository of evaluated, post-competition pitch videos; two paths; the five-step
  process; monthly collection period closing 12:00 pm ET on the last day of the month.
- Instructional videos: six categories (Getting Started → Communications and Marketing), each item with
  title, description, runtime, audience, date updated, transcript when available.
- FAQs: nine categories, searchable, deep-linkable, last-updated date.
- Awardable companies: public card (company, solution, summary, focus area, awardable month) with a
  sign-in prompt for detail; government-only detail stays in restricted columns.
- Awardees: public records only, visibility flag per row; no classified awards.
- AI Playground: catalog with authorization status and a data-sensitivity warning beside the action
  button; nine named tools are listed as **Details pending** until the program office supplies approved
  copy (nothing is invented).
- Contract vehicles: parent overview + DRAID, AI Talent 2.0, T&E detail with scope, ordering, holders,
  documents, contacts and historical notes.

## 4. Employee portal structure

Roles (brief §7.2) → database enum `portal_role`: viewer < contributor < editor < admin < super_admin.

| Capability | Viewer | Contributor | Editor | Admin | Super admin |
| --- | --- | --- | --- | --- | --- |
| Read every record, versions, previews | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create and edit drafts | | ✓ | ✓ | ✓ | ✓ |
| Submit for review | | | ✓ | ✓ | ✓ |
| Propose changes to live content (pending changes) | | ✓ | ✓ | — | — |
| Publish, schedule, archive, approve/reject | | | | ✓ | ✓ |
| Upload / replace files | | ✓ | ✓ | ✓ | ✓ |
| Delete files, hard-delete records | | | | ✓ | ✓ |
| Invite and manage viewer/contributor/editor accounts | | | | ✓ | ✓ |
| Manage admin accounts, settings | | | | | ✓ |
| Read audit logs | | | | ✓ | ✓ |

Portal navigation: Dashboard · Pages · Opportunities · Awardables · Awardees · Resources & Videos ·
FAQs · AI Playground · Prompt Library · Contract Vehicles · Events · Metrics · Media Library · Users ·
Settings · Audit Logs (brief §7.9; the last three are admin-only).

## 5. Data models

Implemented in `supabase/migrations/20261011000000_init.sql`. Every content table has the brief's
domain fields plus a shared workflow block: `status`, `publish_at`, `unpublish_at`, `published_at`,
`archived_at`, `review_requested_by/at`, `approved_by/at`, `pending` (proposed changes), `note`,
`version`, SEO fields, `sort_order`, `created_*`, `updated_*`.

| Brief §8 model | Table | Notable fields |
| --- | --- | --- |
| Page | `pages` | hero eyebrow/title/lead, `sections` (JSON blocks), CTA, related links, audiences |
| Opportunity | `opportunities` | type, sponsor, issuing office, due date, eligibility, requirements, CTA, documents, related pages, archive via status |
| Awardable company | `solutions` | website, focus area, TRL, business size, aisle, awardable month, `visibility`, gov-only details, provider contact, attachments |
| Awardee | `awards` | website, award title, awarding activity, date, public value, category, case study, `visibility` |
| FAQ | `faqs` | category, audience, sort order, related links |
| Video resource | `resources` | kind, category, video URL, thumbnail, runtime, transcript, related |
| AI tool | `ai_tools` | provider, category, access URL, learn-more URL, data-sensitivity warning, authorization level, logo, user guide |
| Prompt | `prompts` | intended user, inputs, output format, warnings |
| Event | `events` | time zone, event type, speakers, resources, registration/recording |
| Contract vehicle | `contract_vehicles` | capability categories, ordering guide, holder list, update notice, period of performance |
| Metric | `metrics` | suffix, description, source note, as-of date, display locations, verified flag |

Supporting tables: `portal_users`, `content_revisions`, `audit_log` (immutable), `media_assets`
(replacement history, visibility), `site_settings`. Public reads go through `public_*` views that never
select restricted columns; the portal reads through `portal_content` for cross-type lists.

## 6. Component list

Public: `SiteHeader` (mega menu + mobile sheet), `SiteFooter`, `PageHero`, `Breadcrumbs`, `Hero`,
`ChoosePath`, `HowItWorks` (orbital animation), `Ecosystem`, `FeaturedOpportunities`, `ToolsPreview`,
`Results`, `ResourcesEvents`, `FinalCta`, `MonogramField`, `BrandLogo`, `DotTitle`, `ButtonLink`,
`Badge`, `Reveal`, `DataNotice`, `EmptyState`, `Accordion`, `SectionHeader`, directory controls and
directories (solutions, opportunities, tools, prompts, FAQs, resources), cards (opportunity, tool,
resource), content blocks (`Section`, `Split`, `Callout`, `PendingContent`, `FeatureList`,
`ProcessSteps`, `SubmissionChecklist`, `VehicleCompare`, `FaqList`), `NextSteps`.

Portal (`components/portal/`): `PortalShell`, `AuthScreen`, `Notice`, `StatusBadge`, `RoleBadge`,
`Card`, `Btn`/`BtnLink`, `FieldInput`, `Table`, `Editor` (structured editor with workflow sidebar),
`MfaEnroll` (client component for authenticator enrollment).

## 7. Security and publishing workflow

Workflow (enforced by the `content_before_write` trigger, so no client can skip a step):

1. Contributor or editor saves a **Draft**.
2. Editor submits it → **In review**.
3. Admin publishes now → **Published**, or schedules → **Scheduled** (promoted automatically by
   `publish_due()`, run every minute by pg_cron when available).
4. Admin archives → **Archived**. Hard deletes are admin-only; everyone else archives.
5. Edits to live content by non-admins become **pending changes** on the row; an admin approves
   (applied in one update) or rejects. The public page keeps the approved values until then.
6. Every update snapshots the previous version; editors can restore a version (restoring live content
   still needs an admin, by the same rule).

Security (brief §14): HTTPS + HSTS + CSP; invite-only accounts; TOTP second factor required — portal
access is gated on JWT `aal2` in RLS, so an un-verified session cannot even read drafts; role-based
policies on every table and bucket; 30-minute inactivity timeout (`proxy.ts`); sign-in throttling plus
Supabase Auth rate limits; immutable audit log written by security-definer functions (sign-ins, failed
sign-ins, MFA events, invites, role changes, every content and file change); file allow-list and 50 MB
limit; private bucket for employee-only files; data-handling warning and attestation on upload;
version history on every record.

## 8. Implementation plan and status

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Information architecture, navigation, redirects, copy | Done |
| 2 | Marketplace section pages, directories, FAQs, videos, exemplars | Done (illustrative records labeled until approved data arrives) |
| 3 | Opportunities + Swarm Forge, Contract Vehicles, AI Playground | Done (nine tools listed as pending content) |
| 4 | Supabase schema, RLS, workflow, audit, media, search | Done and validated in PGlite; **project provisioning blocked by the Supabase free-plan limit** |
| 5 | Employee portal (auth, MFA, dashboard, editors, media, users, settings, audit, preview) | Done; needs a provisioned project to exercise end-to-end |
| 6 | Content migration from tradewindai.com, program-office review, launch | Pending approvals |

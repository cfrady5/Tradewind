# 02 — Architecture

## Stack
| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript | Server Components by default → minimal hydration; ISR for content. |
| Styling | Tailwind CSS v4 with brand tokens in `app/globals.css` (`@theme`) | One source of truth for color, type, spacing, motion. |
| Motion | `motion` (Motion for React) for component motion; CSS transitions for micro-interactions; SVG for brand graphics; GSAP ScrollTrigger only for the pinned, scrubbed How-it-Works sequence | GSAP is loaded by that one client component; everything else stays CSS/Motion. |
| Data / CMS | **Supabase (Postgres + Storage + Auth)** for all structured content | Per program direction, Supabase hosts all data. Content tables carry draft/publish/archive status, scheduled publishing, revisions, SEO fields and role-based editing via RLS. |
| Fonts | Montserrat, self-hosted via `@fontsource-variable/montserrat` | No runtime calls to Google; works in restricted networks. |
| Hosting | Vercel (pending approval) — app is portable to any Node host | See security notes in `04-OPERATIONS.md`. |

UI primitives are hand-built in `components/ui` (button, badge, accordion, tabs, search, filters, pagination…) following shadcn/ui conventions, without pulling in Radix for components that native HTML handles accessibly (`<details>`, `<dialog>`, `<button aria-expanded>`).

## Sitemap & routes

```
/                                   Home (flagship)
/marketplace                        Marketplace overview (two-path entry, how it works, aisles)
  /videos                           Instructional videos
  /exemplars                        Exemplar submissions
  /faqs                             FAQs (search, categories, deep links)
  /awardable-companies              Awardable companies directory (public metadata only)
  /awardees                         Public award records
  /government  /providers           Buyer and provider journeys
  /submission-guide                 Interactive checklist
  /sbir-sttr  /prototype-transition Aisles
/opportunities                      Current opportunities (search, type, status, sponsor, sort)
  /[slug]                           Opportunity detail (sticky key dates + section nav)
  /special-topics  /shopping-notices  /swarm-forge  /archive
/ai-playground                      Tool catalog
  /[slug]                           Tool detail (AcqBot, FOCI API, GenAI.mil, ProcureSight, …)
  /prompt-library                   Prompt library (search, category, copy)
/contract-vehicles                  Overview + side-by-side comparison
  /[slug]                           draid · ai-talent-2 · test-and-evaluation
  /guides                           Acquisition guides & documents
/events  /contact  /privacy
/resources  /resources/news  /about  /about/impact
/employee                           Employee portal (sign-in → MFA → dashboard, content, media, users, settings, audit)
```

Every public page ends with a contextual "next step" module; directory pages link to details; details link back and to related content. Breadcrumbs on every non-home page. Legacy and first-pass URLs redirect permanently (`next.config.ts`).

## Rendering strategy
- All pages are Server Components; client islands only for: navigation, hero/journey animation, directory filtering, prompt copy, counters.
- Directory filtering runs **client-side over a server-provided public dataset** (datasets are small: < few thousand rows) with state mirrored to the URL (`?q=&status=&type=`). If a dataset grows past ~2k rows, switch the same component to server-side querying (`searchParams` → Supabase) — the UI contract doesn't change.
- Content is fetched with ISR (`revalidate = 300`) so CMS edits appear within 5 minutes without redeploying.

## Data layer (`lib/data/*`)
Every loader returns `{ items, source }` where `source` is `"supabase"` or `"development"`.
- If `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured, loaders read **published** rows only (RLS enforces this server-side too).
- Otherwise they fall back to the fixtures in `lib/data/fixtures/*` and the UI shows a visible **“Development data”** notice. Fixtures are never presented as real program data; illustrative records are clearly labeled as samples.

## Content model (Supabase — see `supabase/migrations/20261011000000_init.sql`)
Shared columns on every content table: `id uuid`, `slug`, `status (draft | in_review | scheduled | published | archived)`, `publish_at`, `unpublish_at`, `published_at`, `archived_at`, `review_requested_by/at`, `approved_by/at`, `pending jsonb` (proposed changes awaiting an admin), `note`, `version`, SEO fields, `sort_order`, `sample`, `created_at/by`, `updated_at/by`.

| Table | Key fields |
|---|---|
| `pages` | title, parent_slug, hero eyebrow/title/lead, sections (jsonb blocks), cta, related_links, audiences |
| `opportunities` | title, type (`marketplace-collection`, `special-topic`, `shopping-notice`, `notice-of-intent`, `initiative`, `external`), sponsor, issuing_office, summary, description, mission_need, eligibility, requirements, submission_instructions, cta, opens_at, closes_at, documents, related_pages, contact_email, featured. **Open/upcoming/closed is computed from dates.** |
| `solutions` (awardable companies) | name, company, company_website, summary, focus_area, technology_category, solution_type, awardable_since, aisle, business_size, trl, keywords, listing_status, visibility; government-only: gov_details, pitch_video_url, provider_contact, attachments, acquisition_notes |
| `awards` (awardees) | vendor, website, solution (award title), description, awarding_activity, award_date, value_usd, category, case_study_url, vehicle, visibility |
| `contract_vehicles` | name, short_name, vehicle_type, vehicle_status, tagline, overview, scope, capability_categories, eligible_users, ordering_process, ordering_guide_url, holder_list_url, availability, period_of_performance, documents, holders, contacts, historical_notes, update_notice, pending_fields |
| `ai_tools` | name, provider, category, summary, description, use_cases, availability (`approved`/`external`/`experimental`/`pending`), authorization_level, data_sensitivity, audiences, access, access_url, learn_more_url, logo_url, user_guide_url |
| `prompts` | title, category, description, body, intended_user, inputs_required, output_format, warnings, usage_notes |
| `resources` | title, kind, category, audiences, summary, url, video_url, thumbnail_url, date, duration, captions/transcript flags, transcript, related |
| `events` | title, starts_at, ends_at, time_zone, format, event_type, location, summary, description, speakers, resources, registration_url, recording_url, recap |
| `faqs` | question, answer, category, audiences, related_links (anchor = slug) |
| `metrics` | key, label, value, format, suffix, description, as_of, reporting_period, source, methodology, verified, display_location |
| `homepage_features`, `navigation_items` | curated homepage references; optional CMS-managed navigation |
| `portal_users` | user_id, email, display_name, role (`viewer`…`super_admin`), status (`invited`/`active`/`disabled`), invited_by, last_sign_in_at |
| `content_revisions` | table_name, row_id, version, status, snapshot, note, changed_by/at (trigger-populated; `restore_revision()` rolls back) |
| `audit_log` | at, actor, action, table_name, row_id, summary, before/after, meta — append-only |
| `media_assets` | bucket, path, file_name, title, description, alt_text, category, visibility, mime_type, size, previous_asset_id (replacement history), uploaded_by, deleted_at |
| `site_settings` | key, value jsonb |

**Workflow:** contributors/editors draft → editors submit for review → admins publish, schedule or archive. Non-admin edits to live rows are stored as pending changes until an admin approves. Every update writes a revision; hard deletes are admin-only. Public reads go through `public_*` views (live rows only, no restricted columns); the portal reads `portal_content` for cross-type lists. Full-text `search` columns back the directories.

### Employee portal (`app/employee`, `lib/portal`, `lib/supabase`)
- `proxy.ts` refreshes the Supabase session on every `/employee` request and enforces a 30-minute inactivity timeout.
- `lib/supabase/server.ts` — cookie-bound client; `requirePortal(minRole)` gates every page on session + `aal2` + active account + role.
- `lib/portal/registry.ts` — field definitions per content type drive the list views and the structured editor; `lib/portal/actions.ts` — server actions (auth, MFA, save, status changes, approvals, restore, bulk archive, invites, media, settings); `lib/portal/queries.ts` — reads.
- The service-role key is used only server-side for invitations and failed-sign-in logging. All other portal queries run as the signed-in employee under RLS.

## External systems (never proxied, never reproduced)
Defined once in `lib/site-config.ts` and overridable by env vars:
- Government Marketplace sign-in / registration (`NEXT_PUBLIC_MARKETPLACE_URL`)
- Solution submission portal (`NEXT_PUBLIC_SUBMISSION_URL`)
- SAM.gov, AI.mil ordering pages, document storage

The public site never handles Marketplace credentials and never exposes non-public solution data.

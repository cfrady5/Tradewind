# 02 — Architecture

## Stack
| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript | Server Components by default → minimal hydration; ISR for content. |
| Styling | Tailwind CSS v4 with brand tokens in `app/globals.css` (`@theme`) | One source of truth for color, type, spacing, motion. |
| Motion | `motion` (Motion for React) for component motion; CSS transitions for micro-interactions; SVG for brand graphics | No GSAP needed — scroll sequences use `useScroll`. Keeps JS small. |
| Data / CMS | **Supabase (Postgres + Storage + Auth)** for all structured content | Per program direction, Supabase hosts all data. Content tables carry draft/publish/archive status, scheduled publishing, revisions, SEO fields and role-based editing via RLS. |
| Fonts | Montserrat, self-hosted via `@fontsource-variable/montserrat` | No runtime calls to Google; works in restricted networks. |
| Hosting | Vercel (pending approval) — app is portable to any Node host | See security notes in `04-OPERATIONS.md`. |

UI primitives are hand-built in `components/ui` (button, badge, accordion, tabs, search, filters, pagination…) following shadcn/ui conventions, without pulling in Radix for components that native HTML handles accessibly (`<details>`, `<dialog>`, `<button aria-expanded>`).

## Sitemap & routes

```
/                                   Home (flagship)
/marketplace                        Marketplace overview
  /solutions                        Awardable Solutions directory (public metadata only)
  /government                       Government buyer journey → Marketplace sign-in
  /providers                        Solution provider journey
  /submission-guide                 Interactive checklist, video guidance, FAQs
  /sbir-sttr                        SBIR/STTR Aisle
  /prototype-transition             Prototype Transition Aisle
/opportunities                      Opportunities directory (search, type, status, sponsor, sort)
  /[slug]                           Opportunity detail (standard template, sticky section nav)
  /special-topics                   Filtered view: type=special-topic
  /shopping-notices                 Filtered view: type=shopping-notice
  /archive                          Closed opportunities (automatic)
/acquisition                        Acquisition overview + vehicle comparison
  /vehicles                         Contract vehicle directory/compare
  /vehicles/[slug]                  draid · ai-talent-2 · test-and-evaluation
  /guides                           Acquisition guides & documents
/ai-tools                           AI Tools directory
  /[slug]                           Tool detail
  /prompt-library                   Prompt library (search, category, copy)
/resources                          Knowledge hub (all content types)
  /videos  /exemplars  /faqs  /events  /news
/about                              About Tradewinds
  /impact                           Impact dashboard
  /awarded-solutions                Public award records
  /contact                          Support routing
```

Every page ends with a contextual “next step” module; directory pages link to details; details link back and to related content. Breadcrumbs on every non-home page.

## Rendering strategy
- All pages are Server Components; client islands only for: navigation, hero/journey animation, directory filtering, prompt copy, counters.
- Directory filtering runs **client-side over a server-provided public dataset** (datasets are small: < few thousand rows) with state mirrored to the URL (`?q=&status=&type=`). If a dataset grows past ~2k rows, switch the same component to server-side querying (`searchParams` → Supabase) — the UI contract doesn't change.
- Content is fetched with ISR (`revalidate = 300`) so CMS edits appear within 5 minutes without redeploying.

## Data layer (`lib/data/*`)
Every loader returns `{ items, source }` where `source` is `"supabase"` or `"development"`.
- If `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured, loaders read **published** rows only (RLS enforces this server-side too).
- Otherwise they fall back to the fixtures in `lib/data/fixtures/*` and the UI shows a visible **“Development data”** notice. Fixtures are never presented as real program data; illustrative records are clearly labeled as samples.

## Content model (Supabase — see `supabase/migrations/0001_init.sql`)
Shared columns on every content table: `id uuid`, `slug`, `status ('draft'|'published'|'archived')`, `publish_at`, `seo_title`, `seo_description`, `og_image_url`, `created_at`, `updated_at`, `updated_by`.

| Table | Key fields |
|---|---|
| `opportunities` | title, type (`marketplace-collection`, `special-topic`, `shopping-notice`, `external`), sponsor, summary, mission_need, eligibility, requirements, submission_instructions, opens_at, closes_at, contact_email, documents (jsonb), topics text[]. **Status (open/upcoming/closed) is computed from dates**, so closed items archive automatically. |
| `solutions` | name, company, summary, focus_area, technology_category, solution_type, awardable_since, is_public. Only rows with `is_public = true` are readable anonymously. |
| `contract_vehicles` | name, short_name, vehicle_type, scope, purpose, eligible_users, ordering_process, availability, documents, holders, contacts, historical_notes |
| `ai_tools` | name, category, description, use_cases, availability (`approved`/`external`/`experimental`), access_url, access_notes |
| `prompts` | title, category, description, body, usage_notes, sort_order |
| `resources` | title, kind (`guide`,`video`,`tutorial`,`exemplar`,`document`,`news`), audiences text[], summary, url, file_url, duration, captions_url, transcript |
| `events` | title, starts_at, ends_at, location, format, registration_url, recap, recording_url |
| `faqs` | question, answer, category, audiences, sort_order (anchor = slug → linkable) |
| `awards` | vendor, solution, awarding_activity, award_date, value_usd, vehicle, is_public |
| `metrics` | key, label, value numeric, unit, reporting_period, as_of date, source, methodology, verified bool |
| `homepage_features` | section, ref_table, ref_id, sort_order |
| `navigation_items` | location (`header`/`footer`), group, label, href, sort_order |
| `content_revisions` | table_name, row_id, snapshot jsonb, changed_by, changed_at (populated by trigger) |
| `editors` | user_id, role (`editor`/`publisher`/`admin`) |

**Workflow:** editors create/edit drafts; publishers set `status = published` (optionally with future `publish_at` → scheduled). Every update writes a revision. Archive instead of delete. Editing UI: Supabase Studio table editor initially (no code), with a purpose-built `/studio` admin as Phase 2 — see `05-STATUS.md`.

## External systems (never proxied, never reproduced)
Defined once in `lib/site-config.ts` and overridable by env vars:
- Government Marketplace sign-in / registration (`NEXT_PUBLIC_MARKETPLACE_URL`)
- Solution submission portal (`NEXT_PUBLIC_SUBMISSION_URL`)
- SAM.gov, AI.mil ordering pages, document storage

The public site never handles Marketplace credentials and never exposes non-public solution data.

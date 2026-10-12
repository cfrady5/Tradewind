# 05 — Implementation Status & Test Results

_Last updated: 2026-10-12_

## Fully implemented and tested
- Design system: official palette with AA-verified pairings, Montserrat (self-hosted), spacing/grid, motion tokens, reduced-motion support.
- Official logos (full-color + reversed lockups, monogram, favicon/apple icon) from the approved brand files.
- Information architecture per the Oct 2026 rebuild brief: Marketplace (overview, instructional videos, exemplars, FAQs, awardable companies, awardees, aisles), Opportunities (+ Swarm Forge), AI Playground (tool catalog, prompt library, nine named tools), Contract Vehicles, Events, Contact, Employee Portal; permanent redirects from Wix-era and first-pass URLs. The brief's dark tactical treatment was built, reviewed and reverted on the owner's instruction — the approved light system stays.
- Global navigation: sticky compressing header, keyboard-accessible mega menus on wide screens (Enter/↓/Esc, focus return), direct Events/Contact links, animated active indicator, a full-screen `<dialog>` overlay menu at every width (brief §5: large uppercase rows, dividers, indented children, full-width Access the Marketplace button, staggered entrance), persistent **Access Marketplace** CTA. Four-column footer.
- Homepage: all 10 sections; light hero with tilted media collage, mission card, converging pathway lines and a stats bar built from real metrics; CSS hero entrance, animated converging-pathways motif, a GSAP-pinned four-ring orbital journey (continuous spin; scroll-scrubbed selection, deterministic in reverse) with a stage-based fallback on mobile and under reduced motion.
- Directory pattern (URL-synced search/facets/sort, live counts, empty states, pagination) used by Awardable Solutions, Opportunities (+ Special Topics, Shopping Notices, Archive views), AI Tools, Prompt Library (expand + copy with fallback), Resources (+ Videos, Exemplars, News) and FAQs (deep-linkable answers).
- Opportunity status logic: open/upcoming/closed computed from dates; the monthly Marketplace collection deadline (12:00 pm ET, last day of month, DST-aware) is computed live; closed items move to the Archive automatically.
- Templates: opportunity detail (sticky key dates + section nav), contract vehicle detail (current vs. historical, pending-field callouts), AI tool detail, process journeys, comparison table (stacked cards on mobile).
- All routes (31 pages + dynamic detail pages), branded 404, breadcrumbs + JSON-LD (Organization, BreadcrumbList, FAQPage), per-page metadata and canonicals, XML sitemap, robots (previews noindexed), Open Graph image.
- 301/308 redirects for known legacy Wix URLs; security headers + CSP.
- Supabase schema (consolidated): content tables with the brief's fields, five portal roles, MFA-gated access, draft → in review → scheduled → published → archived workflow enforced in triggers, pending changes for live content, revisions + restore, immutable audit log, media library, site settings, full-text search, pg_cron publishing — **validated** by applying migration + seed in PGlite and asserting 40 role/RLS/workflow behaviors.
- Employee portal (`/employee`): invite-only sign-in, authenticator (TOTP) enrolment/verification, 30-minute inactivity timeout, login throttling, dashboard with approvals/drafts/scheduled/deadlines/uploads and global search, registry-driven list + structured editor for every content type (search, filters, bulk archive, scheduling, SEO, version notes, versions with restore, pending-change approval, draft preview), media library (upload/replace/delete with attestation), users (invite, role, disable), settings, audit log. Renders a clear "not configured" screen until the Supabase project exists.

## Brief layout pass (2026-10-12)
The light theme stays; page layouts now follow the rebuild brief section by section — homepage order (§6.1/§11), Marketplace overview (§6.2), instructional videos by six categories (§6.3), exemplars (§6.4), FAQs in eight categories with last-updated dates and related links (§6.5), awardable-company filters for aisle, TRL, business size, month and status (§6.6), searchable awardees (§6.7), opportunities with featured items, lanes and notices of intent (§6.8), Swarm Forge (§6.9), both aisles (§6.10–6.11), AI Playground disclaimer, featured tools and responsible use (§6.12), vehicle overview cards and per-vehicle sections including the brief's capability lists (§6.13–6.16), events with add-to-calendar files (§6.17), contact with six support categories (§6.18), footer microcopy (§10), portal navigation labels and dashboard widgets (§7.4, §7.9), and a media grid/table toggle (§12). Content the program office has not supplied (aisle eligibility detail, Swarm Forge problem statement and dates, holder lists, ordering guides, testimonials, the named participating-organization list) is marked as awaiting approved content rather than invented.

## Using illustrative / development data (labeled on-page as “Development data” and “Sample”)
| Area | Why |
|---|---|
| Awardable Solutions directory (24 samples) | The awardable list is restricted; requires a program-approved public metadata export |
| AI Tools catalog (8 samples) | Official tool catalog not supplied |
| Prompt Library (12 samples) | The live 78-prompt collection must be exported and verified |
| Special Topics / Shopping Notices / external opportunities | No current notices were confirmed; real Marketplace collection period is live data |
| Events, videos, exemplars, news | Not supplied |

## Awaiting approved content
- Verification of metrics (seeded `verified = false`; values from public sources: 2,384 submitted / 836 awardable / 125 activities as of Nov 2025; $3.26B awards as of Feb 2026 from press reporting).
- DRAID and AI Talent 2.0 scope, eligibility, ordering, holders, documents; T&E holder list.
- SBIR/STTR Aisle and Prototype Transition Aisle details.
- Awarded-solutions public dataset; success stories; annual time-series for impact charts.
- ARI-approved photography (guidelines reference an imagery library that was not supplied). The homepage hero collage has photo slots (`public/images/hero/`) and currently renders on-brand illustrated fallbacks. Three interim AI images were generated (Higgsfield) but could not be downloaded into this environment.
- True vector (SVG) logo masters (PNG exports are used today).

## Awaiting external integration
- Confirmed Marketplace sign-in/registration and submission-portal URLs (defaults point to `tradewindai.com/tw-marketplace`, which the brand guidelines also cite).
- Full crawl of the live Wix site to finalize the redirect map and migrate documents (`/_files/ugd/...` PDFs must be re-hosted before Wix is retired).
- Event registration and video hosting links.

## Awaiting security / deployment approval
- Provisioning the dedicated Supabase project — **blocked**: the connected account is at the free plan's two-active-project limit (`create project` was attempted twice). Pause/delete another project or upgrade, then follow docs/04. The portal cannot be exercised end-to-end until then.
- Hosting (Vercel or alternative) compliance review; DNS cutover.

## Test results (production build, 2026-10-12)
| Check | Result |
|---|---|
| `npm run lint` | 0 errors, 0 warnings |
| `npm run typecheck` | Pass |
| `next build` | Pass — all routes static/ISR |
| Playwright (desktop 1440 + Pixel 7) | **99 passed**, 1 skipped (the keyboard mega-menu test runs on desktop only) |
| axe-core WCAG 2.0/2.1/2.2 A+AA on all 31 tested routes × 2 viewports | 0 serious/critical violations |
| Employee portal: unconfigured screen, anonymous redirects, robots exclusion | Pass |
| Viewport overflow (no element beyond viewport, no horizontal scroll) | Pass on all routes, both viewports |
| Lighthouse mobile — `/` | Performance 97 · Accessibility 100 · Best Practices 100 · SEO 100 (LCP 2.5s, CLS 0.01, TBT 60ms) |
| Lighthouse mobile — `/marketplace/awardable-companies` (measured as `/marketplace/solutions` on 2026-10-11) | 94 · 99 · 100 · 100 (LCP 2.9s, CLS 0.06, TBT 40ms) |
| Supabase migration + seed + RLS assertions (PGlite) | Pass |

Lighthouse numbers are lab results on simulated mobile throttling from a local server, not field (p75) data; confirm Core Web Vitals in production with real-user monitoring.

Bugs found and fixed by the suite: mobile grid overflow in the prompt library; invalid `<dl>` markup; `aria-label` on a non-interactive span; date-only values shifting a day in Eastern time; misleading results count with pagination; duplicate badges.

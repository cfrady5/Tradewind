# 05 — Implementation Status & Test Results

_Last updated: 2026-10-11_

## Fully implemented and tested
- Design system: official palette with AA-verified pairings, Montserrat (self-hosted), spacing/grid, motion tokens, reduced-motion support.
- Official logos (full-color + reversed lockups, monogram, favicon/apple icon) from the approved brand files.
- Global navigation: sticky compressing header, keyboard-accessible mega menus (Enter/↓/Esc, focus return), animated active indicator, `<dialog>` mobile menu, persistent Marketplace Login CTA. Footer.
- Homepage: all 10 sections; light hero with tilted media collage, mission card, converging pathway lines and a stats bar built from real metrics; CSS hero entrance, animated converging-pathways motif, a GSAP-pinned four-ring orbital journey (continuous spin; scroll-scrubbed selection, deterministic in reverse) with a stage-based fallback on mobile and under reduced motion.
- Directory pattern (URL-synced search/facets/sort, live counts, empty states, pagination) used by Awardable Solutions, Opportunities (+ Special Topics, Shopping Notices, Archive views), AI Tools, Prompt Library (expand + copy with fallback), Resources (+ Videos, Exemplars, News) and FAQs (deep-linkable answers).
- Opportunity status logic: open/upcoming/closed computed from dates; the monthly Marketplace collection deadline (12:00 pm ET, last day of month, DST-aware) is computed live; closed items move to the Archive automatically.
- Templates: opportunity detail (sticky key dates + section nav), contract vehicle detail (current vs. historical, pending-field callouts), AI tool detail, process journeys, comparison table (stacked cards on mobile).
- All routes (31 pages + dynamic detail pages), branded 404, breadcrumbs + JSON-LD (Organization, BreadcrumbList, FAQPage), per-page metadata and canonicals, XML sitemap, robots (previews noindexed), Open Graph image.
- 301/308 redirects for known legacy Wix URLs; security headers + CSP.
- Supabase schema: content tables, draft/publish/archive, scheduled publishing, roles, revisions, delete protection, RLS, public views, storage buckets — **validated** by applying migration + seed in PGlite and asserting RLS behavior.

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
- Provisioning the dedicated Supabase project (not created — the connected org only contains an unrelated project).
- Hosting (Vercel or alternative) compliance review; DNS cutover.

## Test results (production build, 2026-10-11)
| Check | Result |
|---|---|
| `npm run lint` | 0 errors, 0 warnings |
| `npm run typecheck` | Pass |
| `next build` | Pass — all routes static/ISR |
| Playwright (desktop 1440 + Pixel 7) | **78 passed**, 2 skipped (device-specific nav tests run on the other project) |
| axe-core WCAG 2.0/2.1/2.2 A+AA on all 31 tested routes × 2 viewports | 0 serious/critical violations |
| Viewport overflow (no element beyond viewport, no horizontal scroll) | Pass on all routes, both viewports |
| Lighthouse mobile — `/` | Performance 97 · Accessibility 100 · Best Practices 100 · SEO 100 (LCP 2.5s, CLS 0.01, TBT 60ms) |
| Lighthouse mobile — `/marketplace/solutions` | 94 · 99 · 100 · 100 (LCP 2.9s, CLS 0.06, TBT 40ms) |
| Supabase migration + seed + RLS assertions (PGlite) | Pass |

Lighthouse numbers are lab results on simulated mobile throttling from a local server, not field (p75) data; confirm Core Web Vitals in production with real-user monitoring.

Bugs found and fixed by the suite: mobile grid overflow in the prompt library; invalid `<dl>` markup; `aria-label` on a non-interactive span; date-only values shifting a day in Eastern time; misleading results count with pagination; duplicate badges.

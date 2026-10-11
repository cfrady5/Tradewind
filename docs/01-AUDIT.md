# 01 — Audit & Migration Plan

_Audit date: 2026-10-11. Prepared before any implementation._

## 1. Constraints discovered during the audit

| Item | Finding | Impact |
|---|---|---|
| Repository | `cfrady5/Tradewind` was **empty** (no commits, no prior app, no deployment config). | Nothing to preserve or break in-repo; greenfield build. |
| Live site access | `www.tradewindai.com` could **not** be crawled from the build environment (DNS/proxy blocked). The audit below was assembled from search-index snapshots of the live site and public program documents. | A full crawl (every URL, PDF, video embed, metadata) must be run from an unrestricted network before launch — see §5. |
| Brand guidelines | Received mid-build: *Brand Guidelines (updated 09.24.26)* plus `TSMlogo-dark.png`, `Tradewinds WHITE.png` and `Tradewinds Logo.svg`. Palette, Montserrat hierarchy, logo variations, gradients and mission statement were verified against it. | Official lockups and monogram are in use (`public/brand`). The supplied SVG embeds raster photography (8 MB) and is a social graphic, so it is not used for UI. No clear-space / minimum-size rules are specified in the guidelines; the site keeps ≥ 0.5× monogram-height clear space and ≥ 150px lockup width. |
| Supabase | The connected Supabase org contains only an unrelated project (`nyc-by-ma`). | Schema ships as SQL migrations in `supabase/migrations/`. A dedicated Tradewinds project must be provisioned (needs approval). |

## 2. Current site inventory (from index snapshots)

### Known URLs → proposed destinations (301 redirects implemented in `next.config.ts`)

| Legacy URL | Purpose | New route |
|---|---|---|
| `/` | Home | `/` |
| `/solutions-marketplace` | Marketplace overview | `/marketplace` |
| `/tw-marketplace` | Government login / registration (Wix members) | **Kept as external destination** until Marketplace auth is migrated; linked from `/marketplace/government` |
| `/opportunities` | Opportunities listing | `/opportunities` |
| `/tradewinds-opportunity` | Tradewinds opportunities | `/opportunities` |
| `/other-opportunities` | Curated SAM.gov highlights | `/opportunities?type=external` |
| `/faqs` | FAQ | `/resources/faqs` |
| `/instructional-videos` | Submission how-to videos | `/resources/videos` |
| `/exemplar-videos` | Example pitch videos | `/resources/exemplars` |
| `/events` | Events | `/resources/events` |
| `/about` | About | `/about` |
| `/cdao-vehicles` | Contract vehicles | `/acquisition/vehicles` |
| `/cdao-vehicles/test-and-evaluation-services-blanket-purchase-agreement-bpa` | T&E BPA | `/acquisition/vehicles/test-and-evaluation` |

### Known documents (hosted on `storage.tradewindai.com` / Wix `_files`)
- *I'm Awardable — Now What?* info sheet — `storage.tradewindai.com/pdfs/Info-Sheet-Im-Awardable-Now-What.pdf`
- *Tradewinds Solutions Marketplace Customer Handbook v1.2 (Aug 2023)* — `storage.tradewindai.com/pdfs/…Customer-Handbook-v1.2…pdf`
- *Tradewinds Acquisition Guide v1.2 (Oct 2025)* — referenced publicly; URL to confirm
- Wix-hosted PDFs under `/_files/ugd/…` — **these URLs break when Wix is decommissioned**; must be re-hosted (Supabase Storage) and redirected.

### Verified program facts used in copy
- Tradewinds is housed in the CDAO (Department of War, formerly DoD). The Applied Research Institute (ARI) is the Marketplace manager.
- The Tradewinds Solutions Marketplace (TSM) is a repository of post-competition, readily awardable pitch videos.
- Submissions are ≤ 5:00 video pitches, assessed by a peer/SME panel in **monthly collection periods** (upload by 12:00 pm ET on the last day of the month). Non-awardable submissions receive feedback and may resubmit.
- Only government users with `.gov` / `.mil` email may view the pitch-video library. Solution-provider accounts submit only.
- Contacts: `success@tradewindai.com`, `support@tradewindai.com`.
- T&E Services BPA: open to all USG agencies for AI T&E; managed with ACC–Rock Island.

### Metrics found (seeded with provenance; `verified=false` until program office confirms)
| Metric | Value | As of | Source |
|---|---|---|---|
| Solutions submitted | 2,384 | Nov 2025 | tradewindai.com/tw-marketplace (index snapshot) |
| Solutions determined awardable | 836 | Nov 2025 | same |
| Participating DoW activities | 125 | Nov 2025 | same |
| Contract awards facilitated | $3.26B | Feb 2026 | third-party press report — **needs confirmation** |

## 3. Problems with the current site
1. **Navigation mirrors org structure, not user intent.** Buyers and providers share the same entry points; the two journeys diverge only deep in the site.
2. **Opportunities are static pages.** No status logic, deadlines, filters, or archive — closed items linger or disappear.
3. **No search** across FAQs, videos, resources, or tools.
4. **Wix platform limits:** heavy client JS, weak Core Web Vitals, no structured content, document URLs coupled to Wix storage, limited accessibility control.
5. **Fragmented resources** across instructional videos, exemplars, FAQs and events with no cross-linking — frequent dead ends.
6. **Metrics are hard-coded copy** with inconsistent reporting periods.
7. **Contract-vehicle pages mix current and historical information.**

## 4. Opportunities
- Separate, purpose-built **Buyer** and **Provider** journeys from the first screen.
- Directory pattern (search + facets + URL state) reused for Solutions, Opportunities, AI Tools, Prompts, Resources.
- Structured status logic (open / upcoming / closed computed from dates) with automatic archive.
- Metrics stored with reporting period, source and verification flag.
- Self-hosted fonts and documents; no third-party trackers by default (compliance-friendly).

## 5. Migration plan
1. **Full crawl** (unrestricted network): export every URL, title, meta description, H1, outbound link, embedded video, and PDF to `content/inventory.csv`.
2. **Content verification** with the program office: each item tagged *keep / consolidate / update / retire-for-review*. Nothing is deleted without approval.
3. **Asset re-hosting:** PDFs → Supabase Storage bucket `documents` (public), videos remain on their current host (YouTube/Vimeo) and are referenced by URL.
4. **Import** verified content into Supabase tables (see `02-ARCHITECTURE.md`). The 78-prompt library is imported from the current page export into `prompts`.
5. **Redirect map** finalized from the crawl (initial map already in `next.config.ts`).
6. **Pre-launch QA** (see `05-STATUS.md` → Testing).
7. **DNS cutover** after security/hosting approval; keep Wix live in read-only mode for 30 days for rollback.

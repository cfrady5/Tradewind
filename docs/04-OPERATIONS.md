# 04 — Deployment, Content Management & Operations

## Local development
```bash
npm install
cp .env.example .env.local     # optional: add Supabase URL + anon key
npm run dev                    # http://localhost:3000
```
Without Supabase env vars the site runs on clearly labeled development fixtures.

| Script | Purpose |
|---|---|
| `npm run build` / `start` | Production build / serve |
| `npm run lint` | ESLint (Next core-web-vitals + TypeScript) |
| `npm run typecheck` | Route type generation + `tsc` |
| `npm run test:e2e` | Playwright: every route, a11y (axe WCAG 2.2 AA), overflow, nav, filters, redirects, headers. Set `PW_CHROMIUM_PATH` if using a system Chromium. |
| `npm run seed:generate` | Regenerate `supabase/seed.sql` from verified (non-sample) fixtures |
| `python3 scripts/export-brand-assets.py <src> public/brand app` | Re-export logos/favicons from the approved brand files |

## Supabase setup (all site data)
1. Create a dedicated Supabase project for the Tradewinds website (US region; review against hosting/compliance requirements first).
2. Apply the schema: `supabase db push` (or run `supabase/migrations/20261011000000_init.sql` in the SQL editor).
3. Load verified starter content: run `supabase/seed.sql`.
4. Set env vars on the host: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. **Never** expose the service-role key to the app.
5. Create editor accounts in Supabase Auth, then grant roles:
   ```sql
   insert into editors (user_id, role) values ('<auth user uuid>', 'publisher');
   ```

### Security model (verified in PGlite during the build)
- Anonymous visitors can read **only** rows with `status = 'published'` and `publish_at` in the past — through `public_*` views that run with the caller's privileges (RLS enforced).
- `solutions` and `awards` additionally require `is_public = true`; restricted Marketplace data is never readable by the public site.
- Anonymous writes are blocked. Editors can create drafts; only publishers/admins can publish or archive. Hard deletes are blocked for non-admins (archive instead).
- Every update writes a snapshot to `content_revisions` (who, when, previous version).

## Editing content (non-developers)
Phase 1 — Supabase Studio table editor:
| Task | How |
|---|---|
| Add an opportunity | `opportunities` → Insert row → status `draft` → publisher sets `published` |
| Schedule publication | Set `status = published` and a future `publish_at` |
| Close an opportunity | Nothing to do — status is computed from `closes_at`; it moves to the Archive automatically |
| Retire content | Set `status = archived` (never delete) |
| Update a metric | Edit `metrics.value`, `as_of`, `reporting_period`, `source`; set `verified = true` once confirmed |
| Upload a PDF | Storage → `documents` bucket → copy public URL into the row's `documents`/`url` field |
| Roll back | Copy the prior `snapshot` from `content_revisions` |

Changes appear within 5 minutes (ISR `revalidate = 300`).
Phase 2 (recommended) — a purpose-built `/studio` admin on the same Supabase Auth + RLS, with forms, previews and an approval queue.

## Deployment (pending approval)
Vercel works out of the box (`next build`). Before production:
- Confirm hosting meets program compliance requirements (FedRAMP posture, data residency, logging).
- Set env vars per environment; previews are automatically `noindex` (`app/robots.ts`).
- Point DNS at the host only after the redirect map is finalized against a full crawl of the live Wix site.
- Security headers (CSP, HSTS, frame-ancestors none, nosniff, referrer, permissions) ship from `next.config.ts`.

## Changing official destinations
`lib/site-config.ts` → `EXTERNAL` (Marketplace sign-in, submission portal, support emails), overridable with `NEXT_PUBLIC_MARKETPLACE_URL` / `NEXT_PUBLIC_SUBMISSION_URL`. Navigation is defined once in `NAV` and drives the header, mobile menu, footer and sitemap.

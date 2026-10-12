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

## Supabase setup (all site data + employee portal)
1. Create a dedicated Supabase project (US region; review against hosting/compliance requirements first). **Blocked today:** the connected Supabase account is at its free-plan limit of two active projects, so `tradewinds` could not be created. Pause/delete another project or upgrade the plan, then run `create project`.
2. Apply the schema: `supabase db push` (or run `supabase/migrations/20261011000000_init.sql` in the SQL editor). It is one consolidated migration — nothing earlier was ever applied anywhere.
3. Load verified starter content: run `supabase/seed.sql`.
4. Enable **pg_cron** (Database → Extensions) so scheduled content publishes itself; without it, the portal still promotes due rows whenever an admin loads it.
5. Set env vars on the host: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and — server only — `SUPABASE_SERVICE_ROLE_KEY` (used for invitations and logging failed sign-ins; never shipped to the browser).
6. Auth settings: enable Email provider, disable public sign-ups (portal accounts are invite-only), set Site URL to the production origin and add `https://<origin>/employee/auth/callback` to the redirect allow-list, set JWT expiry ≤ 1 hour.
7. Bootstrap the first super admin: Authentication → Users → *Invite user* (their work email), then in the SQL editor:
   ```sql
   insert into portal_users (user_id, email, display_name, role, status)
   values ('<auth user uuid>', '<email>', '<name>', 'super_admin', 'invited');
   ```
   They open the invitation, set a password, enrol an authenticator app, and the account activates on the first verified sign-in. Every further account is invited from **Employee Portal → Users**.

### Security model (verified in PGlite during the build)
- Anonymous visitors can read **only** live rows (`published`, or `scheduled` with `publish_at` reached, and before `unpublish_at`) — through `public_*` views that run with the caller's privileges (RLS enforced).
- `solutions` and `awards` additionally require `visibility = 'public'`; government-only columns are never selected by the public views.
- Portal access = active invited account **and** a verified second factor (JWT `aal2`). Without MFA a signed-in user cannot read drafts, let alone write.
- Roles: viewer (read) · contributor (drafts) · editor (+ submit for review) · admin (+ publish, schedule, archive, approve, users, file deletes) · super admin (+ admin accounts, settings). Enforced by RLS and by the `content_before_write` trigger, which also turns non-admin edits to live content into pending changes.
- Hard deletes are admin-only (archive instead). Every update writes `content_revisions`; `restore_revision()` rolls back. `audit_log` is append-only via security-definer functions.
- Files: `public-media` bucket is world-readable; `private-media` is readable by portal users only. Uploads are allow-listed (JPG, PNG, WebP, PDF, DOCX, XLSX, CSV, MP4; 50 MB) and carry a data-handling attestation.

## Editing content (non-developers) — Employee Portal
`/employee` → sign in → authenticator code → dashboard. Quick actions cover the common jobs; each content type has a list (search, status/type filters, bulk archive) and a structured editor (fields, government-only fields, scheduling/SEO, version note, status actions, versions with restore, draft preview).

| Task | How |
|---|---|
| Add an opportunity / event / FAQ / tool | Dashboard quick action or *New …* in the list → fill the fields → **Create draft** |
| Get it published | Editor: **Submit for review** → Admin: **Publish now** (or **Schedule** with a date/time) |
| Change something that is already live | Save as usual; non-admins' edits become *pending changes* for an admin to **Approve** or **Reject** |
| Close an opportunity | Nothing to do — open/closed is computed from the due date |
| Retire content | **Archive** (never delete) |
| Update a homepage metric | Metrics → edit value, as-of date, source; tick *Verified* once the program office confirms |
| Upload a PDF or image | Media Library → upload (title, alt text, visibility) → paste the public URL into the record |
| Replace a file | Media Library → *Replace* on the row (history is kept) |
| Roll back | Editor → Versions → **Restore** |
| Preview a draft | Editor → **Preview draft** (renders with the public page header; never visible to the public) |
| Invite a colleague | Users → *Invite an employee* (admins; super admins for admin roles) |
| See who did what | Audit Logs (admins) |

Changes appear within 5 minutes (ISR `revalidate = 300`); publishing from the portal also purges the public cache immediately.

## Deployment (pending approval)
Vercel works out of the box (`next build`). Before production:
- Confirm hosting meets program compliance requirements (FedRAMP posture, data residency, logging).
- Set env vars per environment; previews are automatically `noindex` (`app/robots.ts`).
- Point DNS at the host only after the redirect map is finalized against a full crawl of the live Wix site.
- Security headers (CSP, HSTS, frame-ancestors none, nosniff, referrer, permissions) ship from `next.config.ts`.

## Changing official destinations
`lib/site-config.ts` → `EXTERNAL` (Marketplace sign-in, submission portal, support emails), overridable with `NEXT_PUBLIC_MARKETPLACE_URL` / `NEXT_PUBLIC_SUBMISSION_URL`. Navigation is defined once in `NAV` and drives the header, mobile menu, footer and sitemap.

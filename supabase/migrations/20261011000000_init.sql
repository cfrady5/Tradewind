-- =============================================================================
-- Tradewinds — Supabase schema (public website + employee portal)
--
-- One consolidated migration: the project is provisioned from this file, nothing
-- earlier was ever applied. Design points (rebuild brief §7, §8, §13, §14):
--   • The public site reads ONLY live content (published, or scheduled and due)
--     through the public_* views; RLS enforces the same rule on the base tables.
--   • Portal access = an active, invited portal user WITH a verified second
--     factor (JWT aal2). Roles: viewer < contributor < editor < admin < super_admin.
--   • Workflow: draft → in_review → scheduled → published → archived, enforced in
--     a trigger so no client can skip a step. Edits to live content by non-admins
--     are stored as pending changes for admin approval.
--   • Every change writes a revision (restorable) and an immutable audit entry.
--   • Media metadata lives in media_assets; files in two storage buckets
--     (public-media, private-media).
-- =============================================================================

-- ----------------------------------------------------------------- enums
create type content_status as enum ('draft', 'in_review', 'scheduled', 'published', 'archived');
create type portal_role as enum ('viewer', 'contributor', 'editor', 'admin', 'super_admin');
create type portal_user_status as enum ('invited', 'active', 'disabled');
create type record_visibility as enum ('public', 'internal', 'hidden');
create type media_visibility as enum ('public', 'employee', 'hidden');
create type opportunity_type as enum ('marketplace-collection', 'special-topic', 'shopping-notice', 'notice-of-intent', 'initiative', 'external');
create type vehicle_status as enum ('active', 'limited', 'historical', 'pending-confirmation');
create type tool_availability as enum ('approved', 'external', 'experimental', 'pending');
create type resource_kind as enum ('guide', 'video', 'tutorial', 'exemplar', 'document', 'news');
create type event_format as enum ('virtual', 'in-person', 'hybrid');
create type marketplace_aisle as enum ('General', 'SBIR/STTR', 'Prototype Transition');
create type business_size as enum ('Small', 'Large', 'Non-traditional', 'Academia');
create type audit_action as enum (
  'insert', 'update', 'delete', 'publish', 'unpublish', 'schedule', 'archive', 'restore', 'submit_review', 'approve', 'reject',
  'upload', 'replace', 'file_delete',
  'invite', 'role_change', 'user_disable', 'user_enable', 'user_activate', 'user_delete',
  'sign_in', 'sign_in_failed', 'sign_out', 'mfa_enrolled', 'mfa_verified', 'mfa_failed', 'password_reset'
);

-- ----------------------------------------------------------------- portal users
create table portal_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text,
  role portal_role not null default 'viewer',
  status portal_user_status not null default 'invited',
  invited_by uuid references auth.users (id) on delete set null,
  invited_at timestamptz not null default now(),
  activated_at timestamptz,
  disabled_at timestamptz,
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table portal_users enable row level security;

create or replace function public.role_rank(r portal_role) returns int language sql immutable as $$
  select case r when 'viewer' then 1 when 'contributor' then 2 when 'editor' then 3 when 'admin' then 4 when 'super_admin' then 5 end
$$;

-- Role of the calling user, only while the account is active.
create or replace function public.portal_role() returns portal_role
language sql stable security definer set search_path = public as $$
  select role from portal_users where user_id = auth.uid() and status = 'active'
$$;

create or replace function public.has_role(min_role portal_role) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(role_rank(portal_role()) >= role_rank(min_role), false)
$$;

-- Second factor verified for this session (Supabase Auth sets aal2 after a TOTP challenge).
create or replace function public.mfa_verified() returns boolean language sql stable as $$
  select coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
$$;

-- The single gate for everything in the portal: role AND MFA.
create or replace function public.portal_access(min_role portal_role default 'viewer') returns boolean
language sql stable security definer set search_path = public as $$
  select has_role(min_role) and mfa_verified()
$$;

-- Admins manage viewer/contributor/editor accounts; only super admins manage admins.
create or replace function public.can_manage_role(target portal_role) returns boolean
language sql stable security definer set search_path = public as $$
  select case when role_rank(target) >= role_rank('admin') then portal_access('super_admin') else portal_access('admin') end
$$;

create policy "own profile" on portal_users for select to authenticated using (user_id = auth.uid());
create policy "admins read users" on portal_users for select to authenticated using (portal_access('admin'));
create policy "admins invite users" on portal_users for insert to authenticated with check (can_manage_role(role));
create policy "admins update users" on portal_users for update to authenticated using (can_manage_role(role)) with check (can_manage_role(role));
create policy "super admins delete users" on portal_users for delete to authenticated using (portal_access('super_admin') and user_id <> auth.uid());

-- ----------------------------------------------------------------- audit log (immutable)
create table audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor_id uuid,
  actor_email text,
  action audit_action not null,
  table_name text,
  row_id text,
  summary text,
  before jsonb,
  after jsonb,
  meta jsonb
);
create index on audit_log (at desc);
create index on audit_log (table_name, row_id);
create index on audit_log (actor_id, at desc);
alter table audit_log enable row level security;
create policy "admins read audit log" on audit_log for select to authenticated using (portal_access('admin'));
-- No insert/update/delete policies: rows are written only by security-definer functions below.

create or replace function public.actor_email() returns text
language sql stable security definer set search_path = public as $$
  select email from portal_users where user_id = auth.uid()
$$;

-- Portal-side events (sign-in, MFA, rollbacks …). Callable by any signed-in user for their own actions.
create or replace function public.log_portal_event(p_action audit_action, p_summary text default null, p_meta jsonb default null, p_table text default null, p_row_id text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  insert into audit_log (actor_id, actor_email, action, table_name, row_id, summary, meta)
  values (auth.uid(), actor_email(), p_action, p_table, p_row_id, p_summary, p_meta);
end $$;

-- Called by the portal after a verified sign-in: records the sign-in and activates invited accounts
-- once their second factor is verified.
create or replace function public.portal_touch_sign_in() returns portal_users
language plpgsql security definer set search_path = public as $$
declare u portal_users;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  update portal_users
     set last_sign_in_at = now(),
         status = case when status = 'invited' and mfa_verified() then 'active'::portal_user_status else status end,
         activated_at = case when status = 'invited' and mfa_verified() then now() else activated_at end
   where user_id = auth.uid() and status <> 'disabled'
   returning * into u;
  return u;
end $$;

-- Row-level audit trigger for content, users and media.
create or replace function public.audit_row() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  act audit_action;
  rid text;
  b jsonb; a jsonb;
begin
  if tg_op = 'INSERT' then
    act := case when tg_table_name = 'media_assets' then 'upload' when tg_table_name = 'portal_users' then 'invite' else 'insert' end; a := to_jsonb(new);
  elsif tg_op = 'DELETE' then
    act := case when tg_table_name = 'media_assets' then 'file_delete' when tg_table_name = 'portal_users' then 'user_delete' else 'delete' end; b := to_jsonb(old);
  else
    b := to_jsonb(old); a := to_jsonb(new);
    act := 'update';
    if tg_table_name = 'portal_users' then
      if (b ->> 'role') is distinct from (a ->> 'role') then act := 'role_change';
      elsif (a ->> 'status') = 'disabled' and (b ->> 'status') <> 'disabled' then act := 'user_disable';
      elsif (a ->> 'status') = 'active' and (b ->> 'status') = 'invited' then act := 'user_activate';
      elsif (a ->> 'status') = 'active' and (b ->> 'status') <> 'active' then act := 'user_enable';
      end if;
    elsif tg_table_name = 'media_assets' then
      if (b ->> 'path') is distinct from (a ->> 'path') then act := 'replace'; end if;
    elsif (b ->> 'status') is distinct from (a ->> 'status') then
      act := case a ->> 'status'
        when 'published' then 'publish'::audit_action
        when 'scheduled' then 'schedule'
        when 'archived' then 'archive'
        when 'in_review' then 'submit_review'
        else case when (b ->> 'status') in ('published', 'scheduled') then 'unpublish'::audit_action else 'update' end
      end;
    elsif (b -> 'pending') is not null and (a -> 'pending') is null then
      act := case when (a ->> 'pending_status') = 'rejected' then 'reject'::audit_action else 'approve' end;
    end if;
  end if;
  rid := coalesce(a ->> 'id', a ->> 'user_id', b ->> 'id', b ->> 'user_id');
  insert into audit_log (actor_id, actor_email, action, table_name, row_id, summary, before, after)
  values (auth.uid(), actor_email(), act, tg_table_name, rid,
          coalesce(a ->> 'title', a ->> 'name', a ->> 'question', a ->> 'label', a ->> 'email', b ->> 'title', b ->> 'name', b ->> 'question', b ->> 'label', b ->> 'email'),
          b, a);
  return coalesce(new, old);
end $$;

create trigger portal_users_audit after insert or update or delete on portal_users for each row execute function audit_row();
create or replace function public.touch_updated() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if tg_table_name <> 'portal_users' then new.updated_by := auth.uid(); end if;
  return new;
end $$;
create trigger portal_users_touch before update on portal_users for each row execute function touch_updated();

-- ----------------------------------------------------------------- revisions
create table content_revisions (
  id bigint generated always as identity primary key,
  table_name text not null,
  row_id uuid not null,
  version int not null,
  status content_status,
  snapshot jsonb not null,
  note text,
  changed_by uuid,
  changed_at timestamptz not null default now()
);
create index on content_revisions (table_name, row_id, version desc);
alter table content_revisions enable row level security;
create policy "portal reads revisions" on content_revisions for select to authenticated using (portal_access('viewer'));

-- ----------------------------------------------------------------- content tables
-- Domain columns are declared per table; the shared workflow/SEO/audit columns are
-- added to every content table by the loop that follows.

create table pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  parent_slug text,
  hero_eyebrow text,
  hero_title text,
  hero_lead text,
  sections jsonb not null default '[]',        -- [{ type, heading, body, items[] }]
  cta_label text,
  cta_url text,
  related_links jsonb not null default '[]',   -- [{ label, href }]
  audiences text[] not null default '{all}'
);

create table opportunities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  type opportunity_type not null,
  sponsor text not null,
  issuing_office text,
  summary text not null,
  description text,
  topics text[] not null default '{}',
  opens_at timestamptz,
  closes_at timestamptz,
  recurrence text check (recurrence in ('monthly')),
  mission_need text,
  eligibility text,
  requirements text[],
  submission_instructions text,
  cta_label text,
  cta_url text,
  documents jsonb not null default '[]',
  related_pages text[] not null default '{}',
  contact_email text,
  external_url text,
  featured boolean not null default false
);

-- Awardable companies. Government-only detail stays in restricted columns the public view never selects.
create table solutions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  company text not null,
  company_website text,
  summary text not null,
  focus_area text not null,
  technology_category text not null,
  solution_type text not null,
  awardable_since text not null check (awardable_since ~ '^\d{4}-\d{2}$'),
  aisle marketplace_aisle not null default 'General',
  business_size business_size,
  trl smallint check (trl between 1 and 9),
  keywords text[] not null default '{}',
  listing_status text not null default 'Awardable' check (listing_status in ('Awardable', 'Archived', 'Updated')),
  visibility record_visibility not null default 'internal',
  -- restricted (never exposed publicly)
  gov_details text,
  pitch_video_url text,
  provider_contact jsonb,
  attachments jsonb not null default '[]',
  acquisition_notes text
);

create table awards (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  vendor text not null,
  website text,
  solution text not null,                     -- award title
  description text,
  awarding_activity text not null,
  award_date date not null,
  value_usd numeric(16, 2),
  category text,
  case_study_url text,
  vehicle text not null,
  visibility record_visibility not null default 'internal'
);

create table contract_vehicles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_name text not null,
  vehicle_type text not null,
  vehicle_status vehicle_status not null,
  tagline text not null,
  overview text not null,
  scope text[] not null default '{}',
  capability_categories text[] not null default '{}',
  eligible_users text not null,
  ordering_process text[] not null default '{}',
  ordering_guide_url text,
  holder_list_url text,
  availability text not null,
  period_of_performance text,
  documents jsonb not null default '[]',
  holders text,
  contacts jsonb not null default '[]',
  historical_notes text,
  update_notice text,
  pending_fields text[],
  who_it_serves text,
  background text,
  problem text,
  how_it_helps text,
  capability_label text,
  service_groups jsonb not null default '[]'   -- [{ "title", "body" }]
);

create table ai_tools (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  provider text,
  category text not null,
  summary text not null,
  description text not null,
  use_cases text[] not null default '{}',
  availability tool_availability not null default 'pending',
  authorization_level text,
  data_sensitivity text,
  audiences text[] not null default '{all}',
  access text not null,
  access_url text,
  learn_more_url text,
  logo_url text,
  user_guide_url text
);

create table prompts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  description text not null,
  body text not null,
  intended_user text,
  inputs_required text,
  output_format text,
  warnings text,
  usage_notes text
);

create table resources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  kind resource_kind not null,
  category text,
  audiences text[] not null default '{all}',
  summary text not null,
  url text,
  video_url text,
  thumbnail_url text,
  date date,
  duration text,
  has_captions boolean not null default false,
  has_transcript boolean not null default false,
  transcript text,
  related jsonb not null default '[]'
);

create table events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  time_zone text not null default 'America/New_York',
  format event_format not null,
  event_type text,
  location text not null,
  summary text not null,
  description text,
  speakers jsonb not null default '[]',
  resources jsonb not null default '[]',
  registration_url text,
  recording_url text,
  recap text
);

create table faqs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  question text not null,
  answer text not null,
  category text not null check (category in ('General Marketplace', 'Vendor Submission', 'Government Buyer', 'Assessment and Awardable Status',
    'SBIR/STTR Aisle', 'Prototype Transition Aisle', 'Contracting and Acquisition', 'Communications and Press')),
  audiences text[] not null default '{all}',
  related_links jsonb not null default '[]'
);

create table metrics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,          -- doubles as the metric key
  label text not null,
  value numeric not null,
  format text not null check (format in ('number', 'currency-compact')),
  suffix text,
  description text,
  as_of date not null,
  reporting_period text not null,
  source text not null,
  methodology text,
  verified boolean not null default false,
  display_location text[] not null default '{home}'
);

create table homepage_features (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  section text not null,
  ref_table text not null,
  ref_slug text not null
);

create table navigation_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  location text not null check (location in ('header', 'footer')),
  group_label text not null,
  label text not null,
  href text not null,
  description text
);

-- Shared columns, RLS, indexes and triggers for every content table.
create or replace function public.content_tables() returns text[] language sql immutable as $$
  select array['pages','opportunities','solutions','awards','contract_vehicles','ai_tools','prompts','resources','events','faqs','metrics','homepage_features','navigation_items']
$$;

do $$
declare t text;
begin
  foreach t in array content_tables() loop
    execute format($c$alter table %I
      add column status content_status not null default 'draft',
      add column publish_at timestamptz,
      add column unpublish_at timestamptz,
      add column published_at timestamptz,
      add column archived_at timestamptz,
      add column review_requested_by uuid,
      add column review_requested_at timestamptz,
      add column approved_by uuid,
      add column approved_at timestamptz,
      add column pending jsonb,                         -- proposed changes to live content, awaiting an admin
      add column pending_by uuid,
      add column pending_at timestamptz,
      add column pending_status text check (pending_status in ('in_review', 'rejected')),
      add column note text,                             -- version note for the next revision
      add column version int not null default 1,
      add column seo_title text,
      add column seo_description text,
      add column og_image_url text,
      add column sort_order int not null default 0,
      add column sample boolean not null default false,
      add column created_at timestamptz not null default now(),
      add column created_by uuid,
      add column updated_at timestamptz not null default now(),
      add column updated_by uuid$c$, t);
    execute format('alter table %I enable row level security', t);
    execute format('create index on %I (status, publish_at)', t);
    execute format('create index on %I (updated_at desc)', t);
  end loop;
end $$;

-- Full-text search for the searchable directories (brief §9).
-- array_to_string is only STABLE in PostgreSQL; generated columns need an IMMUTABLE expression.
create or replace function public.join_words(xs text[]) returns text language sql immutable as $$ select array_to_string(xs, ' ') $$;
alter table solutions add column search tsvector generated always as (to_tsvector('english'::regconfig, coalesce(name, '') || ' ' || coalesce(company, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(focus_area, '') || ' ' || coalesce(technology_category, '') || ' ' || join_words(keywords))) stored;
alter table awards add column search tsvector generated always as (to_tsvector('english'::regconfig, coalesce(vendor, '') || ' ' || coalesce(solution, '') || ' ' || coalesce(description, '') || ' ' || coalesce(awarding_activity, '') || ' ' || coalesce(category, ''))) stored;
alter table faqs add column search tsvector generated always as (to_tsvector('english'::regconfig, coalesce(question, '') || ' ' || coalesce(answer, ''))) stored;
alter table resources add column search tsvector generated always as (to_tsvector('english'::regconfig, coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(category, ''))) stored;
alter table ai_tools add column search tsvector generated always as (to_tsvector('english'::regconfig, coalesce(name, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(description, '') || ' ' || coalesce(category, '') || ' ' || join_words(use_cases))) stored;
alter table prompts add column search tsvector generated always as (to_tsvector('english'::regconfig, coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(category, '') || ' ' || coalesce(body, ''))) stored;
alter table opportunities add column search tsvector generated always as (to_tsvector('english'::regconfig, coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(sponsor, '') || ' ' || join_words(topics))) stored;
alter table events add column search tsvector generated always as (to_tsvector('english'::regconfig, coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(location, ''))) stored;
create index on solutions using gin (search);
create index on awards using gin (search);
create index on faqs using gin (search);
create index on resources using gin (search);
create index on ai_tools using gin (search);
create index on prompts using gin (search);
create index on opportunities using gin (search);
create index on events using gin (search);

-- ----------------------------------------------------------------- workflow enforcement
-- Live = visible to the public right now.
create or replace function public.is_live(p_status content_status, p_publish_at timestamptz, p_unpublish_at timestamptz) returns boolean
language sql immutable as $$
  select (p_status = 'published' or (p_status = 'scheduled' and p_publish_at is not null and p_publish_at <= now()))
     and (p_unpublish_at is null or p_unpublish_at > now())
$$;

create or replace function public.content_before_write() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  r portal_role := portal_role();
  live_cols_changed boolean;
  -- 'search' is a generated column: NULL in NEW inside a BEFORE trigger, so it must not count as a change.
  pending_cols text[] := array['pending', 'pending_by', 'pending_at', 'pending_status', 'note', 'updated_at', 'updated_by', 'version', 'search'];
begin
  -- Service role, migrations and seeds carry no user: trust them and skip workflow rules.
  if auth.uid() is not null then
    if r is null or not mfa_verified() then
      raise exception 'Portal access requires an active account with a verified second factor';
    end if;
    if not has_role('contributor') then raise exception 'Viewers cannot change content'; end if;
    -- Status transitions are role-gated; an unchanged status is not a transition.
    if tg_op = 'INSERT' or new.status is distinct from old.status then
      if new.status in ('published', 'scheduled', 'archived') and not has_role('admin') then
        raise exception 'Only admins can publish, schedule or archive content';
      end if;
      if new.status = 'in_review' and not has_role('editor') then
        raise exception 'Contributors save drafts only; an editor submits content for review';
      end if;
    end if;
    if tg_op = 'UPDATE' and old.status in ('published', 'scheduled') and not has_role('admin') then
      live_cols_changed := (to_jsonb(old) - pending_cols) <> (to_jsonb(new) - pending_cols);
      if live_cols_changed then
        raise exception 'Live content changes by editors are saved as pending changes for admin approval';
      end if;
    end if;
    if new.pending is not null and new.pending_by is null then
      new.pending_by := auth.uid(); new.pending_at := now(); new.pending_status := coalesce(new.pending_status, 'in_review');
    end if;
  end if;

  if new.status = 'scheduled' and (new.publish_at is null or new.publish_at <= now())
     and (tg_op = 'INSERT' or new.status is distinct from old.status or new.publish_at is distinct from old.publish_at) then
    raise exception 'Scheduled content needs a publish time in the future';
  end if;

  if tg_op = 'INSERT' then
    new.created_by := coalesce(new.created_by, auth.uid());
    new.version := 1;
    if new.status = 'published' then new.published_at := coalesce(new.published_at, now()); end if;
  else
    -- Version every change: snapshot the previous row, bump the version.
    insert into content_revisions (table_name, row_id, version, status, snapshot, note, changed_by)
    values (tg_table_name, old.id, old.version, old.status, to_jsonb(old) - 'search', old.note, auth.uid());
    new.version := old.version + 1;
    new.note := null;
    if new.status is distinct from old.status then
      if new.status = 'in_review' then new.review_requested_by := auth.uid(); new.review_requested_at := now(); end if;
      if new.status = 'published' then new.published_at := now(); new.approved_by := auth.uid(); new.approved_at := now(); end if;
      if new.status = 'scheduled' then new.approved_by := auth.uid(); new.approved_at := now(); end if;
      if new.status = 'archived' then new.archived_at := now(); end if;
    end if;
  end if;
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end $$;

-- Archive instead of delete. Only admins may hard-delete (RLS also enforces this).
create or replace function public.prevent_delete() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not has_role('admin') then
    raise exception 'Content is archived, not deleted. Set status = ''archived''.';
  end if;
  return old;
end $$;

do $$
declare t text;
begin
  foreach t in array content_tables() loop
    execute format('create trigger %I_workflow before insert or update on %I for each row execute function content_before_write()', t, t);
    execute format('create trigger %I_no_delete before delete on %I for each row execute function prevent_delete()', t, t);
    execute format('create trigger %I_audit after insert or update or delete on %I for each row execute function audit_row()', t, t);

    -- Public: live rows only.
    execute format($p$create policy "public read live" on %I for select to anon, authenticated
      using (is_live(status, publish_at, unpublish_at))$p$, t);
    -- Portal: every row (drafts, review queue, scheduled, archived).
    execute format($p$create policy "portal read all" on %I for select to authenticated using (portal_access('viewer'))$p$, t);
    execute format($p$create policy "portal insert" on %I for insert to authenticated with check (portal_access('contributor'))$p$, t);
    execute format($p$create policy "portal update" on %I for update to authenticated using (portal_access('contributor')) with check (portal_access('contributor'))$p$, t);
    execute format($p$create policy "admins delete" on %I for delete to authenticated using (portal_access('admin'))$p$, t);
  end loop;
end $$;

-- Restricted datasets: the public also needs visibility = 'public'.
drop policy "public read live" on solutions;
create policy "public read live" on solutions for select to anon, authenticated
  using (is_live(status, publish_at, unpublish_at) and visibility = 'public');
drop policy "public read live" on awards;
create policy "public read live" on awards for select to anon, authenticated
  using (is_live(status, publish_at, unpublish_at) and visibility = 'public');

-- Promote due scheduled rows (pg_cron every minute when available; the portal also calls it).
create or replace function public.publish_due() returns int
language plpgsql security definer set search_path = public as $$
declare t text; n int; total int := 0;
begin
  if auth.uid() is not null and not has_role('admin') then return 0; end if;
  foreach t in array content_tables() loop
    execute format($q$update %I set status = 'published', published_at = publish_at
      where status = 'scheduled' and publish_at <= now()$q$, t);
    get diagnostics n = row_count;
    total := total + n;
  end loop;
  return total;
end $$;

-- Restore a previous version (runs as the caller: RLS and the workflow trigger still apply).
create or replace function public.restore_revision(p_revision_id bigint) returns void
language plpgsql security invoker set search_path = public as $$
declare
  rev content_revisions;
  cols text;
begin
  if not portal_access('editor') then raise exception 'Restoring a version requires the editor role'; end if;
  select * into rev from content_revisions where id = p_revision_id;
  if rev.id is null then raise exception 'Revision % not found', p_revision_id; end if;
  select string_agg(format('%I = (p).%I', column_name, column_name), ', ')
    into cols
    from information_schema.columns
   where table_schema = 'public' and table_name = rev.table_name
     and is_generated = 'NEVER'
     and column_name not in ('id', 'status', 'version', 'created_at', 'created_by', 'updated_at', 'updated_by',
                             'pending', 'pending_by', 'pending_at', 'pending_status', 'note',
                             'published_at', 'approved_by', 'approved_at', 'archived_at', 'review_requested_by', 'review_requested_at');
  execute format('update %I t set %s, note = $2 from (select (jsonb_populate_record(null::%I, $1)) as p) s where t.id = $3',
                 rev.table_name, cols, rev.table_name)
    using rev.snapshot, format('Restored version %s', rev.version), rev.row_id;
  perform log_portal_event('restore', format('Restored version %s', rev.version), jsonb_build_object('revision_id', p_revision_id), rev.table_name, rev.row_id::text);
end $$;

-- ----------------------------------------------------------------- media library
create table media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null check (bucket in ('public-media', 'private-media')),
  path text not null,
  file_name text not null,
  title text not null,
  description text,
  alt_text text,
  category text,
  visibility media_visibility not null default 'public',
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  width int,
  height int,
  previous_asset_id uuid references media_assets (id) on delete set null,   -- replacement history
  uploaded_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (bucket, path)
);
create index on media_assets (created_at desc);
alter table media_assets enable row level security;
create policy "public reads public media" on media_assets for select to anon, authenticated using (visibility = 'public' and deleted_at is null);
create policy "portal reads media" on media_assets for select to authenticated using (portal_access('viewer'));
create policy "contributors add media" on media_assets for insert to authenticated with check (portal_access('contributor'));
create policy "contributors update media" on media_assets for update to authenticated using (portal_access('contributor')) with check (portal_access('contributor'));
create policy "admins delete media" on media_assets for delete to authenticated using (portal_access('admin'));
create trigger media_assets_touch before update on media_assets for each row execute function touch_updated();
create trigger media_assets_audit after insert or update or delete on media_assets for each row execute function audit_row();

-- ----------------------------------------------------------------- settings
create table site_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_by uuid,
  updated_at timestamptz not null default now()
);
alter table site_settings enable row level security;
create policy "portal reads settings" on site_settings for select to authenticated using (portal_access('viewer'));
create policy "admins write settings" on site_settings for all to authenticated using (portal_access('admin')) with check (portal_access('admin'));
create trigger site_settings_touch before update on site_settings for each row execute function touch_updated();

-- ----------------------------------------------------------------- grants
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to authenticated;
grant select on pages, opportunities, solutions, awards, contract_vehicles, ai_tools, prompts, resources, events, faqs, metrics,
  homepage_features, navigation_items, media_assets to anon;
grant insert, update, delete on pages, opportunities, solutions, awards, contract_vehicles, ai_tools, prompts, resources, events, faqs,
  metrics, homepage_features, navigation_items, media_assets, portal_users, site_settings to authenticated;
revoke insert, update, delete on audit_log, content_revisions from authenticated, anon;
grant execute on function log_portal_event, restore_revision, publish_due, portal_touch_sign_in to authenticated;
revoke execute on function log_portal_event, restore_revision, publish_due, portal_touch_sign_in from anon;

-- ----------------------------------------------------------------- public read views
-- security_invoker → the RLS above decides which rows the caller sees. Column names map 1:1 to lib/data/types.ts.
create view public_opportunities with (security_invoker = on) as
  select slug, title, type, sponsor, issuing_office, summary, description, topics, opens_at, closes_at, recurrence, mission_need, eligibility,
         requirements, submission_instructions, cta_label, cta_url, documents, contact_email, external_url, featured, sample, updated_at
  from opportunities;
create view public_solutions with (security_invoker = on) as
  select slug, name, company, company_website, summary, focus_area, technology_category, solution_type, awardable_since,
         aisle, business_size, trl, listing_status, sample, updated_at
  from solutions;
create view public_contract_vehicles with (security_invoker = on) as
  select slug, name, short_name, vehicle_type, vehicle_status as status, tagline, overview, scope, capability_categories, eligible_users,
         ordering_process, ordering_guide_url, holder_list_url, availability, period_of_performance, documents, holders, contacts,
         historical_notes, update_notice, pending_fields, who_it_serves, background, problem, how_it_helps, capability_label, service_groups,
         sample, sort_order, updated_at
  from contract_vehicles;
create view public_ai_tools with (security_invoker = on) as
  select slug, name, provider as owner, category, summary, description, use_cases, availability, authorization_level, data_sensitivity,
         audiences, access, access_url, learn_more_url, logo_url, user_guide_url, sample, updated_at
  from ai_tools;
create view public_prompts with (security_invoker = on) as
  select slug, title, category, description, body, intended_user, inputs_required, output_format, warnings, usage_notes, sample, sort_order, updated_at
  from prompts;
create view public_resources with (security_invoker = on) as
  select slug, title, kind, category, audiences, summary, url, video_url, thumbnail_url, date, duration, has_captions, has_transcript, related, sample, sort_order, updated_at
  from resources;
create view public_events with (security_invoker = on) as
  select slug, title, starts_at, ends_at, time_zone, format, event_type, location, summary, description, speakers, resources,
         registration_url, recording_url, sample, updated_at
  from events;
create view public_faqs with (security_invoker = on) as
  select slug, question, answer, category, audiences, related_links, sample, sort_order, updated_at from faqs;
create view public_awards with (security_invoker = on) as
  select slug, vendor, website, solution, description, awarding_activity, award_date, value_usd, category, case_study_url, vehicle, sample, updated_at
  from awards;
create view public_metrics with (security_invoker = on) as
  select slug as key, label, value, format, suffix, description, as_of, reporting_period, source, verified, display_location, sort_order from metrics;
create view public_pages with (security_invoker = on) as
  select slug, title, parent_slug, hero_eyebrow, hero_title, hero_lead, sections, cta_label, cta_url, related_links, audiences,
         seo_title, seo_description, og_image_url, updated_at
  from pages;

grant select on public_opportunities, public_solutions, public_contract_vehicles, public_ai_tools, public_prompts,
  public_resources, public_events, public_faqs, public_awards, public_metrics, public_pages to anon, authenticated;

-- Portal: one list across every content type (dashboard, review queue, global search).
create view portal_content with (security_invoker = on) as
  select 'pages' as table_name, id, slug, title, status, publish_at, pending_status, version, updated_at, updated_by, created_by from pages
  union all select 'opportunities', id, slug, title, status, publish_at, pending_status, version, updated_at, updated_by, created_by from opportunities
  union all select 'solutions', id, slug, company || ' — ' || name, status, publish_at, pending_status, version, updated_at, updated_by, created_by from solutions
  union all select 'awards', id, slug, vendor || ' — ' || solution, status, publish_at, pending_status, version, updated_at, updated_by, created_by from awards
  union all select 'contract_vehicles', id, slug, name, status, publish_at, pending_status, version, updated_at, updated_by, created_by from contract_vehicles
  union all select 'ai_tools', id, slug, name, status, publish_at, pending_status, version, updated_at, updated_by, created_by from ai_tools
  union all select 'prompts', id, slug, title, status, publish_at, pending_status, version, updated_at, updated_by, created_by from prompts
  union all select 'resources', id, slug, title, status, publish_at, pending_status, version, updated_at, updated_by, created_by from resources
  union all select 'events', id, slug, title, status, publish_at, pending_status, version, updated_at, updated_by, created_by from events
  union all select 'faqs', id, slug, question, status, publish_at, pending_status, version, updated_at, updated_by, created_by from faqs
  union all select 'metrics', id, slug, label, status, publish_at, pending_status, version, updated_at, updated_by, created_by from metrics;
grant select on portal_content to authenticated;

-- ----------------------------------------------------------------- storage
insert into storage.buckets (id, name, public) values ('public-media', 'public-media', true), ('private-media', 'private-media', false)
  on conflict (id) do nothing;
create policy "anyone reads public media" on storage.objects for select to anon, authenticated using (bucket_id = 'public-media');
create policy "portal reads private media" on storage.objects for select to authenticated using (bucket_id = 'private-media' and public.portal_access('viewer'));
create policy "contributors upload media" on storage.objects for insert to authenticated with check (bucket_id in ('public-media', 'private-media') and public.portal_access('contributor'));
create policy "contributors replace media" on storage.objects for update to authenticated using (bucket_id in ('public-media', 'private-media') and public.portal_access('contributor'));
create policy "admins delete media files" on storage.objects for delete to authenticated using (bucket_id in ('public-media', 'private-media') and public.portal_access('admin'));

-- ----------------------------------------------------------------- scheduled publishing
do $$
begin
  begin
    create extension if not exists pg_cron;
  exception when others then
    raise notice 'pg_cron not available here (%): scheduled rows are promoted when the portal calls publish_due()', sqlerrm;
  end;
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('tradewinds-publish-due', '* * * * *', $j$select public.publish_due()$j$);
  end if;
end $$;

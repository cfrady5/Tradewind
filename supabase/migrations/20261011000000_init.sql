-- Tradewinds public website — structured content schema
-- Supabase hosts all site data. Anonymous (public site) access is read-only and limited to
-- published, non-scheduled rows via RLS. Editors/publishers authenticate with Supabase Auth.


-- ---------------------------------------------------------------- enums
create type content_status as enum ('draft', 'published', 'archived');
create type editor_role as enum ('editor', 'publisher', 'admin');
create type opportunity_type as enum ('marketplace-collection', 'special-topic', 'shopping-notice', 'external');
create type vehicle_status as enum ('active', 'limited', 'historical', 'pending-confirmation');
create type tool_availability as enum ('approved', 'external', 'experimental');
create type resource_kind as enum ('guide', 'video', 'tutorial', 'exemplar', 'document', 'news');
create type event_format as enum ('virtual', 'in-person', 'hybrid');

-- ---------------------------------------------------------------- roles
create table editors (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role editor_role not null default 'editor',
  created_at timestamptz not null default now()
);
alter table editors enable row level security;

create or replace function public.editor_role() returns editor_role
language sql stable security definer set search_path = public as $$
  select role from editors where user_id = auth.uid()
$$;

create policy "editors read own row" on editors for select to authenticated using (user_id = auth.uid() or editor_role() = 'admin');
create policy "admins manage editors" on editors for all to authenticated using (editor_role() = 'admin') with check (editor_role() = 'admin');

-- ---------------------------------------------------------------- shared columns helper
-- Every content table carries: slug, status, publish_at, seo fields, sort_order, audit columns.

create or replace function public.touch_updated() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end $$;

-- ---------------------------------------------------------------- revisions
create table content_revisions (
  id bigint generated always as identity primary key,
  table_name text not null,
  row_id uuid not null,
  snapshot jsonb not null,
  changed_by uuid,
  changed_at timestamptz not null default now()
);
alter table content_revisions enable row level security;
create policy "editors read revisions" on content_revisions for select to authenticated using (editor_role() is not null);

create or replace function public.record_revision() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into content_revisions (table_name, row_id, snapshot, changed_by)
  values (tg_table_name, old.id, to_jsonb(old), auth.uid());
  return new;
end $$;

-- Archive instead of delete: block hard deletes except for admins.
create or replace function public.prevent_delete() returns trigger language plpgsql as $$
begin
  if coalesce(public.editor_role()::text, '') <> 'admin' then
    raise exception 'Content is archived, not deleted. Set status = ''archived''.';
  end if;
  return old;
end $$;

-- ---------------------------------------------------------------- tables
create table opportunities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  type opportunity_type not null,
  sponsor text not null,
  summary text not null,
  topics text[] not null default '{}',
  opens_at timestamptz,
  closes_at timestamptz,
  recurrence text check (recurrence in ('monthly')),
  mission_need text,
  eligibility text,
  requirements text[],
  submission_instructions text,
  documents jsonb not null default '[]',
  contact_email text,
  external_url text,
  sample boolean not null default false,
  status content_status not null default 'draft',
  publish_at timestamptz,
  seo_title text, seo_description text, og_image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table solutions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  company text not null,
  summary text not null,
  focus_area text not null,
  technology_category text not null,
  solution_type text not null,
  awardable_since text not null check (awardable_since ~ '^\d{4}-\d{2}$'),
  -- Only rows explicitly cleared for public release are ever exposed.
  is_public boolean not null default false,
  sample boolean not null default false,
  status content_status not null default 'draft',
  publish_at timestamptz,
  seo_title text, seo_description text, og_image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid
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
  eligible_users text not null,
  ordering_process text[] not null default '{}',
  availability text not null,
  documents jsonb not null default '[]',
  holders text,
  contacts jsonb not null default '[]',
  historical_notes text,
  pending_fields text[],
  sample boolean not null default false,
  status content_status not null default 'draft',
  publish_at timestamptz,
  seo_title text, seo_description text, og_image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table ai_tools (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  summary text not null,
  description text not null,
  use_cases text[] not null default '{}',
  availability tool_availability not null,
  access text not null,
  access_url text,
  sample boolean not null default false,
  status content_status not null default 'draft',
  publish_at timestamptz,
  seo_title text, seo_description text, og_image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table prompts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  description text not null,
  body text not null,
  usage_notes text,
  sample boolean not null default false,
  status content_status not null default 'draft',
  publish_at timestamptz,
  seo_title text, seo_description text, og_image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table resources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  kind resource_kind not null,
  audiences text[] not null default '{all}',
  summary text not null,
  url text,
  date date,
  duration text,
  has_captions boolean not null default false,
  has_transcript boolean not null default false,
  transcript text,
  sample boolean not null default false,
  status content_status not null default 'draft',
  publish_at timestamptz,
  seo_title text, seo_description text, og_image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  format event_format not null,
  location text not null,
  summary text not null,
  registration_url text,
  recording_url text,
  recap text,
  sample boolean not null default false,
  status content_status not null default 'draft',
  publish_at timestamptz,
  seo_title text, seo_description text, og_image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table faqs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  question text not null,
  answer text not null,
  category text not null check (category in ('Marketplace', 'Submissions', 'Government Access', 'Acquisition', 'General')),
  audiences text[] not null default '{all}',
  sample boolean not null default false,
  status content_status not null default 'draft',
  publish_at timestamptz,
  seo_title text, seo_description text, og_image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table awards (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  vendor text not null,
  solution text not null,
  awarding_activity text not null,
  award_date date not null,
  value_usd numeric(16, 2),
  vehicle text not null,
  is_public boolean not null default false,
  sample boolean not null default false,
  status content_status not null default 'draft',
  publish_at timestamptz,
  seo_title text, seo_description text, og_image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table metrics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,          -- doubles as the metric key
  label text not null,
  value numeric not null,
  format text not null check (format in ('number', 'currency-compact')),
  as_of date not null,
  reporting_period text not null,
  source text not null,
  methodology text,
  verified boolean not null default false,
  sample boolean not null default false,
  status content_status not null default 'draft',
  publish_at timestamptz,
  seo_title text, seo_description text, og_image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table homepage_features (
  id uuid primary key default gen_random_uuid(),
  section text not null,
  ref_table text not null,
  ref_slug text not null,
  sort_order int not null default 0,
  status content_status not null default 'draft',
  publish_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table navigation_items (
  id uuid primary key default gen_random_uuid(),
  location text not null check (location in ('header', 'footer')),
  group_label text not null,
  label text not null,
  href text not null,
  description text,
  sort_order int not null default 0,
  status content_status not null default 'draft',
  publish_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid
);

-- ---------------------------------------------------------------- RLS, triggers
do $$
declare t text;
begin
  foreach t in array array['opportunities','solutions','contract_vehicles','ai_tools','prompts','resources','events','faqs','awards','metrics','homepage_features','navigation_items']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('create index on %I (status, publish_at)', t);
    execute format('create trigger %I_touch before update on %I for each row execute function touch_updated()', t, t);
    execute format('create trigger %I_revision after update on %I for each row execute function record_revision()', t, t);
    execute format('create trigger %I_no_delete before delete on %I for each row execute function prevent_delete()', t, t);

    -- Public: published and not scheduled for the future.
    execute format($p$create policy "public read published" on %I for select to anon, authenticated
      using (status = 'published' and (publish_at is null or publish_at <= now()))$p$, t);
    -- Editors see everything (drafts, scheduled, archived).
    execute format($p$create policy "editors read all" on %I for select to authenticated using (editor_role() is not null)$p$, t);
    -- Editors create drafts; only publishers/admins may publish or archive.
    execute format($p$create policy "editors insert" on %I for insert to authenticated
      with check (editor_role() is not null and (status = 'draft' or editor_role() in ('publisher','admin')))$p$, t);
    execute format($p$create policy "editors update" on %I for update to authenticated
      using (editor_role() is not null)
      with check (status = 'draft' or editor_role() in ('publisher','admin'))$p$, t);
  end loop;
end $$;

-- Restricted datasets: anon must ALSO satisfy is_public.
drop policy "public read published" on solutions;
create policy "public read published" on solutions for select to anon, authenticated
  using (status = 'published' and is_public and (publish_at is null or publish_at <= now()));
drop policy "public read published" on awards;
create policy "public read published" on awards for select to anon, authenticated
  using (status = 'published' and is_public and (publish_at is null or publish_at <= now()));

-- Explicit table grants (RLS above decides which rows each role actually sees).
grant select on opportunities, solutions, contract_vehicles, ai_tools, prompts, resources, events, faqs, awards, metrics,
  homepage_features, navigation_items to anon, authenticated;
grant insert, update, delete on opportunities, solutions, contract_vehicles, ai_tools, prompts, resources, events, faqs,
  awards, metrics, homepage_features, navigation_items to authenticated;
revoke insert, update, delete on opportunities, solutions, contract_vehicles, ai_tools, prompts, resources, events, faqs,
  awards, metrics, homepage_features, navigation_items from anon;

-- ---------------------------------------------------------------- public read views
-- security_invoker → RLS above is enforced for the caller. Column names map 1:1 to lib/data/types.ts.
create view public_opportunities with (security_invoker = on) as
  select slug, title, type, sponsor, summary, topics, opens_at, closes_at, recurrence, mission_need, eligibility,
         requirements, submission_instructions, documents, contact_email, external_url, sample
  from opportunities;
create view public_solutions with (security_invoker = on) as
  select slug, name, company, summary, focus_area, technology_category, solution_type, awardable_since, sample from solutions;
create view public_contract_vehicles with (security_invoker = on) as
  select slug, name, short_name, vehicle_type, vehicle_status as status, tagline, overview, scope, eligible_users,
         ordering_process, availability, documents, holders, contacts, historical_notes, pending_fields, sample, sort_order
  from contract_vehicles;
create view public_ai_tools with (security_invoker = on) as
  select slug, name, category, summary, description, use_cases, availability, access, access_url, sample from ai_tools;
create view public_prompts with (security_invoker = on) as
  select slug, title, category, description, body, usage_notes, sample, sort_order from prompts;
create view public_resources with (security_invoker = on) as
  select slug, title, kind, audiences, summary, url, date, duration, has_captions, has_transcript, sample from resources;
create view public_events with (security_invoker = on) as
  select slug, title, starts_at, ends_at, format, location, summary, registration_url, recording_url, sample from events;
create view public_faqs with (security_invoker = on) as
  select slug, question, answer, category, audiences, sample, sort_order from faqs;
create view public_awards with (security_invoker = on) as
  select slug, vendor, solution, awarding_activity, award_date, value_usd, vehicle, sample from awards;
create view public_metrics with (security_invoker = on) as
  select slug as key, label, value, format, as_of, reporting_period, source, verified, sort_order from metrics;

grant select on public_opportunities, public_solutions, public_contract_vehicles, public_ai_tools, public_prompts,
  public_resources, public_events, public_faqs, public_awards, public_metrics to anon, authenticated;

-- ---------------------------------------------------------------- storage
insert into storage.buckets (id, name, public) values ('documents', 'documents', true), ('images', 'images', true)
  on conflict (id) do nothing;
create policy "public read site assets" on storage.objects for select to anon, authenticated using (bucket_id in ('documents', 'images'));
create policy "editors upload site assets" on storage.objects for insert to authenticated with check (bucket_id in ('documents', 'images') and public.editor_role() is not null);
create policy "editors update site assets" on storage.objects for update to authenticated using (bucket_id in ('documents', 'images') and public.editor_role() is not null);

-- ═══════════════════════════════════════════════════════════════
-- CallOps — Supabase schema v2 (invite-only auth)
-- Run this in: Supabase Dashboard → SQL Editor → New Query → paste → Run
-- Safe to run on a fresh project. Don't run twice (will error on duplicates).
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- 1. PROFILES (extends auth.users — only invited users get one)
-- ───────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null unique,
  full_name text not null default '',
  role text not null default 'manager' check (role in ('admin', 'manager', 'viewer')),
  created_at timestamptz default now()
);

-- ───────────────────────────────────────────────────────────────
-- 2. USER INVITES — admin-issued, consumed on first sign-in
-- ───────────────────────────────────────────────────────────────
create table public.user_invites (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  full_name text default '',
  role text not null default 'manager' check (role in ('admin', 'manager', 'viewer')),
  invited_by uuid references public.profiles(id) on delete set null,
  campaign_ids uuid[] default '{}',
  created_at timestamptz default now()
);
create index idx_invites_email on public.user_invites(email);

-- Auto-create profile on signup IFF a matching invite exists.
-- Without an invite, the auth.users row exists but profile does not → app blocks them.
create or replace function public.handle_new_user()
returns trigger as $$
declare
  inv record;
begin
  select * into inv from public.user_invites where lower(email) = lower(new.email);
  if found then
    insert into public.profiles (id, email, full_name, role)
    values (
      new.id,
      new.email,
      coalesce(nullif(inv.full_name, ''), coalesce(new.raw_user_meta_data->>'full_name', '')),
      inv.role
    );
    if array_length(inv.campaign_ids, 1) > 0 then
      insert into public.campaign_members (campaign_id, user_id, role)
      select unnest(inv.campaign_ids), new.id, inv.role;
    end if;
    delete from public.user_invites where id = inv.id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Pre-seed Derek as the first admin (consumed on his first Google sign-in)
insert into public.user_invites (email, full_name, role)
values ('derekscotthill@gmail.com', 'Derek Hill', 'admin');

-- ───────────────────────────────────────────────────────────────
-- 3. CAMPAIGNS
-- ───────────────────────────────────────────────────────────────
create table public.campaigns (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  client_name text not null default '',
  mark text default '',
  rate_transfer numeric(10,2) default 0,
  rate_confirmed numeric(10,2) default 0,
  rate_ia numeric(10,2) default 15,
  ia_tier_2 numeric(10,2) default 40,
  ia_tier_3 numeric(10,2) default 75,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  archived boolean default false
);

-- ───────────────────────────────────────────────────────────────
-- 4. CAMPAIGN MEMBERS
-- ───────────────────────────────────────────────────────────────
create table public.campaign_members (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null default 'manager' check (role in ('admin', 'manager', 'viewer')),
  created_at timestamptz default now(),
  unique(campaign_id, user_id)
);
create index idx_members_campaign on public.campaign_members(campaign_id);
create index idx_members_user on public.campaign_members(user_id);

-- ───────────────────────────────────────────────────────────────
-- 5. AGENTS
-- ───────────────────────────────────────────────────────────────
create table public.agents (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade,
  full_name text not null,
  agent_number text default '',
  status text default 'active' check (status in ('active', 'inactive', 'removed')),
  is_tl boolean default false,
  assigned_tl_id uuid references public.agents(id) on delete set null,
  contact text default '',
  date_added timestamptz default now(),
  date_removed timestamptz
);
create index idx_agents_campaign on public.agents(campaign_id);

-- ───────────────────────────────────────────────────────────────
-- 6. LEADS (with IA-tier commission trigger)
-- ───────────────────────────────────────────────────────────────
create table public.leads (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  seq bigserial,                              -- chronological ordering for IA tiers
  date date not null default current_date,
  time text default '',
  customer_name text not null,
  phone text default '',
  address text default '',
  status text not null default 'pending' check (status in ('pending','transfer','confirmed','ia','dnc','bad')),
  client_commission numeric(10,2) default 0, -- auto-set by trigger
  spiff numeric(10,2) default 0,
  tl_bonus numeric(10,2) default 0,
  tl_recipient_id uuid references public.agents(id) on delete set null,
  appointment_date date,
  appointment_time text default '',
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_leads_campaign on public.leads(campaign_id);
create index idx_leads_agent on public.leads(agent_id);
create index idx_leads_date on public.leads(date);
create index idx_leads_status on public.leads(status);
create index idx_leads_seq on public.leads(seq);

-- IA-tier commission calc. Order is by seq, NOT by created_at, so seed
-- imports with backdated seq values produce correct tiers.
create or replace function public.calc_client_commission()
returns trigger as $$
declare
  camp record;
  prior_ias integer;
begin
  select * into camp from public.campaigns where id = new.campaign_id;
  if new.status = 'ia' then
    select count(*) into prior_ias
    from public.leads
    where campaign_id = new.campaign_id
      and agent_id = new.agent_id
      and date = new.date
      and status = 'ia'
      and id != new.id
      and seq < new.seq;
    if prior_ias >= 2 then
      new.client_commission := greatest(camp.ia_tier_3 - camp.ia_tier_2, 0);
    elsif prior_ias = 1 then
      new.client_commission := greatest(camp.ia_tier_2 - camp.rate_ia, 0);
    else
      new.client_commission := camp.rate_ia;
    end if;
  elsif new.status = 'confirmed' then
    new.client_commission := camp.rate_confirmed;
  elsif new.status = 'transfer' then
    new.client_commission := camp.rate_transfer;
  else
    new.client_commission := 0;
  end if;
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger calc_commission_before_upsert
  before insert or update on public.leads
  for each row execute procedure public.calc_client_commission();

-- ───────────────────────────────────────────────────────────────
-- 7. SHIFT LOGS
-- ───────────────────────────────────────────────────────────────
create table public.shift_logs (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade,
  date date not null,
  agents_on_floor integer not null default 0,
  notes text default '',
  created_at timestamptz default now(),
  unique(campaign_id, date)
);
create index idx_shift_campaign_date on public.shift_logs(campaign_id, date);

-- ───────────────────────────────────────────────────────────────
-- 8. ATTENDANCE (was missing from v1 schema)
-- ───────────────────────────────────────────────────────────────
create table public.attendance (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete cascade,
  date date not null,
  status text not null default 'off' check (status in ('present','absent','off')),
  auto_detected boolean default false,
  created_at timestamptz default now(),
  unique(campaign_id, agent_id, date)
);
create index idx_attendance_campaign_date on public.attendance(campaign_id, date);

-- ───────────────────────────────────────────────────────────────
-- 9. PAY PERIODS
-- ───────────────────────────────────────────────────────────────
create table public.pay_periods (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date not null,
  status text default 'open' check (status in ('open', 'closed', 'paid')),
  notes text default '',
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════
alter table public.profiles         enable row level security;
alter table public.user_invites     enable row level security;
alter table public.campaigns        enable row level security;
alter table public.campaign_members enable row level security;
alter table public.agents           enable row level security;
alter table public.leads            enable row level security;
alter table public.shift_logs       enable row level security;
alter table public.attendance       enable row level security;
alter table public.pay_periods      enable row level security;

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

create or replace function public.is_member_of(target_campaign uuid)
returns boolean as $$
  select exists (
    select 1 from public.campaign_members
    where campaign_id = target_campaign and user_id = auth.uid()
  );
$$ language sql security definer stable;

-- Profiles
create policy "users see own profile, admins see all" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "users update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "admins manage profiles" on public.profiles
  for all using (public.is_admin());

-- Invites (admin only)
create policy "admins manage invites" on public.user_invites
  for all using (public.is_admin());

-- Campaigns
create policy "admins manage all campaigns" on public.campaigns
  for all using (public.is_admin());
create policy "members see their campaigns" on public.campaigns
  for select using (public.is_member_of(id));

-- Campaign members
create policy "admins manage all memberships" on public.campaign_members
  for all using (public.is_admin());
create policy "members see own memberships" on public.campaign_members
  for select using (user_id = auth.uid());

-- Agents
create policy "members manage campaign agents" on public.agents
  for all using (public.is_admin() or public.is_member_of(campaign_id));

-- Leads
create policy "members manage campaign leads" on public.leads
  for all using (public.is_admin() or public.is_member_of(campaign_id));

-- Shifts
create policy "members manage campaign shifts" on public.shift_logs
  for all using (public.is_admin() or public.is_member_of(campaign_id));

-- Attendance
create policy "members manage campaign attendance" on public.attendance
  for all using (public.is_admin() or public.is_member_of(campaign_id));

-- Pay periods
create policy "members manage campaign pay periods" on public.pay_periods
  for all using (public.is_admin() or public.is_member_of(campaign_id));

-- ═══════════════════════════════════════════════════════════════
-- DONE.
-- Next: configure Google OAuth in Supabase Auth → Providers.
-- Then sign in once with derekscotthill@gmail.com to consume the
-- pre-seeded admin invite.
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- CALL CENTER MANAGEMENT PLATFORM — SUPABASE SCHEMA
-- Run this in Supabase SQL Editor (supabase.com → your project → SQL Editor)
-- ═══════════════════════════════════════════════════════════

-- 1. PROFILES (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null default '',
  role text not null default 'manager' check (role in ('admin', 'manager')),
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''), 'manager');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. CAMPAIGNS
create table public.campaigns (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  client_name text not null default '',
  -- Commission rates (client pays)
  rate_transfer numeric(10,2) default 0,       -- per raw transfer/lead
  rate_confirmed numeric(10,2) default 0,       -- per confirmed appointment
  rate_ia numeric(10,2) default 15,             -- per IA (instant appointment)
  -- IA tier bonuses (same agent, same day)
  ia_tier_2 numeric(10,2) default 40,           -- total for 2 IAs in a day
  ia_tier_3 numeric(10,2) default 75,           -- total for 3 IAs in a day
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  archived boolean default false
);

-- 3. CAMPAIGN MEMBERS (who can access which campaign)
create table public.campaign_members (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null default 'manager' check (role in ('admin', 'manager')),
  created_at timestamptz default now(),
  unique(campaign_id, user_id)
);

-- 4. AGENTS
create table public.agents (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade,
  full_name text not null,
  agent_number text default '',
  status text default 'active' check (status in ('active', 'inactive', 'removed')),
  is_tl boolean default false,
  assigned_tl_id uuid references public.agents(id),
  contact text default '',
  date_added timestamptz default now(),
  date_removed timestamptz
);

-- 5. LEADS (the core data — one row per lead)
create table public.leads (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade,
  agent_id uuid references public.agents(id),
  date date not null default current_date,
  customer_name text not null,
  phone text default '',
  address text default '',
  status text not null default 'pending' check (status in ('pending', 'transfer', 'confirmed', 'ia', 'dnc', 'bad')),
  -- Money
  client_commission numeric(10,2) default 0,    -- auto-calculated from campaign rates
  spiff numeric(10,2) default 0,                -- manager's bonus from pocket
  tl_bonus numeric(10,2) default 0,             -- team lead coaching bonus
  tl_recipient_id uuid references public.agents(id),
  -- Appointment
  appointment_date date,
  appointment_time text default '',
  -- Meta
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-calculate client commission based on campaign rates
create or replace function public.calc_client_commission()
returns trigger as $$
declare
  camp record;
  ia_count integer;
  tier_amount numeric;
begin
  select * into camp from public.campaigns where id = new.campaign_id;
  
  if new.status = 'ia' then
    -- Count how many IAs this agent has TODAY in this campaign
    select count(*) into ia_count
    from public.leads
    where campaign_id = new.campaign_id
      and agent_id = new.agent_id
      and date = new.date
      and status = 'ia'
      and id != new.id;
    
    -- Apply tier
    if ia_count >= 2 then
      -- 3rd+ IA: tier_3 total minus what was already paid
      tier_amount := camp.ia_tier_3 - camp.ia_tier_2;
      new.client_commission := greatest(tier_amount, camp.rate_ia);
    elsif ia_count = 1 then
      -- 2nd IA: tier_2 total minus first IA
      tier_amount := camp.ia_tier_2 - camp.rate_ia;
      new.client_commission := tier_amount;
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

-- 6. SHIFT LOG (daily floor count)
create table public.shift_logs (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade,
  date date not null,
  agents_on_floor integer not null default 0,
  notes text default '',
  created_at timestamptz default now(),
  unique(campaign_id, date)
);

-- 7. PAY PERIODS (for accounting)
create table public.pay_periods (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade,
  name text not null,               -- e.g. "Week of May 12"
  start_date date not null,
  end_date date not null,
  status text default 'open' check (status in ('open', 'closed', 'paid')),
  notes text default '',
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_members enable row level security;
alter table public.agents enable row level security;
alter table public.leads enable row level security;
alter table public.shift_logs enable row level security;
alter table public.pay_periods enable row level security;

-- Profiles: users can read all profiles, edit their own
create policy "Profiles are viewable by authenticated users" on public.profiles
  for select using (auth.role() = 'authenticated');
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Campaigns: admins see all, managers see their campaigns
create policy "Admins see all campaigns" on public.campaigns
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
create policy "Members see their campaigns" on public.campaigns
  for select using (
    exists (select 1 from public.campaign_members where campaign_id = id and user_id = auth.uid())
  );

-- Campaign members: admins manage all, members see their own
create policy "Admins manage all members" on public.campaign_members
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
create policy "Members see own campaign members" on public.campaign_members
  for select using (
    exists (select 1 from public.campaign_members cm where cm.campaign_id = campaign_id and cm.user_id = auth.uid())
  );

-- Agents, Leads, Shift Logs, Pay Periods: campaign members can manage
create policy "Campaign members manage agents" on public.agents
  for all using (
    exists (select 1 from public.campaign_members where campaign_id = agents.campaign_id and user_id = auth.uid())
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Campaign members manage leads" on public.leads
  for all using (
    exists (select 1 from public.campaign_members where campaign_id = leads.campaign_id and user_id = auth.uid())
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Campaign members manage shifts" on public.shift_logs
  for all using (
    exists (select 1 from public.campaign_members where campaign_id = shift_logs.campaign_id and user_id = auth.uid())
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Campaign members manage pay periods" on public.pay_periods
  for all using (
    exists (select 1 from public.campaign_members where campaign_id = pay_periods.campaign_id and user_id = auth.uid())
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ═══════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════
create index idx_leads_campaign on public.leads(campaign_id);
create index idx_leads_agent on public.leads(agent_id);
create index idx_leads_date on public.leads(date);
create index idx_leads_status on public.leads(status);
create index idx_agents_campaign on public.agents(campaign_id);
create index idx_shift_campaign_date on public.shift_logs(campaign_id, date);
create index idx_members_campaign on public.campaign_members(campaign_id);
create index idx_members_user on public.campaign_members(user_id);

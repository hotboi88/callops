# Call Center Management Platform — Setup Guide

## What You Get
- **Lead Log** — log every lead with date, agent, customer, phone, status, spiff, TL bonus
- **Commission Sheet** — auto-calculated from lead log, shows what to bill client + what each agent earned
- **Agent Report** — weekly breakdown per agent (transfers, IAs, confirms, DNC, conversion %)
- **Floor Report** — daily agents on floor, total leads, lead:agent ratios
- **Multi-campaign** — separate campaigns with their own agents, rates, and data
- **Role-based access** — admins see all campaigns, managers see only theirs
- **Auto-save** — every change saves instantly to the cloud database

## Quick Start (5 minutes)

### 1. Create a Supabase Project (free)
1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New Project" — pick a name and password
3. Wait ~2 minutes for it to provision

### 2. Set Up the Database
1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Paste the entire contents of `schema.sql` (included in this package)
4. Click "Run" — this creates all tables, triggers, and security policies

### 3. Get Your Keys
1. Go to **Settings → API** in Supabase dashboard
2. Copy your **Project URL** (e.g. `https://xxxxx.supabase.co`)
3. Copy your **anon/public key** (the long string)

### 4. Deploy to GitHub Pages
1. Create a new GitHub repository
2. Upload the HTML file
3. Go to **Settings → Pages** → set source to "main" branch
4. Your app is live at `https://yourusername.github.io/repo-name`

### 5. Connect Supabase
In the HTML file, find these lines near the top and fill in your credentials:
```javascript
const SUPABASE_URL = "https://xxxxx.supabase.co";
const SUPABASE_KEY = "eyJhbGci...your-anon-key";
const USE_SUPABASE = true;
```

## Creating User Accounts
1. Go to Supabase dashboard → **Authentication → Users**
2. Click "Add User" → enter email and password
3. The trigger auto-creates their profile as "manager" role
4. To make someone an admin, go to **Table Editor → profiles** → change their role to "admin"

## Commission Rate Setup
Each campaign has configurable rates:
- **$ per Transfer** — client pays this per raw lead/transfer (usually $0)
- **$ per Confirmed** — client pays per confirmed appointment
- **$ per IA** — client pays per instant appointment (default $15)
- **IA Tier 2** — total client pays when same agent gets 2 IAs in one day (default $40)
- **IA Tier 3** — total for 3 IAs in one day (default $75)

The commission sheet auto-calculates the tier — you just log the lead with status "IA" and it figures out if it's the 1st, 2nd, or 3rd IA that day for that agent.

## Daily Workflow
1. Open the app → select your campaign
2. **Lead Log** → click "Add Lead" → fill in date, agent, customer, status
3. If you spiff the agent, enter your spiff amount
4. If there's a TL coaching bonus, enter the TL bonus and select the TL
5. Done — Commission Sheet and Agent Report update automatically
6. At start of shift, go to **Floor Report** → log how many agents are on the floor

## For Your Accountant
Share the Commission Sheet tab. It shows:
- **Bill Client** total — what to invoice
- Per-agent breakdown with Client $, your spiffs, TL bonuses, and total owed
- Filterable by This Week, Last Week, or All Time

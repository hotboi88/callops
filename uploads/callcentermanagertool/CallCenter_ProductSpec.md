# Call Center Management Platform — Product Spec

## Overview
A web app for managing outbound telemarketing campaigns. Managers log leads, track agent performance, calculate commissions, and monitor daily operations. Multiple campaigns supported — each with their own agents, rates, and data. Admins oversee all campaigns; managers see only theirs.

**Stack:** React + Tailwind + Supabase (PostgreSQL + Auth) → GitHub Pages
**Users:** Campaign managers, admins, accountants (view-only)

---

## Auth & Roles

| Role | Access |
|------|--------|
| **Admin** | All campaigns, all settings, user management |
| **Manager** | Only campaigns they're assigned to |
| **Viewer** (future) | Read-only commission sheets for accountants |

- Email/password login via Supabase Auth
- Auto-create profile on signup (default role: manager)
- Admin promotes users via settings

---

## Campaign Directory (Home Screen)

**Who sees it:** Everyone after login
**What it shows:** 
- List of campaigns as cards (name, client, lead count, IA count)
- Admins see all campaigns; managers see only theirs
- "New Campaign" button (admin only)
- Campaign creation form: name, client name, commission rates

**Create Campaign fields:**
- Campaign name
- Client name
- $ per Transfer (default: $0)
- $ per Confirmed (default: $0)
- $ per IA (default: $15)
- IA Tier 2 — total client pays for 2 IAs by same agent in one day (default: $40)
- IA Tier 3 — total for 3 IAs same agent same day (default: $75)

---

## Inside a Campaign — 5 Tabs

### Tab 1: Lead Log
**Purpose:** The single source of truth. Manager logs every lead here. Everything else auto-calculates from this data.

**Add Lead form fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Date | Date picker | Yes | Defaults to today |
| Agent | Dropdown (from roster) | Yes | Only active agents shown |
| Customer Name | Text | Yes | |
| Phone | Tel | No | |
| Status | Dropdown | Yes | Pending / Transfer / Confirmed / IA / DNC / Bad |
| Your Spiff ($) | Number | No | Manager's bonus from pocket |
| TL Bonus ($) | Number | No | Team lead coaching bonus |
| TL Recipient | Dropdown (TLs only) | No | Who receives the TL bonus |
| Appt Date | Date picker | No | |
| Appt Time | Time picker | No | |
| Notes | Text | No | |

**Auto-calculated (not editable):**
- Client $ — based on status + campaign rates + IA tier logic
- Total — Client $ + Spiff + TL Bonus
- Day of week — from date
- Week number — from date (e.g. WK13)

**IA Tier Logic (auto-calculated per lead):**
- 1st IA of the day for an agent → campaign.rate_ia (default $15)
- 2nd IA same agent same day → campaign.ia_tier_2 minus the 1st IA amount (default $40 - $15 = $25)
- 3rd IA same agent same day → campaign.ia_tier_3 minus tier_2 (default $75 - $40 = $35)
- Resets daily per agent

**Lead table view:**
- Sortable columns (date, agent, customer, status)
- Filter by status (tabs: All / Pending / Transfer / Confirmed / IA / DNC)
- Search bar (searches customer name, phone, agent name)
- Click any row to edit inline
- Status pills color-coded:
  - Pending = neutral gray
  - Transfer = blue/indigo
  - Confirmed = green
  - IA = purple
  - DNC = red
  - Bad = red (muted)
- Money columns color-coded:
  - Client $ = green
  - Spiff = amber/gold
  - TL Bonus = purple
  - Total = white/bold

**Business rules:**
- Every lead that isn't IA, Confirmed, or DNC is "Pending" by default
- Status can be changed at any time (lead progression)
- Changing status auto-recalculates client commission

---

### Tab 2: Commission Sheet
**Purpose:** What accounting sees. Shows exactly what to bill the client and what each agent earned for a given period.

**Period selector:** This Week / Last Week / Custom Range / All Time

**Summary cards (top):**
| Card | Description | Color |
|------|-------------|-------|
| Bill Client | Total client commission for the period | Green |
| Your Spiffs | Total spiffs you paid from pocket | Amber |
| TL Bonuses | Total TL coaching bonuses | Purple |
| Total Payout | Sum of all three | White/bold |

**Agent Payout Table:**
| Column | Description |
|--------|-------------|
| Agent | Name (+ TL star badge if applicable) |
| IAs | Count of IAs this period |
| Confirms | Count of Confirmed this period |
| Transfers | Count of Transfers this period |
| Client $ | Total client commission earned by this agent |
| Your Spiff | Total spiff you gave this agent |
| TL Bonus | TL coaching bonus received (if they're a TL) |
| Total Owed | Client $ + Spiff + TL Bonus |

**Footer row:** Totals for every column

**Export:** CSV download button for the payout table

---

### Tab 3: Agent Report
**Purpose:** Weekly performance breakdown per agent. How many leads, what statuses, conversion rates.

**Agent Summary Table:**
| Column | Description |
|--------|-------------|
| Agent | Name + TL badge |
| Total Leads | All leads assigned to this agent |
| Pending | Count |
| Transfers | Count |
| IAs | Count (highlighted purple) |
| Confirms | Count (highlighted green) |
| DNC | Count (highlighted red if > 0) |
| Conv% | (IAs + Confirms) / Transfers — conversion rate |

- Sorted by (IAs + Confirms) descending by default
- Agents with 5+ transfers and 0 conversions highlighted in red/warning
- Add Agent button → opens quick-add form (name only, auto-set to active)

**Weekly Grid (below the summary):**
Per-agent, per-week breakdown showing T / IA / C counts in a compact grid:
- Rows = agents (only those with leads)
- Columns = week numbers (WK13, WK14, etc.)
- Each cell shows: Transfers | IAs | Confirms
- Color-coded: IAs purple, Confirms green, zeros gray

---

### Tab 4: Floor Report
**Purpose:** Daily operations view. How many agents were working, how many leads came in, what's the ratio.

**Two sections on this page:**

#### Section A: Daily Stats Table

**Shift Logger (top):**
- Date picker + number input + "Log" button
- Logs how many agents were on the floor that day
- Can update existing entries

**Daily Table:**
| Column | Description |
|--------|-------------|
| Date | MM/DD/YY |
| Day | Mon, Tue, etc. |
| On Floor | Agents working that day (from shift log) |
| Total Leads | All leads that day |
| Pending | Count |
| Transfers | Count |
| IAs | Count |
| Confirms | Count |
| DNC | Count |
| Lead:Agent | Ratio (total leads ÷ agents on floor) |

- Sorted by date descending (most recent first)
- Days with no shift logged show "—" in On Floor and Lead:Agent
- Highlight rows where ratio is especially high or low

#### Section B: Agent Attendance Report

**Purpose:** Track which agents were present each day. See attendance patterns, no-shows, consistency.

**Attendance Grid:**
- Rows = agents (active roster)
- Columns = dates (scrollable, last 14–30 days)
- Each cell = Present ✓ / Absent ✗ / Off — (click to toggle)
- Auto-populated as "Present" when an agent has at least 1 lead that day
- Manually overridable (manager can mark someone present even with 0 leads, or absent despite leads if they left early)

**Attendance Summary (side or below grid):**
| Column | Description |
|--------|-------------|
| Agent | Name |
| Days Present | Count of ✓ in the visible range |
| Days Absent | Count of ✗ |
| Attendance % | Present / (Present + Absent) |
| Avg Leads/Day | Total leads ÷ days present |

- Sorted by attendance % descending
- Flag agents below 80% attendance in amber
- Flag agents below 60% in red

---

### Tab 5: Settings
**Purpose:** Campaign configuration and agent roster management.

**General Settings:**
- Campaign name (editable)
- Client name (editable)

**Commission Rates (Client Pays):**
- $ per Transfer
- $ per Confirmed
- $ per IA
- IA Tier 2 (total for 2/day)
- IA Tier 3 (total for 3/day)
- Save button with confirmation

**Agent Roster:**
- List of all agents with: name, status badge (Active/Inactive/Removed), TL badge
- Add Agent: name input + "Add" button
- Per agent actions:
  - Toggle TL status
  - Toggle Active/Inactive
  - Remove (moves to Alumni section)
- Alumni section (collapsed): removed agents with "Reactivate" button
- Bulk actions: select multiple agents → assign TL, mark inactive, remove

**Data Management:**
- Export All Data (JSON backup)
- Import Data (restore from backup)
- Reset Campaign (clear all leads — requires confirmation)

---

## Data Model (Supabase Tables)

### profiles
- id (uuid, from auth.users)
- email
- full_name
- role (admin / manager)

### campaigns
- id, name, client_name
- rate_transfer, rate_confirmed, rate_ia
- ia_tier_2, ia_tier_3
- created_by, created_at

### campaign_members
- campaign_id, user_id, role

### agents
- id, campaign_id
- full_name, agent_number, status (active/inactive/removed)
- is_tl, assigned_tl_id
- contact, date_added, date_removed

### leads
- id, campaign_id, agent_id
- date, customer_name, phone, address
- status (pending/transfer/confirmed/ia/dnc/bad)
- client_commission (auto-calculated by DB trigger)
- spiff, tl_bonus, tl_recipient_id
- appointment_date, appointment_time
- notes, created_at, updated_at

### shift_logs
- id, campaign_id
- date, agents_on_floor, notes

### attendance
- id, campaign_id, agent_id
- date, status (present/absent/off)
- auto_detected (boolean — true if populated from lead data)

---

## Design Direction

**Theme:** Dark — deep charcoal/navy background, not pure black. 
**Accent:** Indigo/purple (#6c63ff) or your brand color.
**Status colors:**
- Pending: neutral gray
- Transfer: indigo/blue
- Confirmed: green
- IA: purple (the hero color — IAs are the premium outcome)
- DNC/Bad: red

**Typography:** 
- Clean sans-serif for UI (e.g. Geist, Satoshi)
- Monospace for all numbers and money (SF Mono, JetBrains Mono)

**Key design principles:**
- Numbers are the hero — big, bold, monospace, colored by meaning
- Tables are the primary interaction — they need to be scannable, not cramped
- Status pills should be immediately recognizable by color
- Commission sheet should look like a real invoice — clean enough to hand to an accountant
- Mobile-responsive but desktop-first (managers use this at a desk)
- Every action auto-saves — no "save" buttons for data entry (save on blur/enter)

**Empty states:** Should be inviting, not just "No data." Show the user what to do: "Add your first lead to get started" with a prominent button.

---

## Future Considerations (not in v1)
- WhatsApp chat import (parse lead templates automatically)
- Real-time lead notifications
- Viewer role for accountants (read-only commission access)
- Multi-TL hierarchy (TL of TLs)
- Lead deduplication (flag same phone number)
- Campaign archiving
- Pay period management (mark weeks as closed/paid)
- Agent performance alerts (auto-flag zero-conversion agents)

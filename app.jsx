// Directory + App shell

const { useState: useStateApp, useEffect: useEffectApp, useMemo: useMemoApp, useCallback: useCallbackApp } = React;

function Directory({ campaigns, agents, leads, profile, onOpen, onNewCampaign }) {
  // Compute live stats per campaign from current state
  const enriched = useMemoApp(() => {
    const today = U.dayStr(window.MOCK_TODAY);
    const tw = { start: U.dayStr(U.startOfWeek(window.MOCK_TODAY)), end: U.dayStr(U.endOfWeek(window.MOCK_TODAY)) };
    return campaigns.map(c => {
      const cLeads = leads.filter(l => l.campaign_id === c.id);
      const ias = cLeads.filter(l => l.status === "ia").length;
      const activeAgents = agents.filter(a => a.campaign_id === c.id && a.status === "active").length;
      const todayLeads = cLeads.filter(l => l.date === today);
      const twLeads = cLeads.filter(l => l.date >= tw.start && l.date <= tw.end);
      const twBill = twLeads.reduce((s, l) => s + (l.client_commission || 0), 0);
      // 14-day spark
      const spark = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date(window.MOCK_TODAY);
        d.setDate(d.getDate() - i);
        const ds = U.dayStr(d);
        spark.push(cLeads.filter(l => l.date === ds).length);
      }
      return {
        ...c,
        lead_count: cLeads.length,
        ia_count: ias,
        agent_count: activeAgents,
        today_count: todayLeads.length,
        tw_bill: twBill,
        spark
      };
    });
  }, [campaigns, agents, leads]);

  const totalLeads = enriched.reduce((s, c) => s + c.lead_count, 0);
  const totalIA = enriched.reduce((s, c) => s + c.ia_count, 0);
  const totalAgents = enriched.reduce((s, c) => s + c.agent_count, 0);
  const totalBill = enriched.reduce((s, c) => s + c.tw_bill, 0);

  const greet = (() => {
    const h = window.MOCK_TODAY.getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="directory">
      <div className="directory-head">
        <div>
          <div className="greet">{greet}, {profile.full_name.split(" ")[0]}.</div>
          <h1>Campaigns</h1>
        </div>
        <div className="right">
          <button className="btn btn-primary btn-lg" onClick={onNewCampaign}>
            <Icon name="plus"/> New Campaign
          </button>
        </div>
      </div>

      <div className="row" style={{ gap: 28, marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid var(--border-subtle)", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Campaigns</div>
          <div className="mono" style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em" }}>{enriched.length}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Agents</div>
          <div className="mono" style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em" }}>{totalAgents}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Leads (28d)</div>
          <div className="mono" style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em" }}>{totalLeads.toLocaleString()}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>IAs (28d)</div>
          <div className="mono" style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--status-ia-fg)" }}>{totalIA}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Billing (this week)</div>
          <div className="mono" style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--money-pos)" }}>{U.fmtMoney(totalBill)}</div>
        </div>
      </div>

      <div className="campaign-grid">
        {enriched.map(c => (
          <div key={c.id} className="campaign-card" onClick={() => onOpen(c.id)}>
            <div className="cc-head">
              <div className="cc-mark">{c.mark}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3>{c.name}</h3>
                <div className="cc-client">{c.client}</div>
              </div>
              <Sparkline values={c.spark} width={72} height={24}/>
            </div>
            <div className="cc-stats">
              <div className="s">
                <div className="v">{c.lead_count.toLocaleString()}</div>
                <div className="l">Leads 28d</div>
              </div>
              <div className="s">
                <div className="v" style={{ color: "var(--status-ia-fg)" }}>{c.ia_count}</div>
                <div className="l">IAs 28d</div>
              </div>
              <div className="s">
                <div className="v">{c.agent_count}</div>
                <div className="l">Agents</div>
              </div>
              <div className="s">
                <div className="v" style={{ color: "var(--money-pos)" }}>{U.fmtMoney(c.tw_bill)}</div>
                <div className="l">Bill / wk</div>
              </div>
            </div>
            <div className="cc-footer">
              <span className="dot"/>
              <span>
                <span className="mono" style={{ color: "var(--text)" }}>{c.today_count || 0}</span> lead{c.today_count === 1 ? "" : "s"} today
              </span>
              <span className="muted-2" style={{ marginLeft: "auto" }}>Open campaign →</span>
            </div>
          </div>
        ))}
        <div className="campaign-card new-card" onClick={onNewCampaign}>
          <div>
            <Icon name="plus" size={20}/>
            <div style={{ marginTop: 6, fontSize: 13, fontWeight: 500 }}>New Campaign</div>
            <div className="help" style={{ marginTop: 4 }}>Admin only</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- New Campaign Modal ----------
function NewCampaignModal({ onClose, onSave }) {
  const [form, setForm] = useStateApp({
    name: "", client: "",
    rate_transfer: 0, rate_confirmed: 25, rate_ia: 15, ia_tier_2: 40, ia_tier_3: 75,
  });
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const updateNum = (k, v) => setForm(f => ({ ...f, [k]: Math.max(0, Number(v) || 0) }));

  const canSave = form.name.trim() && form.client.trim();
  return (
    <Modal
      open
      onClose={onClose}
      title="New Campaign"
      width="560px"
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => canSave && onSave(form)} disabled={!canSave}>Create campaign</button>
        </>
      }
    >
      <div className="stack">
        <div className="row-2">
          <div className="field">
            <label>Campaign name</label>
            <input className="input" autoFocus value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Apex Solar"/>
          </div>
          <div className="field">
            <label>Product</label>
            <input className="input" value={form.client} onChange={(e) => update("client", e.target.value)} placeholder="e.g. Residential Solar"/>
          </div>
        </div>
        <div className="divider"/>
        <div className="help">Commission rates — what the client pays you per outcome.</div>
        <div className="row-3">
          <div className="field">
            <label>$ per Transfer</label>
            <div className="field-money"><input className="input" type="number" min="0" value={form.rate_transfer} onChange={(e) => updateNum("rate_transfer", e.target.value)}/></div>
          </div>
          <div className="field">
            <label>$ per Confirmed</label>
            <div className="field-money"><input className="input" type="number" min="0" value={form.rate_confirmed} onChange={(e) => updateNum("rate_confirmed", e.target.value)}/></div>
          </div>
          <div className="field">
            <label>$ per IA</label>
            <div className="field-money"><input className="input" type="number" min="0" value={form.rate_ia} onChange={(e) => updateNum("rate_ia", e.target.value)}/></div>
          </div>
        </div>
        <div className="row-2">
          <div className="field">
            <label>IA Tier 2 (2 IAs/day)</label>
            <div className="field-money"><input className="input" type="number" min="0" value={form.ia_tier_2} onChange={(e) => updateNum("ia_tier_2", e.target.value)}/></div>
          </div>
          <div className="field">
            <label>IA Tier 3 (3 IAs/day)</label>
            <div className="field-money"><input className="input" type="number" min="0" value={form.ia_tier_3} onChange={(e) => updateNum("ia_tier_3", e.target.value)}/></div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ---------- Campaign Shell ----------
function CampaignShell(props) {
  const { campaign, tab, onTab } = props;
  const tabs = [
    ["overview", "Overview", "activity"],
    ["lead_log", "Lead Log", "list"],
    ["commission", "Commission Sheet", "download"],
    ["agent_report", "Agent Report", "users"],
    ["floor_report", "Floor Report", "grid"],
    ["settings", "Settings", "settings"],
  ];

  return (
    <>
      <div className="tabs">
        {tabs.map(([k, label, icon]) => (
          <button key={k} className={"tab" + (tab === k ? " active" : "")} onClick={() => onTab(k)}>
            <Icon name={icon} size={13}/> {label}
          </button>
        ))}
      </div>
      {tab === "overview" && (
        <Overview
          campaign={campaign}
          agents={props.agents}
          leads={props.leads}
          shiftLogs={props.shiftLogs}
          onJumpTab={onTab}
        />
      )}
      {tab === "lead_log" && (
        <LeadLog
          campaign={campaign}
          agents={props.agents}
          leads={props.leads}
          onAddLead={props.onAddLead}
          onUpdateLead={props.onUpdateLead}
          onDeleteLead={props.onDeleteLead}
        />
      )}
      {tab === "commission" && (
        <CommissionSheet
          campaign={campaign}
          agents={props.agents}
          leads={props.leads}
          profile={props.profile}
          onInviteUser={props.onInviteUser}
        />
      )}
      {tab === "agent_report" && (
        <AgentReport
          campaign={campaign}
          agents={props.agents}
          leads={props.leads}
          onAddAgent={(name, isTl) => props.onAddAgent(campaign.id, name, isTl)}
        />
      )}
      {tab === "floor_report" && (
        <FloorReport
          campaign={campaign}
          agents={props.agents}
          leads={props.leads}
          shiftLogs={props.shiftLogs}
          attendanceOverrides={props.attendanceOverrides}
          onLogShift={props.onLogShift}
          onSetAttendance={props.onSetAttendance}
        />
      )}
      {tab === "settings" && (
        <Settings
          campaign={campaign}
          agents={props.agents}
          profile={props.profile}
          canDo={props.canDo}
          onUpdateCampaign={props.onUpdateCampaign}
          onAddAgent={(name, isTl) => props.onAddAgent(campaign.id, name, isTl)}
          onUpdateAgent={props.onUpdateAgent}
          onDeleteCampaign={props.onDeleteCampaign}
          leadsCount={props.leads.filter(l => l.campaign_id === campaign.id).length}
        />
      )}
    </>
  );
}

// ---------- Top App ----------
function App() {
  // ---- State ----
  const initial = window.MOCK_DATA;
  const [campaigns, setCampaigns] = useStateApp(initial.campaigns);
  const [agents, setAgents] = useStateApp(initial.agents);
  const [leads, setLeads] = useStateApp(initial.leads);
  const [shiftLogs, setShiftLogs] = useStateApp(initial.shift_logs);
  const [attendanceOverrides, setAttendanceOverrides] = useStateApp({}); // {"agentId|date": "present|absent|off"}
  const [profile, setProfile] = useStateApp(initial.profile);
  const [impersonatingFrom, setImpersonatingFrom] = useStateApp(null);
  const [users, setUsers] = useStateApp(initial.users || []);
  const [auditLog, setAuditLog] = useStateApp(initial.audit_log || []);
  const [rolePerms, setRolePerms] = useStateApp({ admin: {}, manager: {}, viewer: {} });
  const [userOverrides, setUserOverrides] = useStateApp({});
  const [signedOut, setSignedOut] = useStateApp(false);
  const [userMenuOpen, setUserMenuOpen] = useStateApp(false);
  const [view, setView] = useStateApp("app"); // "app" | "admin"
  const userMenuRef = React.useRef(null);

  // ---- Audit helper ----
  const pushAudit = useCallbackApp((entry) => {
    const e = {
      id: "au_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
      ts: new Date().toISOString(),
      actor_id: profile.id,
      actor_name: profile.full_name,
      ...entry,
    };
    setAuditLog(prev => [e, ...prev].slice(0, 500));
  }, [profile]);

  // Permission helper bound to current profile state
  const canDo = useCallbackApp(
    (perm) => window.can(profile, perm, { rolePerms, userOverrides }),
    [profile, rolePerms, userOverrides]
  );

  // Route state
  const [activeCampaignId, setActiveCampaignId] = useStateApp(null);
  const [tab, setTab] = useStateApp("overview");
  const [showNewCampaign, setShowNewCampaign] = useStateApp(false);

  // ---- Impersonation: "view as" another user ----
  const startImpersonate = useCallbackApp((userId) => {
    const u = users.find(x => x.id === userId);
    if (!u) return;
    // If clicking on the original profile while impersonating, just stop.
    if (impersonatingFrom && u.id === impersonatingFrom.id) {
      stopImpersonate();
      return;
    }
    // Already impersonating someone else? Don't overwrite the saved original.
    if (u.id === profile.id) return;
    if (!impersonatingFrom) {
      setImpersonatingFrom(profile);
    }
    setProfile({
      id: u.id,
      full_name: u.full_name,
      initials: u.initials,
      role: u.role,
      email: u.email,
    });
    setView("app");
    setUserMenuOpen(false);
    // Route based on access
    const fake = { id: u.id, role: u.role };
    const hasViewAll = window.can(fake, "view_all_campaigns", { rolePerms, userOverrides });
    if (hasViewAll || u.campaign_ids.length > 1) {
      setActiveCampaignId(null);
    } else if (u.campaign_ids.length === 1) {
      setActiveCampaignId(u.campaign_ids[0]);
      setTab("overview");
    } else {
      setActiveCampaignId(null);
    }
    pushAudit({
      kind: "auth.impersonate",
      category: "auth",
      description: `Started viewing as ${u.full_name} (${u.role})`,
    });
  }, [users, profile, rolePerms, userOverrides, pushAudit]);

  const stopImpersonate = useCallbackApp(() => {
    if (!impersonatingFrom) return;
    pushAudit({
      kind: "auth.impersonate_stop",
      category: "auth",
      description: `Stopped viewing as ${profile.full_name}`,
      actor_id: impersonatingFrom.id,
      actor_name: impersonatingFrom.full_name,
    });
    setProfile(impersonatingFrom);
    setImpersonatingFrom(null);
    setView("app");
    setActiveCampaignId(null);
    setUserMenuOpen(false);
  }, [impersonatingFrom, profile, pushAudit]);

  // "Campaigns" top-nav handler: takes user to their highest-level view.
  const goToCampaigns = useCallbackApp(() => {
    setView("app");
    const me = users.find(u => u.id === profile.id);
    const hasViewAll = canDo("view_all_campaigns");
    if (hasViewAll || (me?.campaign_ids?.length || 0) > 1) {
      setActiveCampaignId(null);
    } else if (me?.campaign_ids?.length === 1) {
      setActiveCampaignId(me.campaign_ids[0]);
      setTab("overview");
    } else {
      setActiveCampaignId(null);
    }
  }, [users, profile, canDo]);

  // Campaigns the current profile may see (filtered)
  const visibleCampaigns = useMemoApp(() => {
    if (canDo("view_all_campaigns")) return campaigns;
    const me = users.find(u => u.id === profile.id);
    if (!me) return [];
    return campaigns.filter(c => me.campaign_ids.includes(c.id));
  }, [campaigns, users, profile, canDo]);

  // For users without view_all_campaigns: assign them to one campaign and route there.
  useEffectApp(() => {
    if (!canDo("view_all_campaigns") && view === "app" && activeCampaignId === null) {
      const me = users.find(u => u.id === profile.id);
      if (me && me.campaign_ids.length === 1) {
        setActiveCampaignId(me.campaign_ids[0]);
        setTab("overview");
      }
    }
  }, [profile.id, rolePerms, userOverrides, view, activeCampaignId]);

  // Theme tweak
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "theme": "dark"
  }/*EDITMODE-END*/;
  const [tweaks, setTweak] = window.useTweaks
    ? window.useTweaks(TWEAK_DEFAULTS)
    : [TWEAK_DEFAULTS, () => {}];

  useEffectApp(() => {
    document.documentElement.setAttribute("data-theme", tweaks.theme || "dark");
  }, [tweaks.theme]);

  const activeCampaign = useMemoApp(
    () => campaigns.find(c => c.id === activeCampaignId),
    [campaigns, activeCampaignId]
  );

  // ---- Mutations ----
  const onAddLead = useCallbackApp((lead) => {
    if (!activeCampaign) return;
    const newLead = {
      id: "ld_" + Date.now(),
      campaign_id: activeCampaign.id,
      agent_id: lead.agent_id,
      seq: 9999999,
      date: lead.date,
      customer_name: lead.customer_name,
      phone: lead.phone,
      status: lead.status,
      client_commission: 0,
      spiff: lead.spiff || 0,
      tl_bonus: lead.tl_bonus || 0,
      tl_recipient_id: lead.tl_recipient_id || null,
      appointment_date: lead.appointment_date || null,
      appointment_time: lead.appointment_time || null,
      notes: lead.notes || "",
    };
    setLeads(prev => {
      const next = [...prev, newLead];
      U.recomputeCommissions(activeCampaign, next);
      return next;
    });
    pushAudit({
      kind: "lead.create",
      category: "leads",
      campaign_id: activeCampaign.id,
      campaign_name: activeCampaign.name,
      description: `Added lead “${newLead.customer_name}” (${newLead.status})`,
    });
  }, [activeCampaign, pushAudit]);

  const onUpdateLead = useCallbackApp((id, updates) => {
    setLeads(prev => {
      const before = prev.find(l => l.id === id);
      const next = prev.map(l => l.id === id ? { ...l, ...updates } : l);
      if (activeCampaign) U.recomputeCommissions(activeCampaign, next);
      // Audit
      if (before && activeCampaign) {
        if (updates.status && updates.status !== before.status) {
          pushAudit({
            kind: "lead.status",
            category: "leads",
            campaign_id: activeCampaign.id,
            campaign_name: activeCampaign.name,
            description: `Changed status of “${before.customer_name}”: ${before.status} → ${updates.status}`,
          });
        } else {
          pushAudit({
            kind: "lead.update",
            category: "leads",
            campaign_id: activeCampaign.id,
            campaign_name: activeCampaign.name,
            description: `Updated lead “${before.customer_name}”`,
          });
        }
      }
      return next;
    });
  }, [activeCampaign, pushAudit]);

  const onDeleteLead = useCallbackApp((id) => {
    setLeads(prev => {
      const before = prev.find(l => l.id === id);
      const next = prev.filter(l => l.id !== id);
      if (activeCampaign) U.recomputeCommissions(activeCampaign, next);
      if (before && activeCampaign) {
        pushAudit({
          kind: "lead.delete",
          category: "leads",
          campaign_id: activeCampaign.id,
          campaign_name: activeCampaign.name,
          description: `Deleted lead “${before.customer_name}”`,
        });
      }
      return next;
    });
  }, [activeCampaign, pushAudit]);

  const onAddAgent = useCallbackApp((campaignId, name, isTl) => {
    const a = {
      id: "ag_" + Date.now(),
      campaign_id: campaignId,
      full_name: name,
      agent_number: "A" + (1000 + Math.floor(Math.random() * 9000)),
      status: "active",
      is_tl: !!isTl,
      date_added: U.dayStr(window.MOCK_TODAY),
    };
    setAgents(prev => [...prev, a]);
    const c = campaigns.find(x => x.id === campaignId);
    pushAudit({
      kind: "agent.add",
      category: "agents",
      campaign_id: campaignId,
      campaign_name: c?.name,
      description: `Added agent ${name}${isTl ? " (Team Lead)" : ""}`,
    });
  }, [pushAudit, campaigns]);

  const onUpdateAgent = useCallbackApp((id, updates) => {
    setAgents(prev => {
      const before = prev.find(a => a.id === id);
      const next = prev.map(a => a.id === id ? { ...a, ...updates } : a);
      if (before) {
        const c = campaigns.find(x => x.id === before.campaign_id);
        let desc = `Updated agent ${before.full_name}`;
        if (updates.status === "removed") desc = `Removed agent ${before.full_name}`;
        else if (updates.status && updates.status !== before.status) desc = `${updates.status === "active" ? "Reactivated" : "Deactivated"} agent ${before.full_name}`;
        else if ("is_tl" in updates) desc = `${updates.is_tl ? "Promoted" : "Demoted"} ${before.full_name} ${updates.is_tl ? "to Team Lead" : "from Team Lead"}`;
        pushAudit({
          kind: updates.status === "removed" ? "agent.remove" : "agent.update",
          category: "agents",
          campaign_id: before.campaign_id,
          campaign_name: c?.name,
          description: desc,
        });
      }
      return next;
    });
  }, [pushAudit, campaigns]);

  const onUpdateCampaign = useCallbackApp((updates) => {
    setCampaigns(prev => {
      const next = prev.map(c => c.id === activeCampaign.id ? { ...c, ...updates } : c);
      const updatedCampaign = next.find(c => c.id === activeCampaign.id);
      // Recompute leads with new rates
      setLeads(prevLeads => {
        const out = [...prevLeads];
        U.recomputeCommissions(updatedCampaign, out);
        return out;
      });
      return next;
    });
    pushAudit({
      kind: "campaign.update",
      category: "campaigns",
      campaign_id: activeCampaign.id,
      campaign_name: activeCampaign.name,
      description: `Updated ${activeCampaign.name} settings`,
    });
  }, [activeCampaign, pushAudit]);

  const onLogShift = useCallbackApp((date, count) => {
    if (!activeCampaign) return;
    setShiftLogs(prev => {
      const existing = prev.findIndex(s => s.campaign_id === activeCampaign.id && s.date === date);
      if (existing >= 0) {
        const next = [...prev]; next[existing] = { ...next[existing], agents_on_floor: count };
        return next;
      }
      return [...prev, { id: "sl_" + Date.now(), campaign_id: activeCampaign.id, date, agents_on_floor: count, notes: "" }];
    });
    pushAudit({
      kind: "shift.log",
      category: "floor",
      campaign_id: activeCampaign.id,
      campaign_name: activeCampaign.name,
      description: `Logged ${count} agents on floor for ${U.shortDate(date)}`,
    });
  }, [activeCampaign, pushAudit]);

  const onSetAttendance = useCallbackApp((agentId, date, status) => {
    setAttendanceOverrides(prev => ({ ...prev, [agentId + "|" + date]: status }));
    const a = agents.find(x => x.id === agentId);
    if (a && activeCampaign) {
      pushAudit({
        kind: "attendance.set",
        category: "floor",
        campaign_id: activeCampaign.id,
        campaign_name: activeCampaign.name,
        description: `Marked ${a.full_name} ${status} on ${U.shortDate(date)}`,
      });
    }
  }, [activeCampaign, agents, pushAudit]);

  const onNewCampaign = useCallbackApp((c) => {
    const id = "cmp_" + Date.now();
    const mark = c.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "XX";
    setCampaigns(prev => [...prev, { ...c, id, mark, created_at: U.dayStr(window.MOCK_TODAY), lead_count: 0, ia_count: 0, agent_count: 0 }]);
    setShowNewCampaign(false);
    pushAudit({
      kind: "campaign.create",
      category: "campaigns",
      campaign_id: id,
      campaign_name: c.name,
      description: `Created campaign “${c.name}” for ${c.client}`,
    });
  }, [pushAudit]);

  const onDeleteCampaign = useCallbackApp(() => {
    if (!activeCampaign) return;
    const cid = activeCampaign.id;
    const cname = activeCampaign.name;
    setCampaigns(prev => prev.filter(c => c.id !== cid));
    setLeads(prev => prev.filter(l => l.campaign_id !== cid));
    setAgents(prev => prev.filter(a => a.campaign_id !== cid));
    setShiftLogs(prev => prev.filter(s => s.campaign_id !== cid));
    // Clear attendance overrides tied to this campaign's agents
    setAttendanceOverrides(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        const agentId = k.split("|")[0];
        const a = agents.find(x => x.id === agentId);
        if (a && a.campaign_id === cid) delete next[k];
      });
      return next;
    });
    // Remove campaign from user assignments
    setUsers(prev => prev.map(u => ({ ...u, campaign_ids: u.campaign_ids.filter(x => x !== cid) })));
    pushAudit({
      kind: "campaign.delete",
      category: "campaigns",
      campaign_id: cid,
      campaign_name: cname,
      description: `Deleted campaign “${cname}” and all its data`,
    });
    setActiveCampaignId(null);
  }, [activeCampaign, agents, pushAudit]);

  // ---- User mutations ----
  const onInviteUser = useCallbackApp((data) => {
    const id = "u_" + Date.now();
    const initials = data.full_name.split(" ").map(x => x[0]).join("").slice(0, 2).toUpperCase();
    const u = {
      id, initials,
      full_name: data.full_name,
      email: data.email,
      role: data.role,
      campaign_ids: data.campaign_ids || [],
      status: "invited",
      last_active: null,
      created_at: new Date().toISOString(),
    };
    setUsers(prev => [...prev, u]);
    pushAudit({
      kind: "user.invite",
      category: "users",
      campaign_id: null,
      campaign_name: null,
      description: `Invited ${data.email} as ${data.role}`,
    });
  }, [pushAudit]);

  const onUpdateUserMut = useCallbackApp((id, updates) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    const u = users.find(x => x.id === id);
    if (u) {
      pushAudit({
        kind: "user.update",
        category: "users",
        campaign_id: null,
        campaign_name: null,
        description: `Updated ${u.full_name}’s account`,
      });
    }
  }, [users, pushAudit]);

  const onSuspendUser = useCallbackApp((id) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== id) return u;
      const next = u.status === "suspended" ? "active" : "suspended";
      return { ...u, status: next };
    }));
    const u = users.find(x => x.id === id);
    if (u) {
      const next = u.status === "suspended" ? "active" : "suspended";
      pushAudit({
        kind: next === "suspended" ? "user.suspend" : "user.update",
        category: "users",
        description: next === "suspended" ? `Suspended ${u.full_name}` : `Reactivated ${u.full_name}`,
      });
    }
  }, [users, pushAudit]);

  const onDeleteUser = useCallbackApp((id) => {
    const u = users.find(x => x.id === id);
    setUsers(prev => prev.filter(x => x.id !== id));
    if (u) {
      pushAudit({
        kind: "user.delete",
        category: "users",
        description: `Deleted user ${u.full_name} (${u.email})`,
      });
    }
  }, [users, pushAudit]);

  const onResendInvite = useCallbackApp((id) => {
    const u = users.find(x => x.id === id);
    if (u) {
      pushAudit({
        kind: "user.invite",
        category: "users",
        description: `Re-sent invite to ${u.email}`,
      });
    }
  }, [users, pushAudit]);

  // ---- Permission mutations ----
  const onUpdateRolePerms = useCallbackApp((role, key, val) => {
    setRolePerms(prev => {
      const next = { ...prev };
      const roleOv = { ...(next[role] || {}) };
      if (key === "__reset__") {
        next[role] = {};
      } else {
        // If toggling to the default value, remove the override; otherwise set it
        const defaultVal = window.ROLE_DEFAULTS[role]?.[key];
        if (val === defaultVal) delete roleOv[key];
        else roleOv[key] = val;
        next[role] = roleOv;
      }
      return next;
    });
    pushAudit({
      kind: "permissions.update",
      category: "users",
      description: key === "__reset__"
        ? `Reset ${role} role permissions to defaults`
        : `Set “${key}” to ${val ? "allowed" : "denied"} for ${role}s`,
    });
  }, [pushAudit]);

  const onUpdateUserOverrides = useCallbackApp((userId, overrides) => {
    setUserOverrides(prev => ({ ...prev, [userId]: overrides }));
    const u = users.find(x => x.id === userId);
    if (u) {
      const n = Object.keys(overrides).length;
      pushAudit({
        kind: "permissions.user",
        category: "users",
        description: n === 0
          ? `Cleared all permission overrides for ${u.full_name}`
          : `Updated permission overrides for ${u.full_name} (${n} active)`,
      });
    }
  }, [users, pushAudit]);

  // ---- Render ----
  if (signedOut) {
    return (
      <div className="signin">
        <div className="signin-card">
          <div className="brand" style={{ justifyContent: "center", marginBottom: 18 }}>
            <div className="brand-mark" style={{ width: 28, height: 28, fontSize: 14 }}>CO</div>
            <span style={{ fontSize: 16 }}>CallOps</span>
          </div>
          <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 600, textAlign: "center" }}>Welcome back</h2>
          <p style={{ margin: "0 0 18px", fontSize: 13, color: "var(--text-3)", textAlign: "center" }}>
            Sign in to your account to manage campaigns.
          </p>
          <div className="stack">
            <div className="field">
              <label>Email</label>
              <input className="input" defaultValue={profile.email} readOnly/>
            </div>
            <div className="field">
              <label>Password</label>
              <input className="input" type="password" defaultValue="••••••••••••" readOnly/>
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center", marginTop: 4 }} onClick={() => {
              setSignedOut(false);
              pushAudit({ kind: "auth.signin", category: "auth", description: "Signed in" });
            }}>
              Sign in
            </button>
          </div>
          <div className="help" style={{ textAlign: "center", marginTop: 14 }}>
            Demo — click <strong style={{ color: "var(--text-2)" }}>Sign in</strong> to return.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand" onClick={goToCampaigns}>
          <div className="brand-mark">CO</div>
          <span>CallOps</span>
        </div>
        <div className="top-nav">
          <button
            className={"top-tab" + (view === "app" ? " active" : "")}
            onClick={goToCampaigns}
          >
            Campaigns
            {activeCampaign && (
              <span style={{ color: "var(--text-3)", marginLeft: 6, fontWeight: 400 }}>/ {activeCampaign.name}</span>
            )}
          </button>
          {(canDo("manage_users") || canDo("manage_permissions") || canDo("view_audit_log")) && (
            <button
              className={"top-tab" + (view === "admin" ? " active" : "")}
              onClick={() => { setView("admin"); setActiveCampaignId(null); }}
            >
              Admin tools
            </button>
          )}
        </div>
        <div className="topbar-right">
          <span className="help" style={{ marginRight: 6 }}>{U.dayOfWeekFull(initial.today)} · {U.shortDate(initial.today)}</span>
          <button
            className="icon-btn"
            title="Toggle theme"
            onClick={() => setTweak("theme", tweaks.theme === "dark" ? "light" : "dark")}
          >
            <Icon name={tweaks.theme === "dark" ? "sun" : "moon"} size={13}/>
          </button>
          <button
            ref={userMenuRef}
            className="user-chip"
            style={{ cursor: "pointer", border: "1px solid var(--border)", background: "var(--bg-elev)" }}
            onClick={() => setUserMenuOpen(o => !o)}
          >
            <span className="avatar">{profile.initials}</span>
            <span>{profile.full_name.split(" ")[0]}</span>
            <span className="tag tag-admin" style={{ marginLeft: 4 }}>{profile.role}</span>
            <Icon name="chevron" size={11} style={{ marginLeft: 2, opacity: 0.7 }}/>
          </button>
          <Popover open={userMenuOpen} anchorRef={userMenuRef} onClose={() => setUserMenuOpen(false)} align="end">
            <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-subtle)", minWidth: 220 }}>
              <div style={{ fontWeight: 500, fontSize: 13 }}>{profile.full_name}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{profile.email}</div>
              <div style={{ marginTop: 6 }}>
                <span className="tag tag-admin">{profile.role}</span>
              </div>
            </div>
            <div style={{ padding: 4 }}>
              {(canDo("manage_users") || canDo("manage_permissions") || canDo("view_audit_log")) && (
                <div
                  className="popover-item"
                  onClick={() => {
                    setUserMenuOpen(false);
                    setView("admin");
                    setActiveCampaignId(null);
                  }}
                >
                  <Icon name="settings" size={13}/>
                  <span>Admin tools</span>
                  <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-4)" }}>users · audit</span>
                </div>
              )}
              {impersonatingFrom && (
                <div
                  className="popover-item"
                  style={{ color: "var(--money-spiff)" }}
                  onClick={stopImpersonate}
                >
                  <Icon name="refresh" size={13}/>
                  <span>Stop viewing as {profile.full_name.split(" ")[0]}</span>
                </div>
              )}
              <div
                className="popover-item"
                onClick={() => {
                  setTweak("theme", tweaks.theme === "dark" ? "light" : "dark");
                  setUserMenuOpen(false);
                }}
              >
                <Icon name={tweaks.theme === "dark" ? "sun" : "moon"} size={13}/>
                <span>{tweaks.theme === "dark" ? "Light theme" : "Dark theme"}</span>
              </div>
              <div style={{ height: 1, background: "var(--border-subtle)", margin: "4px 4px" }}/>
              <div
                className="popover-item"
                style={{ color: "var(--status-dnc-fg)" }}
                onClick={() => {
                  setUserMenuOpen(false);
                  pushAudit({ kind: "auth.signout", category: "auth", description: "Signed out" });
                  setSignedOut(true);
                }}
              >
                <Icon name="arrowLeft" size={13}/>
                <span>Sign out</span>
              </div>
            </div>
          </Popover>
        </div>
      </div>

      {impersonatingFrom && (
        <div className="imp-banner">
          <span className="dot"/>
          <span>
            Viewing as <strong style={{ color: "var(--text)" }}>{profile.full_name}</strong>
            <span style={{ color: "var(--text-3)" }}> ({profile.role}) — your actions and audit entries reflect their account.</span>
          </span>
          <button
            className="btn btn-sm"
            style={{ marginLeft: "auto" }}
            onClick={stopImpersonate}
          >
            <Icon name="refresh" size={11}/> Return to {impersonatingFrom.full_name.split(" ")[0]}
          </button>
        </div>
      )}

      {view === "admin" && (canDo("manage_users") || canDo("manage_permissions") || canDo("view_audit_log")) ? (
        <AdminTools
          users={users}
          campaigns={campaigns}
          auditLog={auditLog}
          profile={profile}
          rolePerms={rolePerms}
          userOverrides={userOverrides}
          onInviteUser={onInviteUser}
          onUpdateUser={onUpdateUserMut}
          onSuspendUser={onSuspendUser}
          onDeleteUser={onDeleteUser}
          onResendInvite={onResendInvite}
          onUpdateRolePerms={onUpdateRolePerms}
          onUpdateUserOverrides={onUpdateUserOverrides}
          onImpersonate={startImpersonate}
          onBack={() => setView("app")}
        />
      ) : activeCampaign ? (
        <CampaignShell
          campaign={activeCampaign}
          tab={tab}
          onTab={setTab}
          profile={profile}
          canDo={canDo}
          agents={agents}
          leads={leads}
          shiftLogs={shiftLogs}
          attendanceOverrides={attendanceOverrides}
          onAddLead={onAddLead}
          onUpdateLead={onUpdateLead}
          onDeleteLead={onDeleteLead}
          onAddAgent={onAddAgent}
          onUpdateAgent={onUpdateAgent}
          onUpdateCampaign={onUpdateCampaign}
          onLogShift={onLogShift}
          onSetAttendance={onSetAttendance}
          onInviteUser={onInviteUser}
          onDeleteCampaign={onDeleteCampaign}
        />
      ) : profile.role === "admin" || visibleCampaigns.length > 1 ? (
        <Directory
          campaigns={visibleCampaigns}
          agents={agents}
          leads={leads}
          profile={profile}
          canDo={canDo}
          onOpen={(id) => { setActiveCampaignId(id); setTab("overview"); }}
          onNewCampaign={() => setShowNewCampaign(true)}
        />
      ) : (
        <div className="empty" style={{ margin: 48 }}>
          <h3>No campaign assigned</h3>
          <p>Ask an admin to add you to a campaign.</p>
        </div>
      )}

      {showNewCampaign && (
        <NewCampaignModal onClose={() => setShowNewCampaign(false)} onSave={onNewCampaign}/>
      )}

      {/* Tweaks panel */}
      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection label="Appearance">
            <window.TweakRadio
              label="Theme"
              value={tweaks.theme}
              options={[{ value: "dark", label: "Dark" }, { value: "light", label: "Light" }]}
              onChange={(v) => setTweak("theme", v)}
            />
          </window.TweakSection>
          <window.TweakSection label="Demo">
            <div style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.55, padding: "0 14px 6px" }}>
              All interactions work on local state. Refresh to reset demo data.
            </div>
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);

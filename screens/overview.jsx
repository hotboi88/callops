// Overview — first tab of every campaign. Headline KPIs, week-over-week, top performers, activity.
const { useMemo: useMemoOV } = React;

function Overview({ campaign, agents, leads, shiftLogs, onJumpTab }) {
  const today = window.MOCK_DATA?.today;
  const todayDate = window.MOCK_TODAY;

  // This week & last week ranges (Mon-Sun)
  const tw = useMemoOV(() => {
    const s = U.startOfWeek(todayDate), e = U.endOfWeek(todayDate);
    return { start: U.dayStr(s), end: U.dayStr(e), label: "This week" };
  }, []);
  const lw = useMemoOV(() => {
    const d = new Date(todayDate); d.setDate(d.getDate() - 7);
    return { start: U.dayStr(U.startOfWeek(d)), end: U.dayStr(U.endOfWeek(d)), label: "Last week" };
  }, []);

  // Helpers
  const inRange = (l, r) => l.date >= r.start && l.date <= r.end;

  const camLeads = useMemoOV(() => leads.filter(l => l.campaign_id === campaign.id), [leads, campaign.id]);
  const camAgents = useMemoOV(() => agents.filter(a => a.campaign_id === campaign.id), [agents, campaign.id]);
  const activeAgents = camAgents.filter(a => a.status === "active");

  const twLeads = useMemoOV(() => camLeads.filter(l => inRange(l, tw)), [camLeads, tw]);
  const lwLeads = useMemoOV(() => camLeads.filter(l => inRange(l, lw)), [camLeads, lw]);
  const todayLeads = useMemoOV(() => camLeads.filter(l => l.date === today), [camLeads, today]);

  const sum = (arr, fn) => arr.reduce((s, x) => s + (fn(x) || 0), 0);
  const count = (arr, fn) => arr.filter(fn).length;

  const twBill = sum(twLeads, l => l.client_commission);
  const lwBill = sum(lwLeads, l => l.client_commission);
  const billDelta = lwBill > 0 ? (twBill - lwBill) / lwBill : 0;

  const twIA = count(twLeads, l => l.status === "ia");
  const lwIA = count(lwLeads, l => l.status === "ia");
  const iaDelta = lwIA > 0 ? (twIA - lwIA) / lwIA : 0;

  const twLeadCount = twLeads.length;
  const lwLeadCount = lwLeads.length;
  const leadDelta = lwLeadCount > 0 ? (twLeadCount - lwLeadCount) / lwLeadCount : 0;

  // Today snapshot
  const todayShift = useMemoOV(() => {
    return shiftLogs.find(s => s.campaign_id === campaign.id && s.date === today);
  }, [shiftLogs, campaign.id, today]);

  const todaySnapshot = useMemoOV(() => {
    return {
      onFloor: todayShift?.agents_on_floor ?? null,
      total: todayLeads.length,
      ia: count(todayLeads, l => l.status === "ia"),
      confirmed: count(todayLeads, l => l.status === "confirmed"),
      transfer: count(todayLeads, l => l.status === "transfer"),
      pending: count(todayLeads, l => l.status === "pending"),
      bill: sum(todayLeads, l => l.client_commission),
    };
  }, [todayLeads, todayShift]);

  // Top performers (this week, by IA + confirms)
  const topPerformers = useMemoOV(() => {
    const byAgent = {};
    twLeads.forEach(l => {
      const r = (byAgent[l.agent_id] ||= { agent_id: l.agent_id, ia: 0, confirmed: 0, transfer: 0, bill: 0 });
      r[l.status] = (r[l.status] || 0) + 1;
      r.bill += l.client_commission || 0;
    });
    return Object.values(byAgent)
      .map(r => ({ ...r, agent: agents.find(a => a.id === r.agent_id), score: r.ia + r.confirmed }))
      .filter(r => r.agent)
      .sort((a, b) => b.score - a.score || b.bill - a.bill)
      .slice(0, 5);
  }, [twLeads, agents]);

  // Recent activity (last 6 leads by date desc, seq desc)
  const recent = useMemoOV(() => {
    return [...camLeads]
      .sort((a, b) => b.date.localeCompare(a.date) || (b.seq ?? 0) - (a.seq ?? 0))
      .slice(0, 6);
  }, [camLeads]);

  // 14-day mini chart of total leads + IAs
  const last14 = useMemoOV(() => {
    const out = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(todayDate); d.setDate(d.getDate() - i);
      const ds = U.dayStr(d);
      const day = camLeads.filter(l => l.date === ds);
      out.push({
        date: ds,
        dow: U.dayOfWeek(ds),
        total: day.length,
        ia: day.filter(l => l.status === "ia").length,
        confirmed: day.filter(l => l.status === "confirmed").length,
      });
    }
    return out;
  }, [camLeads]);

  // Attention items
  const attentionItems = useMemoOV(() => {
    const items = [];
    // Agents with 5+ transfers and 0 conversions this week
    const byAgent = {};
    twLeads.forEach(l => {
      const r = (byAgent[l.agent_id] ||= { transfer: 0, ia: 0, confirmed: 0 });
      r[l.status] = (r[l.status] || 0) + 1;
    });
    Object.entries(byAgent).forEach(([agentId, r]) => {
      if (r.transfer >= 5 && (r.ia + r.confirmed) === 0) {
        const a = agents.find(x => x.id === agentId);
        if (a) items.push({
          kind: "warn",
          title: `${a.full_name} — ${r.transfer} transfers, 0 conversions this week`,
          action: "Open Agent Report",
          tab: "agent_report"
        });
      }
    });
    // No shift logged today
    if (todayShift == null && U.parseDate(today).getDay() >= 1 && U.parseDate(today).getDay() <= 5) {
      items.push({
        kind: "info",
        title: "No shift logged for today — track agents on floor for accurate lead-to-agent ratios",
        action: "Log shift",
        tab: "floor_report"
      });
    }
    // Pending leads to follow up on (older than 3 days)
    const old = U.dayStr(new Date(todayDate.getTime() - 3 * 86400000));
    const stale = camLeads.filter(l => l.status === "pending" && l.date < old).length;
    if (stale >= 5) {
      items.push({
        kind: "info",
        title: `${stale} pending leads are 3+ days old — consider closing or following up`,
        action: "Open Lead Log",
        tab: "lead_log"
      });
    }
    return items.slice(0, 4);
  }, [twLeads, camLeads, agents, todayShift]);

  // Max for mini chart bars
  const maxBar = Math.max(1, ...last14.map(d => d.total));

  return (
    <div className="tab-content">
      {/* Greeting + headline KPIs */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {U.dayOfWeekFull(today)} · {U.shortDate(today)}
        </div>
        <h1 style={{ margin: "6px 0 0", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>
          {campaign.name}
          <span style={{ color: "var(--text-3)", fontWeight: 400, marginLeft: 10, fontSize: 14 }}>
            {campaign.client}
          </span>
        </h1>
      </div>

      {/* Headline KPIs — this week */}
      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <Kpi
          tone="accent"
          label="Bill (this week)"
          value={U.fmtMoney(twBill)}
          sub={<DeltaSub current={twBill} prev={lwBill} delta={billDelta} format={U.fmtMoney}/>}
        />
        <Kpi
          label="Leads (this week)"
          value={U.fmtNum(twLeadCount, { dashZero: true })}
          sub={<DeltaSub current={twLeadCount} prev={lwLeadCount} delta={leadDelta} format={U.fmtNum}/>}
        />
        <Kpi
          tone="tl"
          label="IAs (this week)"
          value={U.fmtNum(twIA, { dashZero: true })}
          sub={<DeltaSub current={twIA} prev={lwIA} delta={iaDelta} format={U.fmtNum}/>}
        />
        <Kpi
          label="Active roster"
          value={U.fmtNum(activeAgents.length)}
          sub={`${activeAgents.filter(a => a.is_tl).length} team lead${activeAgents.filter(a => a.is_tl).length === 1 ? "" : "s"}`}
        />
      </div>

      {/* HERO: 14-day lead flow, full width */}
      <div className="card" style={{ padding: "16px 18px", marginBottom: 12 }}>
        <div className="spread" style={{ marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
            Lead flow
            <span style={{ marginLeft: 8, fontSize: 11, color: "var(--text-3)", fontWeight: 400 }}>· last 14 days</span>
          </h3>
          <div style={{ display: "flex", gap: 14, fontSize: 11, color: "var(--text-3)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: 2, background: "var(--bg-panel-2)", border: "1px solid var(--border)" }}/> Other
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: 2, background: "var(--status-ia-fg)" }}/> IAs
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: 2, background: "var(--money-pos)" }}/> Confirms
            </span>
          </div>
        </div>
        <LeadFlowChart last14={last14} maxBar={maxBar} today={today}/>
      </div>

      {/* 3-column row: Today · Recent activity · Top performers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12 }}>
        {/* Today */}
        <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column" }}>
          <div className="spread" style={{ marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
              Today
              <span style={{ marginLeft: 8, fontSize: 11, color: "var(--text-3)", fontWeight: 400 }}>
                · {U.dayOfWeekFull(today)}
              </span>
            </h3>
            <button className="btn btn-sm btn-ghost" onClick={() => onJumpTab("lead_log")}>
              <Icon name="chevronRight" size={11}/>
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 14 }}>
            <StatTile label="On Floor" value={todaySnapshot.onFloor ?? "—"} tone="text"/>
            <StatTile label="Total Leads" value={todaySnapshot.total} tone="text" bold/>
            <StatTile label="IAs" value={todaySnapshot.ia} tone="ia"/>
            <StatTile label="Confirms" value={todaySnapshot.confirmed} tone="pos"/>
          </div>
          {todaySnapshot.total > 0 ? (
            <div style={{ marginTop: "auto" }}>
              <StatusBar leads={todayLeads}/>
              <div className="help" style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border-subtle)" }}>
                Billing today <span className="mono money-pos" style={{ fontWeight: 600 }}>{U.fmtMoney(todaySnapshot.bill)}</span>
                {todaySnapshot.onFloor != null && (
                  <span>
                    {"  ·  "}lead : agent{" "}
                    <span className="mono" style={{ color: "var(--text)" }}>
                      {(todaySnapshot.total / todaySnapshot.onFloor).toFixed(2)}
                    </span>
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="help" style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid var(--border-subtle)" }}>No leads logged today yet.</div>
          )}
        </div>

        {/* Recent activity */}
        <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column" }}>
          <div className="spread" style={{ marginBottom: 8 }}>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Recent activity</h3>
            <button className="btn btn-sm btn-ghost" onClick={() => onJumpTab("lead_log")}>
              All <Icon name="chevronRight" size={11}/>
            </button>
          </div>
          {recent.length === 0 ? (
            <div className="help" style={{ padding: "10px 0" }}>No leads yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {recent.map((l, i) => {
                const a = agents.find(x => x.id === l.agent_id);
                return (
                  <div key={l.id} style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto",
                    gap: 8,
                    padding: "8px 0",
                    borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)",
                    alignItems: "center",
                    fontSize: 12,
                  }}>
                    <Pill status={l.status}/>
                    <div style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <strong style={{ fontWeight: 500 }}>{l.customer_name ? U.toProperCase(l.customer_name) : "—"}</strong>
                      <span style={{ color: "var(--text-3)" }}> · {a?.full_name || "—"}</span>
                    </div>
                    <span className="mono money-pos" style={{ fontSize: 11.5, minWidth: 36, textAlign: "right" }}>
                      {l.client_commission > 0 ? U.fmtMoney(l.client_commission) : <span className="muted-2">—</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top performers */}
        <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column" }}>
          <div className="spread" style={{ marginBottom: 8 }}>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
              Top performers
              <span style={{ marginLeft: 6, fontSize: 11, color: "var(--text-3)", fontWeight: 400 }}>· this week</span>
            </h3>
            <button className="btn btn-sm btn-ghost" onClick={() => onJumpTab("agent_report")}>
              Full <Icon name="chevronRight" size={11}/>
            </button>
          </div>
          {topPerformers.length === 0 ? (
            <div className="help" style={{ padding: "10px 0" }}>No conversions this week.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {topPerformers.map((r, idx) => (
                <div key={r.agent_id} style={{
                  display: "grid",
                  gridTemplateColumns: "16px 1fr auto auto auto",
                  gap: 10,
                  padding: "8px 0",
                  borderTop: idx === 0 ? "none" : "1px solid var(--border-subtle)",
                  alignItems: "center",
                  fontSize: 12,
                }}>
                  <span className="mono" style={{ color: "var(--text-4)", fontSize: 11 }}>{idx + 1}</span>
                  <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.agent.full_name}
                    {r.agent.is_tl && <TLBadge small/>}
                  </span>
                  <span className="mono" style={{ color: r.ia ? "var(--status-ia-fg)" : "var(--text-4)", fontSize: 11.5, minWidth: 24, textAlign: "right" }}>{r.ia || "—"}<span style={{ fontSize: 9, color: "var(--text-4)", marginLeft: 2 }}>i</span></span>
                  <span className="mono" style={{ color: r.confirmed ? "var(--money-pos)" : "var(--text-4)", fontSize: 11.5, minWidth: 24, textAlign: "right" }}>{r.confirmed || "—"}<span style={{ fontSize: 9, color: "var(--text-4)", marginLeft: 2 }}>c</span></span>
                  <span className="mono money-bold" style={{ minWidth: 40, textAlign: "right" }}>{U.fmtMoney(r.bill)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Attention items */}
      {attentionItems.length > 0 && (
        <div className="card" style={{ padding: 16 }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600 }}>Needs attention</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {attentionItems.map((it, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 0",
                borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)",
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: 999,
                  background: it.kind === "warn" ? "var(--status-dnc-fg)" : "var(--money-spiff)",
                }}/>
                <span style={{ fontSize: 12.5, color: "var(--text-2)", flex: 1 }}>{it.title}</span>
                <button className="btn btn-sm" onClick={() => onJumpTab(it.tab)}>
                  {it.action} <Icon name="chevronRight" size={11}/>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 14-day lead flow chart with custom (no-delay, styled, cursor-following) tooltip
function LeadFlowChart({ last14, maxBar, today }) {
  const [hover, setHover] = React.useState(null); // { idx, x, y } | null
  const wrapRef = React.useRef(null);

  const handleMove = (e) => {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const n = last14.length;
    // Bar zones are equal width across the grid. Use rect width to map x → idx.
    const idx = Math.min(n - 1, Math.max(0, Math.floor((x / r.width) * n)));
    setHover({ idx, x, y });
  };

  const handleLeave = () => setHover(null);

  return (
    <div
      ref={wrapRef}
      style={{ position: "relative" }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${last14.length}, 1fr)`, gap: 5, alignItems: "end", height: 200 }}>
        {last14.map((d, idx) => {
          const h = (d.total / maxBar) * 100;
          const isToday = d.date === today;
          const isHover = hover?.idx === idx;
          const cnfShare = d.total > 0 ? (d.confirmed / d.total) * 100 : 0;
          const iaShare = d.total > 0 ? (d.ia / d.total) * 100 : 0;
          return (
            <div
              key={d.date}
              style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: 6, height: "100%" }}
            >
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <div style={{
                  height: `${Math.max(h, d.total > 0 ? 4 : 0)}%`,
                  background: "var(--bg-panel-2)",
                  border: "1px solid " + (isToday ? "var(--accent-line)" : isHover ? "var(--border-strong)" : "var(--border-subtle)"),
                  borderRadius: 4,
                  position: "relative",
                  overflow: "hidden",
                  pointerEvents: "none",
                  filter: isHover ? "brightness(1.15)" : "none",
                }}>
                  {d.confirmed > 0 && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${cnfShare}%`, background: "var(--money-pos)", opacity: 0.9 }}/>}
                  {d.ia > 0 && <div style={{ position: "absolute", left: 0, right: 0, bottom: `${cnfShare}%`, height: `${iaShare}%`, background: "var(--status-ia-fg)", opacity: 0.9 }}/>}
                </div>
              </div>
              <div style={{ textAlign: "center", lineHeight: 1.1, pointerEvents: "none" }}>
                <div className="mono" style={{ fontSize: 11, color: isToday ? "var(--accent)" : isHover ? "var(--text)" : "var(--text-2)", fontWeight: isToday || isHover ? 600 : 400 }}>{U.parseDate(d.date).getDate()}</div>
                <div style={{ fontSize: 10, color: "var(--text-4)" }}>{d.dow.charAt(0)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cursor-following tooltip */}
      {hover !== null && (() => {
        const d = last14[hover.idx];
        const rect = wrapRef.current?.getBoundingClientRect();
        if (!rect) return null;
        const tipW = 180;
        // Default: tooltip to the right of cursor with offset
        let tx = hover.x + 16;
        if (tx + tipW > rect.width) tx = hover.x - tipW - 16;
        const ty = Math.max(0, hover.y - 60);
        return (
          <div style={{
            position: "absolute",
            left: tx,
            top: ty,
            background: "var(--bg-elev)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            boxShadow: "var(--shadow-pop)",
            padding: "10px 12px",
            zIndex: 5,
            width: tipW,
            pointerEvents: "none",
          }}>
            <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <span className="mono" style={{ color: "var(--text)", fontWeight: 500 }}>{U.dayOfWeek(d.date)}</span>
              <span className="mono" style={{ color: "var(--text-3)" }}>{U.shortDate(d.date)}</span>
              {d.date === today && <span className="tag" style={{ color: "var(--accent)", borderColor: "var(--accent-line)", background: "var(--accent-soft)", height: 16, padding: "0 5px", fontSize: 9 }}>today</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
              <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
                <span style={{ color: "var(--text-3)" }}>Total</span>
                <span className="mono money-bold">{d.total}</span>
              </div>
              <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-3)" }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: "var(--status-ia-fg)" }}/> IAs
                </span>
                <span className="mono" style={{ color: d.ia ? "var(--status-ia-fg)" : "var(--text-4)" }}>{d.ia || "—"}</span>
              </div>
              <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-3)" }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: "var(--money-pos)" }}/> Confirms
                </span>
                <span className="mono" style={{ color: d.confirmed ? "var(--money-pos)" : "var(--text-4)" }}>{d.confirmed || "—"}</span>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function StatTile({ label, value, tone, bold }) {  let color = "var(--text)";
  if (tone === "pos") color = "var(--money-pos)";
  else if (tone === "ia") color = "var(--status-ia-fg)";
  else if (tone === "spiff") color = "var(--money-spiff)";
  return (
    <div>
      <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{label}</div>
      <div className="mono" style={{ fontSize: 20, fontWeight: bold ? 600 : 500, letterSpacing: "-0.02em", color, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

function StatusBar({ leads }) {
  const counts = { transfer: 0, confirmed: 0, ia: 0, dnc: 0, pending: 0, bad: 0 };
  leads.forEach(l => { counts[l.status] = (counts[l.status] || 0) + 1; });
  const total = leads.length;
  const colors = {
    transfer: "var(--status-transfer-fg)",
    confirmed: "var(--money-pos)",
    ia: "var(--status-ia-fg)",
    pending: "var(--text-3)",
    dnc: "var(--status-dnc-fg)",
    bad: "var(--status-bad-fg)",
  };
  const order = ["ia", "confirmed", "transfer", "pending", "dnc", "bad"];
  return (
    <div>
      <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", background: "var(--bg-panel-2)" }}>
        {order.map(k => {
          const pct = (counts[k] / total) * 100;
          if (pct === 0) return null;
          return <div key={k} style={{ width: `${pct}%`, background: colors[k] }} title={`${U.STATUS_LABEL[k]}: ${counts[k]}`}/>;
        })}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 11, color: "var(--text-3)", flexWrap: "wrap" }}>
        {order.filter(k => counts[k] > 0).map(k => (
          <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, background: colors[k], borderRadius: 1 }}/>
            <span style={{ color: "var(--text-2)" }}>{U.STATUS_LABEL[k]}</span>
            <span className="mono" style={{ color: "var(--text-4)" }}>{counts[k]}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function DeltaSub({ current, prev, delta, format }) {
  if (prev === 0 && current === 0) return <span>—</span>;
  if (prev === 0) return <span style={{ color: "var(--text-3)" }}>new vs last week</span>;
  const up = delta >= 0;
  const color = up ? "var(--money-pos)" : "var(--status-dnc-fg)";
  return (
    <span>
      <span style={{ color }}>
        {up ? "▲" : "▼"} {Math.abs(Math.round(delta * 100))}%
      </span>
      <span style={{ color: "var(--text-4)" }}> vs {format(prev)} last week</span>
    </span>
  );
}

Object.assign(window, { Overview });

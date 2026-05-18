// Overview — first tab of every campaign. Headline KPIs, week-over-week, top performers, activity.
const { useMemo: useMemoOV } = React;

function Overview({ campaign, agents, leads, shiftLogs, attendanceOverrides, onJumpTab, onOpenAgent }) {
  const today = window.MOCK_DATA?.today;
  const todayDate = window.MOCK_TODAY;

  // This week & last week ranges (Mon-Sun)
  const tw = useMemoOV(() => {
    const s = U.startOfWeek(todayDate), e = U.endOfWeek(todayDate);
    return { start: U.dayStr(s), end: U.dayStr(e), label: "This week" };
  }, []);
  // Week-over-week deltas compare COMPLETED days only — never today (still in
  // progress) and never a partial week against a full one. elapsedDays counts
  // the finished days of the current week (0 on Monday → delta suppressed).
  const elapsedDays = (todayDate.getDay() + 6) % 7;
  const cmp = useMemoOV(() => {
    const wkStart = U.startOfWeek(todayDate);
    const curEnd = new Date(todayDate); curEnd.setDate(curEnd.getDate() - 1);
    const prevStart = new Date(wkStart); prevStart.setDate(prevStart.getDate() - 7);
    const prevEnd = new Date(prevStart); prevEnd.setDate(prevEnd.getDate() + elapsedDays - 1);
    const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return {
      hasData: elapsedDays > 0,
      curStart: U.dayStr(wkStart),
      curEnd: U.dayStr(curEnd),
      prevStart: U.dayStr(prevStart),
      prevEnd: U.dayStr(prevEnd),
      through: elapsedDays > 0 ? DOW[elapsedDays - 1] : "",
    };
  }, []);

  // Helpers
  const inRange = (l, r) => l.date >= r.start && l.date <= r.end;

  const camLeads = useMemoOV(() => leads.filter(l => l.campaign_id === campaign.id), [leads, campaign.id]);
  const camAgents = useMemoOV(() => agents.filter(a => a.campaign_id === campaign.id), [agents, campaign.id]);
  const activeAgents = camAgents.filter(a => a.status === "active");

  const twLeads = useMemoOV(() => camLeads.filter(l => inRange(l, tw)), [camLeads, tw]);
  // Completed-days lead sets the week-over-week deltas are measured on.
  const cmpCur = useMemoOV(() => cmp.hasData ? camLeads.filter(l => l.date >= cmp.curStart && l.date <= cmp.curEnd) : [], [camLeads, cmp]);
  const cmpPrev = useMemoOV(() => cmp.hasData ? camLeads.filter(l => l.date >= cmp.prevStart && l.date <= cmp.prevEnd) : [], [camLeads, cmp]);
  const todayLeads = useMemoOV(() => camLeads.filter(l => l.date === today), [camLeads, today]);

  const sum = (arr, fn) => arr.reduce((s, x) => s + (fn(x) || 0), 0);
  const count = (arr, fn) => arr.filter(fn).length;

  // Card values = live week-to-date (today included).
  const twBill = sum(twLeads, l => l.client_commission);
  const twIA = count(twLeads, l => l.status === "ia");
  const twLeadCount = twLeads.length;

  // Deltas = completed days this week vs the same completed days last week.
  const cmpCurBill = sum(cmpCur, l => l.client_commission);
  const cmpPrevBill = sum(cmpPrev, l => l.client_commission);
  const billDelta = cmpPrevBill > 0 ? (cmpCurBill - cmpPrevBill) / cmpPrevBill : 0;

  const cmpCurIA = count(cmpCur, l => l.status === "ia");
  const cmpPrevIA = count(cmpPrev, l => l.status === "ia");
  const iaDelta = cmpPrevIA > 0 ? (cmpCurIA - cmpPrevIA) / cmpPrevIA : 0;

  const cmpCurLeads = cmpCur.length;
  const cmpPrevLeads = cmpPrev.length;
  const leadDelta = cmpPrevLeads > 0 ? (cmpCurLeads - cmpPrevLeads) / cmpPrevLeads : 0;

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

  // Every week of the campaign — room-wide weekly lead-flow line chart.
  const roomWeeks = useMemoOV(() => {
    const dates = camLeads.map(l => l.date);
    const earliest = dates.length ? dates.reduce((a, b) => a < b ? a : b) : null;
    let startISO = campaign.created_at;
    if (!startISO || startISO === "0000-01-01") startISO = earliest || U.dayStr(todayDate);
    else if (earliest && earliest < startISO) startISO = earliest;
    const weeks = [];
    let cur = U.startOfWeek(U.parseDate(startISO));
    let guard = 0;
    while (cur <= todayDate && guard < 400) {
      const wkStart = U.dayStr(cur);
      const wkEndD = new Date(cur); wkEndD.setDate(wkEndD.getDate() + 6);
      weeks.push({ label: U.weekLabel(wkStart), start: wkStart, end: U.dayStr(wkEndD), transferred: 0, ia: 0, confirmed: 0 });
      cur = new Date(cur); cur.setDate(cur.getDate() + 7);
      guard++;
    }
    camLeads.forEach(l => {
      const w = weeks.find(x => l.date >= x.start && l.date <= x.end);
      if (!w) return;
      if (l.status !== "pending") w.transferred++;
      if (l.status === "ia") w.ia++;
      if (l.status === "confirmed") w.confirmed++;
    });
    return weeks;
  }, [camLeads, campaign.created_at]);

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
          sub={<DeltaSub delta={billDelta} prev={cmpPrevBill} format={U.fmtMoney} cmp={cmp}/>}
        />
        <Kpi
          label="Leads (this week)"
          value={U.fmtNum(twLeadCount, { dashZero: true })}
          sub={<DeltaSub delta={leadDelta} prev={cmpPrevLeads} format={U.fmtNum} cmp={cmp}/>}
        />
        <Kpi
          tone="tl"
          label="IAs (this week)"
          value={U.fmtNum(twIA, { dashZero: true })}
          sub={<DeltaSub delta={iaDelta} prev={cmpPrevIA} format={U.fmtNum} cmp={cmp}/>}
        />
        <Kpi
          label="Active roster"
          value={U.fmtNum(activeAgents.length)}
          sub={`${activeAgents.filter(a => a.is_tl).length} team lead${activeAgents.filter(a => a.is_tl).length === 1 ? "" : "s"}`}
        />
      </div>

      {/* Room-wide weekly lead flow */}
      <div className="card" style={{ padding: "16px 18px", marginBottom: 12 }}>
        <div className="spread" style={{ marginBottom: 4, gap: 12, flexWrap: "wrap" }}>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
            Lead flow
            <span style={{ marginLeft: 8, fontSize: 11, color: "var(--text-3)", fontWeight: 400 }}>· every week, whole room</span>
          </h3>
          <div style={{ display: "flex", gap: 14, fontSize: 11, color: "var(--text-3)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 16, height: 2, background: "var(--text-3)", borderRadius: 2 }}/> Transferred
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 16, height: 2, background: "var(--money-pos)", borderRadius: 2 }}/> Converted
            </span>
          </div>
        </div>
        <WeeklyTrendChart weeks={roomWeeks}/>
      </div>

      {/* Multi-week trend table */}
      <WeeklyStats campaign={campaign} leads={leads} shiftLogs={shiftLogs} agents={agents} attendanceOverrides={attendanceOverrides} className="" />
      <div style={{ height: 12 }}/>

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
                <div key={r.agent_id}
                  onClick={() => onOpenAgent && onOpenAgent(r.agent_id)}
                  title="Open agent report"
                  style={{
                  display: "grid",
                  gridTemplateColumns: "16px 1fr auto auto auto",
                  gap: 10,
                  padding: "8px 0",
                  borderTop: idx === 0 ? "none" : "1px solid var(--border-subtle)",
                  alignItems: "center",
                  fontSize: 12,
                  cursor: "pointer",
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

function DeltaSub({ delta, prev, format, cmp }) {
  if (!cmp.hasData) return <span style={{ color: "var(--text-3)" }}>Week in progress · day 1</span>;
  if (prev === 0) return <span style={{ color: "var(--text-3)" }}>nothing last wk thru {cmp.through}</span>;
  const up = delta >= 0;
  const color = up ? "var(--money-pos)" : "var(--status-dnc-fg)";
  return (
    <span>
      <span style={{ color }}>
        {up ? "▲" : "▼"} {Math.abs(Math.round(delta * 100))}%
      </span>
      <span style={{ color: "var(--text-4)" }}> vs {format(prev)} last wk thru {cmp.through}</span>
    </span>
  );
}

Object.assign(window, { Overview });

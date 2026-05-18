// Agent Detail — individual performance report for one agent.
// Drill-down rendered inside the Agent Report tab.
const { useState: useStateAD, useMemo: useMemoAD, useRef: useRefAD, useEffect: useEffectAD } = React;

// "vs floor average" sub-line for a KPI card. Higher is always better here.
function BenchSub({ value, avg, fmt, showRel }) {
  if (avg == null || !isFinite(avg)) return <span style={{ color: "var(--text-3)" }}>—</span>;
  const up = value >= avg;
  const color = up ? "var(--money-pos)" : "var(--status-dnc-fg)";
  const rel = (showRel && avg > 0) ? Math.round(Math.abs(value - avg) / avg * 100) : null;
  return (
    <span>
      <span style={{ color }}>{up ? "▲" : "▼"}{rel != null ? " " + rel + "%" : ""}</span>
      <span style={{ color: "var(--text-4)" }}> · floor avg {fmt(avg)}</span>
    </span>
  );
}

function AgentDetail({ campaign, agent, agents, leads, attendanceOverrides, onBack }) {
  const AD_PRESETS = [
    { key: "7d", label: "7d", days: 7 },
    { key: "30d", label: "30d", days: 30 },
    { key: "90d", label: "90d", days: 90 },
    { key: "all", label: "All", days: null },
  ];
  const [dayKey, setDayKey] = useStateAD("30d");
  const [dayOffset, setDayOffset] = useStateAD(0);
  const [customRange, setCustomRange] = useStateAD(null);
  const [pickerOpen, setPickerOpen] = useStateAD(false);
  const pickerBtnRef = useRefAD(null);
  const preset = AD_PRESETS.find(p => p.key === dayKey) || AD_PRESETS[1];
  const presetRange = useMemoAD(() => window.dayRange(preset.days, dayOffset), [preset.days, dayOffset]);
  const range = customRange
    ? { startISO: customRange.startISO, endISO: customRange.endISO, label: `${U.shortDate(customRange.startISO)} – ${U.shortDate(customRange.endISO)}` }
    : presetRange;
  useEffectAD(() => { if (preset.days == null && dayOffset !== 0) setDayOffset(0); }, [preset.days]);

  const inRange = (d) => d >= range.startISO && d <= range.endISO;
  const todayISO = U.dayStr(window.MOCK_TODAY);

  const EMPTY = { total: 0, pending: 0, transfer: 0, confirmed: 0, ia: 0, dnc: 0, bad: 0, client: 0, spiff: 0, tl: 0 };
  const derive = (s) => {
    const base = s || EMPTY;
    const transferred = base.total - base.pending;
    const converted = base.ia + base.confirmed;
    return {
      ...base, transferred, converted,
      conv: transferred > 0 ? converted / transferred : 0,
      earnings: base.client + base.spiff + base.tl,
    };
  };

  // Per-agent aggregates for the whole campaign over the selected range.
  const periodStats = useMemoAD(() => {
    const m = {};
    const ensure = (id) => (m[id] ||= { total: 0, pending: 0, transfer: 0, confirmed: 0, ia: 0, dnc: 0, bad: 0, client: 0, spiff: 0, tl: 0 });
    leads.forEach(l => {
      if (l.campaign_id !== campaign.id) return;
      if (!inRange(l.date)) return;
      const r = ensure(l.agent_id);
      r.total++;
      if (r[l.status] != null) r[l.status]++;
      r.client += l.client_commission || 0;
      r.spiff += l.spiff || 0;
      if (l.tl_bonus > 0 && l.tl_recipient_id) ensure(l.tl_recipient_id).tl += l.tl_bonus;
    });
    return m;
  }, [leads, campaign.id, range]);

  const me = derive(periodStats[agent.id]);

  const activeAgents = useMemoAD(
    () => agents.filter(a => a.campaign_id === campaign.id && a.status === "active"),
    [agents, campaign.id]
  );

  // Floor average across the active roster.
  const floor = useMemoAD(() => {
    const rows = activeAgents.map(a => derive(periodStats[a.id]));
    const n = rows.length || 1;
    const avg = (fn) => rows.reduce((s, r) => s + fn(r), 0) / n;
    return {
      total: avg(r => r.total),
      transferred: avg(r => r.transferred),
      ia: avg(r => r.ia),
      confirmed: avg(r => r.confirmed),
      conv: avg(r => r.conv),
      earnings: avg(r => r.earnings),
      count: rows.length,
    };
  }, [activeAgents, periodStats]);

  // Standing among the active roster.
  const ranking = useMemoAD(() => {
    const rows = activeAgents.map(a => ({ id: a.id, ...derive(periodStats[a.id]) }));
    const byConv = [...rows].sort((a, b) => b.converted - a.converted || b.transferred - a.transferred);
    const byRate = [...rows].sort((a, b) => b.conv - a.conv || b.converted - a.converted);
    return {
      n: rows.length,
      convRank: byConv.findIndex(r => r.id === agent.id) + 1,
      rateRank: byRate.findIndex(r => r.id === agent.id) + 1,
    };
  }, [activeAgents, periodStats, agent.id]);

  const agentLeads = useMemoAD(
    () => leads.filter(l => l.campaign_id === campaign.id && l.agent_id === agent.id && inRange(l.date)),
    [leads, campaign.id, agent.id, range]
  );

  // Ground-truth attendance from the daily reports.
  const attData = useMemoAD(() => {
    const present = {};
    const reportDays = new Set();
    ((window.MOCK_DATA && window.MOCK_DATA.attendance) || []).forEach(r => {
      if (r.campaign_id !== campaign.id) return;
      present[r.agent_id + "|" + r.date] = true;
      reportDays.add(r.date);
    });
    return { present, reportDays };
  }, [campaign.id]);

  const attendance = useMemoAD(() => {
    const days = [...attData.reportDays].filter(d => inRange(d)).sort();
    let present = 0, absent = 0, off = 0;
    const cells = days.map(d => {
      const key = agent.id + "|" + d;
      const ov = attendanceOverrides && attendanceOverrides[key];
      let st;
      if (ov) st = ov;
      else if (agent.date_added && d < agent.date_added) st = "off";
      else if (agent.date_removed && d > agent.date_removed) st = "off";
      else st = attData.present[key] ? "present" : "absent";
      if (st === "present") present++;
      else if (st === "absent") absent++;
      else off++;
      return { date: d, status: st };
    });
    return { cells, present, absent, off, pct: (present + absent) > 0 ? present / (present + absent) : 0 };
  }, [attData, agent, attendanceOverrides, range]);

  // Prior period (same length, immediately before) — for the conversion-drop flag.
  const prior = useMemoAD(() => {
    if (preset.days == null && !customRange) return null; // All-time has no "prior".
    const sD = U.parseDate(range.startISO), eD = U.parseDate(range.endISO);
    if (!sD || !eD) return null;
    const len = Math.round((eD - sD) / 86400000) + 1;
    const pe = new Date(sD); pe.setDate(pe.getDate() - 1);
    const ps = new Date(pe); ps.setDate(ps.getDate() - len + 1);
    const pStart = U.dayStr(ps), pEnd = U.dayStr(pe);
    let total = 0, pending = 0, ia = 0, confirmed = 0;
    leads.forEach(l => {
      if (l.campaign_id !== campaign.id || l.agent_id !== agent.id) return;
      if (l.date < pStart || l.date > pEnd) return;
      total++;
      if (l.status === "pending") pending++;
      if (l.status === "ia") ia++;
      if (l.status === "confirmed") confirmed++;
    });
    const transferred = total - pending;
    return { transferred, conv: transferred > 0 ? (ia + confirmed) / transferred : 0 };
  }, [leads, campaign.id, agent.id, range, preset.days, customRange]);

  // Weekly trend — continuous Mon-start weeks, clamped to tenure, last 14 shown.
  const trend = useMemoAD(() => {
    let startISO = range.startISO;
    if (agent.date_added && agent.date_added > startISO) startISO = agent.date_added;
    if (startISO === "0000-01-01") {
      const dates = agentLeads.map(l => l.date);
      startISO = dates.length ? dates.reduce((a, b) => a < b ? a : b) : todayISO;
    }
    let endISO = range.endISO;
    if (endISO > todayISO) endISO = todayISO;
    if (agent.date_removed && agent.date_removed < endISO) endISO = agent.date_removed;
    const endD = U.parseDate(endISO);
    const weeks = [];
    let cur = U.startOfWeek(U.parseDate(startISO));
    let guard = 0;
    while (cur <= endD && guard < 260) {
      const wkStart = U.dayStr(cur);
      const wkEndD = new Date(cur); wkEndD.setDate(wkEndD.getDate() + 6);
      weeks.push({ label: U.weekLabel(wkStart), start: wkStart, end: U.dayStr(wkEndD), transferred: 0, ia: 0, confirmed: 0 });
      cur = new Date(cur); cur.setDate(cur.getDate() + 7);
      guard++;
    }
    agentLeads.forEach(l => {
      const w = weeks.find(x => l.date >= x.start && l.date <= x.end);
      if (!w) return;
      if (l.status !== "pending") w.transferred++;
      if (l.status === "ia") w.ia++;
      if (l.status === "confirmed") w.confirmed++;
    });
    return weeks.slice(-14);
  }, [agentLeads, range, agent, todayISO]);
  const maxBar = Math.max(1, ...trend.map(w => w.transferred));

  const flags = useMemoAD(() => {
    const out = [];
    if (me.transferred >= 5 && me.converted === 0)
      out.push({ kind: "warn", text: `${me.transferred} transferred, 0 conversions this period` });
    if (prior && prior.transferred >= 3 && prior.conv > 0 && me.transferred >= 3 && me.conv < prior.conv * 0.7)
      out.push({ kind: "warn", text: `Conversion down — ${U.fmtPct(prior.conv)} → ${U.fmtPct(me.conv)} vs prior period` });
    if (attendance.absent >= 3)
      out.push({ kind: "warn", text: `${attendance.absent} absence${attendance.absent === 1 ? "" : "s"} in this period` });
    if ((attendance.present + attendance.absent) >= 5 && attendance.pct < 0.7)
      out.push({ kind: "warn", text: `Attendance ${U.fmtPct(attendance.pct)} — below 70%` });
    if (agent.status === "active" && ranking.n >= 4 && ranking.convRank >= 1 && ranking.convRank <= 3 && me.converted > 0)
      out.push({ kind: "good", text: `Top ${ranking.convRank} on the floor by conversions` });
    return out;
  }, [me, prior, attendance, ranking, agent.status]);

  const recent = useMemoAD(
    () => [...agentLeads].sort((a, b) => b.date.localeCompare(a.date) || (b.seq ?? 0) - (a.seq ?? 0)).slice(0, 60),
    [agentLeads]
  );

  const tenure = (() => {
    if (!agent.date_added) return campaign.name;
    if (agent.date_removed) return `Hired ${U.shortDate(agent.date_added)} · Terminated ${U.shortDate(agent.date_removed)}`;
    const days = Math.max(0, Math.round((U.parseDate(todayISO) - U.parseDate(agent.date_added)) / 86400000));
    return `Hired ${U.shortDate(agent.date_added)} · ${days} day${days === 1 ? "" : "s"} on campaign`;
  })();

  const daysOnFloor = attendance.present;
  const leadsPerDay = daysOnFloor > 0 ? me.total / daysOnFloor : null;
  const convPerDay = daysOnFloor > 0 ? me.converted / daysOnFloor : null;

  return (
    <div className="tab-content">
      {/* Header — back + identity + range control */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
        <div>
          <button className="btn btn-sm btn-ghost" onClick={onBack} style={{ marginBottom: 8, paddingLeft: 4 }}>
            <Icon name="arrowLeft" size={12}/> Agent Report
          </button>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: 4 }}>
            {agent.full_name}
            {agent.is_tl && <TLBadge/>}
            <span
              className={"tag" + (agent.status === "active" ? "" : " tag-inactive")}
              style={agent.status === "active"
                ? { marginLeft: 8, color: "var(--money-pos)", borderColor: "var(--accent-line)", background: "var(--accent-soft)" }
                : { marginLeft: 8 }}
            >
              {agent.status === "active" ? "Active" : "Inactive"}
            </span>
          </h1>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>{tenure}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {customRange ? (
            <>
              <button ref={pickerBtnRef} className="chip active" style={{ display: "inline-flex", alignItems: "center", gap: 6 }} onClick={() => setPickerOpen(o => !o)} title="Click to change dates">
                <Icon name="calendar" size={11}/>
                {U.shortDate(customRange.startISO)} – {U.shortDate(customRange.endISO)}
              </button>
              <button className="icon-btn" title="Clear custom range" onClick={() => setCustomRange(null)}>
                <Icon name="x" size={12}/>
              </button>
            </>
          ) : (
            <>
              <RangeNav
                options={AD_PRESETS}
                value={dayKey}
                onChange={(k) => { setDayKey(k); setDayOffset(0); }}
                rangeLabel={range.label}
                canBack={preset.days != null}
                canForward={preset.days != null && dayOffset > 0}
                onBack={() => setDayOffset(o => o + 1)}
                onForward={() => setDayOffset(o => Math.max(0, o - 1))}
                onReset={() => setDayOffset(0)}
                canReset={dayOffset !== 0}
              />
              <button ref={pickerBtnRef} className="chip" style={{ display: "inline-flex", alignItems: "center", gap: 5 }} onClick={() => setPickerOpen(o => !o)}>
                <Icon name="calendar" size={11}/> Pick dates…
              </button>
            </>
          )}
          <DateRangePicker
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            anchorRef={pickerBtnRef}
            value={customRange || (preset.days != null ? presetRange : null)}
            onChange={(r) => { setCustomRange(r); setDayOffset(0); }}
          />
        </div>
      </div>

      {/* KPI cards — value + vs floor average */}
      <div className="kpi-grid" style={{ marginBottom: 12 }}>
        <Kpi label="Leads" value={U.fmtNum(me.total, { dashZero: true })}
          sub={<BenchSub value={me.total} avg={floor.total} fmt={v => v.toFixed(1)} showRel/>}/>
        <Kpi label="Transferred" value={U.fmtNum(me.transferred, { dashZero: true })}
          sub={<BenchSub value={me.transferred} avg={floor.transferred} fmt={v => v.toFixed(1)} showRel/>}/>
        <Kpi tone="tl" label="IAs" value={U.fmtNum(me.ia, { dashZero: true })}
          sub={<BenchSub value={me.ia} avg={floor.ia} fmt={v => v.toFixed(1)} showRel/>}/>
        <Kpi label="Confirms" value={U.fmtNum(me.confirmed, { dashZero: true })}
          sub={<BenchSub value={me.confirmed} avg={floor.confirmed} fmt={v => v.toFixed(1)} showRel/>}/>
        <Kpi label="Conversion" value={U.fmtPct(me.conv)}
          sub={<BenchSub value={me.conv} avg={floor.conv} fmt={U.fmtPct}/>}/>
        <Kpi tone="accent" label="Earnings" value={U.fmtMoney(me.earnings)}
          sub={<BenchSub value={me.earnings} avg={floor.earnings} fmt={U.fmtMoney} showRel/>}/>
      </div>

      {/* Trend + outcome mix */}
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 12, marginBottom: 12 }}>
        <div className="card" style={{ padding: "16px 18px" }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600 }}>
            Performance trend
            <span style={{ marginLeft: 8, fontSize: 11, color: "var(--text-3)", fontWeight: 400 }}>· transferred per week, shaded by conversions</span>
          </h3>
          {trend.length === 0 ? (
            <div className="help" style={{ padding: "24px 0" }}>No weeks in this range.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${trend.length}, 1fr)`, gap: 5, alignItems: "end", height: 168, marginTop: 12 }}>
              {trend.map(w => {
                const h = (w.transferred / maxBar) * 100;
                const cnfShare = w.transferred > 0 ? (w.confirmed / w.transferred) * 100 : 0;
                const iaShare = w.transferred > 0 ? (w.ia / w.transferred) * 100 : 0;
                const converted = w.ia + w.confirmed;
                return (
                  <div key={w.start} style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: 5, height: "100%" }}>
                    <div style={{ textAlign: "center", fontSize: 10.5, color: converted ? "var(--text)" : "var(--text-4)", fontFamily: "Geist Mono, monospace" }}>{converted || ""}</div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                      <div
                        title={`${w.label} · ${w.transferred} transferred · ${w.ia} IA · ${w.confirmed} confirmed`}
                        style={{
                          height: `${Math.max(h, w.transferred > 0 ? 4 : 0)}%`,
                          background: "var(--bg-panel-2)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: 4, position: "relative", overflow: "hidden",
                        }}>
                        {w.confirmed > 0 && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${cnfShare}%`, background: "var(--money-pos)", opacity: 0.9 }}/>}
                        {w.ia > 0 && <div style={{ position: "absolute", left: 0, right: 0, bottom: `${cnfShare}%`, height: `${iaShare}%`, background: "var(--status-ia-fg)", opacity: 0.9 }}/>}
                      </div>
                    </div>
                    <div style={{ textAlign: "center", fontSize: 9.5, color: "var(--text-4)", fontFamily: "Geist Mono, monospace" }}>{w.label}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600 }}>Outcome mix</h3>
          {agentLeads.length === 0 ? (
            <div className="help" style={{ padding: "10px 0" }}>No leads in this range.</div>
          ) : (
            <StatusBar leads={agentLeads}/>
          )}
          <div style={{ marginTop: "auto", paddingTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Leads / day on floor</div>
              <div className="mono" style={{ fontSize: 18, fontWeight: 600 }}>{leadsPerDay != null ? leadsPerDay.toFixed(1) : "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Conversions / day</div>
              <div className="mono" style={{ fontSize: 18, fontWeight: 600 }}>{convPerDay != null ? convPerDay.toFixed(2) : "—"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance */}
      <div className="card" style={{ padding: 16, marginBottom: 12 }}>
        <div className="spread" style={{ marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
            Attendance
            <span style={{ marginLeft: 8, fontSize: 11, color: "var(--text-3)", fontWeight: 400 }}>
              · present {attendance.present} / absent {attendance.absent} / off {attendance.off}
            </span>
          </h3>
          <span className="mono" style={{ fontSize: 16, fontWeight: 600, color: attendance.pct >= 0.85 ? "var(--money-pos)" : attendance.pct >= 0.7 ? "var(--money-spiff)" : attendance.present + attendance.absent > 0 ? "var(--status-dnc-fg)" : "var(--text-3)" }}>
            {attendance.present + attendance.absent > 0 ? U.fmtPct(attendance.pct) : "—"}
          </span>
        </div>
        {attendance.cells.length === 0 ? (
          <div className="help">No working days reported in this range.</div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {attendance.cells.map(c => (
              <div
                key={c.date}
                title={`${U.dayOfWeek(c.date)} ${U.shortDate(c.date)} — ${c.status}`}
                style={{
                  width: 16, height: 16, borderRadius: 3,
                  background: c.status === "present" ? "var(--money-pos)" : c.status === "absent" ? "var(--status-dnc-fg)" : "var(--bg-panel-2)",
                  border: "1px solid " + (c.status === "off" ? "var(--border-subtle)" : "transparent"),
                  opacity: c.status === "off" ? 0.6 : 0.9,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Standing */}
      <div className="card" style={{ padding: 16, marginBottom: 12 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600 }}>Standing on the floor</h3>
        {agent.status !== "active" ? (
          <div className="help">Not ranked — agent is inactive.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            {[
              { label: "By conversions (IA + Confirmed)", rank: ranking.convRank },
              { label: "By conversion rate", rank: ranking.rateRank },
            ].map((row, i) => {
              const pct = ranking.n > 0 && row.rank > 0 ? (ranking.n - row.rank + 1) / ranking.n : 0;
              return (
                <div key={i}>
                  <div className="spread" style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 11.5, color: "var(--text-3)" }}>{row.label}</span>
                    <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>
                      {row.rank > 0 ? `#${row.rank}` : "—"}
                      <span style={{ color: "var(--text-4)", fontWeight: 400 }}> of {ranking.n}</span>
                    </span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: "var(--bg-panel-2)", overflow: "hidden" }}>
                    <div style={{ width: `${Math.round(pct * 100)}%`, height: "100%", background: pct >= 0.66 ? "var(--money-pos)" : pct >= 0.33 ? "var(--money-spiff)" : "var(--status-dnc-fg)" }}/>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Coaching flags */}
      {flags.length > 0 && (
        <div className="card" style={{ padding: 16, marginBottom: 12 }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600 }}>Coaching flags</h3>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {flags.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)" }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: f.kind === "warn" ? "var(--status-dnc-fg)" : "var(--money-pos)", flexShrink: 0 }}/>
                <span style={{ fontSize: 12.5, color: "var(--text-2)" }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent leads */}
      <div className="section-head" style={{ paddingTop: 6 }}>
        <h2>Leads</h2>
        <span className="sub">{agentLeads.length} in range{recent.length < agentLeads.length ? ` · showing latest ${recent.length}` : ""}</span>
      </div>
      {recent.length === 0 ? (
        <div className="empty"><h3>No leads in this range</h3><p>Pick a wider window to see this agent's calls.</p></div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 90 }}>Date</th>
                <th style={{ width: 50 }}>Day</th>
                <th>Customer</th>
                <th style={{ width: 120 }}>Status</th>
                <th style={{ width: 100 }}>Appt date</th>
                <th className="num" style={{ width: 90 }}>Client $</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(l => (
                <tr key={l.id}>
                  <td className="num-l">{U.shortDate(l.date)}</td>
                  <td className="muted-2" style={{ fontSize: 11 }}>{U.dayOfWeek(l.date)}</td>
                  <td>{l.customer_name ? U.toProperCase(l.customer_name) : "—"}</td>
                  <td><Pill status={l.status}/></td>
                  <td className="num-l muted-2" style={{ fontSize: 11.5 }}>{l.appointment_date ? U.shortDate(l.appointment_date) : "—"}</td>
                  <td className="num"><Money v={l.client_commission} tone="pos"/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { AgentDetail });

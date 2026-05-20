// Agent Report — weekly per-agent breakdown
const { useState: useStateAR, useMemo: useMemoAR, useEffect: useEffectAR, useRef: useRefAR } = React;

function AgentReport({ campaign, agents, leads, onOpenAgent }) {

  const AR_PRESETS = [
    { key: "7d", label: "7d", days: 7 },
    { key: "30d", label: "30d", days: 30 },
    { key: "90d", label: "90d", days: 90 },
    { key: "all", label: "All", days: null },
  ];
  const [dayKey, setDayKey] = useStateAR("30d");
  const [dayOffset, setDayOffset] = useStateAR(0);
  const [customRange, setCustomRange] = useStateAR(null);
  const [pickerOpen, setPickerOpen] = useStateAR(false);
  const pickerBtnRef = useRefAR(null);
  const preset = AR_PRESETS.find(p => p.key === dayKey) || AR_PRESETS[1];
  const presetRange = useMemoAR(() => window.dayRange(preset.days, dayOffset), [preset.days, dayOffset]);
  const range = customRange
    ? { startISO: customRange.startISO, endISO: customRange.endISO, label: `${U.shortDate(customRange.startISO)} – ${U.shortDate(customRange.endISO)}` }
    : presetRange;

  // No cap — page freely backward into the past
  useEffectAR(() => {
    if (preset.days == null && dayOffset !== 0) setDayOffset(0);
  }, [preset.days]);

  const inRange = (d) => (preset.days == null && !customRange) || (d >= range.startISO && d <= range.endISO);

  // Per-agent summary
  const rows = useMemoAR(() => {
    const map = {};
    leads.forEach(l => {
      if (l.campaign_id !== campaign.id) return;
      if (!inRange(l.date)) return;
      const r = (map[l.agent_id] ||= { agent_id: l.agent_id, total: 0, pending: 0, transfer: 0, confirmed: 0, ia: 0, dnc: 0, bad: 0 });
      r.total++; r[l.status]++;
    });
    const list = agents
      .filter(a => a.campaign_id === campaign.id && a.status === "active")
      .map(a => {
        const r = map[a.id] || { total: 0, pending: 0, transfer: 0, confirmed: 0, ia: 0, dnc: 0, bad: 0 };
        // "Transferred" = every lead that left pending (transfer/ia/confirmed/dnc/bad).
        // Conversion is measured against what was transferred, not total leads.
        const transferred = r.total - r.pending;
        const conv = transferred > 0 ? (r.ia + r.confirmed) / transferred : 0;
        return { ...a, ...r, transferred, conv };
      });
    list.sort((a, b) => {
      const ca = a.ia + a.confirmed, cb = b.ia + b.confirmed;
      if (ca !== cb) return cb - ca;
      // Tiebreaker: higher conversion *rate* climbs higher when converted counts tie.
      return b.conv - a.conv;
    });
    return list;
  }, [agents, leads, campaign.id, range, preset.days, customRange]);

  // Weekly grid owns its own range — see <WeeklyGrid> below.

  return (
    <div className="tab-content">
      <div className="toolbar">
        <div>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Agent Performance</h2>
          <div className="help" style={{ marginTop: 2 }}>
            Sorted by IAs + Confirms, with conversion rate as the tiebreaker. Agents with 5+ transferred and 0 conversions flagged.
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {customRange ? (
            <>
              <button
                ref={pickerBtnRef}
                className="chip active"
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                onClick={() => setPickerOpen(o => !o)}
                title="Click to change dates"
              >
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
                options={AR_PRESETS}
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
              <button
                ref={pickerBtnRef}
                className="chip"
                style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
                onClick={() => setPickerOpen(o => !o)}
              >
                <Icon name="calendar" size={11}/>
                Pick dates…
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

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 280 }}>Agent</th>
              <th className="num" style={{ width: 80 }}>Total Leads</th>
              <th className="num" style={{ width: 80 }}>Pending</th>
              <th className="num" style={{ width: 95 }}>Transferred</th>
              <th className="num" style={{ width: 70 }}>IAs</th>
              <th className="num" style={{ width: 80 }}>Confirms</th>
              <th className="num" style={{ width: 90 }}>Converted</th>
              <th className="num" style={{ width: 70 }}>DNC</th>
              <th className="num" style={{ width: 80 }}>Conv%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(a => {
              const warn = a.transferred >= 5 && (a.ia + a.confirmed) === 0;
              return (
                <tr
                  key={a.id}
                  className={(warn ? "row-warn " : "") + "clickable"}
                  onClick={() => onOpenAgent && onOpenAgent(a.id)}
                  title="Open agent report"
                >
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 20 }}>
                      <span>{a.full_name}</span>
                      {a.is_tl && <TLBadge small/>}
                      {warn && (
                        <span className="tag" style={{ color: "var(--status-dnc-fg)", borderColor: "var(--status-dnc-ring)", background: "var(--status-dnc-bg)" }}>
                          Needs attention
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="num"><span className="money money-bold">{a.total || "—"}</span></td>
                  <td className="num"><span className={a.pending ? "money" : "money money-muted"}>{a.pending || "—"}</span></td>
                  <td className="num"><span className={a.transferred ? "money" : "money money-muted"} style={a.transferred ? { color: "var(--status-transfer-fg)" } : {}}>{a.transferred || "—"}</span></td>
                  <td className="num"><span className={a.ia ? "money money-tl" : "money money-muted"}>{a.ia || "—"}</span></td>
                  <td className="num"><span className={a.confirmed ? "money money-pos" : "money money-muted"}>{a.confirmed || "—"}</span></td>
                  <td className="num"><span className={(a.ia + a.confirmed) > 0 ? "money money-bold" : "money money-muted"}>{(a.ia + a.confirmed) || "—"}</span></td>
                  <td className="num"><span className={a.dnc > 0 ? "money" : "money money-muted"} style={a.dnc > 0 ? { color: "var(--status-dnc-fg)" } : {}}>{a.dnc || "—"}</span></td>
                  <td className="num">
                    <span className="money" style={{ color: a.conv >= 0.5 ? "var(--money-pos)" : a.conv > 0 ? "var(--text)" : "var(--text-4)" }}>
                      {a.transferred === 0 ? "—" : Math.round(a.conv * 100) + "%"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Weekly grid — owns its own time range; agent order mirrors the table above */}
      <WeeklyGrid
        campaign={campaign}
        leads={leads}
        agents={agents}
        order={rows.map(r => r.id)}
      />
    </div>
  );
}

// Weekly grid — self-contained: owns its own time range, calendar picker,
// presets, and pagination through the resulting weeks.
function WeeklyGrid({ campaign, leads, agents, order }) {
  const WG_PRESETS = [
    { key: "30d", label: "30d", days: 30 },
    { key: "90d", label: "90d", days: 90 },
    { key: "6m", label: "6mo", days: 180 },
    { key: "all", label: "All", days: null },
  ];
  const [wgKey, setWgKey] = useStateAR("90d");
  const [wgOffset, setWgOffset] = useStateAR(0);
  const [wgCustom, setWgCustom] = useStateAR(null);
  const [wgPickerOpen, setWgPickerOpen] = useStateAR(false);
  const wgPickerRef = useRefAR(null);
  const wgPreset = WG_PRESETS.find(p => p.key === wgKey) || WG_PRESETS[1];
  const wgPresetRange = useMemoAR(() => window.dayRange(wgPreset.days, wgOffset), [wgPreset.days, wgOffset]);
  const wgRange = wgCustom
    ? { startISO: wgCustom.startISO, endISO: wgCustom.endISO, label: `${U.shortDate(wgCustom.startISO)} – ${U.shortDate(wgCustom.endISO)}` }
    : wgPresetRange;

  useEffectAR(() => {
    if (wgPreset.days == null && wgOffset !== 0) setWgOffset(0);
  }, [wgPreset.days]);

  const wgInRange = (d) => (wgPreset.days == null && !wgCustom) || (d >= wgRange.startISO && d <= wgRange.endISO);

  const { weeks, grid, gridAgents } = useMemoAR(() => {
    // Track weeks by their Monday date (ISO string) — year-aware and sortable,
    // unlike a bare "WKnn" label which collides and mis-sorts across years.
    const weekMap = new Map();
    const seenAgents = new Set();
    const conv = {};
    const g = {};
    leads.forEach(l => {
      if (l.campaign_id !== campaign.id) return;
      if (!wgInRange(l.date)) return;
      const d = U.parseDate(l.date);
      if (!d) return;
      const monday = U.startOfWeek(d);
      const w = U.dayStr(monday);
      if (!weekMap.has(w)) {
        const sun = new Date(monday);
        sun.setDate(sun.getDate() + 6);
        weekMap.set(w, { key: w, label: U.weekLabel(l.date), start: w, end: U.dayStr(sun) });
      }
      seenAgents.add(l.agent_id);
      const k = l.agent_id + "|" + w;
      const c = (g[k] ||= { t: 0, i: 0, c: 0 });
      // t = Transferred (every non-pending lead); i and c are subsets of it.
      if (l.status !== "pending") c.t++;
      if (l.status === "ia") c.i++;
      if (l.status === "confirmed") c.c++;
      if (l.status === "ia" || l.status === "confirmed") conv[l.agent_id] = (conv[l.agent_id] || 0) + 1;
    });
    const weeksOut = Array.from(weekMap.values()).sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
    // Mirror the Agent Performance table's exact order (conversion supremacy).
    // Falls back to in-grid IAs+Confirms if no order was supplied.
    const orderIdx = {};
    (order || []).forEach((id, i) => { orderIdx[id] = i; });
    const gridAgents = agents
      .filter(a => a.campaign_id === campaign.id && a.status === "active" && seenAgents.has(a.id))
      .sort((a, b) => {
        if (order && order.length) return (orderIdx[a.id] ?? 9999) - (orderIdx[b.id] ?? 9999);
        return (conv[b.id] || 0) - (conv[a.id] || 0);
      });
    return { weeks: weeksOut, grid: g, gridAgents };
  }, [leads, agents, campaign.id, wgRange, wgPreset.days, wgCustom, order]);

  // Show every week in range — the grid scrolls horizontally for long campaigns.
  const visible = weeks;

  return (
    <>
      <div className="section-head" style={{ paddingTop: 24, alignItems: "flex-end" }}>
        <div>
          <h2>Weekly Grid</h2>
          <span className="sub">Transferred · IAs · Confirms per week per agent</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {wgCustom ? (
            <>
              <button
                ref={wgPickerRef}
                className="chip active"
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                onClick={() => setWgPickerOpen(o => !o)}
                title="Click to change dates"
              >
                <Icon name="calendar" size={11}/>
                {U.shortDate(wgCustom.startISO)} – {U.shortDate(wgCustom.endISO)}
              </button>
              <button className="icon-btn" title="Clear custom range" onClick={() => setWgCustom(null)}>
                <Icon name="x" size={12}/>
              </button>
            </>
          ) : (
            <>
              <RangeNav
                options={WG_PRESETS}
                value={wgKey}
                onChange={(k) => { setWgKey(k); setWgOffset(0); }}
                rangeLabel={wgRange.label}
                canBack={wgPreset.days != null}
                canForward={wgPreset.days != null && wgOffset > 0}
                onBack={() => setWgOffset(o => o + 1)}
                onForward={() => setWgOffset(o => Math.max(0, o - 1))}
                onReset={() => setWgOffset(0)}
                canReset={wgOffset !== 0}
              />
              <button
                ref={wgPickerRef}
                className="chip"
                style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
                onClick={() => setWgPickerOpen(o => !o)}
              >
                <Icon name="calendar" size={11}/>
                Pick dates…
              </button>
            </>
          )}
          <DateRangePicker
            open={wgPickerOpen}
            onClose={() => setWgPickerOpen(false)}
            anchorRef={wgPickerRef}
            value={wgCustom || (wgPreset.days != null ? wgPresetRange : null)}
            onChange={(r) => { setWgCustom(r); setWgOffset(0); }}
          />
          {visible.length > 0 && (
            <span className="help" style={{ fontFamily: "Geist Mono, monospace", marginLeft: 4, paddingLeft: 10, borderLeft: "1px solid var(--border-subtle)" }}>
              {visible[0].label}{visible.length > 1 ? "–" + visible[visible.length - 1].label : ""}
              <span className="muted-2" style={{ marginLeft: 6 }}>· {visible.length} week{visible.length === 1 ? "" : "s"}</span>
            </span>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 12, overflowX: "auto" }}>
        {visible.length === 0 ? (
          <div className="help" style={{ padding: 12 }}>No weeks in this range.</div>
        ) : (
          <div style={{ display: "inline-grid", gridTemplateColumns: `180px repeat(${visible.length}, 100px)`, gap: 4 }}>
            <div style={{ fontSize: 11, color: "var(--text-3)", padding: "6px 4px", letterSpacing: "0.03em", textTransform: "uppercase" }}>Agent</div>
            {visible.map(w => (
              <div key={w.key} style={{ fontFamily: "Geist Mono, monospace", fontSize: 11, color: "var(--text-3)", padding: "6px 4px" }}>
                {w.label}
              </div>
            ))}
            {gridAgents.map(a => (
              <React.Fragment key={a.id}>
                <div style={{ padding: "6px 4px", fontSize: 12, color: "var(--text)", display: "flex", alignItems: "center" }}>
                  {a.full_name}{a.is_tl && <TLBadge small/>}
                </div>
                {visible.map(w => {
                  // Blank weeks before the agent was hired / after they left.
                  // Date comparison — year-aware, unlike bare week numbers.
                  if ((a.date_added && a.date_added > w.end) ||
                      (a.date_removed && a.date_removed < w.start)) {
                    return <div key={w.key}/>;
                  }
                  const c = grid[a.id + "|" + w.key] || { t: 0, i: 0, c: 0 };
                  const isEmpty = c.t + c.i + c.c === 0;
                  return (
                    <div key={w.key} className="weekly-cell" style={isEmpty ? { background: "transparent", border: "1px dashed var(--border-subtle)" } : {}}>
                      <div className="label">T · I · C</div>
                      <div className="nums">
                        <span className={c.t ? "n-t" : "n-zero"}>{c.t}</span>
                        <span className={c.i ? "n-i" : "n-zero"}>{c.i}</span>
                        <span className={c.c ? "n-c" : "n-zero"}>{c.c}</span>
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

Object.assign(window, { AgentReport });

// Agent Report — weekly per-agent breakdown
const { useState: useStateAR, useMemo: useMemoAR, useEffect: useEffectAR, useRef: useRefAR } = React;

function AgentReport({ campaign, agents, leads, onAddAgent }) {
  const [showAdd, setShowAdd] = useStateAR(false);

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
    list.sort((a, b) => (b.ia + b.confirmed) - (a.ia + a.confirmed));
    return list;
  }, [agents, leads, campaign.id, range, preset.days, customRange]);

  // Weekly grid owns its own range — see <WeeklyGrid> below.

  return (
    <div className="tab-content">
      <div className="toolbar">
        <div>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Agent Performance</h2>
          <div className="help" style={{ marginTop: 2 }}>
            Sorted by IAs + Confirms. Agents with 5+ transferred and 0 conversions flagged.
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
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Icon name="plus" size={13}/> Add Agent
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Agent</th>
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
                <tr key={a.id} className={warn ? "row-warn" : ""}>
                  <td>
                    {a.full_name}
                    {a.is_tl && <TLBadge small/>}
                    {warn && (
                      <span className="tag" style={{ marginLeft: 8, color: "var(--status-dnc-fg)", borderColor: "var(--status-dnc-ring)", background: "var(--status-dnc-bg)" }}>
                        Needs attention
                      </span>
                    )}
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

      {/* Weekly grid — owns its own time range */}
      <WeeklyGrid
        campaign={campaign}
        leads={leads}
        agents={agents}
      />

      {showAdd && (
        <AddAgentModal campaign={campaign} onClose={() => setShowAdd(false)} onSave={(name, isTl) => {
          onAddAgent(name, isTl);
          setShowAdd(false);
        }}/>
      )}
    </div>
  );
}

// Weekly grid — self-contained: owns its own time range, calendar picker,
// presets, and pagination through the resulting weeks.
function WeeklyGrid({ campaign, leads, agents }) {
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
    const weekSet = new Set();
    const seenAgents = new Set();
    const g = {};
    leads.forEach(l => {
      if (l.campaign_id !== campaign.id) return;
      if (!wgInRange(l.date)) return;
      const w = U.weekLabel(l.date);
      weekSet.add(w);
      seenAgents.add(l.agent_id);
      const k = l.agent_id + "|" + w;
      const c = (g[k] ||= { t: 0, i: 0, c: 0 });
      // t = Transferred (every non-pending lead); i and c are subsets of it.
      if (l.status !== "pending") c.t++;
      if (l.status === "ia") c.i++;
      if (l.status === "confirmed") c.c++;
    });
    const weeksOut = Array.from(weekSet).sort();
    const gridAgents = agents
      .filter(a => a.campaign_id === campaign.id && a.status === "active" && seenAgents.has(a.id))
      .sort((a, b) => a.full_name.localeCompare(b.full_name));
    return { weeks: weeksOut, grid: g, gridAgents };
  }, [leads, agents, campaign.id, wgRange, wgPreset.days, wgCustom]);

  const WINDOW = 8;
  const [offset, setOffset] = useStateAR(0);
  const total = weeks.length;
  const end = total - offset;
  const start = Math.max(0, end - WINDOW);
  const visible = weeks.slice(start, end);
  const canBack = start > 0;
  const canFwd = offset > 0;

  useEffectAR(() => {
    if (offset > Math.max(0, total - WINDOW)) setOffset(0);
  }, [total]);

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
            onChange={(r) => { setWgCustom(r); setWgOffset(0); setOffset(0); }}
          />
          {total > WINDOW && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 4, paddingLeft: 10, borderLeft: "1px solid var(--border-subtle)" }}>
              <span className="help" style={{ fontFamily: "Geist Mono, monospace" }}>
                {visible[0]}{visible.length > 1 ? "–" + visible[visible.length - 1] : ""}
                <span className="muted-2" style={{ marginLeft: 6 }}>· {total} weeks</span>
              </span>
              <button
                className="icon-btn"
                onClick={() => setOffset(o => o + WINDOW)}
                disabled={!canBack}
                style={!canBack ? { opacity: 0.35, cursor: "not-allowed" } : {}}
                title="Earlier weeks"
              >
                <Icon name="arrowLeft" size={13}/>
              </button>
              <button
                className="btn btn-sm"
                onClick={() => setOffset(0)}
                disabled={!canFwd}
                style={!canFwd ? { opacity: 0.35, cursor: "default" } : {}}
              >Latest</button>
              <button
                className="icon-btn"
                onClick={() => setOffset(o => Math.max(0, o - WINDOW))}
                disabled={!canFwd}
                style={!canFwd ? { opacity: 0.35, cursor: "not-allowed" } : {}}
                title="Later weeks"
              >
                <Icon name="chevronRight" size={13}/>
              </button>
            </div>
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
              <div key={w} style={{ fontFamily: "Geist Mono, monospace", fontSize: 11, color: "var(--text-3)", padding: "6px 4px" }}>
                {w}
              </div>
            ))}
            {gridAgents.map(a => (
              <React.Fragment key={a.id}>
                <div style={{ padding: "6px 4px", fontSize: 12, color: "var(--text)", display: "flex", alignItems: "center" }}>
                  {a.full_name}{a.is_tl && <TLBadge small/>}
                </div>
                {visible.map(w => {
                  // Blank weeks before the agent was hired / after they left.
                  const wkNum = parseInt(String(w).replace(/\D/g, ""), 10);
                  const startWk = a.date_added ? U.weekNumber(a.date_added) : 0;
                  const endWk = a.date_removed ? U.weekNumber(a.date_removed) : 9999;
                  if (wkNum < startWk || wkNum > endWk) return <div key={w}/>;
                  const c = grid[a.id + "|" + w] || { t: 0, i: 0, c: 0 };
                  const isEmpty = c.t + c.i + c.c === 0;
                  return (
                    <div key={w} className="weekly-cell" style={isEmpty ? { background: "transparent", border: "1px dashed var(--border-subtle)" } : {}}>
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

function AddAgentModal({ campaign, onClose, onSave }) {
  const [name, setName] = useStateAR("");
  const [isTl, setIsTl] = useStateAR(false);
  return (
    <Modal
      open
      onClose={onClose}
      title="Add Agent"
      width="440px"
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => name.trim() && onSave(name.trim(), isTl)} disabled={!name.trim()}>
            Add agent
          </button>
        </>
      }
    >
      <div className="stack">
        <div className="field">
          <label>Full name</label>
          <input className="input" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Devon Reyes" onKeyDown={(e) => e.key === "Enter" && name.trim() && onSave(name.trim(), isTl)}/>
        </div>
        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12.5, cursor: "pointer" }}>
          <input type="checkbox" checked={isTl} onChange={(e) => setIsTl(e.target.checked)}/>
          <span>Team Lead</span>
          <span className="help" style={{ marginLeft: 6 }}>(eligible to receive coaching bonuses)</span>
        </label>
      </div>
    </Modal>
  );
}

Object.assign(window, { AgentReport });

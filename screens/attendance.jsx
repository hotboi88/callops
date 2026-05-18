// Attendance — its own tab, dedicated to taking attendance for managers
const { useState: useStateATT, useMemo: useMemoATT, useEffect: useEffectATT } = React;

// Inline-editable agent name cell: click the name to rename, Enter/blur saves.
function EditableAgentName({ agent, onUpdateAgent }) {
  const [editing, setEditing] = useStateATT(false);
  const [val, setVal] = useStateATT(agent.full_name);
  const save = () => {
    const name = val.trim();
    if (name && name !== agent.full_name) onUpdateAgent(agent.id, { full_name: name });
    else setVal(agent.full_name);
    setEditing(false);
  };
  if (editing) {
    return (
      <input
        className="input"
        style={{ maxWidth: 240, padding: "4px 8px" }}
        value={val}
        autoFocus
        onChange={(e) => setVal(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") { setVal(agent.full_name); setEditing(false); }
        }}
      />
    );
  }
  return (
    <span
      style={{ cursor: "pointer" }}
      title="Click to rename"
      onClick={() => { setVal(agent.full_name); setEditing(true); }}
    >
      {agent.full_name}
    </span>
  );
}

function Attendance({ campaign, agents, leads, attendanceOverrides, onSetAttendance, onAddAgent, onUpdateAgent }) {
  const [attDays, setAttDays] = useStateATT(14);
  const [attOffset, setAttOffset] = useStateATT(0);

  const dateCols = useMemoATT(() => {
    const out = [];
    for (let i = 0; i < attDays; i++) {
      const d = new Date(window.MOCK_TODAY);
      d.setDate(d.getDate() - i - attOffset);
      out.push(U.dayStr(d));
    }
    return out;
  }, [attDays, attOffset]);

  const rangeLabel = useMemoATT(() => {
    if (!dateCols.length) return "";
    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const last = U.parseDate(dateCols[0]);
    const first = U.parseDate(dateCols[dateCols.length - 1]);
    const sameMonth = first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear();
    if (sameMonth) return `${MONTHS[first.getMonth()]} ${first.getDate()}–${last.getDate()}, ${last.getFullYear()}`;
    return `${MONTHS[first.getMonth()]} ${first.getDate()} – ${MONTHS[last.getMonth()]} ${last.getDate()}, ${last.getFullYear()}`;
  }, [dateCols]);

  const campaignAgents = useMemoATT(() => agents.filter(a => a.campaign_id === campaign.id && a.status === "active"), [agents, campaign.id]);

  // ---- Roster (active first, then inactive; alumni separate) ----
  const [newAgent, setNewAgent] = useStateATT("");
  const [showAlumni, setShowAlumni] = useStateATT(false);
  const rosterAgents = useMemoATT(() =>
    agents
      .filter(a => a.campaign_id === campaign.id && a.status !== "removed")
      .sort((a, b) => (a.status === "active" ? 0 : 1) - (b.status === "active" ? 0 : 1)),
    [agents, campaign.id]);
  const removedAgents = useMemoATT(() => agents.filter(a => a.campaign_id === campaign.id && a.status === "removed"), [agents, campaign.id]);

  const attMap = useMemoATT(() => {
    const m = {};
    const leadDays = {};
    leads.forEach(l => {
      if (l.campaign_id !== campaign.id) return;
      leadDays[l.agent_id + "|" + l.date] = true;
    });
    campaignAgents.forEach(a => {
      dateCols.forEach(d => {
        const key = a.id + "|" + d;
        const override = attendanceOverrides[key];
        if (override) {
          m[key] = { status: override, auto: false };
        } else {
          const dow = U.parseDate(d).getDay();
          if (a.date_added && d < a.date_added) m[key] = { status: "off", auto: true, preHire: true };
          else if (leadDays[key]) m[key] = { status: "present", auto: true };
          else if (dow === 0 || dow === 6) m[key] = { status: "off", auto: true };
          else m[key] = { status: "absent", auto: true };
        }
      });
    });
    return m;
  }, [campaignAgents, dateCols, leads, campaign.id, attendanceOverrides]);

  const attSummary = useMemoATT(() => {
    return campaignAgents.map(a => {
      let p = 0, ab = 0, off = 0, leadsCount = 0;
      dateCols.forEach(d => {
        const s = attMap[a.id + "|" + d]?.status;
        if (s === "present") p++;
        else if (s === "absent") ab++;
        else off++;
      });
      leads.forEach(l => {
        if (l.campaign_id === campaign.id && l.agent_id === a.id && dateCols.includes(l.date)) leadsCount++;
      });
      const pct = (p + ab) > 0 ? p / (p + ab) : 0;
      const avg = p > 0 ? leadsCount / p : 0;
      return { ...a, present: p, absent: ab, off, pct, avg, leadsCount };
    }).sort((a, b) => a.full_name.localeCompare(b.full_name));
  }, [campaignAgents, dateCols, attMap, leads, campaign.id]);

  const rollup = useMemoATT(() => {
    let p = 0, ab = 0;
    attSummary.forEach(a => { p += a.present; ab += a.absent; });
    const pct = (p + ab) > 0 ? p / (p + ab) : 0;
    return { p, ab, pct };
  }, [attSummary]);

  const pctColor = rollup.pct >= 0.85 ? "var(--money-pos)"
    : rollup.pct >= 0.7 ? "var(--money-spiff)"
    : rollup.pct > 0 ? "var(--status-dnc-fg)"
    : "var(--text-3)";
  const pctTone = rollup.pct >= 0.85 ? "Strong"
    : rollup.pct >= 0.7 ? "Watch"
    : rollup.pct > 0 ? "Critical"
    : "—";

  const cycleAttendance = (agentId, date) => {
    const cur = attMap[agentId + "|" + date]?.status || "absent";
    const next = cur === "present" ? "absent" : cur === "absent" ? "off" : "present";
    onSetAttendance(agentId, date, next);
  };

  const markAllPresentForDate = (date) => {
    campaignAgents.forEach(a => {
      const cur = attMap[a.id + "|" + date]?.status;
      if (cur !== "present") onSetAttendance(a.id, date, "present");
    });
  };
  const markAllPresentForAgent = (agentId) => {
    dateCols.forEach(d => {
      const dow = U.parseDate(d).getDay();
      if (dow === 0 || dow === 6) return;
      const cur = attMap[agentId + "|" + d]?.status;
      if (cur !== "present") onSetAttendance(agentId, d, "present");
    });
  };

  return (
    <div className="tab-content">
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 18,
        flexWrap: "wrap",
        marginBottom: 16,
        paddingBottom: 16,
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
              Attendance
            </div>
            <h2 style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              {campaignAgents.length} agent{campaignAgents.length === 1 ? "" : "s"}
              <span style={{ color: "var(--text-3)", fontWeight: 400, marginLeft: 8, fontSize: 14 }}>
                {rangeLabel}
              </span>
            </h2>
          </div>

          {/* Floor attendance gauge */}
          <div style={{
            display: "flex", flexDirection: "column", gap: 6,
            minWidth: 200,
            padding: "10px 14px",
            border: "1px solid var(--border)",
            borderRadius: 10,
            background: "var(--bg-panel)",
          }}>
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Floor attendance</span>
              <span className="mono" style={{ fontSize: 10, color: pctColor, fontWeight: 600 }}>{pctTone}</span>
            </div>
            <div className="row" style={{ alignItems: "baseline", gap: 8 }}>
              <span className="mono" style={{ fontSize: 28, fontWeight: 600, color: pctColor, letterSpacing: "-0.03em", lineHeight: 1 }}>
                {Math.round(rollup.pct * 100)}<span style={{ fontSize: 14, color: "var(--text-3)", marginLeft: 1 }}>%</span>
              </span>
              <span style={{ fontSize: 11, color: "var(--text-4)", fontFamily: "Geist Mono, monospace" }}>
                {rollup.p}/{rollup.p + rollup.ab}
              </span>
            </div>
            <div style={{ height: 4, background: "var(--bg-panel-2)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: Math.max(2, rollup.pct * 100) + "%", height: "100%", background: pctColor }}/>
            </div>
          </div>
        </div>

        <RangeNav
          options={[{ key: "7", label: "7d" }, { key: "14", label: "14d" }, { key: "30", label: "30d" }]}
          value={String(attDays)}
          onChange={(k) => { setAttDays(Number(k)); setAttOffset(0); }}
          rangeLabel={rangeLabel}
          canBack={true}
          canForward={attOffset > 0}
          onBack={() => setAttOffset(o => o + attDays)}
          onForward={() => setAttOffset(o => Math.max(0, o - attDays))}
          onReset={() => setAttOffset(0)}
          canReset={attOffset !== 0}
        />
      </div>

      <div className="help" style={{ marginBottom: 12 }}>
        Click a cell to toggle present → absent → off · click a date header to mark everyone present · click an agent name to mark every weekday · lime ring = auto-detected
      </div>

      <div className="att-grid">
        <div className="att-scroll">
          <table className="att-table">
            <thead>
              <tr>
                <th>Agent</th>
                {[...dateCols].reverse().map((d, i, arr) => {
                  const dt = U.parseDate(d);
                  const prev = i > 0 ? U.parseDate(arr[i - 1]) : null;
                  const newMonth = !prev || prev.getMonth() !== dt.getMonth();
                  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                  const isToday = U.dayStr(window.MOCK_TODAY) === d;
                  return (
                    <th
                      key={d}
                      style={newMonth && i > 0 ? { borderLeft: "2px solid var(--border)" } : {}}
                      title="Click to mark all agents present for this day"
                      onClick={() => markAllPresentForDate(d)}
                    >
                      {newMonth && (
                        <div style={{ fontSize: 9, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 1, fontWeight: 600 }}>
                          {MONTHS[dt.getMonth()]}
                        </div>
                      )}
                      <div style={{ color: isToday ? "var(--accent)" : "var(--text)", fontWeight: isToday ? 600 : 400 }}>{dt.getDate()}</div>
                      <div style={{ fontSize: 9, color: "var(--text-4)", marginTop: 1 }}>{U.dayOfWeek(d).charAt(0)}</div>
                    </th>
                  );
                })}
                <th style={{ position: "sticky", right: 0, minWidth: 90, borderLeft: "1px solid var(--border)" }}>
                  Att %
                </th>
              </tr>
            </thead>
            <tbody>
              {attSummary.map(a => {
                let pctCls = "";
                if (a.pct < 0.6) pctCls = "att-warn-red";
                else if (a.pct < 0.8) pctCls = "att-warn-amber";
                return (
                  <tr key={a.id}>
                    <td
                      title="Click to mark this agent present every weekday in the visible window"
                      onClick={() => markAllPresentForAgent(a.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <span>{a.full_name}</span>
                      {a.is_tl && <TLBadge small/>}
                    </td>
                    {[...dateCols].reverse().map((d, i, arr) => {
                      const cell = attMap[a.id + "|" + d];
                      const s = cell?.status;
                      const cls = "att-cell att-" + s + (cell?.auto ? " att-auto" : "");
                      const glyph = s === "present" ? "✓" : s === "absent" ? "✗" : "—";
                      const prev = i > 0 ? U.parseDate(arr[i - 1]) : null;
                      const dt = U.parseDate(d);
                      const newMonth = prev && prev.getMonth() !== dt.getMonth();
                      return (
                        <td key={d} style={newMonth ? { borderLeft: "2px solid var(--border)" } : {}}>
                          <span className={cls} onClick={() => cycleAttendance(a.id, d)}>{glyph}</span>
                        </td>
                      );
                    })}
                    <td style={{ position: "sticky", right: 0, borderLeft: "1px solid var(--border)" }} className="num-l">
                      <span className={"money money-bold " + pctCls}>{Math.round(a.pct * 100)}%</span>
                      <div style={{ fontSize: 10, color: "var(--text-4)" }}>{a.present}/{a.present + a.absent}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="row" style={{ marginTop: 12, gap: 16, fontSize: 11.5, color: "var(--text-3)", flexWrap: "wrap" }}>
        <span className="row" style={{ gap: 6 }}>
          <span className="att-cell att-present" style={{ width: 16, height: 16 }}>✓</span>
          <span><strong style={{ color: "var(--text)" }}>Present</strong> — worked that day</span>
        </span>
        <span className="row" style={{ gap: 6 }}>
          <span className="att-cell att-absent" style={{ width: 16, height: 16 }}>✗</span>
          <span><strong style={{ color: "var(--text)" }}>Absent</strong> — expected but didn't show</span>
        </span>
        <span className="row" style={{ gap: 6 }}>
          <span className="att-cell att-off" style={{ width: 16, height: 16 }}>—</span>
          <span><strong style={{ color: "var(--text)" }}>Off</strong> — scheduled day off (weekend, vacation)</span>
        </span>
        <span className="row" style={{ gap: 6 }}>
          <span className="att-cell att-present att-auto" style={{ width: 16, height: 16 }}>✓</span>
          <span>Auto-detected from lead activity — click any cell to override</span>
        </span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-4)" }}>
          Tip: click a date header to mark everyone present that day · click an agent name to mark all weekdays
        </span>
      </div>

      {/* Agent roster */}
      <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--border-subtle)" }}>
        <div style={{ marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Agent roster</h2>
          <div className="help" style={{ marginTop: 2 }}>
            {rosterAgents.length} on roster · {rosterAgents.filter(a => a.is_tl).length} team leads.
          </div>
        </div>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: 12, borderBottom: "1px solid var(--border-subtle)", display: "flex", gap: 8 }}>
            <input
              className="input"
              placeholder="Add agent by name…"
              value={newAgent}
              onChange={(e) => setNewAgent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newAgent.trim()) {
                  onAddAgent(newAgent.trim(), false);
                  setNewAgent("");
                }
              }}
            />
            <button
              className="btn btn-primary"
              onClick={() => { if (newAgent.trim()) { onAddAgent(newAgent.trim(), false); setNewAgent(""); } }}
              disabled={!newAgent.trim()}
            >
              Add
            </button>
          </div>
          <table className="table" style={{ borderRadius: 0 }}>
            <thead>
              <tr>
                <th>Agent</th>
                <th style={{ width: 100 }}>Status</th>
                <th style={{ width: 70 }}>Role</th>
                <th style={{ width: 125 }}>Started</th>
                <th style={{ width: 125 }}>Terminated</th>
                <th style={{ width: 170, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rosterAgents.map(a => (
                <tr key={a.id}>
                  <td><EditableAgentName agent={a} onUpdateAgent={onUpdateAgent}/></td>
                  <td>
                    {a.status === "active"
                      ? <span className="tag" style={{ color: "var(--money-pos)", borderColor: "var(--accent-line)", background: "var(--accent-soft)" }}>Active</span>
                      : <span className="tag tag-inactive">Inactive</span>}
                  </td>
                  <td>{a.is_tl ? <span className="tag tag-tl">★ TL</span> : <span className="tag">Agent</span>}</td>
                  <td><DatePicker value={a.date_added || ""} onChange={(v) => onUpdateAgent(a.id, { date_added: v })}/></td>
                  <td><DatePicker value={a.date_removed || ""} onChange={(v) => onUpdateAgent(a.id, { date_removed: v || null })} clearable placeholder="—"/></td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-sm btn-ghost" onClick={() => onUpdateAgent(a.id, { is_tl: !a.is_tl })}>
                      {a.is_tl ? "Remove TL" : "Make TL"}
                    </button>
                    <button className="btn btn-sm btn-ghost" onClick={() => onUpdateAgent(a.id, { status: a.status === "active" ? "inactive" : "active" })}>
                      {a.status === "active" ? "Deactivate" : "Reactivate"}
                    </button>
                    <button className="btn btn-sm btn-ghost" onClick={() => onUpdateAgent(a.id, { status: "removed" })} style={{ color: "var(--status-dnc-fg)" }}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {rosterAgents.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 24 }} className="muted">No agents on roster.</td></tr>
              )}
            </tbody>
          </table>

          {removedAgents.length > 0 && (
            <div style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <button
                className="btn btn-ghost"
                style={{ width: "100%", justifyContent: "flex-start", padding: "10px 14px", borderRadius: 0, height: "auto" }}
                onClick={() => setShowAlumni(s => !s)}
              >
                <Icon name={showAlumni ? "chevron" : "chevronRight"} size={12}/>
                Alumni ({removedAgents.length})
              </button>
              {showAlumni && (
                <table className="table" style={{ borderRadius: 0 }}>
                  <tbody>
                    {removedAgents.map(a => (
                      <tr key={a.id} style={{ opacity: 0.7 }}>
                        <td>{a.full_name}</td>
                        <td style={{ textAlign: "right" }}>
                          <button className="btn btn-sm" onClick={() => onUpdateAgent(a.id, { status: "active" })}>
                            <Icon name="refresh" size={12}/> Reactivate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Attendance });

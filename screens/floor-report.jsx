// Floor Report — daily stats + attendance
const { useState: useStateFR, useMemo: useMemoFR } = React;

function FloorReport({ campaign, agents, leads, shiftLogs, attendanceOverrides, onLogShift, onSetAttendance }) {
  const [newShiftDate, setNewShiftDate] = useStateFR(window.MOCK_DATA?.today);
  const [newShiftCount, setNewShiftCount] = useStateFR("");
  const [attDays, setAttDays] = useStateFR(14);
  // Offset in days from today to the end of the attendance window. 0 = ends today.
  const [attOffset, setAttOffset] = useStateFR(0);

  // Daily aggregation
  const days = useMemoFR(() => {
    const map = {};
    const camLeads = leads.filter(l => l.campaign_id === campaign.id);
    camLeads.forEach(l => {
      const r = (map[l.date] ||= { date: l.date, total: 0, pending: 0, transfer: 0, confirmed: 0, ia: 0, dnc: 0, bad: 0 });
      r.total++; r[l.status]++;
    });
    shiftLogs.filter(s => s.campaign_id === campaign.id).forEach(s => {
      const r = (map[s.date] ||= { date: s.date, total: 0, pending: 0, transfer: 0, confirmed: 0, ia: 0, dnc: 0, bad: 0 });
      r.on_floor = s.agents_on_floor;
    });
    const arr = Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
    return arr;
  }, [leads, shiftLogs, campaign.id]);

  // Attendance computation
  // Build N days ending at (today - attOffset)
  const dateCols = useMemoFR(() => {
    const out = [];
    for (let i = 0; i < attDays; i++) {
      const d = new Date(window.MOCK_TODAY);
      d.setDate(d.getDate() - i - attOffset);
      out.push(U.dayStr(d));
    }
    return out; // newest first
  }, [attDays, attOffset]);

  // Cap how far back you can page — don't go earlier than the campaign was created
  const maxOffset = useMemoFR(() => {
    if (!campaign.created_at) return 9999;
    const created = U.parseDate(campaign.created_at);
    const diffDays = Math.floor((window.MOCK_TODAY - created) / 86400000);
    return Math.max(0, diffDays - attDays + 1);
  }, [campaign.created_at, attDays]);

  // Clamp current offset if window size shrunk to less than current offset
  React.useEffect(() => {
    if (attOffset > maxOffset) setAttOffset(maxOffset);
  }, [maxOffset, attOffset]);

  // Range label e.g. "Apr 16 – May 15"
  const rangeLabel = useMemoFR(() => {
    if (!dateCols.length) return "";
    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const last = U.parseDate(dateCols[0]);              // newest
    const first = U.parseDate(dateCols[dateCols.length - 1]); // oldest
    const sameMonth = first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear();
    if (sameMonth) {
      return `${MONTHS[first.getMonth()]} ${first.getDate()}–${last.getDate()}, ${last.getFullYear()}`;
    }
    return `${MONTHS[first.getMonth()]} ${first.getDate()} – ${MONTHS[last.getMonth()]} ${last.getDate()}, ${last.getFullYear()}`;
  }, [dateCols]);

  const campaignAgents = useMemoFR(() => agents.filter(a => a.campaign_id === campaign.id && a.status === "active"), [agents, campaign.id]);

  // For each agent/date — auto: present if any leads, else absent (Sat/Sun → off; before agent's hire date → off too)
  const attMap = useMemoFR(() => {
    const m = {};
    // leads per agent/date
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
          // Before agent's hire date → treat as off (not absent — they hadn't started yet)
          if (a.date_added && d < a.date_added) m[key] = { status: "off", auto: true, preHire: true };
          else if (leadDays[key]) m[key] = { status: "present", auto: true };
          else if (dow === 0 || dow === 6) m[key] = { status: "off", auto: true };
          else m[key] = { status: "absent", auto: true };
        }
      });
    });
    return m;
  }, [campaignAgents, dateCols, leads, campaign.id, attendanceOverrides]);

  const attSummary = useMemoFR(() => {
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

  const cycleAttendance = (agentId, date) => {
    const cur = attMap[agentId + "|" + date]?.status || "absent";
    const next = cur === "present" ? "absent" : cur === "absent" ? "off" : "present";
    onSetAttendance(agentId, date, next);
  };

  const logShift = () => {
    const n = parseInt(newShiftCount, 10);
    if (!newShiftDate || !(n >= 0)) return;
    onLogShift(newShiftDate, n);
    setNewShiftCount("");
  };

  return (
    <div className="tab-content">
      {/* Section A: Daily Stats */}
      <div className="section-head">
        <h2>Daily Floor Stats</h2>
        <span className="sub">Lead flow vs agents on floor, last {days.length} days with activity</span>
      </div>

      {/* Shift logger */}
      <div className="card" style={{ padding: 12, marginBottom: 12, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <strong style={{ fontSize: 12.5 }}>Log shift:</strong>
        <div style={{ width: 170 }}>
          <DatePicker value={newShiftDate} onChange={(v) => setNewShiftDate(v)}/>
        </div>
        <span className="muted" style={{ fontSize: 12 }}>agents on floor</span>
        <input className="input" type="number" min="0" style={{ width: 80 }}
          placeholder="0" value={newShiftCount}
          onChange={(e) => setNewShiftCount(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && logShift()}/>
        <button className="btn btn-primary btn-sm" onClick={logShift}>Log</button>
        <div className="help" style={{ marginLeft: "auto" }}>
          Logging a date again will overwrite the previous count.
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 90 }}>Date</th>
              <th style={{ width: 50 }}>Day</th>
              <th className="num" style={{ width: 90 }}>On Floor</th>
              <th className="num" style={{ width: 90 }}>Total Leads</th>
              <th className="num" style={{ width: 80 }}>Pending</th>
              <th className="num" style={{ width: 90 }}>Transfers</th>
              <th className="num" style={{ width: 70 }}>IAs</th>
              <th className="num" style={{ width: 80 }}>Confirms</th>
              <th className="num" style={{ width: 70 }}>DNC</th>
              <th className="num" style={{ width: 110 }}>Lead : Agent</th>
            </tr>
          </thead>
          <tbody>
            {days.map(d => {
              const ratio = d.on_floor && d.on_floor > 0 ? d.total / d.on_floor : null;
              const dow = U.parseDate(d.date).getDay();
              const isWeekend = dow === 0 || dow === 6;
              let ratioCls = "";
              if (ratio != null) {
                if (ratio >= 2.0) ratioCls = "row-good";
              }
              return (
                <tr key={d.date} className={ratioCls}>
                  <td className="num-l">{U.shortDate(d.date)}</td>
                  <td className="muted-2" style={{ fontSize: 11 }}>
                    <span style={{ color: isWeekend ? "var(--text-4)" : "var(--text-3)" }}>{U.dayOfWeek(d.date)}</span>
                  </td>
                  <td className="num">
                    {d.on_floor != null ? (
                      <span className="money money-bold">{d.on_floor}</span>
                    ) : <span className="money money-muted">—</span>}
                  </td>
                  <td className="num"><span className="money money-bold">{d.total || "—"}</span></td>
                  <td className="num"><span className={d.pending ? "money" : "money money-muted"}>{d.pending || "—"}</span></td>
                  <td className="num"><span className={d.transfer ? "money" : "money money-muted"} style={d.transfer ? { color: "var(--status-transfer-fg)" } : {}}>{d.transfer || "—"}</span></td>
                  <td className="num"><span className={d.ia ? "money money-tl" : "money money-muted"}>{d.ia || "—"}</span></td>
                  <td className="num"><span className={d.confirmed ? "money money-pos" : "money money-muted"}>{d.confirmed || "—"}</span></td>
                  <td className="num"><span className={d.dnc ? "money" : "money money-muted"} style={d.dnc ? { color: "var(--status-dnc-fg)" } : {}}>{d.dnc || "—"}</span></td>
                  <td className="num">
                    {ratio != null ? (
                      <span className="money money-bold">{ratio.toFixed(2)}</span>
                    ) : <span className="money money-muted">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Section B: Attendance */}
      <div className="section-head" style={{ paddingTop: 28, alignItems: "flex-end" }}>
        <div>
          <h2>Agent Attendance</h2>
          <span className="sub">Click a cell to toggle present → absent → off. Lime ring = auto-detected from lead activity.</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div className="row" style={{ gap: 4 }}>
            <button
              className="icon-btn"
              title={attOffset >= maxOffset ? `Reached campaign start (${U.shortDate(campaign.created_at)})` : "Earlier"}
              onClick={() => setAttOffset(o => Math.min(maxOffset, o + attDays))}
              disabled={attOffset >= maxOffset}
              style={attOffset >= maxOffset ? { opacity: 0.35, cursor: "not-allowed" } : {}}
            >
              <Icon name="arrowLeft" size={13}/>
            </button>
            <div style={{
              minWidth: 168,
              textAlign: "center",
              fontSize: 12.5,
              padding: "0 10px",
              color: "var(--text)",
              fontFamily: "Geist Mono, monospace",
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.01em"
            }}>{rangeLabel}</div>
            <button className="icon-btn" title="Later" onClick={() => setAttOffset(o => Math.max(0, o - attDays))} disabled={attOffset === 0} style={attOffset === 0 ? { opacity: 0.4, cursor: "not-allowed" } : {}}>
              <Icon name="chevronRight" size={13}/>
            </button>
          </div>
          {/* Today is always rendered (just disabled) so the arrows don't shift when paging back */}
          <button
            className="btn btn-sm"
            onClick={() => setAttOffset(0)}
            disabled={attOffset === 0}
            style={attOffset === 0 ? { opacity: 0.35, cursor: "default" } : {}}
          >Today</button>
          <div className="filter-chips">
            {[7, 14, 30].map(d => (
              <button key={d} className={"chip" + (attDays === d ? " active" : "")} onClick={() => setAttDays(d)}>
                {d}d
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="att-grid">
        <div className="att-scroll">
          <table className="att-table">
            <thead>
              <tr>
                <th>Agent</th>
                {/* Reverse so dates go oldest → newest left to right, like a calendar */}
                {[...dateCols].reverse().map((d, i, arr) => {
                  const dt = U.parseDate(d);
                  const prev = i > 0 ? U.parseDate(arr[i - 1]) : null;
                  const newMonth = !prev || prev.getMonth() !== dt.getMonth();
                  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                  return (
                    <th key={d} style={newMonth && i > 0 ? { borderLeft: "2px solid var(--border)" } : {}}>
                      {newMonth && (
                        <div style={{ fontSize: 9, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 1, fontWeight: 600 }}>
                          {MONTHS[dt.getMonth()]}
                        </div>
                      )}
                      <div style={{ color: "var(--text)" }}>{dt.getDate()}</div>
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
                    <td>
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

      {/* Mini legend */}
      <div className="row" style={{ marginTop: 10, gap: 16, fontSize: 11.5, color: "var(--text-3)", flexWrap: "wrap" }}>
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
      </div>
    </div>
  );
}

Object.assign(window, { FloorReport });

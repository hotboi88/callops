// Floor Report — weekly trend + daily floor stats (attendance lives in its own tab)
const { useState: useStateFR, useMemo: useMemoFR, useEffect: useEffectFR, useRef: useRefFR } = React;

function FloorReport({ campaign, agents, leads, shiftLogs, attendanceOverrides, onLogShift }) {
  // Daily Stats date range
  const DAILY_PRESETS = [
    { key: "7d", label: "7d", days: 7 },
    { key: "30d", label: "30d", days: 30 },
    { key: "90d", label: "90d", days: 90 },
    { key: "all", label: "All", days: null },
  ];
  const [dailyKey, setDailyKey] = useStateFR("30d");
  const [dailyOffset, setDailyOffset] = useStateFR(0);
  const [customRange, setCustomRange] = useStateFR(null);
  const [pickerOpen, setPickerOpen] = useStateFR(false);
  const pickerBtnRef = useRefFR(null);
  const dailyPreset = DAILY_PRESETS.find(p => p.key === dailyKey) || DAILY_PRESETS[1];
  const presetRange = useMemoFR(() => window.dayRange(dailyPreset.days, dailyOffset), [dailyPreset.days, dailyOffset]);
  const dailyRange = customRange
    ? { startISO: customRange.startISO, endISO: customRange.endISO, label: `${U.shortDate(customRange.startISO)} – ${U.shortDate(customRange.endISO)}` }
    : presetRange;

  useEffectFR(() => {
    if (dailyPreset.days == null && dailyOffset !== 0) setDailyOffset(0);
  }, [dailyPreset.days]);

  // Daily aggregation — filtered by date range. On Floor is auto-computed from
  // attendance (count of agents with status="present" for that date).
  const days = useMemoFR(() => {
    const inRange = (d) => (dailyPreset.days == null && !customRange) || (d >= dailyRange.startISO && d <= dailyRange.endISO);
    const camAgents = agents.filter(a => a.campaign_id === campaign.id && a.status === "active");
    // Ground-truth attendance from Derek's daily reports (data.js).
    const present = {};
    const reportDays = new Set();
    ((window.MOCK_DATA && window.MOCK_DATA.attendance) || []).forEach(r => {
      if (r.campaign_id !== campaign.id) return;
      present[r.agent_id + "|" + r.date] = true;
      reportDays.add(r.date);
    });
    const statusFor = (agent, date) => {
      const key = agent.id + "|" + date;
      const ov = attendanceOverrides && attendanceOverrides[key];
      if (ov) return ov;
      if (agent.date_added && date < agent.date_added) return "off";
      if (agent.date_removed && date > agent.date_removed) return "off";
      if (!reportDays.has(date)) return "off";
      return present[key] ? "present" : "absent";
    };
    const presentCountForDate = (date) => {
      let n = 0;
      camAgents.forEach(a => { if (statusFor(a, date) === "present") n++; });
      return n;
    };

    const map = {};
    leads.filter(l => l.campaign_id === campaign.id).forEach(l => {
      if (!inRange(l.date)) return;
      const r = (map[l.date] ||= { date: l.date, total: 0, pending: 0, transfer: 0, confirmed: 0, ia: 0, dnc: 0, bad: 0 });
      r.total++; r[l.status]++;
    });
    // Also surface days with attendance overrides but no leads
    Object.keys(attendanceOverrides || {}).forEach(k => {
      const [, date] = k.split("|");
      if (!date || !inRange(date)) return;
      if (!map[date]) map[date] = { date, total: 0, pending: 0, transfer: 0, confirmed: 0, ia: 0, dnc: 0, bad: 0 };
    });
    Object.values(map).forEach(r => { r.on_floor = presentCountForDate(r.date); });
    return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
  }, [leads, agents, attendanceOverrides, campaign.id, dailyRange, dailyPreset.days, customRange]);

  return (
    <div className="tab-content">
      {/* Weekly rollup + lifetime totals — defaults to All here */}
      <WeeklyStats campaign={campaign} leads={leads} shiftLogs={shiftLogs} agents={agents} attendanceOverrides={attendanceOverrides} defaultPresetKey="all" />
      <div style={{ height: 22 }}/>

      {/* Daily Stats */}
      <div className="section-head" style={{ alignItems: "flex-end" }}>
        <div>
          <h2>Daily Floor Stats</h2>
          <span className="sub">Lead flow vs agents on floor · {days.length} day{days.length === 1 ? "" : "s"} with activity in range</span>
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
                options={DAILY_PRESETS}
                value={dailyKey}
                onChange={(k) => { setDailyKey(k); setDailyOffset(0); }}
                rangeLabel={dailyRange.label}
                canBack={dailyPreset.days != null}
                canForward={dailyPreset.days != null && dailyOffset > 0}
                onBack={() => setDailyOffset(o => o + 1)}
                onForward={() => setDailyOffset(o => Math.max(0, o - 1))}
                onReset={() => setDailyOffset(0)}
                canReset={dailyOffset !== 0}
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
            value={customRange || (dailyPreset.days != null ? presetRange : null)}
            onChange={(r) => { setCustomRange(r); setDailyOffset(0); }}
          />
        </div>
      </div>

      {/* Shift logger removed — On Floor is now auto-derived from the Attendance tab */}
      <div className="help" style={{ marginBottom: 12, fontSize: 11 }}>
        <Icon name="check" size={11} style={{ verticalAlign: "-1px", color: "var(--money-pos)", marginRight: 4 }}/>
        <span>On Floor counts each day's <strong style={{ color: "var(--text-2)" }}>present</strong> agents — take attendance in the <strong style={{ color: "var(--text)" }}>Attendance</strong> tab and this report updates automatically.</span>
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
              <th className="num" style={{ width: 95 }}>Transferred</th>
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
              // Transferred = every non-pending lead (transfer + ia + confirmed + dnc + bad).
              const transferred = d.total - d.pending;
              let ratioCls = "";
              if (ratio != null && ratio >= 2.0) ratioCls = "row-good";
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
                  <td className="num"><span className={transferred ? "money" : "money money-muted"} style={transferred ? { color: "var(--status-transfer-fg)" } : {}}>{transferred || "—"}</span></td>
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
    </div>
  );
}

Object.assign(window, { FloorReport });

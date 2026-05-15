// Agent Report — weekly per-agent breakdown
const { useState: useStateAR, useMemo: useMemoAR } = React;

function AgentReport({ campaign, agents, leads, onAddAgent }) {
  const [showAdd, setShowAdd] = useStateAR(false);

  // Per-agent summary
  const rows = useMemoAR(() => {
    const map = {};
    leads.forEach(l => {
      if (l.campaign_id !== campaign.id) return;
      const r = (map[l.agent_id] ||= { agent_id: l.agent_id, total: 0, pending: 0, transfer: 0, confirmed: 0, ia: 0, dnc: 0, bad: 0 });
      r.total++; r[l.status]++;
    });
    const list = agents
      .filter(a => a.campaign_id === campaign.id && a.status === "active")
      .map(a => {
        const r = map[a.id] || { total: 0, pending: 0, transfer: 0, confirmed: 0, ia: 0, dnc: 0, bad: 0 };
        const conv = r.total > 0 ? (r.ia + r.confirmed) / r.total : 0;
        return { ...a, ...r, conv };
      });
    list.sort((a, b) => (b.ia + b.confirmed) - (a.ia + a.confirmed));
    return list;
  }, [agents, leads, campaign.id]);

  // Weekly grid: weeks across columns
  const weekly = useMemoAR(() => {
    const weekSet = new Set();
    leads.forEach(l => { if (l.campaign_id === campaign.id) weekSet.add(U.weekLabel(l.date)); });
    const weeks = Array.from(weekSet).sort();
    // per-agent per-week
    const grid = {};
    leads.forEach(l => {
      if (l.campaign_id !== campaign.id) return;
      const w = U.weekLabel(l.date);
      const k = l.agent_id + "|" + w;
      const c = (grid[k] ||= { t: 0, i: 0, c: 0 });
      if (l.status === "transfer") c.t++;
      if (l.status === "ia") c.i++;
      if (l.status === "confirmed") c.c++;
    });
    return { weeks, grid };
  }, [leads, campaign.id]);

  return (
    <div className="tab-content">
      <div className="toolbar">
        <div>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Agent Performance</h2>
          <div className="help" style={{ marginTop: 2 }}>
            Sorted by IAs + Confirms. Agents with 5+ transfers and 0 conversions flagged.
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
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
              <th className="num" style={{ width: 80 }}>Transfers</th>
              <th className="num" style={{ width: 70 }}>IAs</th>
              <th className="num" style={{ width: 80 }}>Confirms</th>
              <th className="num" style={{ width: 90 }}>Total Conf.</th>
              <th className="num" style={{ width: 70 }}>DNC</th>
              <th className="num" style={{ width: 80 }}>Conv%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(a => {
              const warn = a.transfer >= 5 && (a.ia + a.confirmed) === 0;
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
                  <td className="num"><span className={a.transfer ? "money" : "money money-muted"} style={a.transfer ? { color: "var(--status-transfer-fg)" } : {}}>{a.transfer || "—"}</span></td>
                  <td className="num"><span className={a.ia ? "money money-tl" : "money money-muted"}>{a.ia || "—"}</span></td>
                  <td className="num"><span className={a.confirmed ? "money money-pos" : "money money-muted"}>{a.confirmed || "—"}</span></td>
                  <td className="num"><span className={(a.ia + a.confirmed) > 0 ? "money money-bold" : "money money-muted"}>{(a.ia + a.confirmed) || "—"}</span></td>
                  <td className="num"><span className={a.dnc > 0 ? "money" : "money money-muted"} style={a.dnc > 0 ? { color: "var(--status-dnc-fg)" } : {}}>{a.dnc || "—"}</span></td>
                  <td className="num">
                    <span className="money" style={{ color: a.conv >= 0.5 ? "var(--money-pos)" : a.conv > 0 ? "var(--text)" : "var(--text-4)" }}>
                      {a.transfer === 0 ? "—" : (a.conv === Infinity ? "∞" : Math.round(a.conv * 100) + "%")}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Weekly grid */}
      <WeeklyGrid
        weeks={weekly.weeks}
        grid={weekly.grid}
        agents={rows.filter(r => r.total > 0)}
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

// Weekly grid extracted so it can own its own pagination state cleanly
function WeeklyGrid({ weeks, grid, agents }) {
  const WINDOW = 8;
  const [offset, setOffset] = useStateAR(0); // 0 = newest weeks
  // weeks is sorted ascending (oldest → newest). Slice from the right.
  const total = weeks.length;
  const end = total - offset;
  const start = Math.max(0, end - WINDOW);
  const visible = weeks.slice(start, end);
  const canBack = start > 0;
  const canFwd = offset > 0;

  return (
    <>
      <div className="section-head" style={{ paddingTop: 24, alignItems: "flex-end" }}>
        <div>
          <h2>Weekly Grid</h2>
          <span className="sub">Transfers · IAs · Confirms per week per agent</span>
        </div>
        {total > WINDOW && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <span className="help" style={{ fontFamily: "Geist Mono, monospace" }}>
              {visible[0]}{visible.length > 1 ? "–" + visible[visible.length - 1] : ""}
              <span className="muted-2" style={{ marginLeft: 6 }}>· {total} total</span>
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
            >
              Latest
            </button>
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

      <div className="card" style={{ padding: 12, overflowX: "auto" }}>
        <div style={{ display: "inline-grid", gridTemplateColumns: `180px repeat(${visible.length}, 100px)`, gap: 4 }}>
          {/* Header row */}
          <div style={{ fontSize: 11, color: "var(--text-3)", padding: "6px 4px", letterSpacing: "0.03em", textTransform: "uppercase" }}>Agent</div>
          {visible.map(w => (
            <div key={w} style={{ fontFamily: "Geist Mono, monospace", fontSize: 11, color: "var(--text-3)", padding: "6px 4px" }}>
              {w}
            </div>
          ))}
          {/* Rows */}
          {agents.map(a => (
            <React.Fragment key={a.id}>
              <div style={{ padding: "6px 4px", fontSize: 12, color: "var(--text)", display: "flex", alignItems: "center" }}>
                {a.full_name}{a.is_tl && <TLBadge small/>}
              </div>
              {visible.map(w => {
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

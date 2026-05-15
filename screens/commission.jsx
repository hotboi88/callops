// Commission Sheet — accountant-facing
const { useState: useStateCS, useMemo: useMemoCS } = React;

function CommissionSheet({ campaign, agents, leads, profile, onInviteUser }) {
  const [period, setPeriod] = useStateCS("this_week");
  const [customStart, setCustomStart] = useStateCS("");
  const [customEnd, setCustomEnd] = useStateCS("");
  const [showInviteViewer, setShowInviteViewer] = useStateCS(false);

  const today = window.MOCK_TODAY;
  const range = useMemoCS(() => {
    if (period === "this_week") {
      return { start: U.dayStr(U.startOfWeek(today)), end: U.dayStr(U.endOfWeek(today)), label: "This Week" };
    } else if (period === "last_week") {
      const lw = new Date(today);
      lw.setDate(lw.getDate() - 7);
      return { start: U.dayStr(U.startOfWeek(lw)), end: U.dayStr(U.endOfWeek(lw)), label: "Last Week" };
    } else if (period === "month") {
      const s = new Date(today); s.setDate(1);
      return { start: U.dayStr(s), end: U.dayStr(today), label: "Month-to-date" };
    } else if (period === "custom") {
      return {
        start: customStart || "0000-00-00",
        end: customEnd || "9999-99-99",
        label: "Custom"
      };
    } else {
      return { start: "0000-00-00", end: "9999-99-99", label: "All Time" };
    }
  }, [period, customStart, customEnd, today]);

  const filtered = useMemoCS(() => {
    return leads.filter(l => l.campaign_id === campaign.id && l.date >= range.start && l.date <= range.end);
  }, [leads, campaign.id, range]);

  // Summary
  const totals = useMemoCS(() => {
    let bill = 0, spiff = 0, tl = 0;
    filtered.forEach(l => {
      bill += l.client_commission || 0;
      spiff += l.spiff || 0;
      tl += l.tl_bonus || 0;
    });
    return { bill, spiff, tl, total: bill + spiff + tl };
  }, [filtered]);

  // Per-agent breakdown
  const agentRows = useMemoCS(() => {
    const byAgent = {};
    filtered.forEach(l => {
      const k = l.agent_id;
      const row = (byAgent[k] ||= { agent_id: k, ia: 0, confirms: 0, transfers: 0, client: 0, spiff: 0, tl: 0 });
      if (l.status === "ia") row.ia++;
      if (l.status === "confirmed") row.confirms++;
      if (l.status === "transfer") row.transfers++;
      row.client += l.client_commission || 0;
      row.spiff += l.spiff || 0;
    });
    // TL bonuses received
    filtered.forEach(l => {
      if (l.tl_bonus > 0 && l.tl_recipient_id) {
        const row = (byAgent[l.tl_recipient_id] ||= { agent_id: l.tl_recipient_id, ia: 0, confirms: 0, transfers: 0, client: 0, spiff: 0, tl: 0 });
        row.tl += l.tl_bonus;
      }
    });
    const rows = Object.values(byAgent).map(r => {
      const a = agents.find(x => x.id === r.agent_id);
      return {
        ...r,
        name: a?.full_name || "—",
        is_tl: a?.is_tl,
        total: r.client + r.spiff + r.tl,
      };
    });
    rows.sort((a, b) => b.total - a.total);
    return rows;
  }, [filtered, agents]);

  const periodDays = useMemoCS(() => {
    const s = U.parseDate(range.start), e = U.parseDate(range.end);
    if (!s || !e || s > e) return 0;
    return Math.round((e - s) / 86400000) + 1;
  }, [range]);

  function exportCsv() {
    const headers = ["Agent","TL","IAs","Confirms","Transfers","Client $","Your Spiff","TL Bonus","Total Owed"];
    const rows = agentRows.map(r => [
      r.name, r.is_tl ? "Y" : "", r.ia, r.confirms, r.transfers,
      r.client.toFixed(2), r.spiff.toFixed(2), r.tl.toFixed(2), r.total.toFixed(2)
    ]);
    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${campaign.name.replace(/\s+/g, "_")}_${range.label.replace(/\s+/g, "")}_commissions.csv`;
    a.click();
  }

  return (
    <div className="tab-content">
      {/* Period selector + actions */}
      <div className="toolbar">
        <div className="filter-chips">
          {[
            ["this_week","This Week"],
            ["last_week","Last Week"],
            ["month","MTD"],
            ["all","All Time"],
            ["custom","Custom…"],
          ].map(([k, l]) => (
            <button key={k} className={"chip" + (period === k ? " active" : "")} onClick={() => setPeriod(k)}>
              {l}
            </button>
          ))}
        </div>
        {period === "custom" && (
          <>
            <div style={{ width: 170 }}>
              <DatePicker value={customStart} onChange={setCustomStart} placeholder="Start date" clearable/>
            </div>
            <span className="muted">to</span>
            <div style={{ width: 170 }}>
              <DatePicker value={customEnd} onChange={setCustomEnd} placeholder="End date" clearable/>
            </div>
          </>
        )}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <span className="help">
            {U.shortDate(range.start === "0000-00-00" ? today.toISOString().slice(0,10) : range.start)} — {U.shortDate(range.end === "9999-99-99" ? today.toISOString().slice(0,10) : range.end)} · <span className="mono">{filtered.length}</span> leads
          </span>
          {onInviteUser && (
            <button className="btn" onClick={() => setShowInviteViewer(true)} title="Share read-only access with your accountant">
              <Icon name="users" size={12}/> Share with accountant
            </button>
          )}
          <button className="btn" onClick={exportCsv}>
            <Icon name="download" size={12}/> Export CSV
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <Kpi
          tone="accent"
          label="Bill Client"
          value={U.fmtMoney(totals.bill)}
          sub={`${campaign.client} · ${range.label}`}
        />
        <Kpi
          tone="spiff"
          label="Your Spiffs"
          value={U.fmtMoney(totals.spiff)}
          sub="Paid from pocket"
        />
        <Kpi
          tone="tl"
          label="TL Bonuses"
          value={U.fmtMoney(totals.tl)}
          sub="Coaching bonuses"
        />
        <Kpi
          label="Total Payout"
          value={U.fmtMoney(totals.total)}
          sub={`${agentRows.length} agent${agentRows.length === 1 ? "" : "s"} paid`}
        />
      </div>

      {/* Per-agent table */}
      <div className="section-head" style={{ paddingTop: 6 }}>
        <h2>Agent Payout</h2>
        <span className="sub">{periodDays > 0 ? `${periodDays} day${periodDays === 1 ? "" : "s"}` : ""} · sorted by total owed</span>
      </div>

      {agentRows.length === 0 ? (
        <div className="empty">
          <h3>No leads in this period</h3>
          <p>Pick a different range, or log leads in the Lead Log to populate this sheet.</p>
        </div>
      ) : (
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Agent</th>
              <th className="num" style={{ width: 70 }}>IAs</th>
              <th className="num" style={{ width: 90 }}>Confirms</th>
              <th className="num" style={{ width: 90 }}>Transfers</th>
              <th className="num" style={{ width: 100 }}>Client $</th>
              <th className="num" style={{ width: 100 }}>Your Spiff</th>
              <th className="num" style={{ width: 100 }}>TL Bonus</th>
              <th className="num" style={{ width: 110 }}>Total Owed</th>
            </tr>
          </thead>
          <tbody>
            {agentRows.map(r => (
              <tr key={r.agent_id}>
                <td>
                  {r.name}
                  {r.is_tl && <TLBadge small/>}
                </td>
                <td className="num"><span className={r.ia > 0 ? "money money-tl" : "money money-muted"}>{r.ia || "—"}</span></td>
                <td className="num"><span className={r.confirms > 0 ? "money money-pos" : "money money-muted"}>{r.confirms || "—"}</span></td>
                <td className="num"><span className="money money-muted" style={r.transfers > 0 ? { color: "var(--status-transfer-fg)" } : {}}>{r.transfers || "—"}</span></td>
                <td className="num"><Money v={r.client} tone="pos"/></td>
                <td className="num"><Money v={r.spiff} tone="spiff"/></td>
                <td className="num"><Money v={r.tl} tone="tl"/></td>
                <td className="num"><Money v={r.total} bold/></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Totals</td>
              <td className="num money money-tl">{agentRows.reduce((s,r) => s + r.ia, 0) || "—"}</td>
              <td className="num money money-pos">{agentRows.reduce((s,r) => s + r.confirms, 0) || "—"}</td>
              <td className="num money" style={{ color: "var(--status-transfer-fg)" }}>{agentRows.reduce((s,r) => s + r.transfers, 0) || "—"}</td>
              <td className="num money money-pos">{U.fmtMoney(totals.bill)}</td>
              <td className="num money money-spiff">{U.fmtMoney(totals.spiff)}</td>
              <td className="num money money-tl">{U.fmtMoney(totals.tl)}</td>
              <td className="num money money-bold">{U.fmtMoney(totals.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      )}

      {showInviteViewer && (
        <InviteViewerModal
          campaign={campaign}
          onClose={() => setShowInviteViewer(false)}
          onSave={(data) => {
            onInviteUser({ ...data, role: "viewer", campaign_ids: [campaign.id] });
            setShowInviteViewer(false);
          }}
        />
      )}
    </div>
  );
}

function InviteViewerModal({ campaign, onClose, onSave }) {
  const [form, setForm] = useStateCS({ full_name: "", email: "" });
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const canSave = form.full_name.trim() && form.email.includes("@");
  return (
    <Modal
      open
      onClose={onClose}
      title="Share with accountant"
      width="480px"
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => canSave && onSave(form)} disabled={!canSave}>Send invite</button>
        </>
      }
    >
      <div className="stack">
        <div className="help" style={{
          background: "var(--bg-panel-2)",
          padding: "10px 12px",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border-subtle)",
          marginBottom: 4
        }}>
          They'll get <strong style={{ color: "var(--text-2)" }}>read-only access</strong> to the Commission Sheet for <strong style={{ color: "var(--text-2)" }}>{campaign.name}</strong>. No agents, no settings, no other campaigns.
        </div>
        <div className="field">
          <label>Full name</label>
          <input className="input" autoFocus value={form.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="e.g. Sandra Patel"/>
        </div>
        <div className="field">
          <label>Email</label>
          <input className="input" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="accountant@firm.com"/>
        </div>
      </div>
    </Modal>
  );
}

Object.assign(window, { CommissionSheet });

// Lead Log — the hero tab
const { useState: useStateLL, useMemo: useMemoLL, useRef: useRefLL, useEffect: useEffectLL } = React;

function LeadLog({ campaign, agents, leads, onAddLead, onUpdateLead, onDeleteLead }) {
  const [filter, setFilter] = useStateLL("all");
  const [search, setSearch] = useStateLL("");
  const [sort, setSort] = useStateLL({ col: "date", dir: "desc" });
  const [editLead, setEditLead] = useStateLL(null);
  const [showAdd, setShowAdd] = useStateLL(false);
  const [flashId, setFlashId] = useStateLL(null);

  const agentsById = useMemoLL(() => {
    const m = {};
    agents.forEach(a => { m[a.id] = a; });
    return m;
  }, [agents]);

  // Filter pipeline
  const filtered = useMemoLL(() => {
    let arr = leads.filter(l => l.campaign_id === campaign.id);
    if (filter !== "all") arr = arr.filter(l => l.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(l => {
        const a = agentsById[l.agent_id];
        const customer = U.toProperCase(l.customer_name || "");
        const phoneFmt = U.fmtPhone(l.phone || "");
        return customer.toLowerCase().includes(q)
          || phoneFmt.toLowerCase().includes(q)
          || (l.phone || "").toLowerCase().includes(q)
          || (a && a.full_name.toLowerCase().includes(q));
      });
    }
    arr.sort((a, b) => {
      let av, bv;
      switch (sort.col) {
        case "agent":
          av = (agentsById[a.agent_id]?.full_name || "").toLowerCase();
          bv = (agentsById[b.agent_id]?.full_name || "").toLowerCase();
          break;
        case "customer":
          av = U.toProperCase(a.customer_name || "").toLowerCase();
          bv = U.toProperCase(b.customer_name || "").toLowerCase();
          break;
        case "status":
          av = U.STATUS_ORDER.indexOf(a.status); bv = U.STATUS_ORDER.indexOf(b.status); break;
        case "client":
          av = a.client_commission || 0; bv = b.client_commission || 0; break;
        case "total":
          av = (a.client_commission || 0) + (a.spiff || 0) + (a.tl_bonus || 0);
          bv = (b.client_commission || 0) + (b.spiff || 0) + (b.tl_bonus || 0); break;
        default:
          av = a.date + String(a.seq).padStart(6, "0");
          bv = b.date + String(b.seq).padStart(6, "0");
      }
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [leads, campaign.id, filter, search, sort, agentsById]);

  const counts = useMemoLL(() => {
    const c = { all: 0, pending: 0, transfer: 0, confirmed: 0, ia: 0, dnc: 0, bad: 0 };
    leads.forEach(l => {
      if (l.campaign_id !== campaign.id) return;
      c.all++; c[l.status] = (c[l.status] || 0) + 1;
    });
    return c;
  }, [leads, campaign.id]);

  const handleSort = (col) => {
    setSort(s => s.col === col ? { col, dir: s.dir === "asc" ? "desc" : "asc" } : { col, dir: "desc" });
  };

  const triggerFlash = (id) => {
    setFlashId(id);
    setTimeout(() => setFlashId(null), 700);
  };

  return (
    <div className="tab-content">
      {/* Toolbar */}
      <div className="toolbar">
        <div className="filter-chips">
          {[
            ["all", "All"],
            ["pending", "Pending"],
            ["transfer", "Transfer"],
            ["confirmed", "Confirmed"],
            ["ia", "IA"],
            ["dnc", "DNC"],
            ["bad", "Bad"],
          ].map(([k, label]) => (
            <button
              key={k}
              className={"chip" + (filter === k ? " active" : "")}
              onClick={() => setFilter(k)}
            >
              {label}
              <span className="ct">{counts[k] || 0}</span>
            </button>
          ))}
        </div>

        <div className="search-wrap">
          <Icon name="search" />
          <input
            className="input"
            placeholder="Search customer, phone, agent…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <span className="help">
            Showing <span className="mono" style={{ color: "var(--text)" }}>{filtered.length}</span> of{" "}
            <span className="mono" style={{ color: "var(--text)" }}>{counts.all}</span>
          </span>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Icon name="plus" size={13}/> Add Lead
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          {counts.all === 0 ? (
            <>
              <h3>No leads logged yet</h3>
              <p>Add your first lead to start tracking commissions and agent performance.</p>
              <button className="btn btn-primary btn-lg" onClick={() => setShowAdd(true)}>
                <Icon name="plus"/> Add your first lead
              </button>
            </>
          ) : (
            <>
              <h3>No leads match these filters</h3>
              <p>Try clearing the search or switching status.</p>
            </>
          )}
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort("date")} style={{ width: 90 }}>
                  Date {sort.col === "date" && <span className="arrow">{sort.dir === "asc" ? "↑" : "↓"}</span>}
                </th>
                <th style={{ width: 50 }}>Day</th>
                <th className="sortable" onClick={() => handleSort("agent")}>
                  Agent {sort.col === "agent" && <span className="arrow">{sort.dir === "asc" ? "↑" : "↓"}</span>}
                </th>
                <th className="sortable" onClick={() => handleSort("customer")}>
                  Customer {sort.col === "customer" && <span className="arrow">{sort.dir === "asc" ? "↑" : "↓"}</span>}
                </th>
                <th>Phone</th>
                <th className="sortable" onClick={() => handleSort("status")} style={{ width: 110 }}>
                  Status {sort.col === "status" && <span className="arrow">{sort.dir === "asc" ? "↑" : "↓"}</span>}
                </th>
                <th className="num sortable" onClick={() => handleSort("client")} style={{ width: 80 }}>
                  Client $ {sort.col === "client" && <span className="arrow">{sort.dir === "asc" ? "↑" : "↓"}</span>}
                </th>
                <th className="num" style={{ width: 70 }}>Spiff</th>
                <th className="num" style={{ width: 80 }}>TL Bonus</th>
                <th className="num sortable" onClick={() => handleSort("total")} style={{ width: 80 }}>
                  Total {sort.col === "total" && <span className="arrow">{sort.dir === "asc" ? "↑" : "↓"}</span>}
                </th>
                <th style={{ width: 90 }}>Appt</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => {
                const a = agentsById[l.agent_id];
                const tlRec = agents.find(x => x.id === l.tl_recipient_id);
                const total = (l.client_commission || 0) + (l.spiff || 0) + (l.tl_bonus || 0);
                return (
                  <tr
                    key={l.id}
                    className={"clickable" + (flashId === l.id ? " flash" : "")}
                    onClick={() => setEditLead(l)}
                  >
                    <td className="num-l muted">{U.shortDate(l.date)}</td>
                    <td className="muted-2" style={{ fontSize: 11 }}>{U.dayOfWeek(l.date)}</td>
                    <td>
                      <span>{a ? a.full_name : "—"}</span>
                      {a && a.is_tl && <TLBadge small/>}
                    </td>
                    <td>{l.customer_name ? U.toProperCase(l.customer_name) : <span className="muted-2">—</span>}</td>
                    <td className="num-l muted">{l.phone ? U.fmtPhone(l.phone) : "—"}</td>
                    <td>
                      <StatusEditor
                        lead={l}
                        onChange={(newStatus) => {
                          onUpdateLead(l.id, { status: newStatus });
                          triggerFlash(l.id);
                        }}
                      />
                    </td>
                    <td><Money v={l.client_commission} tone="pos"/></td>
                    <td><Money v={l.spiff} tone="spiff"/></td>
                    <td>
                      <Money v={l.tl_bonus} tone="tl"/>
                      {l.tl_bonus > 0 && tlRec && (
                        <div style={{ fontSize: 10, color: "var(--text-4)", textAlign: "right" }}>
                          → {tlRec.full_name.split(" ")[0]}
                        </div>
                      )}
                    </td>
                    <td><Money v={total} bold/></td>
                    <td className="num-l muted">{U.fmtAppt(l.appointment_date, l.appointment_time)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button className="icon-btn" onClick={() => setEditLead(l)} aria-label="Edit">
                        <Icon name="edit"/>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6} className="muted">
                  Totals for {filtered.length} lead{filtered.length === 1 ? "" : "s"}
                </td>
                <td className="num money money-pos">
                  {U.fmtMoney(filtered.reduce((s, l) => s + (l.client_commission || 0), 0))}
                </td>
                <td className="num money money-spiff">
                  {U.fmtMoney(filtered.reduce((s, l) => s + (l.spiff || 0), 0))}
                </td>
                <td className="num money money-tl">
                  {U.fmtMoney(filtered.reduce((s, l) => s + (l.tl_bonus || 0), 0))}
                </td>
                <td className="num money money-bold">
                  {U.fmtMoney(filtered.reduce((s, l) => s + (l.client_commission || 0) + (l.spiff || 0) + (l.tl_bonus || 0), 0))}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {showAdd && (
        <LeadFormModal
          campaign={campaign}
          agents={agents}
          onClose={() => setShowAdd(false)}
          onSave={(lead) => {
            onAddLead(lead);
            setShowAdd(false);
          }}
        />
      )}
      {editLead && (
        <LeadFormModal
          campaign={campaign}
          agents={agents}
          lead={editLead}
          onClose={() => setEditLead(null)}
          onSave={(updates) => {
            onUpdateLead(editLead.id, updates);
            setEditLead(null);
            triggerFlash(editLead.id);
          }}
          onDelete={() => {
            onDeleteLead(editLead.id);
            setEditLead(null);
          }}
        />
      )}
    </div>
  );
}

// ---------- Inline status editor ----------
function StatusEditor({ lead, onChange }) {
  const [open, setOpen] = useStateLL(false);
  const ref = useRefLL(null);
  return (
    <>
      <button
        ref={ref}
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer" }}
      >
        <Pill status={lead.status}/>
      </button>
      <Popover open={open} anchorRef={ref} onClose={() => setOpen(false)}>
        {U.STATUS_ORDER.map(s => (
          <div
            key={s}
            className={"popover-item" + (s === lead.status ? " active" : "")}
            onClick={(e) => { e.stopPropagation(); onChange(s); setOpen(false); }}
          >
            <Pill status={s}/>
            {s === lead.status && (
              <span style={{ marginLeft: "auto", color: "var(--accent)" }}>
                <Icon name="check" size={12}/>
              </span>
            )}
          </div>
        ))}
      </Popover>
    </>
  );
}

// ---------- Add/Edit Lead modal ----------
function LeadFormModal({ campaign, agents, lead, onClose, onSave, onDelete }) {
  const isEdit = !!lead;
  const tls = agents.filter(a => a.is_tl && a.status === "active");
  const activeAgents = agents.filter(a => a.status === "active" || (lead && a.id === lead.agent_id));

  const [form, setForm] = useStateLL(() => ({
    date: lead?.date || (window.MOCK_DATA?.today),
    agent_id: lead?.agent_id || activeAgents[0]?.id || "",
    customer_name: lead?.customer_name || "",
    phone: lead?.phone || "",
    status: lead?.status || "pending",
    spiff: lead?.spiff || 0,
    tl_bonus: lead?.tl_bonus || 0,
    tl_recipient_id: lead?.tl_recipient_id || "",
    appointment_date: lead?.appointment_date || "",
    appointment_time: lead?.appointment_time || "",
    notes: lead?.notes || "",
  }));

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const isApptStatus = form.status === "confirmed" || form.status === "ia";

  const submit = () => {
    if (!form.customer_name.trim()) return;
    onSave({
      ...form,
      spiff: Number(form.spiff) || 0,
      tl_bonus: Number(form.tl_bonus) || 0,
      tl_recipient_id: form.tl_bonus > 0 ? form.tl_recipient_id || null : null,
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? "Edit Lead" : "Add Lead"}
      width="640px"
      footer={
        <>
          {isEdit && (
            <button className="btn btn-danger" onClick={onDelete} style={{ marginRight: "auto" }}>
              <Icon name="trash" size={12}/> Delete
            </button>
          )}
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}>
            {isEdit ? "Save changes" : "Add lead"}
          </button>
        </>
      }
    >
      <div className="stack" style={{ gap: 12 }}>
        <div className="row-3">
          <div className="field">
            <label>Date</label>
            <DatePicker value={form.date} onChange={(v) => update("date", v)}/>
          </div>
          <div className="field">
            <label>Agent</label>
            <Select
              value={form.agent_id}
              onChange={(v) => update("agent_id", v)}
              options={activeAgents.map(a => ({ value: a.id, label: a.full_name + (a.is_tl ? " ★" : "") }))}
            />
          </div>
          <div className="field">
            <label>Status</label>
            <Select
              value={form.status}
              onChange={(v) => update("status", v)}
              options={U.STATUS_ORDER.map(s => ({ value: s, label: U.STATUS_LABEL[s] }))}
            />
          </div>
        </div>

        <div className="row-2">
          <div className="field">
            <label>Customer Name</label>
            <input className="input" value={form.customer_name} onChange={(e) => update("customer_name", e.target.value)} placeholder="e.g. Margaret Thompson"/>
          </div>
          <div className="field">
            <label>Phone</label>
            <input className="input" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="(555) 123-4567"/>
          </div>
        </div>

        <div className="row-3">
          <div className="field">
            <label>Your Spiff ($)</label>
            <div className="field-money">
              <input className="input" type="number" min="0" value={form.spiff} onChange={(e) => update("spiff", e.target.value)}/>
            </div>
          </div>
          <div className="field">
            <label>TL Bonus ($)</label>
            <div className="field-money">
              <input className="input" type="number" min="0" value={form.tl_bonus} onChange={(e) => update("tl_bonus", e.target.value)}/>
            </div>
          </div>
          <div className="field">
            <label>TL Recipient</label>
            <Select
              value={form.tl_recipient_id || ""}
              onChange={(v) => update("tl_recipient_id", v)}
              disabled={!(form.tl_bonus > 0)}
              placeholder="— Select —"
              options={[{ value: "", label: "— Select —" }, ...tls.map(t => ({ value: t.id, label: t.full_name }))]}
            />
          </div>
        </div>

        {isApptStatus && (
          <div className="row-2">
            <div className="field">
              <label>Appointment Date</label>
              <DatePicker value={form.appointment_date} onChange={(v) => update("appointment_date", v)} clearable/>
            </div>
            <div className="field">
              <label>Appointment Time</label>
              <TimePicker value={form.appointment_time} onChange={(v) => update("appointment_time", v)} clearable/>
            </div>
          </div>
        )}

        <div className="field">
          <label>Notes</label>
          <textarea className="input" rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Any context — call-back time, customer concerns, etc."/>
        </div>

        <div className="help" style={{
          background: "var(--bg-panel-2)",
          padding: "10px 12px",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border-subtle)"
        }}>
          <strong style={{ color: "var(--text-2)" }}>Auto-calculated:</strong>{" "}
          Client $ is set from campaign rates ({U.fmtMoney(campaign.rate_ia)}/IA, {U.fmtMoney(campaign.rate_confirmed)}/Confirmed)
          and IA tier logic ({U.fmtMoney(campaign.ia_tier_2)} for 2 same-day, {U.fmtMoney(campaign.ia_tier_3)} for 3). Total = Client $ + Spiff + TL Bonus.
        </div>
      </div>
    </Modal>
  );
}

Object.assign(window, { LeadLog });

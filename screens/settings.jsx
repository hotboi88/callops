// Settings — campaign config + agent roster
const { useState: useStateST, useMemo: useMemoST } = React;

function Settings({ campaign, agents, profile, onUpdateCampaign, onAddAgent, onUpdateAgent, onDeleteCampaign, leadsCount }) {
  const [form, setForm] = useStateST({ ...campaign });
  const [savedFlash, setSavedFlash] = useStateST(false);
  const dirty = Object.keys(form).some(k => form[k] !== campaign[k]);

  const [newAgent, setNewAgent] = useStateST("");
  const [showAlumni, setShowAlumni] = useStateST(false);
  const [confirmReset, setConfirmReset] = useStateST(false);
  const [confirmDelete, setConfirmDelete] = useStateST(false);
  const [deleteText, setDeleteText] = useStateST("");

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const updateNum = (k, v) => setForm(f => ({ ...f, [k]: Math.max(0, Number(v) || 0) }));

  const save = () => {
    onUpdateCampaign(form);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1400);
  };

  const activeAgents = agents.filter(a => a.campaign_id === campaign.id && a.status !== "removed");
  const removed = agents.filter(a => a.campaign_id === campaign.id && a.status === "removed");

  return (
    <div className="tab-content">
      {/* General */}
      <div className="settings-grid" style={{ marginBottom: 24 }}>
        <div className="label-col">
          <h4>General</h4>
          <p>Campaign name and product appear across reports.</p>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="row-2">
            <div className="field">
              <label>Campaign name</label>
              <input className="input" value={form.name} onChange={(e) => update("name", e.target.value)}/>
            </div>
            <div className="field">
              <label>Product</label>
              <input className="input" value={form.client} onChange={(e) => update("client", e.target.value)}/>
            </div>
          </div>
        </div>
      </div>

      {/* Commission rates */}
      <div className="settings-grid" style={{ marginBottom: 24 }}>
        <div className="label-col">
          <h4>Commission rates</h4>
          <p>What the client pays per lead outcome. IA tiers stack daily per agent.</p>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="row-3">
            <div className="field">
              <label>$ per Transfer</label>
              <div className="field-money">
                <input className="input" type="number" min="0" value={form.rate_transfer} onChange={(e) => updateNum("rate_transfer", e.target.value)}/>
              </div>
            </div>
            <div className="field">
              <label>$ per Confirmed</label>
              <div className="field-money">
                <input className="input" type="number" min="0" value={form.rate_confirmed} onChange={(e) => updateNum("rate_confirmed", e.target.value)}/>
              </div>
            </div>
            <div className="field">
              <label>$ per IA (1st)</label>
              <div className="field-money">
                <input className="input" type="number" min="0" value={form.rate_ia} onChange={(e) => updateNum("rate_ia", e.target.value)}/>
              </div>
            </div>
          </div>
          <div className="row-2" style={{ marginTop: 12 }}>
            <div className="field">
              <label>IA Tier 2 — total for 2 IAs same day, same agent</label>
              <div className="field-money">
                <input className="input" type="number" min="0" value={form.ia_tier_2} onChange={(e) => updateNum("ia_tier_2", e.target.value)}/>
              </div>
              <div className="help">2nd IA pays <span className="mono">{U.fmtMoney(Math.max(0, form.ia_tier_2 - form.rate_ia))}</span></div>
            </div>
            <div className="field">
              <label>IA Tier 3 — total for 3 IAs same day</label>
              <div className="field-money">
                <input className="input" type="number" min="0" value={form.ia_tier_3} onChange={(e) => updateNum("ia_tier_3", e.target.value)}/>
              </div>
              <div className="help">3rd IA pays <span className="mono">{U.fmtMoney(Math.max(0, form.ia_tier_3 - form.ia_tier_2))}</span></div>
            </div>
          </div>
          <div className="row" style={{ marginTop: 14, gap: 8 }}>
            <button className="btn btn-primary" onClick={save} disabled={!dirty && !savedFlash}>
              {savedFlash ? <><Icon name="check" size={12}/> Saved</> : dirty ? "Save changes" : "No changes"}
            </button>
            {dirty && (
              <button className="btn btn-ghost" onClick={() => setForm({ ...campaign })}>Discard</button>
            )}
            <div className="help" style={{ marginLeft: "auto" }}>
              Changing rates recomputes all existing leads.
            </div>
          </div>
        </div>
      </div>

      {/* Agent roster */}
      <div className="settings-grid" style={{ marginBottom: 24 }}>
        <div className="label-col">
          <h4>Agent roster</h4>
          <p>{activeAgents.length} on roster · {activeAgents.filter(a => a.is_tl).length} team leads.</p>
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
                <th style={{ width: 110 }}>Status</th>
                <th style={{ width: 80 }}>Role</th>
                <th style={{ width: 100 }}>Added</th>
                <th style={{ width: 180, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeAgents.map(a => (
                <tr key={a.id}>
                  <td>{a.full_name}</td>
                  <td>
                    {a.status === "active"
                      ? <span className="tag" style={{ color: "var(--money-pos)", borderColor: "var(--accent-line)", background: "var(--accent-soft)" }}>Active</span>
                      : <span className="tag tag-inactive">Inactive</span>}
                  </td>
                  <td>{a.is_tl ? <span className="tag tag-tl">★ TL</span> : <span className="tag">Agent</span>}</td>
                  <td className="num-l muted">{U.shortDate(a.date_added)}</td>
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
              {activeAgents.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: 24 }} className="muted">No agents on roster.</td></tr>
              )}
            </tbody>
          </table>

          {removed.length > 0 && (
            <div style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <button
                className="btn btn-ghost"
                style={{ width: "100%", justifyContent: "flex-start", padding: "10px 14px", borderRadius: 0, height: "auto" }}
                onClick={() => setShowAlumni(s => !s)}
              >
                <Icon name={showAlumni ? "chevron" : "chevronRight"} size={12}/>
                Alumni ({removed.length})
              </button>
              {showAlumni && (
                <table className="table" style={{ borderRadius: 0 }}>
                  <tbody>
                    {removed.map(a => (
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

      {/* Data management */}
      <div className="settings-grid">
        <div className="label-col">
          <h4>Data management</h4>
          <p>Backups, restore, and danger zone.</p>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <button className="btn">
              <Icon name="download" size={12}/> Export all data (JSON)
            </button>
            <button className="btn">
              <Icon name="refresh" size={12}/> Import backup
            </button>
          </div>
          <div className="help" style={{ marginTop: 12 }}>
            Export gives you a snapshot of all leads, agents, shifts, and settings for this campaign.
          </div>

          {profile?.role === "admin" ? (
          <div style={{
            marginTop: 18,
            padding: 14,
            border: "1px solid var(--status-dnc-ring)",
            background: "rgba(251, 113, 133, 0.04)",
            borderRadius: "var(--radius)"
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--status-dnc-fg)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
              Danger zone
            </div>
            <div className="spread" style={{ marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 12.5, color: "var(--text)", fontWeight: 500 }}>Reset campaign data</div>
                <div className="help" style={{ marginTop: 2 }}>
                  Clears all <span className="mono" style={{ color: "var(--text-2)" }}>{leadsCount}</span> leads, shift logs, and attendance. Agents and rates stay.
                </div>
              </div>
              <button className="btn btn-danger" onClick={() => setConfirmReset(true)}>
                <Icon name="refresh" size={12}/> Reset data
              </button>
            </div>
            <div className="spread" style={{ paddingTop: 10, borderTop: "1px solid var(--border-subtle)" }}>
              <div>
                <div style={{ fontSize: 12.5, color: "var(--text)", fontWeight: 500 }}>Delete this campaign</div>
                <div className="help" style={{ marginTop: 2 }}>
                  Permanently deletes <strong style={{ color: "var(--text-2)" }}>{campaign.name}</strong>, all its agents, leads, and history. This cannot be undone.
                </div>
              </div>
              <button className="btn btn-danger" onClick={() => { setConfirmDelete(true); setDeleteText(""); }}>
                <Icon name="trash" size={12}/> Delete campaign
              </button>
            </div>
          </div>
          ) : (
            <div className="help" style={{
              marginTop: 18,
              padding: "10px 12px",
              background: "var(--bg-panel-2)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)"
            }}>
              Resetting or deleting a campaign is restricted to admins. Ask your admin if you need this.
            </div>
          )}
        </div>
      </div>

      {confirmReset && (
        <Modal
          open
          onClose={() => setConfirmReset(false)}
          title="Reset this campaign?"
          width="440px"
          footer={
            <>
              <button className="btn" onClick={() => setConfirmReset(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => setConfirmReset(false)}>
                Yes, reset (demo)
              </button>
            </>
          }
        >
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)" }}>
            This will delete all leads, shift logs, and attendance records for <strong>{campaign.name}</strong>. Agents and commission settings are kept.
          </p>
          <p style={{ marginTop: 10, marginBottom: 0, fontSize: 12, color: "var(--text-3)" }}>
            (In this prototype, the demo data won't actually be deleted.)
          </p>
        </Modal>
      )}

      {confirmDelete && (
        <Modal
          open
          onClose={() => setConfirmDelete(false)}
          title="Delete this campaign?"
          width="480px"
          footer={
            <>
              <button className="btn" onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button
                className="btn btn-danger"
                disabled={deleteText !== campaign.name}
                style={deleteText !== campaign.name ? { opacity: 0.4, cursor: "not-allowed" } : {}}
                onClick={() => {
                  if (deleteText === campaign.name) {
                    onDeleteCampaign && onDeleteCampaign();
                  }
                }}
              >
                <Icon name="trash" size={12}/> Permanently delete
              </button>
            </>
          }
        >
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)" }}>
            This will permanently delete <strong>{campaign.name}</strong> and everything tied to it: <span className="mono" style={{ color: "var(--text-2)" }}>{leadsCount}</span> leads, all agents, shift logs, attendance, and settings. <strong style={{ color: "var(--status-dnc-fg)" }}>This cannot be undone.</strong>
          </p>
          <div className="field" style={{ marginTop: 16 }}>
            <label>Type <span className="mono" style={{ color: "var(--text)" }}>{campaign.name}</span> to confirm</label>
            <input
              className="input"
              autoFocus
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              placeholder={campaign.name}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

Object.assign(window, { Settings });

// Admin Tools — Users management + Audit Log
const { useState: useStateAD, useMemo: useMemoAD, useRef: useRefAD } = React;

function AdminTools({ users, campaigns, auditLog, profile, rolePerms, userOverrides, onInviteUser, onUpdateUser, onSuspendUser, onDeleteUser, onResendInvite, onUpdateRolePerms, onUpdateUserOverrides, onImpersonate, onBack }) {
  const [tab, setTab] = useStateAD("users");

  return (
    <div className="tab-content">
      <div style={{ marginBottom: 16 }}>
        <div className="row" style={{ marginBottom: 6 }}>
          <button className="btn btn-ghost btn-sm" onClick={onBack}>
            <Icon name="arrowLeft" size={12}/> Back to campaigns
          </button>
        </div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>
          Admin Tools
          <span className="tag tag-admin" style={{ marginLeft: 10, verticalAlign: "middle" }}>admin only</span>
        </h1>
        <div className="help" style={{ marginTop: 4 }}>
          Manage logins, view system activity, and oversee the workspace.
        </div>
      </div>

      <div className="tabs" style={{
        position: "static",
        margin: "0 -18px 16px",
        padding: "0 18px",
        borderBottom: "1px solid var(--border-subtle)"
      }}>
        {[
          ["users", "Users", "users", users.length],
          ["permissions", "Permissions", "settings", null],
          ["audit", "Audit Log", "activity", auditLog.length],
        ].map(([k, label, icon, count]) => (
          <button key={k} className={"tab" + (tab === k ? " active" : "")} onClick={() => setTab(k)}>
            <Icon name={icon} size={13}/> {label}
            {count != null && <span className="tab-count">{count}</span>}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <UsersTab
          users={users}
          campaigns={campaigns}
          profile={profile}
          rolePerms={rolePerms}
          userOverrides={userOverrides}
          onInviteUser={onInviteUser}
          onUpdateUser={onUpdateUser}
          onSuspendUser={onSuspendUser}
          onDeleteUser={onDeleteUser}
          onResendInvite={onResendInvite}
          onUpdateUserOverrides={onUpdateUserOverrides}
          onImpersonate={onImpersonate}
        />
      )}
      {tab === "permissions" && (
        <PermissionsTab
          rolePerms={rolePerms}
          onUpdateRolePerms={onUpdateRolePerms}
        />
      )}
      {tab === "audit" && (
        <AuditTab auditLog={auditLog} campaigns={campaigns} users={users}/>
      )}
    </div>
  );
}

// ============================ USERS TAB ============================
function UsersTab({ users, campaigns, profile, rolePerms, userOverrides, onInviteUser, onUpdateUser, onSuspendUser, onDeleteUser, onResendInvite, onUpdateUserOverrides, onImpersonate }) {
  const [search, setSearch] = useStateAD("");
  const [showInvite, setShowInvite] = useStateAD(false);
  const [editUser, setEditUser] = useStateAD(null);
  const [confirmDelete, setConfirmDelete] = useStateAD(null);

  const filtered = useMemoAD(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u =>
      u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  }, [users, search]);

  const stats = useMemoAD(() => ({
    total: users.length,
    active: users.filter(u => u.status === "active").length,
    invited: users.filter(u => u.status === "invited").length,
    suspended: users.filter(u => u.status === "suspended").length,
    admins: users.filter(u => u.role === "admin").length,
  }), [users]);

  return (
    <>
      {/* KPI strip */}
      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <Kpi label="Total users" value={U.fmtNum(stats.total)}/>
        <Kpi tone="accent" label="Active" value={U.fmtNum(stats.active)} sub={`${stats.admins} admin${stats.admins === 1 ? "" : "s"}`}/>
        <Kpi tone="spiff" label="Pending invites" value={U.fmtNum(stats.invited, { dashZero: true })}/>
        <Kpi label="Suspended" value={U.fmtNum(stats.suspended, { dashZero: true })}/>
      </div>

      <div className="toolbar" style={{ paddingBottom: 12 }}>
        <div className="search-wrap" style={{ maxWidth: 320 }}>
          <Icon name="search"/>
          <input
            className="input"
            placeholder="Search by name, email, role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ marginLeft: "auto" }}>
          <button className="btn btn-primary" onClick={() => setShowInvite(true)}>
            <Icon name="plus" size={13}/> Invite User
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th style={{ width: 100 }}>Role</th>
              <th style={{ width: 110 }}>Status</th>
              <th>Campaigns</th>
              <th style={{ width: 130 }}>Last active</th>
              <th style={{ width: 110 }}>Added</th>
              <th style={{ width: 180, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => {
              const isSelf = u.id === profile.id;
              const isActive = u.status === "active";
              const isInvited = u.status === "invited";
              const isSuspended = u.status === "suspended";
              const campaignNames = u.campaign_ids.length === 0
                ? <span className="muted-2">— none —</span>
                : (
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {u.campaign_ids.map(cid => {
                      const c = campaigns.find(x => x.id === cid);
                      if (!c) return null;
                      return <span key={cid} className="tag">{c.name}</span>;
                    })}
                  </div>
                );
              return (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{
                        width: 26, height: 26, borderRadius: 999,
                        background: u.role === "admin" ? "var(--status-ia-bg)" : "var(--bg-panel-2)",
                        color: u.role === "admin" ? "var(--status-ia-fg)" : "var(--text-2)",
                        display: "grid", placeItems: "center",
                        fontFamily: "Geist Mono, monospace",
                        fontSize: 11, fontWeight: 600,
                        border: u.role === "admin" ? "1px solid var(--status-ia-ring)" : "1px solid var(--border-subtle)"
                      }}>{u.initials}</span>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span>
                          {u.full_name}
                          {isSelf && <span className="tag" style={{ marginLeft: 6, color: "var(--accent)", borderColor: "var(--accent-line)", background: "var(--accent-soft)" }}>you</span>}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--text-3)" }}>{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {u.role === "admin"
                      ? <span className="tag tag-admin">admin</span>
                      : u.role === "manager"
                        ? <span className="tag">manager</span>
                        : <span className="tag">viewer</span>}
                  </td>
                  <td>
                    {isActive && <span className="tag" style={{ color: "var(--money-pos)", borderColor: "var(--accent-line)", background: "var(--accent-soft)" }}>● active</span>}
                    {isInvited && <span className="tag" style={{ color: "var(--money-spiff)", borderColor: "rgba(251,191,36,0.3)", background: "rgba(251,191,36,0.1)" }}>● invited</span>}
                    {isSuspended && <span className="tag" style={{ color: "var(--status-dnc-fg)", borderColor: "var(--status-dnc-ring)", background: "var(--status-dnc-bg)" }}>● suspended</span>}
                  </td>
                  <td>{campaignNames}</td>
                  <td className="num-l muted">{U.relTime(u.last_active)}</td>
                  <td className="num-l muted">{U.relTime(u.created_at)}</td>
                  <td style={{ textAlign: "right" }}>
                    {!isSelf && isActive && (
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => onImpersonate && onImpersonate(u.id)}
                        title={`View the app as ${u.full_name}`}
                      >
                        <Icon name="user" size={11}/> View as
                      </button>
                    )}
                    {isInvited && (
                      <button className="btn btn-sm btn-ghost" onClick={() => onResendInvite(u.id)}>
                        Resend
                      </button>
                    )}
                    <button className="btn btn-sm btn-ghost" onClick={() => setEditUser(u)} disabled={isSelf}>
                      Edit
                    </button>
                    {!isSelf && (
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => onSuspendUser(u.id)}
                        style={{ color: isSuspended ? "var(--money-pos)" : "var(--status-dnc-fg)" }}
                      >
                        {isSuspended ? "Reactivate" : "Suspend"}
                      </button>
                    )}
                    {!isSelf && (
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => setConfirmDelete(u)}
                        style={{ color: "var(--status-dnc-fg)" }}
                      >
                        <Icon name="trash" size={11}/>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: 32 }} className="muted">No users match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showInvite && (
        <InviteUserModal
          campaigns={campaigns}
          onClose={() => setShowInvite(false)}
          onSave={(data) => { onInviteUser(data); setShowInvite(false); }}
        />
      )}
      {editUser && (
        <EditUserModal
          user={editUser}
          campaigns={campaigns}
          rolePerms={rolePerms}
          userOverrides={userOverrides}
          onClose={() => setEditUser(null)}
          onSave={(updates) => { onUpdateUser(editUser.id, updates); setEditUser(null); }}
          onUpdateOverrides={(ov) => onUpdateUserOverrides(editUser.id, ov)}
        />
      )}
      {confirmDelete && (
        <Modal
          open
          title="Delete user?"
          onClose={() => setConfirmDelete(null)}
          width="440px"
          footer={
            <>
              <button className="btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => { onDeleteUser(confirmDelete.id); setConfirmDelete(null); }}>
                Delete user
              </button>
            </>
          }
        >
          <p style={{ margin: 0, fontSize: 13 }}>
            Permanently delete <strong>{confirmDelete.full_name}</strong> ({confirmDelete.email})?
            They'll lose access immediately and you'd have to re-invite them.
          </p>
        </Modal>
      )}
    </>
  );
}

// ============================ INVITE / EDIT MODALS ============================
function InviteUserModal({ campaigns, onClose, onSave }) {
  const [form, setForm] = useStateAD({
    full_name: "",
    email: "",
    role: "manager",
    campaign_ids: [],
  });
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleCampaign = (cid) => {
    setForm(f => ({
      ...f,
      campaign_ids: f.campaign_ids.includes(cid)
        ? f.campaign_ids.filter(x => x !== cid)
        : [...f.campaign_ids, cid]
    }));
  };
  const canSave = form.full_name.trim() && form.email.includes("@");

  return (
    <Modal
      open
      onClose={onClose}
      title="Invite a new user"
      width="540px"
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => canSave && onSave(form)} disabled={!canSave}>
            Send invite
          </button>
        </>
      }
    >
      <div className="stack">
        <div className="row-2">
          <div className="field">
            <label>Full name</label>
            <input className="input" autoFocus value={form.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="e.g. Devon Reyes"/>
          </div>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="devon@callops.io"/>
          </div>
        </div>
        <div className="field">
          <label>Role</label>
          <div className="filter-chips" style={{ alignSelf: "flex-start" }}>
            {[
              ["manager", "Manager", "Can manage assigned campaigns only"],
              ["admin", "Admin", "Full access to everything"],
              ["viewer", "Viewer", "Read-only access (e.g. accountants)"],
            ].map(([k, label, sub]) => (
              <button
                key={k}
                className={"chip" + (form.role === k ? " active" : "")}
                onClick={() => update("role", k)}
                title={sub}
                type="button"
              >{label}</button>
            ))}
          </div>
          <div className="help" style={{ marginTop: 2 }}>
            {form.role === "admin" && "Full access to all campaigns, users, and settings."}
            {form.role === "manager" && "Can manage leads/agents for assigned campaigns only."}
            {form.role === "viewer" && "Read-only commission sheet access. Useful for accountants."}
          </div>
        </div>

        {form.role !== "admin" && (
          <div className="field">
            <label>Assign to campaigns</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
              {campaigns.map(c => (
                <button
                  key={c.id}
                  className={"chip" + (form.campaign_ids.includes(c.id) ? " active" : "")}
                  type="button"
                  onClick={() => toggleCampaign(c.id)}
                  style={{
                    border: "1px solid var(--border)",
                    background: form.campaign_ids.includes(c.id) ? "var(--accent-soft)" : "var(--bg-elev)",
                    color: form.campaign_ids.includes(c.id) ? "var(--accent)" : "var(--text-2)",
                  }}
                >
                  {form.campaign_ids.includes(c.id) && <Icon name="check" size={11}/>}
                  {c.name}
                </button>
              ))}
            </div>
            {form.campaign_ids.length === 0 && (
              <div className="help" style={{ marginTop: 4, color: "var(--money-spiff)" }}>
                ⚠ No campaigns selected — they won't see anything until you assign at least one.
              </div>
            )}
          </div>
        )}

        <div className="help" style={{
          background: "var(--bg-panel-2)",
          padding: "10px 12px",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border-subtle)",
        }}>
          They'll receive an email at <strong style={{ color: "var(--text-2)" }}>{form.email || "their email"}</strong> with a link to set their password and sign in.
        </div>
      </div>
    </Modal>
  );
}

function EditUserModal({ user, campaigns, rolePerms, userOverrides, onClose, onSave, onUpdateOverrides }) {
  const [form, setForm] = useStateAD({
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    campaign_ids: [...user.campaign_ids],
  });
  const [overrides, setOverrides] = useStateAD(userOverrides[user.id] || {});
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleCampaign = (cid) => {
    setForm(f => ({
      ...f,
      campaign_ids: f.campaign_ids.includes(cid)
        ? f.campaign_ids.filter(x => x !== cid)
        : [...f.campaign_ids, cid]
    }));
  };

  // Build a virtual user object so the override UI uses the in-progress role selection
  const virtualUser = { ...user, role: form.role };
  const virtualOverrides = { ...userOverrides, [user.id]: overrides };

  const handleSave = () => {
    onSave(form);
    onUpdateOverrides && onUpdateOverrides(overrides);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Edit ${user.full_name}`}
      width="620px"
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save changes</button>
        </>
      }
    >
      <div className="stack">
        <div className="row-2">
          <div className="field">
            <label>Full name</label>
            <input className="input" value={form.full_name} onChange={(e) => update("full_name", e.target.value)}/>
          </div>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => update("email", e.target.value)}/>
          </div>
        </div>
        <div className="field">
          <label>Role</label>
          <div className="filter-chips">
            {["manager","admin","viewer"].map(r => (
              <button key={r} type="button" className={"chip" + (form.role === r ? " active" : "")} onClick={() => update("role", r)}>{r}</button>
            ))}
          </div>
        </div>
        {form.role !== "admin" && (
          <div className="field">
            <label>Assigned campaigns</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {campaigns.map(c => (
                <button
                  key={c.id}
                  className={"chip" + (form.campaign_ids.includes(c.id) ? " active" : "")}
                  type="button"
                  onClick={() => toggleCampaign(c.id)}
                  style={{
                    border: "1px solid var(--border)",
                    background: form.campaign_ids.includes(c.id) ? "var(--accent-soft)" : "var(--bg-elev)",
                    color: form.campaign_ids.includes(c.id) ? "var(--accent)" : "var(--text-2)",
                  }}
                >
                  {form.campaign_ids.includes(c.id) && <Icon name="check" size={11}/>}
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="divider"/>
        <UserPermissionOverrides
          user={virtualUser}
          rolePerms={rolePerms}
          userOverrides={virtualOverrides}
          onChange={setOverrides}
        />
      </div>
    </Modal>
  );
}

// ============================ AUDIT TAB ============================
const AUDIT_CATEGORIES = [
  ["all", "All", null],
  ["auth", "Auth", "Sign in / out"],
  ["leads", "Leads", null],
  ["agents", "Agents", null],
  ["campaigns", "Campaigns", null],
  ["floor", "Floor", "Shifts & attendance"],
  ["users", "Users", null],
];

function AuditTab({ auditLog, campaigns, users }) {
  const [cat, setCat] = useStateAD("all");
  const [search, setSearch] = useStateAD("");
  const [range, setRange] = useStateAD("7"); // days

  const filtered = useMemoAD(() => {
    let arr = auditLog;
    if (cat !== "all") arr = arr.filter(e => e.category === cat);
    if (range !== "all") {
      const days = Number(range);
      const cutoff = new Date(window.MOCK_TODAY.getTime() - days * 86400000);
      arr = arr.filter(e => new Date(e.ts) >= cutoff);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(e =>
        e.description.toLowerCase().includes(q) ||
        e.actor_name.toLowerCase().includes(q) ||
        (e.campaign_name || "").toLowerCase().includes(q)
      );
    }
    return arr;
  }, [auditLog, cat, search, range]);

  const catCounts = useMemoAD(() => {
    const c = { all: auditLog.length };
    auditLog.forEach(e => { c[e.category] = (c[e.category] || 0) + 1; });
    return c;
  }, [auditLog]);

  // Group by day for readability
  const grouped = useMemoAD(() => {
    const m = {};
    filtered.forEach(e => {
      const day = e.ts.slice(0, 10);
      (m[day] ||= []).push(e);
    });
    return Object.entries(m).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  return (
    <>
      <div className="toolbar" style={{ paddingBottom: 8 }}>
        <div className="filter-chips">
          {AUDIT_CATEGORIES.map(([k, label, sub]) => (
            <button
              key={k}
              className={"chip" + (cat === k ? " active" : "")}
              onClick={() => setCat(k)}
              title={sub || ""}
            >
              {label}
              <span className="ct">{catCounts[k] || 0}</span>
            </button>
          ))}
        </div>
        <div className="search-wrap">
          <Icon name="search"/>
          <input
            className="input"
            placeholder="Search actor, action, target…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <span className="help">Range:</span>
          <div className="filter-chips">
            {[["1","Today"], ["7","7d"], ["30","30d"], ["all","All"]].map(([k, l]) => (
              <button key={k} className={"chip" + (range === k ? " active" : "")} onClick={() => setRange(k)}>{l}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="help" style={{ marginBottom: 12 }}>
        Showing <span className="mono" style={{ color: "var(--text)" }}>{filtered.length}</span> of{" "}
        <span className="mono" style={{ color: "var(--text)" }}>{auditLog.length}</span> events.
        Auto-saved · not editable.
      </div>

      {grouped.length === 0 ? (
        <div className="empty">
          <h3>No events match these filters</h3>
          <p>Try a wider time range or different category.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {grouped.map(([day, entries], gi) => (
            <div key={day} style={{ borderTop: gi === 0 ? "none" : "1px solid var(--border-subtle)" }}>
              <div style={{
                position: "sticky", top: 0,
                background: "var(--bg-panel-2)",
                padding: "6px 14px",
                fontSize: 11,
                color: "var(--text-3)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontWeight: 500,
                borderBottom: "1px solid var(--border-subtle)",
                zIndex: 1,
              }}>
                {U.dayOfWeekFull(day)} · {U.shortDate(day)} <span className="muted-2" style={{ marginLeft: 6 }}>· {entries.length}</span>
              </div>
              {entries.map(e => <AuditRow key={e.id} entry={e}/>)}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function AuditRow({ entry }) {
  // Color & icon for category
  const CAT_META = {
    auth:      { dot: "var(--text-3)" },
    leads:     { dot: "var(--status-transfer-fg)" },
    agents:    { dot: "var(--money-pos)" },
    campaigns: { dot: "var(--accent)" },
    floor:     { dot: "var(--money-spiff)" },
    users:     { dot: "var(--status-ia-fg)" },
  };
  const meta = CAT_META[entry.category] || { dot: "var(--text-3)" };
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "12px 76px 1fr 180px 90px",
      gap: 12,
      padding: "8px 14px",
      borderTop: "1px solid var(--border-subtle)",
      alignItems: "center",
      fontSize: 12.5,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: meta.dot }}/>
      <span className="mono" style={{ fontSize: 11, color: "var(--text-4)" }}>{U.absTime(entry.ts).split(" ").slice(1).join(" ")}</span>
      <span style={{ color: "var(--text)" }}>
        <span style={{ color: "var(--text-2)" }}>{entry.actor_name}</span>
        <span style={{ color: "var(--text-4)" }}> · </span>
        {entry.description}
      </span>
      <span style={{ fontSize: 11, color: "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {entry.campaign_name || ""}
      </span>
      <span style={{ fontSize: 10, color: "var(--text-4)", textAlign: "right", fontFamily: "Geist Mono, monospace", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {entry.kind}
      </span>
    </div>
  );
}

// ============================ PERMISSIONS TAB ============================
function PermissionsTab({ rolePerms, onUpdateRolePerms }) {
  const ROLES = ["admin", "manager", "viewer"];
  const groups = window.groupPerms();
  const groupOrder = ["Access", "Daily ops", "Campaign", "Users"];

  const getVal = (role, key) => {
    const overrides = rolePerms[role] || {};
    if (key in overrides) return overrides[key];
    return window.ROLE_DEFAULTS[role]?.[key] ?? false;
  };

  const toggle = (role, key) => {
    onUpdateRolePerms(role, key, !getVal(role, key));
  };

  const resetRole = (role) => {
    onUpdateRolePerms(role, "__reset__", null);
  };

  // Count: how many perms differ from defaults per role
  const driftCount = (role) => {
    const ov = rolePerms[role] || {};
    let n = 0;
    window.PERMS.forEach(p => {
      if (p.key in ov && ov[p.key] !== window.ROLE_DEFAULTS[role][p.key]) n++;
    });
    return n;
  };

  return (
    <>
      <div className="help" style={{ marginBottom: 14 }}>
        Toggle what each role can do by default. Per-user overrides (in the Users tab → Edit) take precedence. Admins automatically have everything unless you explicitly remove permissions.
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {/* Header */}
        <div className="perm-header">
          <div>Permission</div>
          {ROLES.map(r => {
            const drift = driftCount(r);
            return (
              <div key={r} className="perm-role-col">
                <div className="row" style={{ justifyContent: "center", gap: 6 }}>
                  <span className={"tag" + (r === "admin" ? " tag-admin" : "")} style={r === "admin" ? {} : { color: "var(--text-2)", textTransform: "capitalize" }}>{r}</span>
                  {drift > 0 && (
                    <button className="btn btn-sm btn-ghost" onClick={() => resetRole(r)} title="Reset to default" style={{ padding: "2px 6px", height: 18, fontSize: 10 }}>
                      <Icon name="refresh" size={9}/> reset
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Groups */}
        {groupOrder.map(g => (
          <div key={g}>
            <div className="perm-group-head">{g}</div>
            {(groups[g] || []).map(p => (
              <div key={p.key} className="perm-row">
                <div className="perm-meta">
                  <div className="perm-name">{p.label}</div>
                  <div className="perm-desc">{p.desc}</div>
                </div>
                {ROLES.map(r => {
                  const v = getVal(r, p.key);
                  const overridden = (rolePerms[r] || {})[p.key] !== undefined
                    && (rolePerms[r] || {})[p.key] !== window.ROLE_DEFAULTS[r][p.key];
                  return (
                    <div key={r} className="perm-role-col">
                      <button
                        type="button"
                        className={"perm-toggle" + (v ? " on" : "") + (overridden ? " overridden" : "")}
                        onClick={() => toggle(r, p.key)}
                        title={overridden ? "Differs from default" : (v ? "Enabled" : "Disabled")}
                        aria-label={`${p.label} for ${r}`}
                      >
                        <span className="perm-knob"/>
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

// ============================ USER PERMISSION OVERRIDES (inside EditUserModal) ============================
function UserPermissionOverrides({ user, rolePerms, userOverrides, onChange }) {
  const userOv = (userOverrides[user.id] || {});
  const groups = window.groupPerms();
  const groupOrder = ["Access", "Daily ops", "Campaign", "Users"];

  const roleDefault = (key) => {
    const role = user.role;
    const rolePermOverrides = rolePerms[role] || {};
    if (key in rolePermOverrides) return rolePermOverrides[key];
    return window.ROLE_DEFAULTS[role]?.[key] ?? false;
  };

  const effective = (key) => {
    if (key in userOv) return userOv[key];
    return roleDefault(key);
  };

  const setOverride = (key, val) => {
    onChange({ ...userOv, [key]: val });
  };
  const clearOverride = (key) => {
    const next = { ...userOv };
    delete next[key];
    onChange(next);
  };

  const overrideCount = Object.keys(userOv).length;

  return (
    <div>
      <div className="row" style={{ marginBottom: 8 }}>
        <strong style={{ fontSize: 12.5 }}>Permission overrides</strong>
        <span className="help" style={{ marginLeft: "auto" }}>
          {overrideCount > 0 ? (
            <>
              <span className="mono" style={{ color: "var(--accent)" }}>{overrideCount}</span> override{overrideCount === 1 ? "" : "s"}
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => onChange({})} style={{ marginLeft: 6, padding: "2px 8px", height: 20 }}>
                Reset all
              </button>
            </>
          ) : (
            <span className="muted-2">Following <strong style={{ color: "var(--text-3)" }}>{user.role}</strong> role defaults</span>
          )}
        </span>
      </div>

      <div style={{
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-sm)",
        overflow: "hidden",
        background: "var(--bg-panel)",
        maxHeight: 320,
        overflowY: "auto"
      }}>
        {groupOrder.map(g => (
          <div key={g}>
            <div className="perm-group-head" style={{ padding: "6px 12px", fontSize: 10 }}>{g}</div>
            {(groups[g] || []).map(p => {
              const isOverride = p.key in userOv;
              const eff = effective(p.key);
              const def = roleDefault(p.key);
              return (
                <div key={p.key} style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  borderTop: "1px solid var(--border-subtle)",
                  fontSize: 12,
                }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: "var(--text)" }}>{p.label}</div>
                    <div className="help" style={{ marginTop: 1, fontSize: 11 }}>
                      Default: <span style={{ color: def ? "var(--money-pos)" : "var(--text-3)" }}>{def ? "allowed" : "denied"}</span>
                    </div>
                  </div>
                  {isOverride && (
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => clearOverride(p.key)} title="Use role default" style={{ padding: "2px 6px", height: 20, fontSize: 10 }}>
                      <Icon name="refresh" size={10}/> default
                    </button>
                  )}
                  {!isOverride && <span/>}
                  <button
                    type="button"
                    className={"perm-toggle" + (eff ? " on" : "") + (isOverride ? " overridden" : "")}
                    onClick={() => setOverride(p.key, !eff)}
                  >
                    <span className="perm-knob"/>
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { AdminTools, UserPermissionOverrides });

// Permission system — keys, defaults, can() helper
// Loaded before any app code so window.PERMS / can() are universally available.

(function () {
  const PERMS = [
    // Access & navigation
    { key: "view_all_campaigns", group: "Access", label: "View all campaigns", desc: "See the directory and switch between any campaign" },
    { key: "view_audit_log",     group: "Access", label: "View audit log",     desc: "See the full activity history across the workspace" },

    // Lead & day-to-day work
    { key: "manage_leads",       group: "Daily ops", label: "Manage leads",      desc: "Add, edit, change status, and delete leads" },
    { key: "manage_agents",      group: "Daily ops", label: "Manage agents",     desc: "Add agents, toggle TL status, deactivate, remove" },
    { key: "log_shifts",         group: "Daily ops", label: "Log shifts",        desc: "Record agents on the floor each day" },
    { key: "manage_attendance",  group: "Daily ops", label: "Override attendance", desc: "Manually mark agents present/absent/off" },

    // Campaign-level
    { key: "edit_campaign_settings", group: "Campaign", label: "Edit campaign settings", desc: "Change campaign name, product, and commission rates" },
    { key: "reset_campaign_data",    group: "Campaign", label: "Reset campaign data",    desc: "Wipe all leads, shifts, and attendance" },
    { key: "delete_campaign",        group: "Campaign", label: "Delete campaign",        desc: "Permanently delete a campaign and all of its data" },
    { key: "create_campaigns",       group: "Campaign", label: "Create new campaigns",   desc: "Create new campaigns from the directory" },

    // User management
    { key: "invite_viewers",  group: "Users", label: "Invite viewers (accountants)", desc: "Share read-only commission access" },
    { key: "invite_managers", group: "Users", label: "Invite managers",              desc: "Add managers to one or more campaigns" },
    { key: "invite_admins",   group: "Users", label: "Invite admins",                desc: "Grant full administrative access" },
    { key: "manage_users",    group: "Users", label: "Manage users",                 desc: "Edit, suspend, or delete any user" },
    { key: "manage_permissions", group: "Users", label: "Manage permissions",        desc: "Change role defaults and per-user overrides" },
  ];

  const ROLE_DEFAULTS = {
    admin: Object.fromEntries(PERMS.map(p => [p.key, true])),
    manager: {
      view_all_campaigns: false,
      view_audit_log: false,
      manage_leads: true,
      manage_agents: true,
      log_shifts: true,
      manage_attendance: true,
      edit_campaign_settings: true,
      reset_campaign_data: false,
      delete_campaign: false,
      create_campaigns: false,
      invite_viewers: true,
      invite_managers: false,
      invite_admins: false,
      manage_users: false,
      manage_permissions: false,
    },
    viewer: Object.fromEntries(PERMS.map(p => [p.key, false])),
  };

  // can(profile, permKey, { rolePerms, userOverrides })
  //   profile: { id, role }
  //   rolePerms: { [role]: { [permKey]: bool } } — overrides role defaults
  //   userOverrides: { [userId]: { [permKey]: bool } } — overrides per user
  function can(profile, permKey, opts) {
    if (!profile) return false;
    opts = opts || {};
    const userOv = opts.userOverrides?.[profile.id];
    if (userOv && permKey in userOv) return !!userOv[permKey];
    const role = profile.role;
    // Merge defaults under any role-level overrides so {} doesn't blank out perms
    const merged = {
      ...(ROLE_DEFAULTS[role] || {}),
      ...((opts.rolePerms && opts.rolePerms[role]) || {})
    };
    return !!merged[permKey];
  }

  // Group permissions for UI rendering
  function groupPerms() {
    const groups = {};
    PERMS.forEach(p => { (groups[p.group] ||= []).push(p); });
    return groups;
  }

  window.PERMS = PERMS;
  window.ROLE_DEFAULTS = ROLE_DEFAULTS;
  window.can = can;
  window.groupPerms = groupPerms;
})();

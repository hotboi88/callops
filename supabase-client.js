// CallOps — Supabase client wrapper
// Exposes window.SB with .auth, .data, .invites helpers.
// No-op when CONFIG.USE_SUPABASE is false (skeleton still runs on MOCK_DATA).
(function () {
  const C = window.CONFIG || {};
  if (!C.USE_SUPABASE || !C.SUPABASE_URL || !C.SUPABASE_ANON_KEY) {
    window.SB = null;
    return;
  }
  if (!window.supabase || !window.supabase.createClient) {
    console.error("Supabase SDK missing — check index.html script tags.");
    window.SB = null;
    return;
  }

  const client = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });

  // ─── AUTH ────────────────────────────────────────────────────
  const auth = {
    async signInWithEmail(email, password) {
      const { error } = await client.auth.signInWithPassword({
        email: String(email).trim().toLowerCase(),
        password,
      });
      if (error) throw error;
    },
    async signUpWithEmail(email, password) {
      const { data, error } = await client.auth.signUp({
        email: String(email).trim().toLowerCase(),
        password,
      });
      if (error) throw error;
      return data; // data.session is null when email confirmation is still required
    },
    async signOut() {
      await client.auth.signOut();
    },
    async getSession() {
      const { data } = await client.auth.getSession();
      return data.session;
    },
    async getProfile() {
      const session = await auth.getSession();
      if (!session) return null;
      const { data, error } = await client
        .from("profiles").select("*").eq("id", session.user.id).maybeSingle();
      if (error) throw error;
      return data; // null = authenticated but uninvited (access denied)
    },
    onAuthChange(cb) {
      const { data } = client.auth.onAuthStateChange((event, session) => cb(event, session));
      return () => data.subscription.unsubscribe();
    },
  };

  // ─── DATA (reads) ────────────────────────────────────────────
  const data = {
    async listCampaigns() {
      const { data, error } = await client.from("campaigns").select("*").eq("archived", false).order("created_at");
      if (error) throw error;
      return data || [];
    },
    async listAgents(campaignId) {
      const { data, error } = await client.from("agents").select("*").eq("campaign_id", campaignId).order("full_name");
      if (error) throw error;
      return data || [];
    },
    async listLeads(campaignId) {
      const { data, error } = await client.from("leads").select("*").eq("campaign_id", campaignId).order("seq");
      if (error) throw error;
      return data || [];
    },
    async listShifts(campaignId) {
      const { data, error } = await client.from("shift_logs").select("*").eq("campaign_id", campaignId);
      if (error) throw error;
      return data || [];
    },
    async listAttendance(campaignId) {
      const { data, error } = await client.from("attendance").select("*").eq("campaign_id", campaignId);
      if (error) throw error;
      return data || [];
    },

    // ─── WRITES ────────────────────────────────────────────────
    async createCampaign(c) {
      const { data, error } = await client.from("campaigns").insert(c).select().single();
      if (error) throw error;
      return data;
    },
    async updateCampaign(id, patch) {
      const { data, error } = await client.from("campaigns").update(patch).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    async createAgent(a) {
      const { data, error } = await client.from("agents").insert(a).select().single();
      if (error) throw error;
      return data;
    },
    async updateAgent(id, patch) {
      const { data, error } = await client.from("agents").update(patch).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    async createLead(l) {
      const { data, error } = await client.from("leads").insert(l).select().single();
      if (error) throw error;
      return data;
    },
    async updateLead(id, patch) {
      const { data, error } = await client.from("leads").update(patch).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    async deleteLead(id) {
      const { error } = await client.from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    async upsertShift(s) {
      const { data, error } = await client.from("shift_logs")
        .upsert(s, { onConflict: "campaign_id,date" }).select().single();
      if (error) throw error;
      return data;
    },
    async upsertAttendance(a) {
      const { data, error } = await client.from("attendance")
        .upsert(a, { onConflict: "campaign_id,agent_id,date" }).select().single();
      if (error) throw error;
      return data;
    },

    // Bulk seed for migrating MOCK_DATA → Supabase (admin-only, called once)
    async bulkInsertAgents(rows)   { const { error } = await client.from("agents").insert(rows);     if (error) throw error; },
    async bulkInsertLeads(rows)    { const { error } = await client.from("leads").insert(rows);      if (error) throw error; },
    async bulkInsertShifts(rows)   { const { error } = await client.from("shift_logs").insert(rows); if (error) throw error; },
  };

  // ─── INVITES (admin only) ────────────────────────────────────
  const invites = {
    async list() {
      const { data, error } = await client.from("user_invites").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    async create({ email, full_name, role, campaign_ids }) {
      const { data, error } = await client.from("user_invites").insert({
        email: String(email).toLowerCase().trim(),
        full_name: full_name || "",
        role: role || "manager",
        campaign_ids: campaign_ids || [],
      }).select().single();
      if (error) throw error;
      return data;
    },
    async remove(id) {
      const { error } = await client.from("user_invites").delete().eq("id", id);
      if (error) throw error;
    },
  };

  window.SB = { client, auth, data, invites };
})();

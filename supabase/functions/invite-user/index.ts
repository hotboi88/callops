// Supabase Edge Function: invite-user
// Creates a CallOps user account with an admin-chosen password.
// Only a signed-in admin can call it (verified below).
//
// Deploy:
//   supabase functions deploy invite-user
//
// SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are injected
// automatically by Supabase at runtime — no manual secret setup needed.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Always responds 200 so the browser client can read {ok, error} cleanly.
function reply(body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return reply({ ok: false, error: "POST only." });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // 1. Verify the caller is a signed-in admin.
  const authHeader = req.headers.get("Authorization") ?? "";
  const caller = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: userErr } = await caller.auth.getUser();
  if (userErr || !user) return reply({ ok: false, error: "Not signed in." });
  const { data: profile } = await caller
    .from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || profile.role !== "admin") {
    return reply({ ok: false, error: "Only admins can invite users." });
  }

  // 2. Parse + validate input.
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return reply({ ok: false, error: "Bad request body." }); }
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const full_name = String(body.full_name ?? "").trim();
  const role = ["admin", "manager", "viewer"].includes(String(body.role)) ? String(body.role) : "manager";
  const campaign_ids = Array.isArray(body.campaign_ids) ? body.campaign_ids : [];
  if (!email.includes("@")) return reply({ ok: false, error: "A valid email is required." });
  if (password.length < 6) return reply({ ok: false, error: "Password must be at least 6 characters." });

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  // 3. Whitelist the email so the handle_new_user trigger assigns the right
  //    profile + role the moment the account is created.
  const { error: invErr } = await admin.from("user_invites").upsert(
    { email, full_name, role, campaign_ids },
    { onConflict: "email" },
  );
  if (invErr) return reply({ ok: false, error: "Could not record invite: " + invErr.message });

  // 4. Create the account with the admin-chosen password, already confirmed.
  const { error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });
  if (createErr) return reply({ ok: false, error: createErr.message });

  return reply({ ok: true });
});

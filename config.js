// CallOps — environment configuration
// Keep secrets OUT of this file. The anon key is designed to be public;
// access control happens via Supabase RLS policies and the user_invites table.
window.CONFIG = {
  SUPABASE_URL: "https://eqwcgyngomqomuzvncwg.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_8WaYcUFrKfy0h7728OYzdA_YkDdgwBU",

  // When true: auth + data come from Supabase. When false: app boots into
  // the in-memory MOCK_DATA demo. Flip to true after the schema is in place
  // and Google OAuth is configured.
  USE_SUPABASE: true,
};

// Auth screen — shown when there's no Supabase session, or a session exists
// but the user isn't in the profiles allowlist.
//
//   1. signed-out → email + password sign-in
//   2. signed-in-but-no-profile → "Access denied" + sign out
//
// Accounts are admin-created (Admin tools → Invite User) with an
// admin-chosen password — there is no self-signup.
const { useState: useStateAuth } = React;

function AuthScreen({ mode }) {
  const [email, setEmail] = useStateAuth("");
  const [password, setPassword] = useStateAuth("");
  const [busy, setBusy] = useStateAuth(false);
  const [err, setErr] = useStateAuth(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      await window.SB.auth.signInWithEmail(email, password);
      // Root's onAuthChange handles the transition into the app.
    } catch (e2) {
      setErr(e2.message || String(e2));
      setBusy(false);
    }
  };

  const signOut = async () => {
    setBusy(true);
    try { await window.SB.auth.signOut(); window.location.reload(); }
    catch (e) { setErr(e.message || String(e)); setBusy(false); }
  };

  if (mode === "denied") {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="auth-brand"><div className="brand-mark">CO</div> <span>CallOps</span></div>
          <h1>Access denied</h1>
          <p className="auth-sub">
            You're signed in, but this email isn't on the invite list.
            Ask an admin to invite you, then sign back in.
          </p>
          <button className="btn btn-block" onClick={signOut} disabled={busy}>
            {busy ? "…" : "Sign out"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand"><div className="brand-mark">CO</div> <span>CallOps</span></div>
        <h1>Sign in</h1>
        <p className="auth-sub">Sign in with the email and password your admin gave you.</p>
        <form className="auth-form" onSubmit={submit}>
          <input
            className="auth-input" type="email" placeholder="Email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            autoComplete="email" required disabled={busy}
          />
          <input
            className="auth-input" type="password" placeholder="Password"
            value={password} onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password" required disabled={busy}
          />
          <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
            {busy ? "…" : "Sign in"}
          </button>
        </form>
        {err && <p className="auth-err">{err}</p>}
      </div>
    </div>
  );
}

window.AuthScreen = AuthScreen;

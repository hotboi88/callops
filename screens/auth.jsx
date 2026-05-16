// Auth screen — shown when there's no Supabase session (or a session
// exists but the user isn't in the profiles allowlist).
//
// States this component handles:
//   1. signed-out → email + password sign-in / create-account form
//   2. signed-in-but-no-profile → "Access denied" + sign out
//
// Renders nothing if CONFIG.USE_SUPABASE is false (skeleton stays open
// for local dev / demo).
const { useState: useStateAuth } = React;

function AuthScreen({ mode }) {
  const [tab, setTab] = useStateAuth("signin"); // "signin" | "signup"
  const [email, setEmail] = useStateAuth("");
  const [password, setPassword] = useStateAuth("");
  const [busy, setBusy] = useStateAuth(false);
  const [err, setErr] = useStateAuth(null);
  const [notice, setNotice] = useStateAuth(null);

  const switchTab = (t) => { setTab(t); setErr(null); setNotice(null); };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(null); setNotice(null);
    try {
      if (tab === "signup") {
        const res = await window.SB.auth.signUpWithEmail(email, password);
        if (!res || !res.session) {
          // Email confirmation is on — user must confirm before signing in.
          setNotice("Account created. Check your email for a confirmation link, then sign in.");
          setTab("signin");
          setBusy(false);
          return;
        }
        // Session present → Root's onAuthChange picks it up and renders the app.
      } else {
        await window.SB.auth.signInWithEmail(email, password);
        // Root's onAuthChange handles the transition.
      }
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

  const isSignup = tab === "signup";

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand"><div className="brand-mark">CO</div> <span>CallOps</span></div>
        <h1>{isSignup ? "Create account" : "Sign in"}</h1>
        <p className="auth-sub">
          {isSignup
            ? "CallOps is invite-only. Create your account with the email an admin invited."
            : "Sign in with your CallOps email and password."}
        </p>
        <form className="auth-form" onSubmit={submit}>
          <input
            className="auth-input" type="email" placeholder="Email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            autoComplete="email" required disabled={busy}
          />
          <input
            className="auth-input" type="password" placeholder="Password"
            value={password} onChange={(e) => setPassword(e.target.value)}
            autoComplete={isSignup ? "new-password" : "current-password"}
            required disabled={busy} minLength={6}
          />
          <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
            {busy ? "…" : (isSignup ? "Create account" : "Sign in")}
          </button>
        </form>
        {err && <p className="auth-err">{err}</p>}
        {notice && <p className="auth-notice">{notice}</p>}
        <p className="auth-toggle">
          {isSignup ? (
            <>Already have an account?{" "}
              <button className="auth-link" type="button" onClick={() => switchTab("signin")}>Sign in</button>
            </>
          ) : (
            <>Need an account?{" "}
              <button className="auth-link" type="button" onClick={() => switchTab("signup")}>Create one</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

window.AuthScreen = AuthScreen;

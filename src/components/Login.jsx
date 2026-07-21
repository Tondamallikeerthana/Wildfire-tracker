import { useState } from "react";
import { supabase } from "../supabaseClient";
import Globe from "./Globe";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [infoMsg, setInfoMsg] = useState(null);
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setInfoMsg(null);

    if (!email.trim() || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);

    if (isRegister) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      setLoading(false);

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data?.user && !data.session) {
        setInfoMsg("Account created! Check your email to confirm, then log in.");
        setIsRegister(false);
        return;
      }

      if (data?.session) {
        onLogin(data.session.user);
      }
    } else {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setLoading(false);

      if (signInError) {
        setError(signInError.message);
        return;
      }

      onLogin(data.user);
    }
  }

  return (
    <div className="auth-split">
      {/* Left — dark visual panel with the rotating globe, logo, and tagline */}
      <div className="auth-visual">
        <Globe />

        <div className="auth-brand">
          <span className="auth-brand-mark">🔥</span>
          <span className="auth-brand-name">Wildfire Tracker</span>
        </div>

        <div className="auth-visual-copy">
          <span className="auth-visual-eyebrow">Welcome to</span>
          <h2>Wildfire Tracker</h2>
          <p>
            Live wildfire monitoring, worldwide.
            <br />
            Powered by NASA EONET satellite data.
          </p>
        </div>
      </div>

      {/* Right — the actual sign-in / register form */}
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <h1>{isRegister ? "Create an account" : "Welcome back!"}</h1>
          <p className="auth-subtitle">
            {isRegister ? "Sign up to start tracking wildfires." : "Log in to your account"}
          </p>
          <p className="auth-tagline">
            {isRegister ? "It only takes a minute." : "Ready to check what's burning near you?"}
          </p>

          <form onSubmit={submit} className="auth-form">
            {error && <div className="error">{error}</div>}
            {infoMsg && <div className="info">{infoMsg}</div>}

            <label className="field-label">
              Email
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
              />
            </label>
            <label className="field-label">
              Password
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isRegister ? "new-password" : "current-password"}
                placeholder="Your password"
              />
            </label>

            <button className="btn primary auth-submit" type="submit" disabled={loading}>
              {loading ? "Please wait..." : isRegister ? "Create account" : "Log In"}
            </button>
          </form>

          <div className="auth-switch">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              className="auth-switch-link"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
                setInfoMsg(null);
              }}
            >
              {isRegister ? "Sign in" : "Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

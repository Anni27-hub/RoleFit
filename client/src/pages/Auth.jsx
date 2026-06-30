import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./Auth.css";

const Auth = () => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { googleLogin, login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from || "/";

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleGoogleSuccess = async ({ credential }) => {
    setError("");
    setBusy(true);
    try {
      await googleLogin(credential);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Google login failed.");
    } finally {
      setBusy(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      if (mode === "signup") {
        await signup(form);
      } else {
        await login({ email: form.email, password: form.password });
      }
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <Link className="auth-logo" to="/">
          <span>RF</span>
          RoleFit AI
        </Link>
        <p className="section-kicker">Secure workspace</p>
        <h1>Save every resume analysis and track your fit over time.</h1>
        <p>
          Sign in to upload resumes, run Groq-powered job-description analysis, and keep
          your private application history in one place.
        </p>
        <div className="auth-proof">
          <span>JWT protected</span>
          <span>Private history</span>
          <span>ATS reports</span>
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-tabs">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
            Sign in
          </button>
          <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>
            Create account
          </button>
        </div>

        <form onSubmit={submit}>
          {mode === "signup" && (
            <label>
              <span>Name</span>
              <input name="name" value={form.name} onChange={update} placeholder="Your name" />
            </label>
          )}

          <label>
            <span>Email</span>
            <input name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" />
          </label>

          <label>
            <span>Password</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={update}
              placeholder="Minimum 6 characters"
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit" disabled={busy}>
            {busy ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>
        <div className="google-wrap">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google login was cancelled or failed.")}
            text="continue_with"
            shape="pill"
            width={320}
          />
        </div>
      </section>
    </main>
  );
};

export default Auth;

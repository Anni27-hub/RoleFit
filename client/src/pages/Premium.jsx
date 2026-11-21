import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPremiumOrder, getPayments, getPremiumConfig, verifyPremiumPayment } from "../api/payment.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import "./Premium.css";

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Premium = () => {
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [config, setConfig] = useState({ priceInr: 99, credits: 5 });
  const [payments, setPayments] = useState([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getPremiumConfig().then(setConfig).catch(() => {});
    getPayments().then(setPayments).catch(() => {});
  }, []);

  const buyPremium = async () => {
    setStatus("");
    setBusy(true);

    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Could not load Razorpay checkout.");

      const order = await createPremiumOrder();
      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "RoleFit AI",
        description: `${order.credits} premium resume analysis credits`,
        order_id: order.orderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "9999999999"
        },
        theme: { color: "#2563eb" },
        handler: async (response) => {
          const result = await verifyPremiumPayment(response);
          updateUser(result.user);
          setStatus(result.message);
          setPayments((current) => [result.payment, ...current]);
        }
      });

      razorpay.on("payment.failed", (response) => {
        setStatus(response.error?.description || "Payment failed. Try again.");
      });
      razorpay.open();
    } catch (error) {
      setStatus(error.response?.data?.message || error.message || "Payment failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="premium-page">
      <nav className="premium-nav">
        <Link className="brand" to="/">
          <span className="brand-mark">RF</span>RoleFit AI
        </Link>
        <div>
          <Link to="/resume-builder" className="nav-workspace-link">AI Workspace</Link>
          <Link to="/history">History</Link>
          <button className="theme-toggle" type="button" onClick={toggleTheme}>
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <span>{user?.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>

      <section className="premium-hero animate-rise">
        <p className="section-kicker">Premium</p>
        <h1>Unlock more AI resume analyses.</h1>
        <p>
          You currently have <strong className="credit-badge">{user?.analysisCredits ?? 0} credits</strong> available.
          Upgrade with Razorpay test checkout to add premium credits instantly.
        </p>
      </section>

      <section className="pricing-grid">
        <article className="plan-card">
          <span className="plan-tag">Free Tier</span>
          <h2>Starter</h2>
          <div className="plan-price">
            <span className="currency">₹</span>0
          </div>
          <p className="plan-summary">Included upon account registration to test the analyzer.</p>
          <ul className="plan-features">
            <li>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span>2 full resume ATS evaluations</span>
            </li>
            <li>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span>ATS score breakdown & insights</span>
            </li>
            <li>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Keyword alignment checklist</span>
            </li>
            <li>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Export clean PDF reports</span>
            </li>
          </ul>
          <Link to="/" className="plan-action-btn secondary">Use free checker</Link>
        </article>

        <article className="plan-card premium-plan">
          <span className="plan-tag popular">Recommended</span>
          <h2>Premium Pack</h2>
          <div className="plan-price">
            <span className="currency">₹</span>{config.priceInr}
            <span className="period">/ one-time</span>
          </div>
          <p className="plan-summary">
            +{config.credits} instant high-depth resume analysis credits for your job search.
          </p>
          <ul className="plan-features">
            <li>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span>+{config.credits} deep AI resume scans</span>
            </li>
            <li>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Comprehensive ATS keyword gap finder</span>
            </li>
            <li>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span>AI bullet point rewriter with rationale</span>
            </li>
            <li>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Skill gap roadmap & recommended actions</span>
            </li>
            <li>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Instant Razorpay checkout activation</span>
            </li>
          </ul>
          <button className="plan-action-btn primary" onClick={buyPremium} disabled={busy}>
            {busy ? "Opening checkout..." : `Upgrade Now • ₹${config.priceInr}`}
          </button>
          {status && <p className="payment-status">{status}</p>}
        </article>
      </section>

      <section className="payment-history">
        <h2>Payment history</h2>
        {payments.length === 0 ? (
          <p className="payment-empty">No payments recorded yet.</p>
        ) : (
          <div className="payment-records-list">
            {payments.map((payment) => (
              <article key={payment._id || payment.razorpayOrderId} className="payment-record">
                <div className="payment-record-left">
                  <div className={`status-pill ${payment.status === "paid" ? "status-paid" : "status-pending"}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>{payment.status === "paid" ? "Paid" : payment.status}</span>
                  </div>
                  <div className="payment-record-info">
                    <strong>+{payment.credits || 5} Analysis Credits</strong>
                    <div className="payment-meta">
                      <span>Order: {payment.razorpayOrderId}</span>
                      {payment.createdAt && (
                        <span>• {new Date(payment.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="payment-record-amount">
                  ₹{Math.round((payment.amount || 0) / 100)}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Premium;

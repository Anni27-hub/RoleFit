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
          <Link to="/history">Dashboard</Link>
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
          Your account has <strong>{user?.analysisCredits ?? 0}</strong> credits left.
          Upgrade with Razorpay test checkout and add premium credits instantly after verification.
        </p>
      </section>

      <section className="pricing-grid">
        <article className="plan-card">
          <span>Free</span>
          <h2>Starter</h2>
          <strong>2 credits</strong>
          <p>Good for testing the analyzer and saving initial history.</p>
          <Link to="/">Use free checker</Link>
        </article>

        <article className="plan-card premium-plan">
          <span>Recommended</span>
          <h2>Premium Pack</h2>
          <strong>INR {config.priceInr}</strong>
          <p>
            {config.credits} extra AI analyses, dashboard tracking, report download, and priority resume tailoring.
          </p>
          <button onClick={buyPremium} disabled={busy}>
            {busy ? "Opening checkout..." : "Upgrade with Razorpay"}
          </button>
          {status && <p className="payment-status">{status}</p>}
        </article>
      </section>

      <section className="payment-history">
        <h2>Payment history</h2>
        {payments.length === 0 ? (
          <p>No payments yet.</p>
        ) : (
          payments.map((payment) => (
            <article key={payment._id || payment.razorpayOrderId}>
              <div>
                <strong>{payment.status}</strong>
                <span>{payment.razorpayOrderId}</span>
              </div>
              <b>INR {Math.round((payment.amount || 0) / 100)}</b>
            </article>
          ))
        )}
      </section>
    </main>
  );
};

export default Premium;

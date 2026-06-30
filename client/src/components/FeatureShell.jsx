import { Link } from "react-router-dom";
import "./FeatureShell.css";

const FeatureShell = ({ title, subtitle, children }) => {
  return (
    <main className="feature-page">
      <nav className="feature-navbar">
        <Link to="/" className="logo">
          <span className="logo-mark">RF</span>
          RoleFit AI
        </Link>
        <Link to="/" className="back-home">Back to Home</Link>
      </nav>

      <section className="feature-hero">
        <p className="section-kicker">AI workspace</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </section>

      {children}
    </main>
  );
};

export default FeatureShell;

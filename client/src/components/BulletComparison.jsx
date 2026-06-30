import "./BulletComparison.css";

const BulletComparison = ({ original, improved, reason }) => {
  return (
    <div className="bullet-comparison">
      <div className="bullet-side original">
        <span className="bullet-label">Original</span>
        <p>{original}</p>
      </div>
      <div className="bullet-arrow">-&gt;</div>
      <div className="bullet-side improved">
        <span className="bullet-label">Improved</span>
        <p>{improved}</p>
        {reason && <span className="bullet-reason">{reason}</span>}
      </div>
    </div>
  );
};

export default BulletComparison;

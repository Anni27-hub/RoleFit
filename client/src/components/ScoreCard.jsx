import "./ScoreCard.css";

const ScoreCard = ({ score, label }) => {
  const getColor = (s) => {
    if (s >= 75) return "good";
    if (s >= 50) return "warn";
    return "bad";
  };

  const color = getColor(score);

  return (
    <div className={`score-card score-${color}`}>
      <div className="score-number">{score}</div>
      <div className="score-label">{label}</div>
    </div>
  );
};

export default ScoreCard;
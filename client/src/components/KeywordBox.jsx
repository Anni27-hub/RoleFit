import "./KeywordBox.css";

const KeywordBox = ({ title, keywords, type = "default" }) => {
  return (
    <div className={`keyword-box keyword-${type}`}>
      <h3>{title}</h3>
      <div className="keyword-list">
        {keywords.length === 0 ? (
          <p className="empty">None</p>
        ) : (
          keywords.map((kw, i) => (
            <span key={i} className="keyword-tag">
              {kw}
            </span>
          ))
        )}
      </div>
    </div>
  );
};

export default KeywordBox;
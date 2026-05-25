function RiskCard({ title, value, status }) {
  return (
    <div className="risk-card">
      <h3>{title}</h3>

      <h1>{value}</h1>

      <p>{status}</p>
    </div>
  );
}

export default RiskCard;
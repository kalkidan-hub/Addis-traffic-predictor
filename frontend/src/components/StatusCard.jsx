function statusTone(status) {
  if (status === "Smooth") return "smooth";
  if (status === "Moderate") return "moderate";
  return "heavy";
}

export default function StatusCard({ segment, prediction, loading, error }) {
  const index = Math.max(0, Math.min(1, prediction?.congestion_index ?? 0));
  const status = prediction?.traffic_status || "Awaiting model";
  const tone = statusTone(status);
  const estimatedSpeed = Math.max(0, Math.round(segment.speedLimit * (1 - index * 0.72)));

  return (
    <section className="panel status-card">
      <div className="status-topline"><div className="eyebrow">SELECTED SEGMENT</div><span className={`status-pill ${tone}`}><i />{status}</span></div>
      <div className="segment-title"><div><h2>{segment.name}</h2><p>{segment.area} · {segment.latitude ? `${segment.latitude.toFixed(5)}, ${segment.longitude.toFixed(5)}` : `ID ${segment.id}`}</p></div><div className="segment-index">{Math.round(index * 100)}<small>%</small></div></div>
      <div className="meter"><div className={`meter-fill ${tone}`} style={{ width: `${index * 100}%` }} /></div>
      <div className="metric-grid">
        <div className="metric-card"><span>Predicted speed</span><strong>{loading ? "—" : `${estimatedSpeed} km/h`}</strong></div>
        <div className="metric-card"><span>Speed limit</span><strong>{segment.speedLimit} km/h</strong></div>
        <div className="metric-card"><span>Congestion index</span><strong>{loading ? "Updating" : index.toFixed(2)}</strong></div>
      </div>
      {error && <div className="error-message" role="alert"><strong>Prediction service unavailable</strong><span>{error}</span></div>}
      {!error && <p className="model-note"><span className="live-dot" /> Model synced to local FastAPI service</p>}
    </section>
  );
}

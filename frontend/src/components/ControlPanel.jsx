const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function formatHour(hour) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 || 12;
  return `${display}:00 ${suffix}`;
}

export default function ControlPanel({ hour, dayOfWeek, speedLimit, onHourChange, onDayChange, onSpeedChange }) {
  return (
    <section className="panel control-panel">
      <div className="eyebrow">SIMULATION CONTROLS</div>
      <div className="control-row">
        <div className="control-heading">
          <label htmlFor="hour">Time of day</label>
          <strong>{formatHour(hour)}</strong>
        </div>
        <input id="hour" type="range" min="0" max="23" value={hour} onChange={(event) => onHourChange(Number(event.target.value))} />
        <div className="range-labels" aria-hidden="true"><span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>12 AM</span></div>
      </div>
      <div className="control-grid">
        <div>
          <label className="field-label" htmlFor="day">Day of week</label>
          <select id="day" value={dayOfWeek} onChange={(event) => onDayChange(Number(event.target.value))}>
            {DAYS.map((day, index) => <option key={day} value={index}>{day}</option>)}
          </select>
        </div>
        <div>
          <div className="control-heading"><label htmlFor="speed">Speed limit</label><strong>{speedLimit} km/h</strong></div>
          <input id="speed" type="range" min="20" max="80" step="5" value={speedLimit} onChange={(event) => onSpeedChange(Number(event.target.value))} />
        </div>
      </div>
    </section>
  );
}

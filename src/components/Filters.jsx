import { useState } from "react";
import Globe from "./Globe";

const PRESETS = [
  { label: "Last 24h", days: 1 },
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

export default function Filters({ initial = { days: 30, max: 200, alertRadius: 50 }, onApply, onBack }) {
  const [days, setDays] = useState(initial.days);
  const [max, setMax] = useState(initial.max);
  const [onlyOpen, setOnlyOpen] = useState(initial.onlyOpen ?? true);
  const [alertRadius, setAlertRadius] = useState(initial.alertRadius ?? 50);

  return (
    <div className="auth-stage">
      <div className="auth-starfield" />
      <Globe />
      <h1 className="auth-heading">Configure Your View</h1>

      <div className="filters-card">
        <div className="filters-section">
          <div className="filters-section-label">Quick range</div>
          <div className="preset-row">
            {PRESETS.map((p) => (
              <button
                type="button"
                key={p.label}
                className={days === p.days ? "chip active" : "chip"}
                onClick={() => setDays(p.days)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filters-section">
          <div className="slider-row">
            <label>Days back</label>
            <span className="slider-value">{days}</span>
          </div>
          <input
            className="slider"
            type="range"
            min={1}
            max={365}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          />
        </div>

        <div className="filters-section">
          <div className="slider-row">
            <label>Max results</label>
            <span className="slider-value">{max}</span>
          </div>
          <input
            className="slider"
            type="range"
            min={10}
            max={1000}
            step={10}
            value={max}
            onChange={(e) => setMax(Number(e.target.value))}
          />
        </div>

        <div className="filters-section">
          <div className="slider-row">
            <label>Alert radius (km)</label>
            <span className="slider-value">{alertRadius}</span>
          </div>
          <input
            className="slider"
            type="range"
            min={5}
            max={200}
            step={5}
            value={alertRadius}
            onChange={(e) => setAlertRadius(Number(e.target.value))}
          />
          <div className="filters-hint">You'll be notified when a fire is within this distance.</div>
        </div>

        <div className="filters-section toggle-row">
          <label className="switch">
            <input type="checkbox" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} />
            <span className="switch-track"><span className="switch-thumb" /></span>
          </label>
          <span>Only show currently active fires</span>
        </div>

        <div className="filters-summary">
          Showing wildfires from the last <strong>{days}</strong> day{days === 1 ? "" : "s"}, up to <strong>{max}</strong> results
          {onlyOpen ? ", open events only" : ""}. Alerts trigger within <strong>{alertRadius}km</strong> of your location.
        </div>

        <div className="filters-actions">
          <button className="btn primary" onClick={() => onApply({ days, max, onlyOpen, alertRadius })}>
            Apply &amp; Continue
          </button>
          <button className="btn secondary" onClick={onBack}>Back</button>
        </div>
      </div>
    </div>
  );
}

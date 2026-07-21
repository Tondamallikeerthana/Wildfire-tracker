import React from "react";

export default function EventDetails({ event, onClose }) {
  if (!event) return null;

  const geom = event.geometry && event.geometry[0];
  const coords = geom && geom.coordinates ? `${geom.coordinates[1]}, ${geom.coordinates[0]}` : "n/a";
  const date = geom && geom.date ? new Date(geom.date).toLocaleString() : "n/a";

  return (
    <div style={panelStyle}>
      <button onClick={onClose} style={closeStyle} aria-label="Close details">✕</button>
      <h3 style={{ marginTop: 0 }}>{event.title}</h3>
      <p><strong>Coordinates:</strong> {coords}</p>
      <p><strong>Date:</strong> {date}</p>
      {event.categories && event.categories.length > 0 && (
        <p><strong>Categories:</strong> {event.categories.map(c => c.title).join(", ")}</p>
      )}
      {event.sources && event.sources.length > 0 && (
        <div>
          <strong>Sources:</strong>
          <ul>
            {event.sources.map((s, i) => (
              <li key={i}><a href={s.url} target="_blank" rel="noreferrer">{s.id}</a></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const panelStyle = {
  position: "absolute",
  right: 16,
  top: 16,
  width: 320,
  maxHeight: "70vh",
  overflowY: "auto",
  background: "rgba(255,255,255,0.98)",
  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
  padding: 12,
  borderRadius: 8,
  zIndex: 1000,
};

const closeStyle = {
  position: "absolute",
  right: 8,
  top: 8,
  border: "none",
  background: "transparent",
  fontSize: 16,
  cursor: "pointer",
};

import { useState } from "react";

export default function TestLocationPanel({ events, manualPosition, onSetManual, onClearManual }) {
  const [lat, setLat] = useState(manualPosition?.lat ?? "");
  const [lon, setLon] = useState(manualPosition?.lon ?? "");
  const [open, setOpen] = useState(false);

  function applyManual() {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    if (Number.isNaN(latNum) || Number.isNaN(lonNum)) return;
    onSetManual({ lat: latNum, lon: lonNum });
  }

  function snapToFire() {
    const first = events.find((ev) => ev.geometry && ev.geometry[0] && ev.geometry[0].coordinates);
    if (!first) return;
    const [flon, flat] = first.geometry[0].coordinates;
    const testLat = flat + 0.03;
    const testLon = flon + 0.03;
    setLat(testLat.toFixed(4));
    setLon(testLon.toFixed(4));
    onSetManual({ lat: testLat, lon: testLon });
  }

  if (!open) {
    return (
      <button style={toggleBtnStyle} onClick={() => setOpen(true)}>
        Test with manual location
      </button>
    );
  }

  return (
    <div style={panelStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong style={{ fontSize: 13 }}>Test Location</strong>
        <button style={closeBtnStyle} onClick={() => setOpen(false)} aria-label="Close">X</button>
      </div>

      <button style={{ ...actionBtnStyle, marginTop: 8 }} onClick={snapToFire} disabled={!events.length}>
        Snap near nearest active fire
      </button>

      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <input
          style={inputStyle}
          type="number"
          placeholder="Latitude"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
        />
        <input
          style={inputStyle}
          type="number"
          placeholder="Longitude"
          value={lon}
          onChange={(e) => setLon(e.target.value)}
        />
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <button style={actionBtnStyle} onClick={applyManual}>Set Location</button>
        {manualPosition && (
          <button style={secondaryBtnStyle} onClick={onClearManual}>Use Real Location</button>
        )}
      </div>

      {manualPosition && (
        <div style={{ fontSize: 11, marginTop: 6, opacity: 0.8 }}>
          Testing at {manualPosition.lat.toFixed(4)}, {manualPosition.lon.toFixed(4)}
        </div>
      )}
    </div>
  );
}

const panelStyle = {
  position: "absolute",
  bottom: 16,
  left: 16,
  width: 240,
  background: "rgba(255,255,255,0.98)",
  padding: 12,
  borderRadius: 8,
  boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
  zIndex: 1000,
  color: "#0b1220",
};

const toggleBtnStyle = {
  position: "absolute",
  bottom: 16,
  left: 16,
  zIndex: 1000,
  background: "#0b1220",
  color: "white",
  border: "none",
  borderRadius: 8,
  padding: "8px 12px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
};

const closeBtnStyle = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: 14,
};

const inputStyle = {
  width: "100%",
  padding: "6px 8px",
  borderRadius: 6,
  border: "1px solid #e6e9ee",
  fontSize: 12,
};

const actionBtnStyle = {
  flex: 1,
  background: "#ff6b35",
  color: "white",
  border: "none",
  borderRadius: 6,
  padding: "7px 8px",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryBtnStyle = {
  ...actionBtnStyle,
  background: "#f3f4f6",
  color: "#0b1220",
};
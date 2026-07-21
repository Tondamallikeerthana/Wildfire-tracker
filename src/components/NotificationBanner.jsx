export default function NotificationBanner({ nearbyEvents, permission, geoError, rangeKm }) {
  if (geoError) {
    return (
      <div style={bannerStyle("warn")}>
        ⚠ Location unavailable ({geoError}). Enable location access for wildfire proximity alerts.
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div style={bannerStyle("warn")}>
        🔕 Notifications are blocked. Enable them in your browser settings to receive wildfire alerts.
      </div>
    );
  }

  if (nearbyEvents.length > 0) {
    return (
      <div style={bannerStyle("danger")}>
        🔥 {nearbyEvents.length} wildfire{nearbyEvents.length > 1 ? "s" : ""} within {rangeKm}km of your location!
      </div>
    );
  }

  return null;
}

function bannerStyle(type) {
  return {
    position: "absolute",
    top: 16,
    left: "50%",
    transform: "translateX(-50%)",
    background: type === "danger" ? "#b00020" : "#92400e",
    color: "white",
    padding: "10px 18px",
    borderRadius: 8,
    zIndex: 1000,
    fontWeight: 600,
    fontSize: 14,
    boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
    maxWidth: "90%",
    textAlign: "center",
  };
}

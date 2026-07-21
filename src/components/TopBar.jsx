export default function TopBar({ onSendNotifications, nearbyCount, userName, role, onLogout, sendStatus }) {
  return (
    <div className="top-bar">
      <h1 className="top-bar-title">🔥 WILD FIRE TRACKER</h1>
      <div className="top-bar-right">
        {sendStatus && <span className="top-bar-status">{sendStatus}</span>}
        {userName && (
          <span className="top-bar-user">
            {userName} {role ? `(${role})` : ""}
          </span>
        )}
        {role === "admin" && (
          <button className="btn primary" onClick={onSendNotifications}>
            🔔 Send Notifications{nearbyCount > 0 ? ` (${nearbyCount})` : ""}
          </button>
        )}
        {onLogout && (
          <button className="btn secondary" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
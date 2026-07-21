import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import LocationMarker from "./components/LocationMarker";
import EventDetails from "./components/EventDetails";
import UserLocationMarker from "./components/UserLocationMarker";
import NotificationBanner from "./components/NotificationBanner";
import TestLocationPanel from "./components/TestLocationPanel";
import FireTable from "./components/FireTable";
import TopBar from "./components/TopBar";
import useGeolocation from "./hooks/useGeolocation";
import useProximityAlerts, { DANGER_RANGE_KM } from "./hooks/useProximityAlerts";
import useSyncLocation from "./hooks/useSyncLocation";
import { supabase } from "./supabaseClient";

export default function Map({ filters = { days: 30, max: 200 }, userId, userName, role, onLogout }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [sendStatus, setSendStatus] = useState(null);

  const { position: geoPosition, error: geoError } = useGeolocation();
  const [manualPosition, setManualPosition] = useState(null);
  const userPosition = manualPosition || geoPosition;
  useSyncLocation(userId, geoPosition);
  const alertRadiusKm = filters.alertRadius ?? DANGER_RANGE_KM;
  const { nearbyEvents, permission, requestPermission, sendTestNotification } = useProximityAlerts(events, userPosition, alertRadiusKm);

  useEffect(() => {
    let mounted = true;
    const statusParam = filters.onlyOpen ? "status=open" : "";
    const url = `https://eonet.gsfc.nasa.gov/api/v3/events?${statusParam}&category=wildfires&days=${filters.days}`;

    async function fetchEvents() {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(res.statusText || "Fetch error");
        const data = await res.json();
        if (mounted) {
          const list = data.events || [];
          const limited = list.slice(0, filters.max || 200);
          setEvents(limited);
        }
      } catch (err) {
        if (mounted) setError(err.message);
        console.error("EONET fetch error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchEvents();
    return () => {
      mounted = false;
    };
  }, [filters]);

  async function handleSendNotifications() {
    setSendStatus("Sending...");
    try {
      const { data, error } = await supabase.functions.invoke("send-wildfire-alerts", {
        body: { events },
      });

      if (error) throw error;

      setSendStatus(
        data.sent > 0
          ? `Sent to ${data.sent} user(s): ${data.recipients.join(", ")}`
          : "No users are currently within range."
      );
    } catch (err) {
      setSendStatus(`Failed: ${err.message}`);
    }

    setTimeout(() => setSendStatus(null), 8000);
  }

  return (
    <div className="dashboard">
      <TopBar
        onSendNotifications={handleSendNotifications}
        nearbyCount={nearbyEvents.length}
        userName={userName}
        role={role}
        onLogout={onLogout}
        sendStatus={sendStatus}
      />

      <div className="dashboard-body">
        <div className="dashboard-left">
          <FireTable events={events} selectedEvent={selectedEvent} onSelect={setSelectedEvent} />
        </div>

        <div className="dashboard-right">
          <MapContainer
            center={[42.3265, -122.8756]}
            zoom={6}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
            dragging={true}
            doubleClickZoom={true}
            zoomControl={true}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
            <LocationMarker events={events} onSelect={setSelectedEvent} />
            <UserLocationMarker position={userPosition} rangeKm={alertRadiusKm} />
            {selectedEvent && (
              <EventDetails event={selectedEvent} onClose={() => setSelectedEvent(null)} />
            )}
            <NotificationBanner
              nearbyEvents={nearbyEvents}
              permission={permission}
              geoError={geoError}
              rangeKm={alertRadiusKm}
              onRequestPermission={requestPermission}
              onSendTest={sendTestNotification}
            />
            <TestLocationPanel
              events={events}
              manualPosition={manualPosition}
              onSetManual={setManualPosition}
              onClearManual={() => setManualPosition(null)}
            />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
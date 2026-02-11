
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import LocationMarker from "./components/LocationMarker";
import EventDetails from "./components/EventDetails";

export default function Map({ filters = { days: 30, max: 200 } }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

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
          console.log("EONET fetch succeeded, events (fetched/used):", (data.events || []).length, limited.length);
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

  console.log({ loading, error, eventsCount: events.length });

  return (
    <MapContainer
      center={[42.3265, -122.8756]}
      zoom={6}
      style={{ height: "100vh", width: "100%" }}
      scrollWheelZoom={true}
      dragging={true}
      doubleClickZoom={true}
      zoomControl={true}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      <LocationMarker events={events} onSelect={setSelectedEvent} />
      {selectedEvent && (
        <EventDetails event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </MapContainer>
  );
}
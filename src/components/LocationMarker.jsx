import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const fireIcon = new L.DivIcon({
  html: `<div style="font-size: 32px; line-height: 32px;">🔥</div>`,
  className: "iconify-fire-icon",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export default function LocationMarker({ events = [], onSelect }) {
  if (!events || events.length === 0) {
    return (
      <Marker position={[42.3265, -122.8756]} icon={fireIcon}>
        <Popup>
          <strong>Wildfire:</strong> Example Fire
          <br />
          <strong>Status:</strong> Active
        </Popup>
      </Marker>
    );
  }

  return (
    <>
      {events.map((ev) => {
        const geom = ev.geometry && ev.geometry[0];
        if (!geom || !geom.coordinates) return null;
        const [lon, lat] = geom.coordinates;
        const handlers = onSelect
          ? { click: () => onSelect(ev) }
          : undefined;
        return (
          <Marker key={ev.id} position={[lat, lon]} icon={fireIcon} eventHandlers={handlers}>
            <Popup>
              <strong>{ev.title}</strong>
              <br />
              {ev.categories && ev.categories.length > 0 && (
                <em>{ev.categories.map((c) => c.title).join(", ")}</em>
              )}
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
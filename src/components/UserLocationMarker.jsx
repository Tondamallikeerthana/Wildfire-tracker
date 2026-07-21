import { Marker, Circle, Popup } from "react-leaflet";
import L from "leaflet";

const userIcon = new L.DivIcon({
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#2563eb;border:3px solid white;box-shadow:0 0 8px rgba(37,99,235,0.9);"></div>`,
  className: "user-location-icon",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function UserLocationMarker({ position, rangeKm }) {
  if (!position) return null;

  return (
    <>
      <Marker position={[position.lat, position.lon]} icon={userIcon}>
        <Popup>You are here</Popup>
      </Marker>
      <Circle
        center={[position.lat, position.lon]}
        radius={rangeKm * 1000}
        pathOptions={{ color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.07, weight: 1 }}
      />
    </>
  );
}

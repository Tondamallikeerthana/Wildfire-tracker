import { useEffect, useRef, useState } from "react";
import { haversineDistanceKm } from "../utils/geo";

export const DANGER_RANGE_KM = 50;

// Watches wildfire events + user position, fires a browser notification
// the first time a fire enters rangeKm of the user (defaults to DANGER_RANGE_KM,
// but the Filters page lets the user tune this via filters.alertRadius).
export default function useProximityAlerts(events, userPosition, rangeKm = DANGER_RANGE_KM) {
  const [nearbyEvents, setNearbyEvents] = useState([]);
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );
  const notifiedIds = useRef(new Set());

  // Ask for notification permission once, on mount
  useEffect(() => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") {
      Notification.requestPermission().then(setPermission);
    }
  }, []);

  useEffect(() => {
    if (!userPosition || !events || events.length === 0) {
      setNearbyEvents([]);
      return;
    }

    const near = [];

    events.forEach((ev) => {
      const geom = ev.geometry && ev.geometry[0];
      if (!geom || !geom.coordinates) return;
      const [lon, lat] = geom.coordinates;
      const dist = haversineDistanceKm(userPosition.lat, userPosition.lon, lat, lon);

      if (dist <= rangeKm) {
        near.push({ ...ev, distanceKm: dist });

        const alreadyNotified = notifiedIds.current.has(ev.id);
        if (
          !alreadyNotified &&
          typeof Notification !== "undefined" &&
          Notification.permission === "granted"
        ) {
          notifiedIds.current.add(ev.id);
          new Notification("🔥 Wildfire Alert", {
            body: `${ev.title} is ~${dist.toFixed(1)} km from your location.`,
            icon: "/vite.svg",
          });
        }
      }
    });

    setNearbyEvents(near);
  }, [events, userPosition, rangeKm]);

  return { nearbyEvents, permission };
}

import { useEffect, useState } from "react";

// Auto-detects and continuously tracks the user's current location
export default function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
        setError(null);
      },
      (err) => {
        setError(err.message || "Unable to retrieve location.");
      },
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 15000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { position, error };
}

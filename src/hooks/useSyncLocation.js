import { useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";

// Periodically saves the logged-in user's current location to their profile
// row, so the admin's notification system can query it from the database.
export default function useSyncLocation(userId, position) {
  const lastSyncTime = useRef(0);

  useEffect(() => {
    if (!userId || !position) return;

    const now = Date.now();
    // Throttle: only sync at most once every 30 seconds
    if (now - lastSyncTime.current < 30000) return;
    lastSyncTime.current = now;

    supabase
      .from("profiles")
      .update({
        last_lat: position.lat,
        last_lon: position.lon,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .then(({ error }) => {
        if (error) console.error("Failed to sync location:", error.message);
      });
  }, [userId, position]);
}
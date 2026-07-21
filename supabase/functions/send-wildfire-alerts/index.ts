import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RANGE_KM = 50;

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    // Verify the caller is a logged-in, real admin (not just anyone who calls this URL)
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await callerClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: callerProfile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!callerProfile || callerProfile.role !== "admin") {
      return new Response(JSON.stringify({ error: "Admins only" }), {
        status: 403,
        headers: corsHeaders,
      });
    }

    const { events } = await req.json();
    if (!Array.isArray(events) || events.length === 0) {
      return new Response(JSON.stringify({ error: "No events provided" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const { data: profiles, error: profilesError } = await adminClient
      .from("profiles")
      .select("id, email, last_lat, last_lon")
      .not("last_lat", "is", null)
      .not("last_lon", "is", null);

    if (profilesError) throw profilesError;

    const emailsSent = [];

    for (const profile of profiles) {
      const nearbyFires = events.filter((ev) => {
        const geom = ev.geometry && ev.geometry[ev.geometry.length - 1];
        if (!geom || !geom.coordinates) return false;
        const [lon, lat] = geom.coordinates;
        const dist = haversineDistanceKm(profile.last_lat, profile.last_lon, lat, lon);
        return dist <= RANGE_KM;
      });

      if (nearbyFires.length === 0) continue;

      const fireList = nearbyFires.map((f) => `<li>${f.title}</li>`).join("");

      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Wildfire Tracker <onboarding@resend.dev>",
          to: profile.email,
          subject: "🔥 Wildfire Alert: Active fires near you",
          html: `<h2>Wildfire Alert</h2><p>The following wildfire(s) are within ${RANGE_KM}km of your last known location:</p><ul>${fireList}</ul>`,
        }),
      });

      if (emailRes.ok) {
        emailsSent.push(profile.email);
      } else {
        console.error("Resend error for", profile.email, await emailRes.text());
      }
    }

    return new Response(JSON.stringify({ sent: emailsSent.length, recipients: emailsSent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
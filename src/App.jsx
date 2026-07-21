import Map from "./map";
import Login from "./components/Login";
import Filters from "./components/Filters";
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function App(){
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [filters, setFilters] = useState({ days: 30, max: 200, onlyOpen: true, alertRadius: 50 });
  const [stage, setStage] = useState("login"); // login -> filters -> map
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleLogin(session.user);
      }
      setCheckingSession(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        setRole(null);
        setStage("login");
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogin(authUser){
    setUser(authUser);

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authUser.id)
      .single();

    if (error) {
      console.error("Failed to load profile:", error.message);
      setRole("user");
    } else {
      setRole(profile.role);
    }

    setStage("filters");
  }

  function handleApplyFilters(f){
    setFilters(f);
    setStage("map");
  }

  async function handleLogout(){
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setStage("login");
  }

  if (checkingSession) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  return <>
    {!user && stage === "login" && <Login onLogin={handleLogin} />}
    {user && stage === "filters" && (
      <Filters initial={filters} onApply={(f)=>handleApplyFilters(f)} onBack={handleLogout} />
    )}
    {user && stage === "map" && (
      <Map filters={filters} userId={user.id} userName={user.email} role={role} onLogout={handleLogout} />
    )}
  </>
}

export default App;
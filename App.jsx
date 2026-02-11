
import Head from "./components/Head";
import Map from "./map";
import Login from "./components/Login";
import Filters from "./components/Filters";
import 'leaflet/dist/leaflet.css';
import { useState } from "react";

function App(){
  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState({ days: 30, max: 200 });
  const [stage, setStage] = useState("login"); // login -> filters -> map

  function handleLogin(creds){
    setUser({ name: creds.username });
    setStage("filters");
  }

  function handleApplyFilters(f){
    setFilters(f);
    setStage("map");
  }

  return <>
    <Head />
    {!user && stage === "login" && <Login onLogin={handleLogin} />}
    {user && stage === "filters" && (
      <Filters initial={filters} onApply={(f)=>handleApplyFilters(f)} onBack={() => setStage("login")} />
    )}
    {user && stage === "map" && <Map filters={filters} />}
  </>
}

export default App;
import { useEffect, useMemo, useState } from "react";
import ControlPanel from "./components/ControlPanel";
import MapView from "./components/MapView";
import StatusCard from "./components/StatusCard";
import { ROAD_SEGMENTS } from "./data/segments";
import { API_BASE_URL, predictTraffic } from "./services/api";

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("sheger-flow-theme") || "dark");
  const [hour, setHour] = useState(8);
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [speedLimit, setSpeedLimit] = useState(50);
  const [selectedId, setSelectedId] = useState(101);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedSegment = useMemo(
    () => selectedLocation || ROAD_SEGMENTS.find((segment) => segment.id === selectedId) || ROAD_SEGMENTS[0],
    [selectedId, selectedLocation],
  );

  useEffect(() => {
    localStorage.setItem("sheger-flow-theme", theme);
  }, [theme]);

  function handleSegmentSelect(segmentId) {
    setSelectedLocation(null);
    setSelectedId(segmentId);
  }

  function handleMapLocationSelect(location) {
    const nearestSegment = ROAD_SEGMENTS.reduce((nearest, segment) => {
      const nearestDistance = Math.hypot(
        nearest.position[0] - location.latitude,
        nearest.position[1] - location.longitude,
      );
      const segmentDistance = Math.hypot(
        segment.position[0] - location.latitude,
        segment.position[1] - location.longitude,
      );
      return segmentDistance < nearestDistance ? segment : nearest;
    }, ROAD_SEGMENTS[0]);

    setSelectedLocation({
      ...nearestSegment,
      name: "Map selection",
      area: "Addis Ababa",
      position: location.position,
      latitude: location.latitude,
      longitude: location.longitude,
    });
  }

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const segmentsToPredict = selectedLocation
          ? [...ROAD_SEGMENTS, selectedSegment]
          : ROAD_SEGMENTS;
        const results = await Promise.all(
          segmentsToPredict.map(async (segment) => {
            const result = await predictTraffic({
              hour,
              day_of_week: dayOfWeek,
              is_weekend: dayOfWeek >= 5 ? 1 : 0,
              length_meters: segment.lengthMeters,
              max_speed_kmh: speedLimit,
              segment_id: segment.id,
            });
            return [segment.id, result];
          }),
        );
        if (active) setPredictions((current) => ({ ...current, ...Object.fromEntries(results) }));
      } catch (requestError) {
        if (active) {
          const message = requestError.response?.data?.detail || "Unable to reach the prediction service.";
          const apiUrl = new URL(API_BASE_URL);
          setError(`${message} Check the prediction service at ${apiUrl.host} and try again.`);
        }
      } finally {
        if (active) setLoading(false);
      }
    }, 180);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [dayOfWeek, hour, selectedLocation, selectedSegment, speedLimit]);

  return (
    <main className={`app-shell theme-${theme}`}>
      <header className="topbar">
        <div className="brand"><div className="brand-mark"><span /></div><div><h1>Sheger Flow</h1><p>Urban mobility intelligence</p></div></div>
        <div className="topbar-meta">
          <span className="connection-indicator"><i /> LOCAL MODEL ONLINE</span>
          <span className="date-stamp">ADDIS ABABA · 2026</span>
          <button
            className="theme-toggle"
            type="button"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}
          >
            <span aria-hidden="true">{theme === "dark" ? "☼" : "☾"}</span>
            {theme === "dark" ? "LIGHT" : "DARK"}
          </button>
        </div>
      </header>
      <div className="dashboard">
        <aside className="sidebar">
          <div className="intro"><p className="eyebrow">TRAFFIC OPERATIONS </p><h2>Read the city<br /><em>in motion.</em></h2></div>
          <StatusCard segment={selectedSegment} prediction={predictions[selectedSegment.id]} loading={loading} error={error} />
          <ControlPanel hour={hour} dayOfWeek={dayOfWeek} speedLimit={speedLimit} onHourChange={setHour} onDayChange={setDayOfWeek} onSpeedChange={setSpeedLimit} />
        </aside>
        <section className="map-section">
          <div className="map-toolbar"><span><b>06</b> monitored corridors</span><span className="toolbar-help">Click a marker to inspect segment</span></div>
          <MapView
            segments={ROAD_SEGMENTS}
            predictions={predictions}
            selectedId={selectedId}
            selectedLocation={selectedLocation}
            onSelect={handleSegmentSelect}
            onSelectLocation={handleMapLocationSelect}
          />
        </section>
      </div>
    </main>
  );
}

export default App;

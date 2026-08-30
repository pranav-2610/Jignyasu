import { useState, useEffect, useCallback } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import { fetchEntity, fetchPins, fetchNearby } from "../api/entities";
import {Sidebar} from "./Sidebar.jsx";
import TimelineSlider from "./TimelineSlider";

const INDIA_TOPO_JSON =
  "https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@2884453/topojson/india.json";

export default function MapTimeline({ entityId, onBack, onRestart }) {
  const [entity, setEntity] = useState(null);
  const [pins, setPins] = useState([]);
  const [nearby, setNearby] = useState(null); // null = sidebar closed, [] = closed but empty result
  const [clickedRegion, setClickedRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadEntity = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEntity(id);
      setEntity(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // initial load: current entity + every pin on the map
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: kicking off async loads on mount/id-change
    loadEntity(entityId);
    fetchPins()
      .then(setPins)
      .catch(() => setPins([])); // non-fatal — map still works without the full pin overlay
  }, [entityId, loadEntity]);

  const handleRegionClick = useCallback(async (geo) => {
    const [lng, lat] = geoCentroid(geo);
    const name = geo.properties?.st_nm || geo.properties?.name || "this region";
    setClickedRegion(name);
    try {
      const results = await fetchNearby(lat, lng, 300);
      setNearby(results);
    } catch {
      setNearby([]);
    }
  }, []);

  const handlePickFromSidebar = useCallback(
    (id) => {
      setNearby(null);
      setClickedRegion(null);
      loadEntity(id);
    },
    [loadEntity]
  );

  if (loading && !entity) {
    return (
      <div className="jg-screen">
        <div className="jg-meta">loading cultural map…</div>
      </div>
    );
  }

  if (error && !entity) {
    return (
      <div className="jg-screen">
        <div className="jg-error">{error}</div>
        <button className="jg-btn jg-btn-secondary jg-btn-secondary--sm" onClick={onBack}>
          Back to reveal
        </button>
      </div>
    );
  }

  const coords = entity?.spatial_coordinates;

  return (
    <div className="jg-screen">
      <div style={{ textAlign: "center" }}>
        <div className="jg-section-label" style={{ marginBottom: 0 }}>Cultural map &amp; timeline</div>
        <h2 className="jg-subtitle">{entity.canonical_name}</h2>
      </div>

      <div className="jg-map-layout">
        <div className="jg-map-wrap jg-map-wrap--real">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 900, center: [82, 22] }}
            width={420}
            height={480}
            className="jg-map-svg"
          >
            <Geographies geography={INDIA_TOPO_JSON}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => handleRegionClick(geo)}
                    className="jg-map-region"
                    style={{
                      default: { fill: "#233F3A", stroke: "#3E6B4F", strokeWidth: 0.75, outline: "none" },
                      hover: { fill: "#2E5049", stroke: "#5A9C8A", strokeWidth: 1, outline: "none", cursor: "pointer" },
                      pressed: { fill: "#1B2E29", outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* every entity that has coordinates — small dots, explore mode */}
            {pins
              .filter((p) => p.id !== entity.id)
              .map((p) => (
                <Marker
                  key={p.id}
                  coordinates={[p.spatial_coordinates.longitude, p.spatial_coordinates.latitude]}
                  onClick={() => handlePickFromSidebar(p.id)}
                >
                  <circle r={3} fill="#C9A227" stroke="#F1E7D2" strokeWidth={0.5} style={{ cursor: "pointer" }} />
                </Marker>
              ))}

            {/* current entity — large highlighted pin */}
            {coords && (
              <Marker coordinates={[coords.longitude, coords.latitude]}>
                <circle r={7} fill="#C9522A" stroke="#F1E7D2" strokeWidth={1.5} />
                <circle r={14} fill="none" stroke="#C9522A" strokeWidth={1} opacity={0.5} />
              </Marker>
            )}
          </ComposableMap>

          {!coords && (
            <div className="jg-map-empty">no coordinates for this entity yet</div>
          )}
        </div>

        {nearby !== null && (
          <Sidebar
            regionName={clickedRegion}
            results={nearby}
            onPick={handlePickFromSidebar}
            onClose={() => setNearby(null)}
          />
        )}
      </div>

      <TimelineSlider events={entity.timeline || []} />

      <div className="jg-actions">
        <button onClick={onBack} className="jg-btn jg-btn-secondary jg-btn-secondary--sm">
          Back to reveal
        </button>
        <button onClick={onRestart} className="jg-btn jg-btn-primary jg-btn-primary--sm">
          Play again
        </button>
      </div>
    </div>
  );
}

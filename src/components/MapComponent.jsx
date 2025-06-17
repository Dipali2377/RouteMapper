import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "./Map.css";

const ORS_API_KEY = "5b3ce3597851110001cf624825a6dc83a15d4e1881ecc8ff6b57184a";

const MapComponent = () => {
  const mapRef = useRef(null);
  const routeLayerRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const mapInitialized = useRef(false);

  const [pointA, setPointA] = useState("");
  const [pointB, setPointB] = useState("");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize the map
  useEffect(() => {
    if (!mapInitialized.current) {
      mapRef.current = L.map("map").setView([28.6139, 77.209], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);
      mapInitialized.current = true;
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        mapInitialized.current = false;
      }
    };
  }, []);

  // Geocode helper
  const geocode = async (location) => {
    const response = await axios.get(
      "https://api.openrouteservice.org/geocode/search",
      {
        headers: { Authorization: ORS_API_KEY },
        params: { api_key: ORS_API_KEY, text: location, size: 1 },
      }
    );
    if (!response.data.features.length)
      throw new Error(`No results for "${location}"`);
    return response.data.features[0].geometry.coordinates;
  };

  // Calculate route
  const calculateRoute = async () => {
    if (!pointA || !pointB) return alert("Please enter both points");
    setLoading(true);
    setDistance("");
    try {
      const [coordsA, coordsB] = await Promise.all([
        geocode(pointA),
        geocode(pointB),
      ]);
      const res = await axios.post(
        "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
        { coordinates: [coordsA, coordsB] },
        {
          headers: {
            Authorization: ORS_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
      const geometry = res.data.features[0].geometry;
      const summary = res.data.features[0].properties.summary;
      setDistance((summary.distance / 1000).toFixed(2) + " km");

      const secs = summary.duration;
      const hrs = Math.floor(secs / 3600);
      const mins = Math.round((secs % 3600) / 60);
      setDuration(`${hrs > 0 ? hrs + "h " : ""}${mins}m`);

      // Remove any existing overlays
      [routeLayerRef, startMarkerRef, endMarkerRef].forEach((ref) => {
        if (ref.current) mapRef.current.removeLayer(ref.current);
      });

      const latlngs = geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      routeLayerRef.current = L.polyline(latlngs, {
        color: "blue",
        weight: 4,
        opacity: 0.8,
      }).addTo(mapRef.current);

      const addMarker = (lat, lng, iconUrl) => {
        return L.marker([lat, lng], {
          icon: L.icon({ iconUrl, iconSize: [32, 32], iconAnchor: [16, 32] }),
        }).addTo(mapRef.current);
      };
      [startMarkerRef.current, endMarkerRef.current] = [
        addMarker(
          latlngs[0][0],
          latlngs[0][1],
          "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
        ),
        addMarker(
          latlngs.at(-1)[0],
          latlngs.at(-1)[1],
          "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
        ),
      ];

      mapRef.current.fitBounds(routeLayerRef.current.getBounds());
      setTimeout(() => mapRef.current.invalidateSize(), 200);
    } catch (err) {
      console.error("Routing error:", err);
      alert(err.message || "Failed to calculate route");
    } finally {
      setLoading(false);
    }
  };

  // Clear everything
  const clearRoute = () => {
    setPointA("");
    setPointB("");
    setDistance("");
    setDuration("");
    setLoading(false);
    [routeLayerRef, startMarkerRef, endMarkerRef].forEach((ref) => {
      if (ref.current) mapRef.current.removeLayer(ref.current);
      ref.current = null;
    });
  };

  // ----------------------

  return (
    <div className="map-container-wrapper">
      <div className="controls">
        <input
          type="text"
          value={pointA}
          placeholder="Enter starting point"
          onChange={(e) => setPointA(e.target.value)}
          disabled={loading}
        />
        <input
          type="text"
          value={pointB}
          placeholder="Enter destination"
          onChange={(e) => setPointB(e.target.value)}
          disabled={loading}
        />
        <button onClick={calculateRoute} disabled={loading}>
          {loading ? "Calculating..." : "Calculate Route"}
        </button>
        <button onClick={clearRoute} disabled={loading}>
          Clear
        </button>
        {/* -------------------- */}
      </div>

      {(distance || duration) && (
        <div className="info">
          {distance && (
            <p>
              <strong>Distance:</strong> {distance}
            </p>
          )}
          {duration && (
            <p>
              <strong>Estimated time:</strong> {duration}
            </p>
          )}
        </div>
      )}

      <div id="map" style={{ height: "500px", marginTop: "10px" }}></div>
    </div>
  );
};

export default MapComponent;

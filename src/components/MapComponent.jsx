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
  const [loading, setLoading] = useState(false);

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

  const geocode = async (location) => {
    const url = `https://api.openrouteservice.org/geocode/search`;
    const response = await axios.get(url, {
      headers: { Authorization: ORS_API_KEY },
      params: {
        api_key: ORS_API_KEY,
        text: location,
        size: 1,
      },
    });

    if (response.data.features.length === 0) {
      throw new Error(`No results found for "${location}"`);
    }

    const { coordinates } = response.data.features[0].geometry;
    return coordinates;
  };

  const calculateRoute = async () => {
    if (!pointA || !pointB) {
      alert("Please enter both points");
      return;
    }

    setLoading(true);
    setDistance("");
    try {
      // Parallel geocode calls to speed up
      const [coordsA, coordsB] = await Promise.all([
        geocode(pointA),
        geocode(pointB),
      ]);

      const response = await axios.post(
        "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
        {
          coordinates: [coordsA, coordsB],
        },
        {
          headers: {
            Authorization: ORS_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      const geometry = response.data.features[0].geometry;
      const summary = response.data.features[0].properties.summary;

      setDistance((summary.distance / 1000).toFixed(2) + " km");

      if (routeLayerRef.current)
        mapRef.current.removeLayer(routeLayerRef.current);
      if (startMarkerRef.current)
        mapRef.current.removeLayer(startMarkerRef.current);
      if (endMarkerRef.current)
        mapRef.current.removeLayer(endMarkerRef.current);

      const latlngs = geometry.coordinates.map(([lng, lat]) => [lat, lng]);

      routeLayerRef.current = L.polyline(latlngs, {
        color: "blue",
        weight: 4,
        opacity: 0.8,
      }).addTo(mapRef.current);

      const [startLat, startLng] = [latlngs[0][0], latlngs[0][1]];
      startMarkerRef.current = L.marker([startLat, startLng], {
        icon: L.icon({
          iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        }),
      }).addTo(mapRef.current);

      const [endLat, endLng] = [
        latlngs[latlngs.length - 1][0],
        latlngs[latlngs.length - 1][1],
      ];
      endMarkerRef.current = L.marker([endLat, endLng], {
        icon: L.icon({
          iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        }),
      }).addTo(mapRef.current);

      mapRef.current.fitBounds(routeLayerRef.current.getBounds());
      setTimeout(() => mapRef.current.invalidateSize(), 200);
    } catch (error) {
      console.error("Routing error:", error);
      alert(error.message || "Failed to calculate route");
    } finally {
      setLoading(false);
    }
  };

  const clearRoute = () => {
    setPointA("");
    setPointB("");
    setDistance("");
    setLoading(false);
    if (routeLayerRef.current)
      mapRef.current.removeLayer(routeLayerRef.current);
    if (startMarkerRef.current)
      mapRef.current.removeLayer(startMarkerRef.current);
    if (endMarkerRef.current) mapRef.current.removeLayer(endMarkerRef.current);
    routeLayerRef.current = null;
    startMarkerRef.current = null;
    endMarkerRef.current = null;
  };

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
      </div>

      {distance && (
        <div className="info">
          <p>
            <strong>Distance:</strong> {distance}
          </p>
        </div>
      )}

      <div id="map" style={{ height: "500px", marginTop: "10px" }}></div>
    </div>
  );
};

export default MapComponent;

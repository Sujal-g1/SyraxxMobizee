// src/components/LiveStatus.jsx
import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../index.css";
const API = import.meta.env.VITE_API_URL;
const LiveStatus = () => {
  const location = useLocation();
  const mapRef = useRef(null);

  useEffect(() => {
    // --- Destroy old map if exists (important for React re-renders)
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // --- Create map
    const map = L.map("map").setView([28.6139, 77.209], 12);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // --- Green icon for start/end
    const greenIcon = L.icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
      shadowUrl: "https://unpkg.com/leaflet/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    // --- Read query params from URL
    const params = new URLSearchParams(location.search);
    const startQuery = params.get("start");
    const endQuery = params.get("end");

    if (!startQuery || !endQuery) {
      console.warn("Start or End missing in URL");
      return;
    }

    // --- Fetch route from backend
    const fetchRouteFromBackend = async (from, to) => {
      const res = await fetch(`${API}/api/routes/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to }),
      });

      if (!res.ok) {
        throw new Error("Backend route search failed");
      }

      const data = await res.json();
      return data;
    };

    fetchRouteFromBackend(startQuery, endQuery)
      .then((data) => {
        // We expect:
        // data.resolvedFrom, data.resolvedTo, data.stops

        if (!data.stops || data.stops.length === 0) {
          console.warn("No route found from backend");
          return;
        }

        const resolvedFrom = data.resolvedFrom;
        const resolvedTo = data.resolvedTo;
        const stops = data.stops;

        // --- 1. Create Start marker (BIG label)
        const startLatLng = L.latLng(resolvedFrom.lat, resolvedFrom.lng);
        L.marker(startLatLng, { icon: greenIcon })
          .addTo(map)
          .bindTooltip(
            `<b style="font-size:14px">${resolvedFrom.name}</b>`,
            { permanent: true, direction: "top", offset: [0, -10] }
          );

        // --- 2. Create End marker (BIG label)
        const endLatLng = L.latLng(resolvedTo.lat, resolvedTo.lng);
        L.marker(endLatLng, { icon: greenIcon })
          .addTo(map)
          .bindTooltip(
            `<b style="font-size:18px">${resolvedTo.name}</b>`,
            { permanent: true, direction: "top", offset: [0, -10] }
          );

        // --- 3. Draw red route polyline from all stops
        const routeLatLngs = stops.map((s) => [s.lat, s.lng]);

        const polyline = L.polyline(routeLatLngs, {
          color: "red",
          weight: 6,
          opacity: 0.9,
        }).addTo(map);

        // --- 4. Add SMALL labels for intermediate stops
        stops.forEach((stop) => {
          // Skip start and end (already added big)
          if (
            stop.name === resolvedFrom.name ||
            stop.name === resolvedTo.name
          ) {
            return;
          }

          const latlng = L.latLng(stop.lat, stop.lng);

          L.circleMarker(latlng, {
            radius: 5,
            color: "#333",
            // fillColor: "#333",
            fillOpacity: 1,
          })
            .addTo(map)
            .bindTooltip(
              `<span style="font-size:11px">${stop.name}</span>`,
              { permanent: true, direction: "right", offset: [6, 0] }
            );
        });

        // --- 5. Fit map to full route
        map.fitBounds(polyline.getBounds().pad(0.3));
      })
      .catch((err) => {
        console.error("Route fetch failed:", err);
      });

    // --- Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [location.search]);

  return <div id="map" style={{ height: "100vh", width: "100%" }} />;
};

export default LiveStatus;

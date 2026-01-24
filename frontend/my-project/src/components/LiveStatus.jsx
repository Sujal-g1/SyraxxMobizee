// src/components/LiveStatus.jsx
import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../index.css";
import Navbar from "./Navbar";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

const LiveStatus = () => {
  const location = useLocation();
  const mapRef = useRef(null);

  useEffect(() => {
    let isMounted = true; // guard against async after unmount

    // ---------------------------
    // 1. Clean map init
    // ---------------------------
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map("map").setView([28.6139, 77.209], 12);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // ---------------------------
    // 2. Marker icon
    // ---------------------------
    const greenIcon = L.icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
      shadowUrl: "https://unpkg.com/leaflet/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    // ---------------------------
    // 3. Read URL params
    // ---------------------------
    const params = new URLSearchParams(location.search);
    const startQuery = params.get("start");
    const endQuery = params.get("end");

    // ---------------------------
    // A. Always draw full network (light gray)
    // ---------------------------
    fetch(`${API}/api/routes/all`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (!data.routes) return;

        data.routes.forEach((route) => {
          if (!route.stops || route.stops.length < 2) return;

          const latLngs = route.stops.map((s) => [s.lat, s.lng]);

          L.polyline(latLngs, {
            color: "#ccc",       // light gray
            weight: 3,
            opacity: 0.6,
            interactive: false, // do not interfere with main route
          }).addTo(map);
        });
      })
      .catch((err) => {
        console.error("Failed to load full network:", err);
      });

    // ---------------------------
    // If no start/end, stop here (but network is already drawn)
    // ---------------------------
    if (!startQuery || !endQuery) {
      console.warn("Start or End missing in URL");
      return () => {
        isMounted = false;
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    }

    // ---------------------------
    // 4. Fetch searched route from backend
    // ---------------------------
    fetch(`${API}/api/routes/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: startQuery, to: endQuery }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;

        console.log("Route response:", data);

        if (!data.path || data.path.length === 0) {
          console.warn("No path returned from backend");
          return;
        }

        const path = data.path;
        const resolvedFrom = data.resolvedFrom;
        const resolvedTo = data.resolvedTo;

        // ---------------------------
        // 5. Start marker (big label)
        // ---------------------------
        const startLatLng = L.latLng(resolvedFrom.lat, resolvedFrom.lng);

        L.marker(startLatLng, { icon: greenIcon })
          .addTo(map)
          .bindTooltip(
            `<b style="font-size:16px">${resolvedFrom.name}</b>`,
            { permanent: true, direction: "top", offset: [0, -10] }
          );

        // ---------------------------
        // 6. End marker (big label)
        // ---------------------------
        const endLatLng = L.latLng(resolvedTo.lat, resolvedTo.lng);

        L.marker(endLatLng, { icon: greenIcon })
          .addTo(map)
          .bindTooltip(
            `<b style="font-size:18px">${resolvedTo.name}</b>`,
            { permanent: true, direction: "top", offset: [0, -10] }
          );

        // ---------------------------
        // 7. Draw polyline from FINAL path (RED, MAIN ROUTE)
        // ---------------------------
        const routeLatLngs = path.map((s) => [s.lat, s.lng]);

        const polyline = L.polyline(routeLatLngs, {
          color: "red",
          weight: 6,
          opacity: 0.9,
        }).addTo(map);

        // ---------------------------
        // 8. Small labels for intermediate stops
        // ---------------------------
        path.forEach((stop) => {
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
            fillOpacity: 1,
          })
            .addTo(map)
            .bindTooltip(
              `<span style="font-size:11px">${stop.name}</span>`,
              { permanent: true, direction: "right", offset: [6, 0] }
            );
        });

        // ---------------------------
        // 9. Fit map to route
        // ---------------------------
        map.fitBounds(polyline.getBounds().pad(0.3));

        // ---------------------------
        // 10. Optional: Log route type
        // ---------------------------
        if (data.type === "interchange") {
          console.log("Interchange at:", data.interchange);
        }
      })
      .catch((err) => {
        console.error("Route fetch failed:", err);
      });

    // ---------------------------
    // Cleanup
    // ---------------------------
    return () => {

      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [location.search]);

  return <div id="map" style={{ height: "100vh", width: "100%" }} />;
};

export default LiveStatus;

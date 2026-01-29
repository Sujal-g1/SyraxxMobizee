import { useEffect, useRef, useState } from "react";
import L from "leaflet";

export default function LiveNearbyBuses() {
  const mapRef = useRef(null);
  const busesRef = useRef([]);
  const [userPos, setUserPos] = useState(null);
  const [busCount, setBusCount] = useState(0);

  // 1️⃣ Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(pos => {
      setUserPos([pos.coords.latitude, pos.coords.longitude]);
    });
  }, []);

  // 2️⃣ Init map + spawn buses (safe timing)
  useEffect(() => {
    if (!userPos) return;

    const map = L.map("nearby-map").setView(userPos, 15);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
      .addTo(map);

    // radius circle
    L.circle(userPos, {
      radius: 1000,
      color: "blue",
      fillOpacity: 0.05
    }).addTo(map);

    // pulsing user dot
    const userMarker = L.circleMarker(userPos, {
      radius: 8,
      color: "#2563eb",
      fillColor: "#3b82f6",
      fillOpacity: 1
    }).addTo(map);

    const pulse = setInterval(() => {
      userMarker.setStyle({
        radius: userMarker.options.radius === 8 ? 14 : 8,
        fillOpacity: userMarker.options.fillOpacity === 1 ? 0.3 : 1
      });
    }, 700);

    // 🚌 spawn buses
    const count = 10;
    setBusCount(count);

    busesRef.current = Array.from({ length: count }).map((_, i) => {
      const lat = userPos[0] + (Math.random() - 0.5) * 0.01;
      const lng = userPos[1] + (Math.random() - 0.5) * 0.01;

      const arrival = Math.floor(Math.random() * 10) + 1;

      const marker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`🚌 Bus ${i + 1}<br/>Arrives in ${arrival} min`);

      return { lat, lng, arrival, marker };
    });

    highlightNearest();

    const moveInterval = setInterval(moveBuses, 2000);

    return () => {
      clearInterval(moveInterval);
      clearInterval(pulse);
      map.remove();
    };
  }, [userPos]);

  // 3️⃣ Move buses slightly
  function moveBuses() {
    busesRef.current.forEach(bus => {
      bus.lat += (Math.random() - 0.5) * 0.001;
      bus.lng += (Math.random() - 0.5) * 0.001;
      bus.marker.setLatLng([bus.lat, bus.lng]);
    });

    highlightNearest();
  }

  // 4️⃣ Highlight nearest bus
  function highlightNearest() {
    if (!userPos) return;

    let nearest = null;
    let minDist = Infinity;

    busesRef.current.forEach(bus => {
      const d =
        Math.pow(bus.lat - userPos[0], 2) +
        Math.pow(bus.lng - userPos[1], 2);

      if (d < minDist) {
        minDist = d;
        nearest = bus;
      }
    });

    busesRef.current.forEach(bus => {
      bus.marker.setOpacity(bus === nearest ? 1 : 0.4);
      bus.marker.setZIndexOffset(bus === nearest ? 1000 : 0);
    });
  }

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "14px",
        borderRadius: "24px",
        backdropFilter: "blur(18px)",
        background: "rgba(255,255,255,0.6)",
        border: "1px solid rgba(255,255,255,0.3)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
        position: "relative"
      }}
    >
      {/* bus count badge */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          background: "#111827",
          color: "white",
          padding: "6px 12px",
          borderRadius: "999px",
          fontSize: "12px",
          fontWeight: 600
        }}
      >
        🚌 {busCount} buses nearby
      </div>

      <div
        id="nearby-map"
        style={{
          height: "450px",
          width: "100%",
          borderRadius: "18px",
          overflow: "hidden"
        }}
      />
    </div>
  );
}

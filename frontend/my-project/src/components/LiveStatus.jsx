// src/components/LiveStatus.jsx
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-control-geocoder";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import io from "socket.io-client";
import "../index.css"; // merged Tailwind + map.css

const LiveStatus = () => {
  const location = useLocation();

  useEffect(() => {
    // --- Map setup
    const map = L.map("map").setView([28.6139, 77.209], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // --- Custom green icon
    const greenIcon = L.icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
      shadowUrl: "https://unpkg.com/leaflet/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    let startMarker = null;
    let destMarker = null;
    let geoWatchId = null;

    // --- Routing control
    const routeControl = L.Routing.control({
      waypoints: [],
      createMarker: () => null,
      routeWhileDragging: true,
      lineOptions: { styles: [{ color: "#FF0000", weight: 6, opacity: 0.9 }] },   // color can be change based on the traffic analysis
    }).addTo(map);

    const updateRouteIfReady = () => {
      if (!startMarker || !destMarker) return;
      routeControl.setWaypoints([
        startMarker.getLatLng(),
        destMarker.getLatLng(),
      ]);
    };

    // --- Function: fetch coordinates for a place
    const fetchCoords = async (place) => {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          place
        )}&countrycodes=in&limit=1`
      );
      const data = await res.json();
      if (data.length) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
      return null;
    };

    // --- Read params from Homepage
    const params = new URLSearchParams(location.search);
    const startQuery = params.get("start");
    const endQuery = params.get("end");

    if (startQuery && endQuery) {
      Promise.all([fetchCoords(startQuery), fetchCoords(endQuery)]).then(
        ([startCoords, endCoords]) => {
          if (startCoords && endCoords) {
            const startLatLng = L.latLng(startCoords[0], startCoords[1]);
            const endLatLng = L.latLng(endCoords[0], endCoords[1]);

            // Start marker
            startMarker = L.marker(startLatLng, { draggable: true, icon: greenIcon })
              .addTo(map)
              .bindPopup("Start")
              .openPopup();

            // Destination marker
            destMarker = L.marker(endLatLng, { draggable: true, icon: greenIcon })
              .addTo(map)
              .bindPopup("Destination")
              .openPopup();

            // Fit map + route
            map.fitBounds(L.latLngBounds([startLatLng, endLatLng]).pad(0.3));
            updateRouteIfReady();

            startMarker.on("dragend", updateRouteIfReady);
            destMarker.on("dragend", updateRouteIfReady);
          }
        }
      );
    }

    // --- Search UI
    const SearchControl = L.Control.extend({
      onAdd: function () {
        const container = L.DomUtil.create(
          "div",
          "search-container leaflet-bar"
        );
        container.innerHTML = `
          <input id="searchbox" class="search-input" type="text" placeholder="Search place in India..." autocomplete="off" />
          <ul id="suggestions" class="suggestions" style="display:none"></ul>
        `;
        L.DomEvent.disableClickPropagation(container);
        return container;
      },
    });
    map.addControl(new SearchControl({ position: "topleft" }));

    const input = document.getElementById("searchbox");
    const suggestions = document.getElementById("suggestions");

    // Clear button
    const clearBtn = document.createElement("span");
    clearBtn.innerHTML = "×";
    clearBtn.className = "clear-btn";
    document.querySelector(".search-container").appendChild(clearBtn);
    clearBtn.addEventListener("click", () => {
      input.value = "";
      suggestions.innerHTML = "";
      suggestions.style.display = "none";
      if (destMarker) {
        map.removeLayer(destMarker);
        destMarker = null;
      }
      routeControl.setWaypoints([]);
    });

    // Suggestions fetch
    const debounce = (fn, wait) => {
      let t;
      return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
      };
    };

    const fetchSuggestions = debounce(async (q) => {
      if (!q) {
        suggestions.style.display = "none";
        suggestions.innerHTML = "";
        return;
      }
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
        q
      )}&addressdetails=1&limit=6&countrycodes=in`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        suggestions.innerHTML = "";
        if (!data.length) {
          suggestions.style.display = "none";
          return;
        }
        for (const place of data) {
          const li = document.createElement("li");
          li.className = "suggestion-item";
          li.textContent = place.display_name;
          li.dataset.lat = place.lat;
          li.dataset.lon = place.lon;
          suggestions.appendChild(li);
        }
        suggestions.style.display = "block";
      } catch (err) {
        console.error("Suggestion fetch failed", err);
      }
    }, 300);

    input.addEventListener("input", (e) => fetchSuggestions(e.target.value));

    // Click suggestion
    suggestions.addEventListener("click", (e) => {
      const li = e.target.closest("li");
      if (!li) return;
      const lat = parseFloat(li.dataset.lat);
      const lon = parseFloat(li.dataset.lon);
      const latlng = L.latLng(lat, lon);

      if (!destMarker) {
        destMarker = L.marker(latlng, { draggable: true, icon: greenIcon })
          .addTo(map)
          .bindPopup("Destination")
          .openPopup();
        destMarker.on("dragend", () => updateRouteIfReady());
      } else {
        destMarker.setLatLng(latlng).openPopup();
      }

      input.value = li.textContent;
      suggestions.innerHTML = "";
      suggestions.style.display = "none";

      if (startMarker) {
        map.fitBounds(
          L.latLngBounds([startMarker.getLatLng(), latlng]).pad(0.3)
        );
      } else {
        map.setView(latlng, 14);
      }

      updateRouteIfReady();
    });

    // --- Live user geolocation
    if (navigator.geolocation && !startQuery) {
      // Only auto-track user if start not provided
      geoWatchId = navigator.geolocation.watchPosition(
        (pos) => {
          const latlng = L.latLng(pos.coords.latitude, pos.coords.longitude);
          if (!startMarker) {
            startMarker = L.marker(latlng, {
              draggable: true,
              icon: greenIcon,
            })
              .addTo(map)
              .bindPopup("You are here")
              .openPopup();
            startMarker.on("dragend", () => updateRouteIfReady());
            map.setView(latlng, 14);
          } else {
            startMarker.setLatLng(latlng);
          }
          updateRouteIfReady();
        },
        (err) => console.warn("Geolocation error:", err),
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
      );
    }

    // --- Map extras
    L.control.scale({ position: "bottomleft", metric: true }).addTo(map);
    map.zoomControl.setPosition("topright");

    L.control.locate = function (opts) {
      const control = L.control({ position: opts.position || "topleft" });
      control.onAdd = function () {
        const btn = L.DomUtil.create("button", "locate-btn leaflet-bar");
        btn.innerHTML = "📍";
        btn.title = "Go to my location";
        btn.style.cursor = "pointer";
        L.DomEvent.on(btn, "click", function (e) {
          L.DomEvent.stopPropagation(e);
          if (startMarker) {
            map.setView(startMarker.getLatLng(), 14);
          }
        });
        return btn;
      };
      return control;
    };
    L.control.locate({ position: "topright" }).addTo(map);

    // --- Socket.io for simulated car
    const socket = io("http://localhost:4000");
    socket.on("receive-location", (data) => {
      console.log("Car location:", data);
      // optional: show simulated vehicle
    });

    return () => {
      if (geoWatchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(geoWatchId);
      }
      socket.disconnect();
      map.remove();
    };
  }, [location.search]);

  return <div id="map" style={{ height: "100vh", width: "100%" }} />;
};

export default LiveStatus;

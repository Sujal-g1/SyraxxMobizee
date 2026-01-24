// src/components/BusInfo.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

const BusInfo = ({user}) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const start = params.get("start");
    const end = params.get("end");

    if (!start || !end) {
      setError("Start or End missing in URL");
      setLoading(false);
      return;
    }

    const fetchBuses = async () => {
      try {
        const res = await fetch(`${API}/api/routes/buses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ from: start, to: end }),
        });

        const data = await res.json();
        console.log("Bus API response:", data);

        setResult(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch buses");
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();
  }, [location.search]);

  // -----------------------
  // Helper: sort buses by time
  // -----------------------
  const sortByTime = (buses) => {
    return [...buses].sort((a, b) =>
      a.departureTime.localeCompare(b.departureTime)
    );
  };

  // -----------------------
  // Loading & Error States
  // -----------------------
  if (loading) {
    return (
      <div className="p-10 text-center text-gray-600 text-lg">
        Loading available buses...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-600 text-lg">
        {error}
      </div>
    );
  }

  if (!result || result.type === "none") {
    return (
      <div className="p-10 text-center text-gray-500 text-lg">
        No direct route found between selected stops.
      </div>
    );
  }

  // -----------------------
  // DIRECT ROUTE UI ONLY
  // -----------------------
  if (result.type === "direct") {
    const buses = sortByTime(result.buses || []);

    return (
      <>
     <Navbar user={user}/>


      <div className="p-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">
            {result.from} → {result.to}
          </h2>
          <p className="text-gray-500 mt-1">Available direct buses</p>
        </div>

        {/* No buses */}
        {buses.length === 0 && (
          <p className="text-center text-gray-500">
            No upcoming buses available on this route.
          </p>
        )}

        {/* Bus List */}
        <div className="space-y-4">
          {buses.map((bus, index) => {
            const isFirst = index === 0; // earliest bus

            return (
              <div
                key={bus._id || index}
                className={`border rounded-lg p-4 shadow-sm flex justify-between items-center
                  ${isFirst ? "border-green-500 bg-green-50" : "border-gray-200"}
                `}
              >
                {/* Left */}
                <div>
                  <p className="text-lg font-semibold">
                    {bus.busNumber}
                    {isFirst && (
                      <span className="ml-2 text-sm text-green-600 font-medium">
                        Earliest
                      </span>
                    )}
                  </p>

                  <p className="text-sm text-gray-600 mt-1">
                    Departure: <b>{bus.departureTime}</b> &nbsp; | &nbsp;
                    Arrival: <b>{bus.arrivalTime}</b>
                  </p>
                </div>

                {/* Right */}
                <div className="text-right">
                  <p className="text-lg font-semibold">₹{bus.fare}</p>
                  <p className="text-sm capitalize text-gray-600">
                    {bus.comfort}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </>
    );
  }

  // We intentionally ignore interchange UI for now
  return null;
};

export default BusInfo;

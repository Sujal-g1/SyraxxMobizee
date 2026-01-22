import React, { useState } from "react";
import { FaFilter, FaSearch } from "react-icons/fa";
import fakeBuses from "./fakeBuses";
import Navbar from "./Navbar";

export default function BusInfo() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Filter and search buses
  const filteredBuses = fakeBuses
    .filter((bus) => (filter === "all" ? true : bus.status === filter))
    .filter((bus) => bus.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
    <Navbar />    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-center">Bus Status Dashboard</h2>

      {/* Filter + Search Controls */}
      <div className="flex justify-end items-center gap-4 mb-8 relative">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by Bus ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-full pl-10 pr-4 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition w-60"
          />
          <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
        </div>

        {/* Filter Button */}
        <div className="relative">
          <button
            className="bg-white rounded-full p-3 shadow-md hover:shadow-lg transition"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <FaFilter size={20} />
          </button>

          {/* Dropdown */}
          {filterOpen && (
            <div className="absolute top-14 right-0 bg-white rounded-lg shadow-lg overflow-hidden animate-fadeIn z-50 w-40">
              {["all", "driving", "idle", "depot", "offline"].map((status) => (
                <button
                  key={status}
                  className={`block px-4 py-2 hover:bg-gray-100 w-full text-left`}
                  onClick={() => {
                    setFilter(status);
                    setFilterOpen(false);
                  }}
                >
                  {status === "all"
                    ? "All Buses"
                    : status === "driving"
                    ? "Running"
                    : status === "idle"
                    ? "Idle"
                    : status === "depot"
                    ? "At Stand"
                    : "Offline"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bus Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBuses.map((bus) => (
          <div
            key={bus.id}
            className={`relative rounded-2xl p-5 shadow-md transform transition-all duration-300 cursor-pointer 
              hover:-translate-y-2 hover:shadow-2xl
              ${
                bus.status === "driving"
                  ? "bg-gradient-to-r from-green-100 to-green-200"
                  : bus.status === "idle"
                  ? "bg-gradient-to-r from-yellow-100 to-yellow-200"
                  : bus.status === "depot"
                  ? "bg-gradient-to-r from-red-100 to-red-200"
                  : "bg-gradient-to-r from-gray-200 to-gray-300"
              }`}
          >
            {/* Bus ID + Company */}
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">{bus.company}</h3>
              <span className="text-sm text-gray-500">{bus.id}</span>
            </div>

            {/* Status Badge */}
            <div className="mb-3">
              <span
                className={`px-3 py-1 text-sm rounded-full font-medium
                  ${
                    bus.status === "driving"
                      ? "bg-green-700 text-white"
                      : bus.status === "idle"
                      ? "bg-yellow-700 text-white"
                      : bus.status === "depot"
                      ? "bg-red-700 text-white"
                      : "bg-gray-600 text-white"
                  }`}
              >
                {bus.status === "depot" ? "At Stand" : bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
              </span>
            </div>

            {/* Seat Occupancy (only for driving) */}
            {bus.status === "driving" && bus.seatOccupancy && (
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">Seat Occupancy:</span> {bus.seatOccupancy}%
              </p>
            )}

            {/* Expected Arrival Time (driving, idle, depot) */}
            {(bus.status === "driving" || bus.status === "idle" || bus.status === "depot") &&
              bus.expectedArrivalTime && (
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">ETA:</span> {bus.expectedArrivalTime}
                </p>
              )}

            {/* Live Location (for driving + idle) */}
            {(bus.status === "driving" || bus.status === "idle") && (
              <div className="text-sm text-gray-700 mb-3">
                <p><span className="font-medium">Lat:</span> {bus.lat}</p>
                <p><span className="font-medium">Lng:</span> {bus.lng}</p>
              </div>
            )}

            {/* Alerts */}
            <div className="text-sm">
              <p>
                Overspeed:{" "}
                {bus.alerts.overspeed ? (
                  <span className="text-red-600 font-medium">Yes</span>
                ) : (
                  <span className="text-gray-500">No</span>
                )}
              </p>
              <p>
                Unplugged:{" "}
                {bus.alerts.unplugged ? (
                  <span className="text-red-600 font-medium">Yes</span>
                ) : (
                  <span className="text-gray-500">No</span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Animation for dropdown */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
    </>

  );
}

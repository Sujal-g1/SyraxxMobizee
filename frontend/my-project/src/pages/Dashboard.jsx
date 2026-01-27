// src/components/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { MdLocationOn, MdStars } from "react-icons/md";
import { GrLanguage } from "react-icons/gr";
import { GoAlertFill } from "react-icons/go";
import { FaWallet, FaUser } from "react-icons/fa";
import fakeBuses from "./fakeBuses";
import "leaflet/dist/leaflet.css";

// ---------- Random status generator ----------
const getRandomStatus = () => (Math.random() > 0.5 ? "Active" : "Inactive");

export default function Dashboard({ user, locationName = "Delhi" }) {
  const [buses, setBuses] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLangOptions, setShowLangOptions] = useState(false);
  const [greenPoints, setGreenPoints] = useState(120);

  // Scroll listener for shadow effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Assign random status to buses
  useEffect(() => {
    const busesWithStatus = fakeBuses.map((bus) => ({
      ...bus,
      status: getRandomStatus(),
    }));
    setBuses(busesWithStatus);
  }, []);

  const totalBuses = buses.length;
  const activeCount = buses.filter((b) => b.status === "Active").length;
  const inactiveCount = totalBuses - activeCount;

  // Panic button handler
  const handlePanic = () => {
    alert("🚨 Panic alert triggered!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ---------- NAVBAR ---------- */}
      <nav
        className={`fixed top-0 left-0 z-50 w-full p-4 flex items-center bg-black text-white ${
          isScrolled ? "shadow-lg" : ""
        }`}
      >
        {/* left side logo & location */}
        <div className="flex items-center gap-10 p-2 ml-3">
          <h1 className="text-2xl font-bold">Mobizee</h1>

          <div
            className="flex items-center gap-1 text-white
        relative after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full
             after:bg-gradient-to-r after:from-orange-500 after:via-white after:to-green-500
             after:scale-x-0 after:origin-left hover:after:scale-x-100
             after:transition-transform after:duration-300"
          >
            <MdLocationOn /> {locationName}
          </div>
        </div>

        {/* multilanguage */}
        <div className="relative ml-auto">
          <button
            onClick={() => setShowLangOptions((prev) => !prev)}
            className="text-white px-5 py-2 flex items-center gap-3 text-2xl hover:text-green-500"
          >
            <GrLanguage />
          </button>

          {showLangOptions && (
            <div className="absolute right-0 mt-2 w-32 bg-white text-black rounded shadow-lg z-50 text-center">
              <button
                className="block w-full  px-4 py-2 hover:bg-gray-200"
                onClick={() => setShowLangOptions(false)}
              >
                English
              </button>
              <button
                className="block w-full px-4 py-2 hover:bg-gray-200"
                onClick={() => setShowLangOptions(false)}
              >
                हिंदी
              </button>
              <button
                className="block w-full px-4 py-2 hover:bg-gray-200"
                onClick={() => setShowLangOptions(false)}
              >
                ਪੰਜਾਬੀ
              </button>
            </div>
          )}
        </div>

        {/* right side -> wallet and user section */}
        <div className="flex-1 justify-end flex gap-4 mr-3">

          {/* user */}
          <button
            className="bg-white text-black px-10 py-2 flex items-center gap-3 text-xl rounded-lg
                             border hover:bg-black hover:text-white
                            transition-all duration-300 ease-in-out "
          >
            <FaUser /> {user ? user.firstName : "Guest"}
          </button>
        </div>
      </nav>

      {/* ---------- DASHBOARD CONTENT ---------- */}
      <div className="p-6 font-sans pt-28">
        {/* Dashboard Header */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Bus Monitoring Dashboard
        </h1>

        {/* Top Section (Status + Alerts) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Status Overview */}
          <div className="bg-white rounded-2xl shadow p-6 col-span-2">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Bus Status Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                title="Total Buses"
                value={totalBuses}
                color="text-blue-600"
              />
              <StatCard
                title="Active"
                value={activeCount}
                color="text-green-600"
              />
              <StatCard
                title="Inactive"
                value={inactiveCount}
                color="text-red-500"
              />
              <StatCard
                title="Overspeed Alerts"
                value={buses.filter((bus) => bus.alerts?.overspeed).length}
                color="text-yellow-500"
              />
            </div>
          </div>

          {/* Alert Summary */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Alerts Status
            </h2>
            <ul className="space-y-3 text-sm">
              <AlertRow label="Over speeding" value={32} />
              <AlertRow label="Device unplugged" value={12} />
              <AlertRow label="No data" value={9} />
              <AlertRow label="Device offline" value={5} />
            </ul>
          </div>
        </div>

        {/* Middle Section (Geofence + Companies) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Geofence Info */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Geofence
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <StatCard title="In Depot" value={120} color="text-purple-600" />
              <StatCard
                title="Waiting in Pump"
                value={34}
                color="text-orange-500"
              />
              <StatCard
                title="Way to Pump"
                value={18}
                color="text-indigo-500"
              />
              <StatCard title="Others" value={7} color="text-gray-600" />
            </div>
          </div>

          {/* Company Breakdown */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Company
            </h2>
            <div className="space-y-3">
              <CompanyRow name="CityBus Ltd" value={4627} color="bg-blue-500" />
              <CompanyRow name="MetroTrans" value={2917} color="bg-green-500" />
              <CompanyRow name="RapidMove" value={3957} color="bg-red-500" />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow overflow-hidden mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
                <th className="px-4 py-3">Bus ID</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Alerts</th>
              </tr>
            </thead>
            <tbody>
              {buses.map((bus, idx) => (
                <tr
                  key={bus.id}
                  className={`border-b ${
                    idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {bus.id}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{bus.company}</td>
                  <td
                    className={`px-4 py-3 font-semibold ${
                      bus.status === "Active"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {bus.status}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {bus.alerts?.overspeed ? "Overspeed " : ""}
                    {bus.alerts?.unplugged ? "Unplugged" : ""}
                    {!bus.alerts?.overspeed && !bus.alerts?.unplugged
                      ? "None"
                      : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------- Small Components ---------- */
function StatCard({ title, value, color }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 text-center shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function AlertRow({ label, value }) {
  return (
    <li className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-bold text-gray-800">{value}</span>
    </li>
  );
}

function CompanyRow({ name, value, color }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${color}`}></span>
        <span className="text-gray-700">{name}</span>
      </div>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  );
}

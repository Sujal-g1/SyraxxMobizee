import React, { useState } from "react";
import Navbar from "./Navbar";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function NfcCard({ user, refreshUser }) {
  const [mode, setMode] = useState("BUS");
  const [sourceStation, setSourceStation] = useState("");
  const [destinationStation, setDestinationStation] = useState("");
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // Enable Card
  // -----------------------------
  const handleEnableCard = async () => {
    if (!user?._id || !user?.email) {
      alert("User not logged in");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/users/enable-feature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: user._id,
          email: user.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to enable card");

      alert("MobMagic Card enabled successfully");

      // 🔥 Refresh user from backend after enabling
      const token = localStorage.getItem("token");
      const meRes = await fetch(`${API}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const meData = await meRes.json();

      refreshUser(meData.user);
      localStorage.setItem("user", JSON.stringify(meData.user));

    } catch (err) {
      console.error(err);
      alert("Error enabling card: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Tap In
  // -----------------------------
  const handleTapIn = async () => {
    if (!sourceStation) {
      alert("Please enter source station");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/users/journey/tap-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user._id,
          mode,
          source_station: sourceStation,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tap-in failed");

      alert("Tap-in successful");

      // Refresh user
      const token = localStorage.getItem("token");
      const meRes = await fetch(`${API}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const meData = await meRes.json();

      refreshUser(meData.user);
      localStorage.setItem("user", JSON.stringify(meData.user));

    } catch (err) {
      console.error(err);
      alert("Tap-in error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Tap Out (Backend not added yet)
  // -----------------------------
  const handleTapOut = async () => {
    if (!destinationStation) {
      alert("Please enter destination station");
      return;
    }

    alert("Tap-out will be implemented next (backend pending)");
  };

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />

      <div className="flex flex-1 items-center justify-center">
        <div className="bg-white shadow-lg rounded-xl p-8 max-w-lg w-full space-y-6">

          <h2 className="text-2xl font-bold text-gray-800 text-center">
            MobMagic Card
          </h2>

          {/* Card Status */}
          <div className="bg-gray-50 p-4 rounded-lg border space-y-1">
            <p>
              <strong>Card Enabled:</strong>{" "}
              {user.mobmagic_enabled ? "Yes" : "No"}
            </p>
            <p>
              <strong>Active Journey:</strong>{" "}
              {user.active_journey_id ? "Yes" : "No"}
            </p>
            <p>
              <strong>Wallet Balance:</strong> ₹{user.wallet_balance}
            </p>
          </div>

          {/* Enable Card */}
          {!user.mobmagic_enabled && (
            <button
              onClick={handleEnableCard}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Enable MobMagic Card
            </button>
          )}

          {/* Tap In Section */}
          {user.mobmagic_enabled && !user.active_journey_id && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-semibold">Start Journey (Tap In)</h3>

              <div>
                <label className="block text-gray-700">Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="BUS">Bus</option>
                  <option value="METRO">Metro</option>
                  <option value="TRAIN">Train</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700">Source Station</label>
                <input
                  type="text"
                  placeholder="Enter source station"
                  value={sourceStation}
                  onChange={(e) => setSourceStation(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <button
                onClick={handleTapIn}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
              >
                Tap In
              </button>
            </div>
          )}

          {/* Tap Out Section */}
          {user.mobmagic_enabled && user.active_journey_id && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-semibold">End Journey (Tap Out)</h3>

              <div>
                <label className="block text-gray-700">Destination Station</label>
                <input
                  type="text"
                  placeholder="Enter destination station"
                  value={destinationStation}
                  onChange={(e) => setDestinationStation(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <button
                onClick={handleTapOut}
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition"
              >
                Tap Out
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

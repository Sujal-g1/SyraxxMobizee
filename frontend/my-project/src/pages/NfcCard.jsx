import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  QrCode,
  History,
  Play,
  StopCircle,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

const API = import.meta.env.VITE_API_URL;

export default function NfcCard({ user, setUser }) {
  const [tab, setTab] = useState("journey"); // journey | qr | history

  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [journeyId, setJourneyId] = useState(null);
  const [status, setStatus] = useState("IDLE"); // IDLE | ACTIVE | COMPLETED
  const [fareResult, setFareResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [allStops, setAllStops] = useState([]);
const [sourceSuggestions, setSourceSuggestions] = useState([]);
const [destSuggestions, setDestSuggestions] = useState([]);

useEffect(() => {
  const fetchStops = async () => {
    try {
      const res = await fetch(`${API}/api/routes/all`);
      const data = await res.json();

      const namesSet = new Set();

      data.routes.forEach((r) => {
        r.stops.forEach((s) => {
          if (s.name) namesSet.add(s.name);
        });
      });

      setAllStops([...namesSet]);
    } catch (err) {
      console.error("Failed to fetch stops", err);
    }
  };

  fetchStops();
}, []);

const filterStops = (value) => {
  if (!value) return [];
  const v = value.toLowerCase();
  return allStops.filter((name) =>
    name.toLowerCase().includes(v)
  ).slice(0, 6); // limit to 6 suggestions
};


  const token = localStorage.getItem("token");

  // 🔎 Fetch active journey on load
  useEffect(() => {
    if (!user || !token) return;

    const fetchActive = async () => {
      try {
        const res = await fetch(`${API}/api/users/journey/active/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.active) {
          setJourneyId(data.journey_id);
          setSource(data.source_station);
          setStatus("ACTIVE");
        } else {
          setJourneyId(null);
          setStatus("IDLE");
        }
      } catch (err) {
        console.error("Failed to fetch active journey");
      }
    };

    fetchActive();
  }, [user, token]);

  const fetchHistory = async () => {
  if (!user || !token) return;

  try {
    const res = await fetch(`${API}/api/users/journey/history/${user._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (res.ok) {
      setHistory(data.journeys || []);
    }
  } catch (err) {
    console.error("Failed to fetch history", err);
  }
};


  // 📜 Fetch journey history
  // 📜 Fetch journey history on load
useEffect(() => {
  if (!user || !token) return;
  fetchHistory();
}, [user, token]);


  // ▶️ Start Journey
  const handleTapIn = async () => {
    if (!source) return alert("Enter source station");

    try {
      const res = await fetch(`${API}/api/users/journey/tap-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user._id,
          mode: "BUS",
          source_station: source,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tap-in failed");

      setJourneyId(data.journey_id);
      setStatus("ACTIVE");
      alert("Journey started");
    } catch (err) {
      alert(err.message);
    }
  };

  // ⏹ End Journey
 const handleTapOut = async () => {
  if (!destination) return alert("Enter destination station");
  if (!journeyId) return alert("No active journey found");

  try {
    const res = await fetch(`${API}/api/users/journey/tap-out`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: user._id,
        journey_id: journeyId,          // 🔥 REQUIRED
        destination_station: destination,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Tap-out failed");

    setFareResult(data);
    setStatus("COMPLETED");
    setJourneyId(null);
    await fetchHistory();

    // 🔥 UPDATE USER BALANCE LOCALLY
const updatedUser = {
  ...user,
  wallet_balance: data.wallet_balance,
};

setUser(updatedUser);
localStorage.setItem("user", JSON.stringify(updatedUser));

    alert(`Journey completed. Fare ₹${data.fare}`);
  } catch (err) {
    alert(err.message);
  }
};


  const qrValue = JSON.stringify({
    user_id: user._id,
    wallet_id: user.wallet_id,
    active_journey_id: journeyId,
  });

  if (!user) return null;

  return (
    <>
      <Navbar user={user} />

      <div className="min-h-screen bg-gray-50 flex justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-6">

          {/* 💳 Top Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-3xl p-5 sm:p-6 shadow-lg bg-gradient-to-r from-slate-300 to-slate-500"
          >
            <div className="absolute inset-0 bg-white/20" />

            <div className="relative text-black">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                <p className="text-xs uppercase tracking-widest">MobMagic Card</p>
              </div>

              <motion.h2
                key={user.wallet_balance}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="text-3xl sm:text-4xl font-extrabold mt-3"
              >
                ₹ {user.wallet_balance}
              </motion.h2>

              <p className="text-[11px] mt-3 opacity-80">
                Wallet ID • {user.wallet_id}
              </p>
            </div>
          </motion.div>

          {/* 🧭 Tabs */}
          <div className="flex bg-white rounded-xl p-1 shadow-sm">
            {[
              { id: "journey", label: "Journey" },
              { id: "qr", label: "QR Code" },
              { id: "history", label: "History" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === t.id
                    ? "bg-black text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* 🔁 Tab Content */}
          <AnimatePresence mode="wait">

            {/* 🚍 Journey Panel */}
            {tab === "journey" && (
              <motion.div
                key="journey"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl p-5 shadow space-y-4"
              >
                <h3 className="font-semibold text-gray-800">Journey Control</h3>

              <div className="relative">
  <input
    type="text"
    placeholder="Source Station"
    value={source}
    onChange={(e) => {
      const val = e.target.value;
      setSource(val);
      setSourceSuggestions(filterStops(val));
    }}
    disabled={status === "ACTIVE"}
    className="w-full rounded-lg px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-black"
  />

  {sourceSuggestions.length > 0 && status !== "ACTIVE" && (
    <div className="absolute z-10 w-full bg-white border rounded-lg shadow mt-1 max-h-40 overflow-y-auto">
      {sourceSuggestions.map((name) => (
        <div
          key={name}
          onClick={() => {
            setSource(name);
            setSourceSuggestions([]);
          }}
          className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
        >
          {name}
        </div>
      ))}
    </div>
  )}
</div>


            <div className="relative">
  <input
    type="text"
    placeholder="Destination Station"
    value={destination}
    onChange={(e) => {
      const val = e.target.value;
      setDestination(val);
      setDestSuggestions(filterStops(val));
    }}
    disabled={status !== "ACTIVE"}
    className="w-full rounded-lg px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-black"
  />

  {destSuggestions.length > 0 && status === "ACTIVE" && (
    <div className="absolute z-10 w-full bg-white border rounded-lg shadow mt-1 max-h-40 overflow-y-auto">
      {destSuggestions.map((name) => (
        <div
          key={name}
          onClick={() => {
            setDestination(name);
            setDestSuggestions([]);
          }}
          className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
        >
          {name}
        </div>
      ))}
    </div>
  )}
</div>


                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleTapIn}
                    disabled={status === "ACTIVE"}
                    className="flex-1 py-3 rounded-xl bg-black text-white font-semibold shadow disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" /> Start
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleTapOut}
                    disabled={status !== "ACTIVE"}
                    className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold shadow disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <StopCircle className="w-4 h-4" /> End
                  </motion.button>
                </div>

                {fareResult && (
                  <div className="mt-3 text-sm space-y-1">
                    <p>From: {fareResult.source}</p>
                    <p>To: {fareResult.destination}</p>
                    <p>Distance: {fareResult.distance_km} km</p>
                    <p className="text-green-700 font-semibold">
                      Fare: ₹{fareResult.fare}
                    </p>
                    <p className="text-blue-700">
                      Balance Left: ₹{fareResult.wallet_balance}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* 🔳 QR Panel */}
            {tab === "qr" && (
              <motion.div
                key="qr"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl p-5 shadow space-y-4 text-center"
              >
                <h3 className="font-semibold text-gray-800 flex items-center justify-center gap-2">
                  <QrCode className="w-5 h-5" /> Entry QR Code
                </h3>

                <div className="flex justify-center">
                  <QRCodeCanvas value={qrValue} size={200} />
                </div>

                <p className="text-xs text-gray-500">
                  Scan this QR to validate your entry
                </p>
              </motion.div>
            )}

            {/* 📜 History Panel */}
            {tab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl p-5 shadow"
              >
                <h3 className="font-semibold text-gray-800 mb-4">Journey History</h3>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {history.length === 0 && (
                    <p className="text-gray-400 text-sm">No journeys yet</p>
                  )}

                  {history.map((j) => (
                    <motion.div
                      key={j._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-between items-center border-b pb-2"
                    >
                      <div>
                        <p className="font-medium">
                          {j.source_station} → {j.destination_station}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {new Date(j.tap_out_time).toLocaleString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-green-700 font-semibold">₹{j.fare}</p>
                        <p className="text-[11px] text-gray-400">
                          {j.distance_km} km
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </div>
    </>
  );
}

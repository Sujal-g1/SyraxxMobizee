import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import tap from "../../public/tap.mp3"
import { CreditCard,QrCode, History,Play,StopCircle } from "lucide-react";
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
// NFC enhancements
const [tapStartTime, setTapStartTime] = useState(null);
const [elapsed, setElapsed] = useState(0);
const [routeStops, setRouteStops] = useState([]);
const [activeStopIndex, setActiveStopIndex] = useState(0);


useEffect(() => {
  if (status === "RECEIPT") {
    const t = setTimeout(() => {
      setStatus("IDLE");
      setSource("");
      setDestination("");
      setFareResult(null);
    }, 3000);

    return () => clearTimeout(t);
  }
}, [status]);


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

useEffect(() => {
  if (status !== "ACTIVE" || !tapStartTime) return;

  const interval = setInterval(() => {
    setElapsed(Math.floor((Date.now() - tapStartTime) / 1000));
  }, 1000);

  return () => clearInterval(interval);
}, [status, tapStartTime]);

const playTapSound = () => {
  const audio = new Audio(tap);
  audio.play().catch(() => {});
};

const vibrate = () => {
  if (navigator.vibrate) navigator.vibrate(40);
};

const formatTime = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
};


const filterStops = (value) => {
  if (!value) return [];
  const v = value.toLowerCase();
  return allStops.filter((name) =>
    name.toLowerCase().includes(v)
  ).slice(0, 6); // limit to 6 suggestions
};


const fetchRouteSegment = async (src, dest) => {
  if (!src || !dest) return;

  try {
    const res = await fetch(`${API}/api/routes/all`);
    const data = await res.json();

    for (const route of data.routes) {
      const stops = route.stops.map(s => s.name);

      const i1 = stops.indexOf(src);
      const i2 = stops.indexOf(dest);

      if (i1 !== -1 && i2 !== -1) {
        const segment =
          i1 <= i2
            ? stops.slice(i1, i2 + 1)
            : stops.slice(i2, i1 + 1).reverse();

        setRouteStops(segment);
        setActiveStopIndex(0);
        break;
      }
    }
  } catch (err) {
    console.error("Route fetch failed", err);
  }
};

useEffect(() => {
  if (status === "ACTIVE" && destination) {
    fetchRouteSegment(source, destination);
  }
}, [destination]);

useEffect(() => {
  if (routeStops.length === 0 || status !== "ACTIVE") return;

  const interval = setInterval(() => {
    setActiveStopIndex((i) =>
      i < routeStops.length - 1 ? i + 1 : i
    );
  }, 1500);

  return () => clearInterval(interval);
}, [routeStops, status]);


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
      fetchRouteSegment(source, destination);
      alert("Journey started");
      playTapSound();
      vibrate();
      setTapStartTime(Date.now());

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
    setStatus("RECEIPT");
    playTapSound();
    vibrate();

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


  const stats = history.reduce(
  (acc, j) => {
    acc.trips += 1;
    acc.km += j.distance_km || 0;
    acc.fare += j.fare || 0;
    return acc;
  },
  { trips: 0, km: 0, fare: 0 }
);

stats.avg = stats.trips
  ? (stats.km / stats.trips).toFixed(1)
  : 0;
const weekly = Array(7).fill(0);

history.forEach((j) => {
  const d = new Date(j.ended_at).getDay();
  weekly[d] += j.fare || 0;
});


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
           {/* 🚍 Journey Panel — VERSION A */}
{tab === "journey" && (
  <motion.div
    key="journey"
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -30 }}
    transition={{ duration: 0.3 }}
    className="bg-white rounded-2xl p-6 shadow space-y-6 text-center"
  >
    {status === "IDLE" && (
      <>
        <h3 className="font-semibold text-gray-800">
          Tap to Enter
        </h3>

        {/* Source input */}
        <div className="relative text-left">
          <input
            value={source}
            onChange={(e) => {
              const v = e.target.value;
              setSource(v);
              setSourceSuggestions(filterStops(v));
            }}
            placeholder="Source Station"
            className="w-full border px-3 py-2 rounded-lg"
          />

          {sourceSuggestions.length > 0 && (
            <div className="absolute bg-white border rounded-lg shadow w-full mt-1 z-10">
              {sourceSuggestions.map((s) => (
                <div
                  key={s}
                  onClick={() => {
                    setSource(s);
                    setSourceSuggestions([]);
                  }}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        <motion.div
          whileTap={{ scale: 0.9 }}
          onClick={handleTapIn}
          className="mx-auto w-48 h-48 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg shadow-xl cursor-pointer"
        >
          TAP IN
        </motion.div>
      </>
    )}

    {status === "ACTIVE" && (
      <>
        <p className="text-green-600 font-semibold">
          Journey Active
        </p>

        <p className="text-sm text-gray-500">
          Time: {formatTime(elapsed)}
        </p>

        <p className="text-sm">
          From: <b>{source}</b>
        </p>

        {/* Destination */}
        <div className="relative text-left">
          <input
            value={destination}
            onChange={(e) => {
              const v = e.target.value;
              setDestination(v);
              setDestSuggestions(filterStops(v));
            }}
            placeholder="Destination Station"
            className="w-full border px-3 py-2 rounded-lg"
          />

          {destSuggestions.length > 0 && (
            <div className="absolute bg-white border rounded-lg shadow w-full mt-1 z-10">
              {destSuggestions.map((s) => (
                <div
                  key={s}
                  onClick={() => {
                    setDestination(s);
                    setDestSuggestions([]);
                  }}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        <motion.div
          whileTap={{ scale: 0.9 }}
          onClick={handleTapOut}
          className="mx-auto w-48 h-48 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg shadow-xl cursor-pointer"
        >
          TAP OUT
        </motion.div>
      </>
    )}

    <div className="flex items-center overflow-x-auto gap-3 py-2">

  {routeStops.map((stop, i) => (
    <div key={i} className="flex items-center gap-2">

      <div
        className={`w-3 h-3 rounded-full ${
          i <= activeStopIndex
            ? "bg-black"
            : "bg-gray-300"
        }`}
      />

      <span
        className={`text-xs ${
          i === activeStopIndex
            ? "font-bold text-black"
            : "text-gray-500"
        }`}
      >
        {stop}
      </span>

      {i !== routeStops.length - 1 && (
        <div className="w-6 h-[2px] bg-gray-300" />
      )}
    </div>
  ))}

</div>


    {status === "RECEIPT" && fareResult && (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-50 rounded-xl p-4 shadow-inner space-y-2"
      >
        <p className="text-green-600 font-bold text-xl">
          ✔ Journey Complete
        </p>

        <p className="text-sm">
          {fareResult.source} → {fareResult.destination}
        </p>

        <p className="text-sm text-gray-600">
          {fareResult.distance_km} km
        </p>

        <p className="text-lg font-semibold">
          ₹{fareResult.fare}
        </p>

        <p className="text-blue-700">
          Balance: ₹{fareResult.wallet_balance}
        </p>

        <p className="text-xs text-gray-400">
          Resetting…
        </p>
      </motion.div>
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
                {/* 📊 Stats dashboard */}
<div className="grid grid-cols-2 gap-3 mb-4">

  <div className="bg-gray-50 rounded-xl p-3 text-center shadow">
    <p className="text-xs text-gray-500">Trips</p>
    <p className="text-lg font-bold">{stats.trips}</p>
  </div>

  <div className="bg-gray-50 rounded-xl p-3 text-center shadow">
    <p className="text-xs text-gray-500">Distance</p>
    <p className="text-lg font-bold">{stats.km} km</p>
  </div>

  <div className="bg-gray-50 rounded-xl p-3 text-center shadow">
    <p className="text-xs text-gray-500">Spent</p>
    <p className="text-lg font-bold">₹{stats.fare}</p>
  </div>

  <div className="bg-gray-50 rounded-xl p-3 text-center shadow">
    <p className="text-xs text-gray-500">Avg Ride</p>
    <p className="text-lg font-bold">{stats.avg} km</p>
  </div>

</div>

{/* 📈 Weekly spend chart */}
<div className="bg-gray-50 rounded-xl p-3 mb-4 shadow">
  <p className="text-xs text-gray-500 mb-2">Weekly Spend</p>

  <div className="flex items-end gap-2 h-20">
    {weekly.map((v, i) => (
      <div
        key={i}
        className="flex-1 bg-black rounded-t"
        style={{
          height: `${Math.max(v, 5)}%`
        }}
      />
    ))}
  </div>
</div>

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
                        {new Date(j.ended_at).toLocaleString()}</p>
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

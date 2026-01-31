import React, { useState, useRef } from "react";
import hornSound from "../assets/horn.mp3";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { IoCloseSharp } from "react-icons/io5";
const PanicButton = ({ user }) => {
  const [pressCount, setPressCount] = useState(0);
  const [isPanic, setIsPanic] = useState(false);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [error, setError] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [emails, setEmails] = useState(["", "", ""]);
  const [savingEmails, setSavingEmails] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const API = import.meta.env.VITE_API_URL;
  const audioRef = useRef(null);
  const navigate = useNavigate();

  const handlePanic = () => {
    const newCount = pressCount + 1;
    setPressCount(newCount);
    if (newCount >= 3) {
      setIsPanic(true);
      if (audioRef.current) {
        audioRef.current.loop = true; // Keep playing until stopped
        audioRef.current
          .play()
          .catch((e) => console.error("Audio play failed", e));
        setIsSoundPlaying(true);
      }
      getLocation();
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setLocation({ lat, lon });
        setLoadingLocation(false);
        try {
          await fetch(`${API}/api/panic`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user._id, lat, lon }),
          });
        } catch (err) {
          console.error("API Error:", err);
        }
      },
      () => {
        setError("Location access denied");
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true },
    );
  };

  // --- RECTIFIED STOP FUNCTIONS ---

  const handleStopSound = (e) => {
    if (e) e.stopPropagation(); // Prevents bubbling to parent elements
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSoundPlaying(false);
    }
  };

  const handleStop = (e) => {
    if (e) e.stopPropagation();
    // 1. Kill the sound first
    handleStopSound();

    // 2. Reset local state
    setIsPanic(false);
    setPressCount(0);
    setLocation({ lat: null, lon: null });

    // 3. Navigate away
    setTimeout(() => {
      navigate("/homepage");
    }, 100);
  };

  const saveEmails = async () => {
    setSavingEmails(true);
    try {
      const res = await fetch(`${API}/api/emergency/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          emails: emails.filter((e) => e !== ""),
        }),
      });
      if (res.ok) {
        setSavedMessage("Contacts saved! ✅");
        setTimeout(() => {
          setSavedMessage("");
          setShowEmailSettings(false);
        }, 1500);
      }
    } catch (err) {
      setSavedMessage("Error saving");
    } finally {
      setSavingEmails(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10 overflow-x-hidden">
      <Navbar user={user} />

      <main className="max-w-md mx-auto px-6 pt-8">
        {/* Settings Toggle */}
        <motion.div className="flex justify-center mb-6"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{
          delay:0.5,
          duration: 1.8,
          ease: [0.16, 1, 0.3, 1], 
        }}>
          <button
            onClick={() => setShowEmailSettings(!showEmailSettings)}
            className={`relative z-10 flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold shadow-sm transition-all
              ${showEmailSettings ? "bg-slate-800 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
          >
            {showEmailSettings ? (
              <IoCloseSharp className="w-5 h-5 font-bold" />
            ) : (
              "⚙️ Emergency Contacts"
            )}
          </button>
        </motion.div>
        {/* Email Settings Card */}
        <AnimatePresence>
          {showEmailSettings && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-[2rem] p-6 shadow-xl border border-slate-100 mb-8 relative z-20"
            >
              <h2 className="font-black text-slate-800 text-lg mb-4">
                Relative's Emails
              </h2>
              <div className="space-y-3">
                {emails.map((email, i) => (
                  <input
                    key={i}
                    type="email"
                    value={email}
                    placeholder={`Email ${i + 1}`}
                    onChange={(e) => {
                      const copy = [...emails];
                      copy[i] = e.target.value;
                      setEmails(copy);
                    }}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                ))}
              </div>
              <button
                onClick={saveEmails}
                disabled={savingEmails}
                className="w-full mt-4 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-colors"
              >
                {savingEmails ? "Saving..." : "Save Settings"}
              </button>
              {savedMessage && (
                <p className="text-center text-xs font-bold text-emerald-500 mt-3">
                  {savedMessage}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Panic Button Card */}
        <motion.div
          initial={{ y: 0 }}
        animate={{ y: 80 }}
        transition={{
          delay:0.5,
          duration: 1.8,
          ease: [0.16, 1, 0.3, 1], 
        }}
          className={`relative rounded-[2.5rem] p-10 text-center shadow-2xl  z-0 overflow-hidden
  ${isPanic ? "bg-white border-2 border-red-500 shadow-red-200" : "bg-white border border-slate-100 shadow-slate-100"}`}
        >
          {/* --- NEW WAVE EFFECT --- */}
          {isPanic && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{
                    scale: [0.8, 2.5],
                    opacity: [0.5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.6,
                    ease: "easeOut",
                  }}
                  className="absolute w-44 h-44 rounded-full border-2 border-red-400"
                />
              ))}
              {/* Subtle full-card flash */}
              <motion.div
                animate={{ opacity: [0, 0.1, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 bg-red-500"
              />
            </div>
          )}
          {/* --- END WAVE EFFECT --- */}

          <h1
            className={`text-2xl font-black mb-2 relative z-10 ${isPanic ? "text-red-600" : "text-slate-800"}`}
          >
            {isPanic ? "EMERGENCY ACTIVE" : "Panic Button"}
          </h1>
          <p className="text-slate-400 text-sm mb-10 font-medium relative z-10">
            Tap 3 times to alert contacts
          </p>

          <button
            onClick={handlePanic}
            className={`relative mx-auto w-44 h-44 rounded-full text-white text-4xl font-black shadow-2xl flex items-center justify-center transition-all z-20
    ${isPanic ? "bg-red-600 scale-105" : "bg-red-500 hover:bg-red-600"}`}
          >
            {isPanic ? "!" : `${pressCount}/3`}
          </button>

          {/* CONTROL SECTION */}
          <div className="mt-10 space-y-4 relative z-30">
            {isPanic && (
              <button
                onClick={handleStop}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all block"
              >
                End Emergency & Exit
              </button>
            )}

            {isSoundPlaying && (
              <button
                onClick={handleStopSound}
                className="w-full py-4 bg-amber-400 text-amber-900 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all block"
              >
                🔇 Silence Sound Only
              </button>
            )}

            {/* Status Footer */}
            {(location.lat || loadingLocation) && (
              <div className="mt-4 pt-4 border-t border-slate-50 relative z-10">
                {loadingLocation ? (
                  <p className="text-blue-500 text-xs font-bold animate-pulse uppercase tracking-widest">
                    📡 Sending Location...
                  </p>
                ) : (
                  <p className="text-slate-400 text-[10px] font-mono">
                    Coordinates: {location.lat}, {location.lon}
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>{" "}
      </main>

      <audio ref={audioRef} src={hornSound} />
    </div>
  );
};

export default PanicButton;

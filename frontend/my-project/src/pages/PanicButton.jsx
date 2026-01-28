import React, { useState, useRef , useEffect } from "react";
import hornSound from "../assets/horn.mp3";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const PanicButton = ({user}) => {
  const [pressCount, setPressCount] = useState(0);
  const [isPanic, setIsPanic] = useState(false);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [error, setError] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const audioRef = useRef(null);
  const navigate = useNavigate();

  const handlePanic = () => {
    const newCount = pressCount + 1;
    setPressCount(newCount);

    if (newCount >= 3) {
      setIsPanic(true);
      setError(null);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.play();
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
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
        setLoadingLocation(false);
      },
      () => {
        setError("Getting location...");
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleStop = () => {
  setIsPanic(false);
  setPressCount(0);
  setLocation({ lat: null, lon: null });
  setError(null);
  setLoadingLocation(false);

  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsSoundPlaying(false);
  }

  // ⏩ Redirect back to trigger page
  navigate("/Homepage"); // change this route if needed
};

 

  const handleStopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSoundPlaying(false);
    }
  };

  return (
    <>

    <Navbar user={user}/>

    <div
      className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-500
      ${isPanic ? "bg-red-100" : "bg-gray-200"}`}
    >
      <div
        className={`relative w-full max-w-md rounded-3xl p-8 text-center shadow-xl shadow-red-300
        ${isPanic ? "bg-white border-2 border-red-500" : "bg-gray-50"}`}
      >
        {/* Pulse Ring */}
        {isPanic && (
          <div className="absolute inset-0 rounded-3xl border-4 border-red-400 animate-ping opacity-30" />
        )}

        {/* Title */}
        <h1 className="text-2xl font-bold mb-2">
          {isPanic ? "🚨 Panic Mode Active" : "Emergency Panic Button"}
        </h1>

        <p className="text-gray-600 mb-6 text-sm">
          Press the button 3 times to activate emergency mode
        </p>

        {/* Panic Button */}
        <button
          onClick={handlePanic}
          className={`mx-auto w-40 h-40 rounded-full text-white text-xl font-bold
          flex items-center justify-center shadow-lg transition-all duration-300 
          ${
            isPanic
              ? "bg-red-700 hover:bg-red-800 scale-105"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {isPanic ? "ALERT" : `${pressCount}/3`}
        </button>

        {/* Controls */}
        <div className="mt-6 flex flex-col gap-3">
          {isPanic && (
            <button
              onClick={handleStop}
              className="py-3 rounded-xl bg-gray-800 text-white font-semibold hover:bg-black transition"
            >
              Stop Panic
            </button>
          )}

          {isSoundPlaying && (
            <button
              onClick={handleStopSound}
              className="py-3 rounded-xl bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition"
            >
              Stop Sound
            </button>
          )}
        </div>

        {/* Location Status */}
        <div className="mt-6 text-sm text-gray-700">
          {loadingLocation && <p>📡 Getting location...</p>}
          {error && <p className="text-blue-600">{error}</p>}

          {location.lat && location.lon && (
            <div className="mt-3 p-4 rounded-xl bg-gray-100 text-left">
              <p className="font-semibold mb-1">📍 Current Location</p>
              <p>Lat: {location.lat}</p>
              <p>Lon: {location.lon}</p>
            </div>
          )}
        </div>

        <audio ref={audioRef} src={hornSound} />
      </div>
    </div>
    </>
  );
};

export default PanicButton;

import React, { useState, useRef } from "react";
import hornSound from "../assets/horn.mp3"; // Make sure this path is correct

const PanicButtonWithLocation = () => {
  const [pressCount, setPressCount] = useState(0);
  const [isPanic, setIsPanic] = useState(false);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [error, setError] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const audioRef = useRef(null);

  // Panic button handler
  const handlePanic = () => {
    const newCount = pressCount + 1;
    setPressCount(newCount);

    if (newCount >= 3) {
      setIsPanic(true);
      setError(null);

      // Play panic sound
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setIsSoundPlaying(true);
      }

      // Get exact location
      getLocation();
    }
  };

  // Get user's current location once
  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoadingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLoadingLocation(false);
      },
      () => {
        // Instead of showing actual error message → show "Getting Location..."
        setError("Getting Location...");
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Stop panic & sound, reset everything
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
  };

  // Stop sound only
  const handleStopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSoundPlaying(false);
    }
  };

  // When sound ends, update state
  const handleAudioEnded = () => {
    setIsSoundPlaying(false);
  };

  return (
    <div
      className={`flex flex-col items-center justify-center h-screen px-6 transition-all duration-500 ${
        isPanic ? "bg-red-100 animate-pulse" : "bg-white"
      }`}
    >
      <h1 className="text-4xl font-bold mb-8 text-center">
        {isPanic ? "🚨 Panic Activated!" : "Panic Button System"}
      </h1>

      {/* Buttons vertical layout */}
      <div className="flex flex-col items-center space-y-4 mb-6">
        <button
          onClick={handlePanic}
          className={`text-white px-8 py-4 rounded-lg text-xl font-bold shadow-lg transition-all duration-300 ${
            isPanic ? "bg-red-700 hover:bg-red-800" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isPanic ? "Trigger Again" : `Press Panic Button (${pressCount}/3)`}
        </button>

        {isPanic && (
          <button
            onClick={handleStop}
            className="bg-gray-700 hover:bg-gray-800 text-white px-8 py-4 rounded-lg text-xl font-bold shadow-lg transition-all duration-300"
          >
            Stop Panic
          </button>
        )}

        {isSoundPlaying && (
          <button
            onClick={handleStopSound}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded-lg text-xl font-bold shadow-lg transition-all duration-300"
          >
            Stop Sound
          </button>
        )}
      </div>

      {/* Location display */}
      {loadingLocation && <p className="text-gray-500 mb-4">Getting location...</p>}

      {error && <p className="text-blue-600 mb-4">{error}</p>}

      {location.lat && location.lon && (
        <div className="text-center mb-4">
          <p className="text-lg font-semibold mb-2">📍 Current Location:</p>
          <p>Latitude: {location.lat}</p>
          <p>Longitude: {location.lon}</p>
        </div>
      )}

      <audio ref={audioRef} src={hornSound} onEnded={handleAudioEnded} />
    </div>
  );
};

export default PanicButtonWithLocation;

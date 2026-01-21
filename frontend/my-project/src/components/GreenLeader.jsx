import React, { useState, useEffect } from "react";
import { MdStars } from "react-icons/md";
import fakeBuses from "./fakeBuses";

export default function GreenButton() {
  const [greenPoints, setGreenPoints] = useState(0);

  useEffect(() => {
    // Assign random green points to each bus
    const busesWithGreenPoints = fakeBuses.map((bus) => ({
      ...bus,
      greenPoints: Math.floor(Math.random() * 100), // random 0-99
    }));

    // Count buses with green points > 50
    const count = busesWithGreenPoints.filter((bus) => bus.greenPoints > 50).length;

    // ✅ update greenPoints state so it shows in button
    setGreenPoints(count);
  }, []);

  return (
    <button  
      className="text-white px-5 py-2 flex items-center gap-3 text-2xl rounded-lg 
      hover:text-green-500 hover:border transition-all duration-300 ease-in-out"
    >
      <MdStars className="text-green-500" /> 
      <span className="text-green-500 font-semibold">{greenPoints}</span>
    </button>
  );
}

import React, { useState, useRef } from "react";
import { Play } from "lucide-react";
import cardStand from "../assets/cardStand.png";
import { getFareByTime, stations } from "./utils/fareCalculator";

export default function NfcCard({ user, refreshUser }) {
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [fare, setFare] = useState(null);
  const timerRef = useRef(null);

  const handleStart = () => {
    // Wallet check
    if (!user?.wallet_id) {
      alert("❌ Please create a wallet first. Wallet and card are not linked.");
      return;
    }

    setRunning(true);
    setElapsed(0);
    setFare(null);
    console.log(`User ${user.user_code} tapped in.`);
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  };

  const handleStop = async () => {
    if (!running) return;
    clearInterval(timerRef.current);
    setRunning(false);

    const calculatedFare = getFareByTime(elapsed);
    setFare(calculatedFare);

    console.log(
      `User ${user.user_code} tapped out. Duration: ${elapsed}s, Fare: Rs ${calculatedFare}`
    );

    // Deduct fare from wallet
    try {
      const res = await fetch("http://localhost:5001/api/users/recharge-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_id: user.wallet_id,
          amount: -calculatedFare, // deduct fare
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      refreshUser(data.user); // update user wallet in parent
      alert(
        `Journey ended!\nTime: ${elapsed}s\nFare: Rs ${calculatedFare}\nWallet Balance: ₹${data.wallet_balance}`
      );
    } catch (err) {
      console.error(err);
      alert("❌ Error updating wallet balance: " + err.message);
    }
  };

  const handleQuickEnable = async () => {
    if (!user || !user._id || !user.email) {
      alert("User not logged in. Cannot generate card.");
      return;
    }

    if (!user.wallet_id) {
      alert("Please create a wallet first. Wallet and card are co-related.");
      return;
    }

    setLoading(true);
    const payload = {
      email: user.email,
      _id: user._id,
    };

    try {
      const res = await fetch("http://localhost:5001/api/users/enable-feature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());
      const result = await res.json();
      console.log("Card generated:", result.user_code);
      alert("Your MobMagic card has been generated");
    } catch (err) {
      console.error(err);
      alert("Error generating card: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="relative flex w-full p-2 items-center bg-black text-white">
        <h1 className="text-4xl font-bold text-center w-full">Mobizee</h1>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col md:flex-row items-center justify-between px-15 py-12 max-w-7xl mx-auto gap-20">
        {/* Left Section */}
        <div className="max-w-lg space-y-6">
          <p className="text-black font-semibold uppercase tracking-wide">
            Best Choice For Your Digital Travel Card
          </p>
          <h2 className="text-5xl font-extrabold leading-tight text-black">
            Get your MobMagic Card Now
          </h2>
          <p className="text-gray-600">For hassle free commute</p>

          {/* Enable Button */}
          <button
            onClick={handleQuickEnable}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 text-lg font-medium"
          >
            {loading ? "Generating..." : "Enable MobMagic Card"}
          </button>

          {/* Tap In / Tap Out */}
          <div className="flex flex-col gap-4 mt-6">
            <button
              onClick={handleStart}
              disabled={running}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 text-lg font-medium"
            >
              Start Journey (Tap In)
            </button>
            <button
              onClick={handleStop}
              disabled={!running}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 text-lg font-medium"
            >
              Stop Journey (Tap Out)
            </button>

            {running && <p>Elapsed Time: {elapsed}s</p>}
            {fare !== null && <p className="text-xl font-semibold">Fare: Rs {fare}</p>}
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full md:w-1/2 flex justify-center mt-8 md:mt-0 border-2 rounded-lg">
          <img
            src={cardStand}
            alt="Card Illustration"
            className="w-full max-w-[600px] rounded-2xl"
          />
        </div>
      </main>
    </div>
  );
}

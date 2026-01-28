import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";

const vehicleOptions = [
  { name: "Mini Bus", min: 1, max: 15, desc: "Ideal for small groups", pricePerSeat: 200 },
  { name: "Van", min: 4, max: 10, desc: "Perfect for families", pricePerSeat: 150 },
  { name: "Big Bus", min: 16, max: 50, desc: "Best for large groups", pricePerSeat: 180 },
  { name: "Luxury Coach", min: 20, max: 50, desc: "Premium comfort & luxury", pricePerSeat: 300 },
];

export default function Reserve({user}) {
  const [travelDate, setTravelDate] = useState("");
  const [occupancyType, setOccupancyType] = useState("");
  const [seatCount, setSeatCount] = useState("");
  const [female, setFemale] = useState("");
  const [elderly, setElderly] = useState("");
  const [children, setChildren] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [booked, setBooked] = useState(false);

  const totalDemographics = +female + +elderly + +children;

  useEffect(() => {
    if (!seatCount) {
      setSelectedVehicle(null);
      return;
    }
    const seats = parseInt(seatCount);
    setSelectedVehicle(
      vehicleOptions.find(v => seats >= v.min && seats <= v.max)
    );
  }, [seatCount]);

  const handleBooking = () => {
    if (selectedVehicle && travelDate && occupancyType && seatCount && totalDemographics <= seatCount) {
      setBooked(true);
    }
  };

  const totalPrice =
    booked && selectedVehicle
      ? selectedVehicle.pricePerSeat * seatCount
      : null;

  return (
    <>
  <Navbar user={user}/>

    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-100
                 flex items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-4xl">

        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-10">
          🚌 Smart Vehicle Reservation
        </h1>

        {/* Glass Card */}
        <div className="relative rounded-3xl p-8 md:p-10
                        bg-white/70 backdrop-blur-xl
                        shadow-[0_20px_60px_rgba(0,0,0,0.12)]
                        border border-white">

          {/* Form */}
          <div className="space-y-8">

            {/* Date */}
            <InputBlock label="Travel Date">
              <input
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="input"
              />
            </InputBlock>

            {/* Occupancy */}
            <InputBlock label="Occupancy Type">
              <div className="flex flex-wrap gap-3">
                {["Group", "Family", "Corporate"].map(type => (
                  <button
                    key={type}
                    onClick={() => setOccupancyType(type)}
                    className={`pill ${
                      occupancyType === type
                        ? "pill-active"
                        : "pill-inactive"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </InputBlock>

            {/* Seats */}
            <InputBlock label="Seats Required">
              <input
                type="number"
                value={seatCount}
                onChange={(e) => setSeatCount(e.target.value)}
                className="input"
                placeholder="e.g. 12"
              />
            </InputBlock>

            {/* Demographics */}
            <InputBlock label="Passengers">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  ["Females", female, setFemale],
                  ["Elderly", elderly, setElderly],
                  ["Children", children, setChildren],
                ].map(([label, value, setter]) => (
                  <input
                    key={label}
                    type="number"
                    placeholder={label}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className="input"
                  />
                ))}
              </div>
            </InputBlock>

            {/* Vehicle Match */}
            <AnimatePresence>
              {selectedVehicle && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl p-6 bg-gradient-to-r
                             from-green-100 to-green-50
                             border border-green-300"
                >
                  <p className="text-sm font-semibold text-green-700">
                    ✔ Best Match
                  </p>
                  <h3 className="text-2xl font-bold">
                    {selectedVehicle.name}
                  </h3>
                  <p className="text-gray-600">{selectedVehicle.desc}</p>
                  <p className="mt-2 font-semibold">
                    ₹{selectedVehicle.pricePerSeat} / seat
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleBooking}
          disabled={
            !selectedVehicle ||
            !travelDate ||
            !occupancyType ||
            !seatCount ||
            totalDemographics > seatCount
          }
          className="mt-8 w-full py-4 rounded-2xl
                     bg-black text-white font-bold text-lg
                     disabled:opacity-40"
        >
          Confirm Booking
        </motion.button>

        {/* Error */}
        {totalDemographics > seatCount && (
          <p className="mt-3 text-center text-red-600 font-medium">
            Passenger count exceeds seat limit
          </p>
        )}

        {/* Confirmation */}
        <AnimatePresence>
          {booked && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-10 bg-white rounded-3xl p-8
                         shadow-2xl border border-green-300"
            >
              <h3 className="text-2xl font-bold text-center mb-6 text-green-700">
                ✅ Booking Confirmed
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  ["Vehicle", selectedVehicle.name],
                  ["Seats", seatCount],
                  ["Date", travelDate],
                  ["Occupancy", occupancyType],
                  ["Total Price", `₹${totalPrice}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="font-medium">{k}</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reusable styles */}
      <style>{`
        .input {
          width: 100%;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid #d1d5db;
          outline: none;
          transition: 0.2s;
        }
        .input:focus {
          border-color: black;
        }
        .pill {
          padding: 10px 18px;
          border-radius: 999px;
          font-weight: 600;
          transition: 0.2s;
        }
        .pill-active {
          background: black;
          color: white;
        }
        .pill-inactive {
          background: #f3f4f6;
        }
        .pill-inactive:hover {
          background: #e5e7eb;
        }
      `}</style>
    </motion.div>

    </>
  );
}

/* Helper */
function InputBlock({ label, children }) {
  return (
    <div>
      <label className="block mb-2 font-semibold">{label}</label>
      {children}
    </div>
  );
}

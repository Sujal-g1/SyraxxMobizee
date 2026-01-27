import React, { useState, useEffect } from "react";

const vehicleOptions = [
  { name: "Mini Bus", min: 1, max: 15, desc: "Ideal for small groups", status: "available", pricePerSeat: 200 },
  { name: "Van", min: 4, max: 10, desc: "Compact family vehicle", status: "available", pricePerSeat: 150 },
  { name: "Big Bus", min: 16, max: 50, desc: "Great for large groups", status: "available", pricePerSeat: 180 },
  { name: "Luxury Coach", min: 20, max: 50, desc: "Comfort with luxury", status: "available", pricePerSeat: 300 },
];

export default function Reserve() {
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
    const match = vehicleOptions.find((v) => seats >= v.min && seats <= v.max);
    setSelectedVehicle(match);
  }, [seatCount]);

  const handleBooking = () => {
    if (selectedVehicle && travelDate && occupancyType && seatCount && totalDemographics <= seatCount) {
      setBooked(true);
    }
  };

  const totalPrice = booked && selectedVehicle && seatCount
    ? selectedVehicle.pricePerSeat * parseInt(seatCount)
    : null;

  return (
    <div className="min-h-screen p-6 bg-gray-50 flex flex-col items-center">
      <h2 className="text-4xl font-extrabold mb-12 text-gray-900 drop-shadow-sm select-none">
        🚌 Reserve a Vehicle
      </h2>

      {/* Form Container with cyan gradient */}
      <div
        className="max-w-2xl w-full rounded-3xl p-10 shadow-xl space-y-8 border border-cyan-300"
        style={{
          background: "linear-gradient(135deg, #a0f0f0 0%, #30cfd0 100%)",
        }}
      >
        {/* Travel Date */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Travel Date</label>
          <input
            type="date"
            value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)}
            className="w-full px-5 py-3 rounded-lg bg-white border border-cyan-400 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
          />
        </div>

        {/* Occupancy Type */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Occupancy Type</label>
          <div className="flex gap-6">
            {["Group", "Family", "Corporate"].map((type) => (
              <button
                key={type}
                onClick={() => setOccupancyType(type)}
                className={`px-6 py-3 rounded-full font-semibold text-sm transition-shadow ${
                  occupancyType === type
                    ? "bg-cyan-400 text-white shadow-md"
                    : "bg-white text-cyan-800 hover:bg-cyan-300 hover:text-white border border-cyan-400"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Seat Count */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Total Seats Required</label>
          <input
            type="number"
            min="1"
            max="50"
            value={seatCount}
            onChange={(e) => setSeatCount(e.target.value)}
            placeholder="Enter number of seats"
            className="w-full px-5 py-3 rounded-lg bg-white border border-cyan-400 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
          />
        </div>

        {/* Demographics */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-cyan-900 text-sm mb-1">Females</label>
            <input
              type="number"
              min="0"
              value={female}
              onChange={(e) => setFemale(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-white border border-cyan-400 text-cyan-900 placeholder-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-cyan-900 text-sm mb-1">Elderly</label>
            <input
              type="number"
              min="0"
              value={elderly}
              onChange={(e) => setElderly(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-white border border-cyan-400 text-cyan-900 placeholder-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-cyan-900 text-sm mb-1">Children</label>
            <input
              type="number"
              min="0"
              value={children}
              onChange={(e) => setChildren(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-white border border-cyan-400 text-cyan-900 placeholder-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Price per seat */}
      {selectedVehicle && seatCount && (
        <div className="max-w-2xl w-full mt-8 text-center text-xl font-semibold text-cyan-900 select-none drop-shadow-sm">
          Price per seat: <span className="text-cyan-800">₹{selectedVehicle.pricePerSeat}</span>
        </div>
      )}

      {/* Book Button */}
      <div className="max-w-2xl w-full mt-6">
        <button
          onClick={handleBooking}
          disabled={
            !selectedVehicle ||
            !travelDate ||
            !occupancyType ||
            !seatCount ||
            totalDemographics > seatCount
          }
          className="w-full py-4 rounded-xl bg-blue-900 hover:bg-blue-500 text-white font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg select-none"
        >
          Book Now
        </button>

        {totalDemographics > seatCount && (
          <p className="text-red-600 text-sm mt-3 text-center font-semibold select-none">
            ⚠️ Total demographic entries exceed seat count.
          </p>
        )}
      </div>

      {/* Booking Confirmation */}
      {booked && (
        <div className="max-w-xl w-full mt-12 bg-white rounded-3xl p-8 shadow-2xl border border-cyan-300 select-none">
          <h3 className="text-3xl font-extrabold mb-6 text-cyan-900 text-center">✅ Reservation Confirmed</h3>

          <table className="w-full text-left border-collapse">
            <tbody>
              {[
                ["Travel Date", travelDate],
                ["Vehicle", selectedVehicle?.name],
                ["Occupancy Type", occupancyType],
                ["Seats", seatCount],
                ["Females", female],
                ["Elderly", elderly],
                ["Children", children],
                ["Total Price", `₹${totalPrice}`],
              ].map(([label, value], idx) => (
                <tr
                  key={label}
                  className={idx % 2 === 0 ? "bg-cyan-50" : ""}
                >
                  <td className="py-3 px-5 font-semibold text-cyan-800 border-b border-cyan-200">
                    {label}
                  </td>
                  <td className="py-3 px-5 text-cyan-700 border-b border-cyan-200">
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

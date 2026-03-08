import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const SEAT_PRICE_EXTRA = 20; // reservation charge
const TOTAL_SEATS = 12; // limited reservable seats

// 🔥 Random Offer Generator (70% no offers, 30% offers)
const generateRandomOffers = () => {
  const baseOffers = [
    { code: "BUS100", discount: 100 },
    { code: "BUS200", discount: 200 },
    { code: "BUS300", discount: 300 },
    { code: "SAVE10", discountPercent: 10 },
    { code: "SAVE15", discountPercent: 15 },
    { code: "ICICI500", discount: 500 },
  ];

  if (Math.random() < 0.7) return [];

  const shuffled = baseOffers.sort(() => 0.5 - Math.random());
  const count = Math.floor(Math.random() * 3) + 1;
  return shuffled.slice(0, count);
};

export default function ReserveSeat({ user }) {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) return <div className="p-10">Invalid access</div>;

  const { bus, from, to } = state;
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [availableOffers] = useState(generateRandomOffers());
  const [selectedOffer, setSelectedOffer] = useState(null);

  const baseFare = Number(bus.fare) || 0;

  // 🔹 Subtotal
  const subtotal =
    selectedSeats.length * (baseFare + SEAT_PRICE_EXTRA);

  // 🔹 Discount Calculation
  let discountAmount = 0;

  if (selectedOffer) {
    if (selectedOffer.discount) {
      discountAmount = selectedOffer.discount;
    } else if (selectedOffer.discountPercent) {
      discountAmount =
        (subtotal * selectedOffer.discountPercent) / 100;
    }
  }

  // 🔹 Final Fare
  const finalFare = Math.max(subtotal - discountAmount, 0);

  return (
    <>
      <Navbar user={user} />

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <h2 className="text-2xl font-bold mb-2">
          Reserve Seat – {bus.busNumber}
        </h2>
        <p className="text-gray-500 mb-6">
          {from} → {to}
        </p>

        {/* Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Seat Grid */}
          <div>
            <h3 className="font-semibold mb-3">Select Seat</h3>

            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: TOTAL_SEATS }).map((_, i) => {
                const seatNo = i + 1;
                const selected = selectedSeats.includes(seatNo);

                return (
                  <button
                    key={seatNo}
                    onClick={() => {
                      setSelectedSeats((prev) =>
                        prev.includes(seatNo)
                          ? prev.filter((s) => s !== seatNo)
                          : [...prev, seatNo]
                      );
                    }}
                    className={`h-12 rounded border font-medium
                      ${
                        selected
                          ? "bg-green-500 text-white border-green-500"
                          : "bg-white border-gray-300 hover:border-green-400"
                      }
                    `}
                  >
                    {seatNo}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fare Summary */}
          <div className="border rounded-lg p-5 bg-gray-50">
            <h3 className="font-semibold mb-4">Fare Details</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Base Fare</span>
                <span>₹{baseFare}</span>
              </div>

              <div className="flex justify-between">
                <span>Seat Reservation</span>
                <span>₹{SEAT_PRICE_EXTRA}</span>
              </div>

              <div className="flex justify-between">
                <span>Seats Selected</span>
                <span>{selectedSeats.length}</span>
              </div>

              {/* 🔥 Offer Dropdown */}
              {availableOffers.length > 0 ? (
                <div className="mt-3">
                  <label className="block text-sm font-medium mb-1">
                    Apply Offer
                  </label>

                  <select
                    className="w-full border rounded p-2 text-sm"
                    value={selectedOffer?.code || ""}
                    onChange={(e) => {
                      const offer = availableOffers.find(
                        (o) => o.code === e.target.value
                      );
                      setSelectedOffer(offer || null);
                    }}
                  >
                    <option value="">Select Offer</option>
                    {availableOffers.map((offer) => (
                      <option key={offer.code} value={offer.code}>
                        {offer.code}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-sm text-gray-400 mt-2">
                  No offers available for this booking
                </p>
              )}

              {/* 🔥 Discount Row */}
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>- ₹{discountAmount}</span>
                </div>
              )}

              <hr />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₹{finalFare}</span>
              </div>
            </div>

            <button
              disabled={selectedSeats.length === 0}
              onClick={() =>
                navigate("/bus/ticket", {
                  state: {
                    bus,
                    from,
                    to,
                    seats: selectedSeats,
                    fare: finalFare,
                    appliedOffer: selectedOffer,
                  },
                })
              }
              className="mt-6 w-full py-3 rounded-lg bg-green-600 text-white font-semibold disabled:bg-gray-300"
            >
              Proceed to Pay
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
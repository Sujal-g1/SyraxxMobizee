import React from "react";
import { useLocation } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "../components/Navbar";

export default function Ticket({ user }) {
  const { state } = useLocation();
  if (!state) return <div className="p-10">No ticket found</div>;

  const { bus, from, to, seat, fare } = state;

  return (
    <>
      <Navbar user={user} />

      <div className="max-w-md mx-auto p-6">
        <div className="bg-white border rounded-xl shadow-lg overflow-hidden">
          {/* Top */}
          <div className="bg-green-600 text-white p-4">
            <h2 className="text-lg font-bold">Bus Boarding Pass</h2>
            <p className="text-sm">{bus.busNumber}</p>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            <div className="flex justify-between">
              <div>
                <p className="text-xs text-gray-500">FROM</p>
                <p className="font-semibold">{from}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">TO</p>
                <p className="font-semibold">{to}</p>
              </div>
            </div>

            <div className="flex justify-between">
              <div>
                <p className="text-xs text-gray-500">SEAT</p>
                <p className="font-bold text-lg">{seat}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">FARE</p>
                <p className="font-bold text-lg">₹{fare}</p>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <QRCodeSVG
                value={`${bus.busNumber}-${seat}-${from}-${to}`}
                size={120}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t text-center text-xs p-3 text-gray-500">
            Show this ticket while boarding
          </div>
        </div>
      </div>
    </>
  );
}

import React, { useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function CreateWallet({ user, refreshUser }) {
  const [step, setStep] = useState("form"); // form | confirm | success
  const [upi, setUpi] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const handleCreateWallet = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API}/api/users/create-wallet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: user.email,
          upi_id: upi,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStep("success");

      // wait 1.5 sec then refresh
      setTimeout(async () => {
        await refreshUser();
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-2xl shadow p-6 w-full max-w-sm text-center space-y-4">

        {/* STEP 1 — FORM */}
        {step === "form" && (
          <>
            <h1 className="text-xl font-bold">Create Wallet</h1>

            <p className="text-sm text-gray-500">
              Enter your UPI ID to activate wallet
            </p>

            <input
              type="text"
              placeholder="example@upi or mobizee@upi"
              value={upi}
              onChange={(e) => setUpi(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />

            <p className="text-xs text-gray-400">
              ⚠ This is a demo wallet. No real payment is processed.
            </p>

            <button
              onClick={() => setStep("confirm")}
              disabled={!upi}
              className="w-full py-3 bg-black text-white rounded-xl disabled:opacity-60"
            >
              Continue
            </button>
          </>
        )}

        {/* STEP 2 — CONFIRM */}
        {step === "confirm" && (
          <>
            <h1 className="text-lg font-semibold">Confirm UPI</h1>

            <p className="text-gray-600 text-sm">
              Wallet will be linked to:
            </p>

            <p className="font-bold">{upi}</p>

            <p className="text-xs text-gray-400">
              This is simulated. No real bank link happens.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setStep("form")}
                className="flex-1 py-2 border rounded-lg"
              >
                Edit
              </button>

              <button
                onClick={handleCreateWallet}
                disabled={loading}
                className="flex-1 py-2 bg-black text-white rounded-lg"
              >
                {loading ? "Creating..." : "Confirm"}
              </button>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </>
        )}

        {/* STEP 3 — SUCCESS */}
        {step === "success" && (
          <>
            <h1 className="text-xl font-bold text-green-600">
              Wallet Created 🎉
            </h1>

            <p className="text-sm text-gray-500">
              Redirecting to wallet dashboard...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

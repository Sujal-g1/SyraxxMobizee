import React, { useState, useEffect } from "react";

export default function Wallet({ user, refreshUser }) {
  const [walletCreated, setWalletCreated] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [phone, setPhone] = useState("");
  const [upiId, setUpiId] = useState("");
  const [rechargeAmount, setRechargeAmount] = useState("");

  useEffect(() => {
    if (user) {
      console.log("USER DATA IN WALLET COMPONENT:", user); // ✅ Debugging line
      setPhone(user.phone || "");

        const hasWallet = user.wallet_id && user.wallet_id.trim() !== "";

      if (hasWallet) {
        setWalletCreated(true);
        setWalletBalance(user.wallet_balance || 0);
        setBankAccount(user.bank_account || "");
        setIfsc(user.ifsc || "");
        setUpiId(user.upi_id || "");
      } else {
        setWalletCreated(false);
      }
    }
  }, [user]);

  if (!user) return <p className="text-center mt-10">Loading user data...</p>;

  // ✅ Create Wallet
  const handleCreateWallet = async () => {
    if (!selectedOption) return alert("Please select Bank or UPI option");

    const payload = {
      email: user.email,
      phone,
      bank_account: selectedOption === "bank" ? bankAccount : undefined,
      ifsc: selectedOption === "bank" ? ifsc : undefined,
      upi_id: selectedOption === "upi" ? upiId : undefined,
    };

    try {
      const res = await fetch("http://localhost:5001/api/users/create-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      alert("✅ Wallet created successfully!");
      setWalletCreated(true);
      setWalletBalance(data.wallet_balance || 0);
      refreshUser(data.user);
    } catch (err) {
      console.error(err);
      alert("❌ Error creating wallet: " + err.message);
    }
  };

  // ✅ Recharge Wallet
  const handleRecharge = async () => {
    if (!rechargeAmount || isNaN(rechargeAmount))
      return alert("Enter a valid amount");

    const payload = {
      wallet_id: user.wallet_id,
      amount: Number(rechargeAmount),
    };

    try {
      const res = await fetch("http://localhost:5001/api/users/recharge-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      setWalletBalance(data.wallet_balance);
      refreshUser({ ...user, wallet_balance: data.wallet_balance });

      alert(`💰 Wallet recharged successfully! New Balance: ₹${data.wallet_balance}`);
      setRechargeAmount("");
    } catch (err) {
      console.error(err);
      alert("❌ Error recharging wallet: " + err.message);
    }
  };

  // ✅ Wallet UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-6 max-w-xl mx-auto rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
        💼 My Wallet
      </h1>

      {!walletCreated ? (
        <>
          <p className="text-gray-700 mb-4 text-center">
            Choose how you’d like to set up your wallet:
          </p>

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setSelectedOption("bank")}
              className={`flex-1 py-2 rounded-lg border-2 ${
                selectedOption === "bank"
                  ? "border-blue-600 bg-blue-100 text-blue-700"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              Bank Details
            </button>
            <button
              onClick={() => setSelectedOption("upi")}
              className={`flex-1 py-2 rounded-lg border-2 ${
                selectedOption === "upi"
                  ? "border-blue-600 bg-blue-100 text-blue-700"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              UPI ID
            </button>
          </div>

          {selectedOption === "bank" && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Account Number"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                placeholder="IFSC Code"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          )}

          {selectedOption === "upi" && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter UPI ID (e.g. name@upi)"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          )}

          <button
            onClick={handleCreateWallet}
            className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Create Wallet
          </button>
        </>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow p-4 mb-6 space-y-2 text-gray-800">
            <p>
              <strong>Wallet ID:</strong> {user.wallet_id}
            </p>
            {bankAccount && (
              <p>
                <strong>Bank:</strong> {bankAccount} ({ifsc})
              </p>
            )}
            {upiId && (
              <p>
                <strong>UPI:</strong> {upiId}
              </p>
            )}
          
            <p className="text-xl font-semibold text-green-700">
              💰 Balance: ₹{walletBalance}
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Enter Amount"
              value={rechargeAmount}
              onChange={(e) => setRechargeAmount(e.target.value)}
              className="border rounded-lg px-3 py-2 flex-1"
            />
            <button
              onClick={handleRecharge}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Recharge
            </button>
          </div>
        </>
      )}
    </div>
  );
}

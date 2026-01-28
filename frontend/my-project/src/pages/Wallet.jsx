
// npm install recharts
import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet as WalletIcon,
  Plus,
  History,
  Filter
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const API = import.meta.env.VITE_API_URL;

export default function Wallet({ user }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState("recharge");

  // 🔎 History filter & pagination
  const [filter, setFilter] = useState("ALL"); // ALL | RECHARGE | FARE_DEBIT
  const [visibleCount, setVisibleCount] = useState(8); // infinite scroll batch size

  const token = localStorage.getItem("token");

  // Fetch wallet + history
  useEffect(() => {
    if (!user || !token) return;

    const fetchTransactions = async () => {
      try {
        const res = await fetch(`${API}/api/users/wallet/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (res.ok) {
          setTransactions(data.transactions);
          if (data.transactions.length > 0) {
            setBalance(data.transactions[0].balance_after);
          }
        }
      } catch (err) {
        console.error("Wallet fetch error:", err);
      }
    };

    fetchTransactions();
  }, [user, token]);

  // 📈 Prepare chart data (oldest -> newest)
  const chartData = useMemo(() => {
    const reversed = [...transactions].reverse();
    return reversed.map((tx, idx) => ({
      index: idx + 1,
      balance: tx.balance_after,
    }));
  }, [transactions]);

  // 🔎 Apply filter
  const filteredTransactions = useMemo(() => {
    if (filter === "ALL") return transactions;
    return transactions.filter((tx) => tx.type === filter);
  }, [transactions, filter]);

  // 🔽 Visible transactions for infinite scroll
  const visibleTransactions = useMemo(() => {
    return filteredTransactions.slice(0, visibleCount);
  }, [filteredTransactions, visibleCount]);

  // Simulated UPI Recharge
  const handleRecharge = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return alert("Enter a valid amount");
    }

    if (!user?.wallet_id) {
      return alert("Wallet not created");
    }

    try {
      setLoading(true);
      setMessage("Opening UPI...");

      // Initiate
      const initRes = await fetch(`${API}/api/users/wallet/recharge/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          wallet_id: user.wallet_id,
          amount: Number(amount),
        }),
      });

      const initData = await initRes.json();
      if (!initRes.ok) throw new Error(initData.error || "Initiate failed");

      const reference_id = initData.reference_id;

      setMessage("Verifying payment...");

      // Confirm
      const confirmRes = await fetch(`${API}/api/users/wallet/recharge/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          wallet_id: user.wallet_id,
          reference_id,
        }),
      });

      const confirmData = await confirmRes.json();
      if (!confirmRes.ok) throw new Error(confirmData.error || "Confirm failed");

      setBalance(confirmData.wallet_balance);
      setAmount("");
      setMessage("Recharge successful ✨");

      // Refresh history
      const txRes = await fetch(`${API}/api/users/wallet/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const txData = await txRes.json();
      if (txRes.ok) {
        setTransactions(txData.transactions);
        setVisibleCount(8); // reset pagination
      }

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 2500);
    }
  };

  if (!user) return <p className="text-center mt-10">Loading wallet...</p>;

  return (
    <>

    <Navbar user={user}/>

    <div className="min-h-screen bg-gray-50 flex justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">

        {/* 💳 Gradient Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl p-5 sm:p-6 shadow-lg bg-gradient-to-r from-slate-300 to-slate-500"
        >
          <div className="absolute inset-0 bg-white/20" />

          <div className="relative text-black">
            <div className="flex items-center gap-2">
              <WalletIcon className="w-5 h-5" />
              <p className="text-xs uppercase tracking-widest">MobMagic Wallet</p>
            </div>

            <motion.h2
              key={balance}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="text-3xl sm:text-4xl font-extrabold mt-3"
            >
              ₹ {balance}
            </motion.h2>

            <p className="text-[11px] mt-3 opacity-80">Wallet ID • {user.wallet_id}</p>
          </div>
        </motion.div>

        {/* 📈 Balance Chart */}
        <div className="bg-white rounded-2xl p-4 shadow">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <History className="w-4 h-4" /> Balance Trend
          </h3>

          {chartData.length < 2 ? (
            <p className="text-gray-400 text-sm">Not enough data to show chart</p>
          ) : (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="index" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Line type="monotone" dataKey="balance" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 🧭 Tabs */}
        <div className="flex bg-white rounded-xl p-1 shadow-sm">
          {[{ id: "recharge", label: "Recharge" }, { id: "history", label: "History" }].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 🔁 Tab Content */}
        <AnimatePresence mode="wait">

          {/* 💰 Recharge Panel */}
          {tab === "recharge" && (
            <motion.div
              key="recharge"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-5 shadow space-y-4"
            >
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Money
              </h3>

              <div className="grid grid-cols-3 gap-2">
                {[100, 500, 1000].map((val) => (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    key={val}
                    onClick={() => setAmount(val)}
                    className="py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    +{val}
                  </motion.button>
                ))}
              </div>

              <input
                type="number"
                placeholder="Custom amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg px-3 py-2 border border-gray-200 outline-none focus:ring-2 focus:ring-black"
              />

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleRecharge}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-black text-white font-semibold shadow disabled:opacity-60"
              >
                {loading ? "Processing..." : "Recharge"}
              </motion.button>

              {message && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-green-600 text-sm">
                  {message}
                </motion.p>
              )}
            </motion.div>
          )}

          {/* 📜 History Panel with Filter + Infinite Scroll */}
          {tab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-5 shadow"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">Recent Activity</h3>
                <div className="flex items-center gap-1">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filter}
                    onChange={(e) => {
                      setFilter(e.target.value);
                      setVisibleCount(8);
                    }}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="ALL">All</option>
                    <option value="RECHARGE">Recharges</option>
                    <option value="FARE_DEBIT">Fare Debits</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {visibleTransactions.length === 0 && (
                  <p className="text-gray-400 text-sm">No transactions found</p>
                )}

                {visibleTransactions.map((tx) => (
                  <motion.div
                    key={tx._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div className="flex items-center gap-2">
                      {tx.type === "RECHARGE" ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      )}
                      <div>
                        <p className={`font-semibold ${tx.type === "RECHARGE" ? "text-green-600" : "text-red-600"}`}>
                          {tx.type === "RECHARGE" ? "+" : "-"}₹{tx.amount}
                        </p>
                        <p className="text-[11px] text-gray-500">{tx.type}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">₹{tx.balance_after}</p>
                      <p className="text-[11px] text-gray-400">
                        {new Date(tx.created_at).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {/* 🔽 Load More */}
                {visibleCount < filteredTransactions.length && (
                  <button
                    onClick={() => setVisibleCount((c) => c + 8)}
                    className="w-full py-2 text-sm text-black hover:underline"
                  >
                    Load more
                  </button>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
    </>
  );
}

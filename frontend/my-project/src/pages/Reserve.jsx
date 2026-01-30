import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import {  Calendar,  Users, Wind, MapPin, ChevronRight, CheckCircle2, Bus,  ArrowRightLeft,Clock,Ticket,QrCode, X} from "lucide-react";

const API = import.meta.env.VITE_API_URL;

export default function Reserve({ user: propUser }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    if (propUser) return setUser(propUser);
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, [propUser]);

  const [tab, setTab] = useState("book"); // book | history | receipt
  const [tripType, setTripType] = useState("oneway");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    departDate: "",
    returnDate: "",
    seats: "",
    bookingType: "shared",
    ac: true,
  });

  const [results, setResults] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Fetch History logic
  const fetchHistory = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/reservation/user/${user._id}`);
      setHistory(res.data);
    } catch (err) {
      console.error("History fetch failed");
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (tab === "history") fetchHistory();
  }, [tab, fetchHistory]);

  const handleSearch = async () => {
    if (!form.departDate || !form.seats) return alert("Fill all fields");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/reservation/search`, {
        seats: Number(form.seats),
        bookingType: form.bookingType,
        ac: form.ac,
        luxuryTier: "standard",
      });
      setResults(res.data.slice(0, 3));
    } catch (err) { alert("Search failed"); }
    setLoading(false);
  };

  const handleReserve = async (option) => {
    if (!user?._id) return alert("Please login again");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/reservation/reserve`, {
        userId: user._id,
        templateId: option.templateId,
        date: form.departDate,
        seats: Number(form.seats),
        bookingType: form.bookingType,
      });
      setReceipt(res.data.reservation);
      setTab("receipt");
    } catch { alert("Booking failed"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      <Navbar user={user} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Updated Header with Tab Navigation */}
        <div className="flex justify-between items-end mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {tab === "history" ? "My Bookings" : "Where to next?"}
            </h1>
            <p className="text-slate-500">
              {tab === "history" ? "Your past and upcoming trips" : "Premium intercity travel at your fingertips."}
            </p>
          </motion.div>
          
          <div className="flex bg-slate-200/50 p-1 rounded-xl">
             <button 
              onClick={() => setTab("book")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === "book" ? "bg-white shadow-sm text-black" : "text-slate-500"}`}
             >
               Book
             </button>
             <button 
              onClick={() => setTab("history")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === "history" ? "bg-white shadow-sm text-black" : "text-slate-500"}`}
             >
               History
             </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {tab === "book" ? (
            <motion.div key="book-tab" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
              {/* Trip Type Switcher */}
              <div className="bg-slate-200/50 p-1.5 rounded-2xl flex gap-1">
                {[{ id: "oneway", label: "One Way", icon: <ChevronRight size={16} /> }, { id: "roundtrip", label: "Round Trip", icon: <ArrowRightLeft size={16} /> }].map((t) => (
                  <button key={t.id} onClick={() => setTripType(t.id)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${tripType === t.id ? "bg-white shadow-sm text-black" : "text-slate-500 hover:text-slate-700"}`}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {/* Form Card */}
              <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Departure</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="date" value={form.departDate} onChange={(e) => setForm({ ...form, departDate: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all" />
                    </div>
                  </div>
                  {tripType === "roundtrip" && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Return</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="date" value={form.returnDate} onChange={(e) => setForm({ ...form, returnDate: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all" />
                      </div>
                    </motion.div>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Passengers</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="number" placeholder="Seats" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Comfort</label>
                    <button onClick={() => setForm({ ...form, ac: !form.ac })} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all ${form.ac ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200" : "bg-orange-50 text-orange-700 ring-1 ring-orange-200"}`}>
                      <span className="font-semibold">{form.ac ? "AC Premium" : "Non-AC Standard"}</span>
                      <Wind size={20} className={form.ac ? "animate-pulse" : ""} />
                    </button>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  {["shared", "private"].map((type) => (
                    <button key={type} onClick={() => setForm({ ...form, bookingType: type })} className={`flex-1 py-3 rounded-xl capitalize font-bold text-sm transition-all ${form.bookingType === type ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>{type}</button>
                  ))}
                </div>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleSearch} disabled={loading} className="w-full mt-8 py-4 bg-black hover:bg-gray-800 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Find Available Buses"}
                </motion.button>
              </div>

              {/* Results List */}
              <div className="space-y-4">
                {results.map((opt, idx) => (
                  <motion.div key={opt.templateId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="group bg-white p-5 rounded-[1.5rem] flex items-center justify-between border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Bus size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{opt.name}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1"><Users size={12} /> {opt.capacity} seats</p>
                      </div>
                    </div>
                    <button onClick={() => handleReserve(opt)} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-bold">₹{opt.totalPrice}</button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : tab === "history" ? (
            /* ================= HISTORY SECTION ================= */
            <motion.div key="history-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
               {history.length === 0 && !loading && (
                 <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
                   <Ticket className="mx-auto text-slate-300 mb-4" size={48} />
                   <p className="text-slate-400 font-medium">No trips booked yet.</p>
                 </div>
               )}
               {history.map((item) => (
                 <motion.div 
                  key={item._id} 
                  onClick={() => setSelectedTicket(item)}
                  whileHover={{ y: -2 }}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center cursor-pointer hover:shadow-md transition-all"
                 >
                   <div className="flex gap-4 items-center">
                     <div className="p-3 bg-slate-50 text-slate-400 rounded-xl"><Clock size={20} /></div>
                     <div>
                       <p className="font-bold text-slate-800">Trip to Terminal</p>
                       <p className="text-xs text-slate-500">{new Date(item.date).toDateString()}</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="font-black text-slate-900 uppercase text-xs tracking-tighter mb-1">ID: {item._id.slice(-6)}</p>
                     <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase">Confirmed</span>
                   </div>
                 </motion.div>
               ))}
            </motion.div>
          ) : (
            /* Receipt Card */
            <motion.div key="receipt-tab" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100">
              <div className="bg-emerald-500 p-8 text-center text-white">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={32} /></div>
                <h2 className="text-2xl font-black">Booking Confirmed!</h2>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-end border-b border-dashed border-slate-200 pb-6">
                  <div><p className="text-xs font-bold text-slate-400 uppercase">Reservation ID</p><p className="font-mono text-slate-600 text-sm uppercase">{receipt?._id}</p></div>
                  <div className="text-right"><p className="text-xs font-bold text-slate-400 uppercase">Total Paid</p><p className="text-2xl font-black text-indigo-600">₹{receipt?.totalPrice}</p></div>
                </div>
                <button onClick={() => setTab("history")} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold">View My Tickets</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ================= BOARDING PASS MODAL ================= */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTicket(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                <Bus size={28} />
                <h3 className="font-black uppercase tracking-widest text-sm">Boarding Pass</h3>
                <button onClick={() => setSelectedTicket(null)}><X size={24}/></button>
              </div>
              <div className="p-8 space-y-8">
                <div className="flex justify-between">
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase">Passenger</p><p className="font-bold text-slate-800">{user?.name || "Guest"}</p></div>
                  <div className="text-right"><p className="text-[10px] font-bold text-slate-400 uppercase">Date</p><p className="font-bold text-slate-800">{new Date(selectedTicket.date).toLocaleDateString()}</p></div>
                </div>
                <div className="flex justify-between items-center py-6 border-y border-slate-50 border-dashed">
                  <div className="text-center"><p className="text-2xl font-black text-slate-900">DEP</p><p className="text-[10px] text-slate-400">CITY MAIN</p></div>
                  <div className="flex-1 px-4 text-indigo-200"><div className="border-t-2 border-dashed border-indigo-100 w-full relative"><Bus size={16} className="absolute -top-2 left-1/2 -translate-x-1/2 text-indigo-600 bg-white px-1"/></div></div>
                  <div className="text-center"><p className="text-2xl font-black text-slate-900">ARR</p><p className="text-[10px] text-slate-400">TERMINAL</p></div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase">Seats</p><p className="font-bold text-slate-800">{selectedTicket.seats}</p></div>
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase">Class</p><p className="font-bold text-slate-800">AC-Tier</p></div>
                  <div className="text-right"><p className="text-[10px] font-bold text-slate-400 uppercase">Price</p><p className="font-bold text-indigo-600">₹{selectedTicket.totalPrice}</p></div>
                </div>

                {/* REAL SCANNER QR CODE */}
          <div className="flex flex-col items-center pt-4 border-t border-slate-50">
        <div className="bg-white p-3 rounded-2xl shadow-lg shadow-indigo-100 border border-slate-50 mb-3">
         <QRCodeSVG 
      // This is the data that will be stored in the QR
      value={`RESERVATION_ID:${selectedTicket._id}`} 
      size={120}
      level={"H"} // High error correction (easier to scan)
      includeMargin={false}
      imageSettings={{
        src: "/bus-icon.png", // Optional: put a tiny logo in the middle
        height: 20,
        width: 20,
        excavate: true,
      }}
    />
     </div>
     <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
    {selectedTicket._id}
  </p>
  </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
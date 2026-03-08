import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bus, Navigation, Leaf, Zap, QrCode, Wind, Clock, 
  Gift, ChevronDown, RotateCcw, AlertCircle, Sparkles, Fuel, Map, ShieldCheck
} from 'lucide-react';
import Navbar from '../components/Navbar';

const UserProfilePage = ({ user, setUser }) => {
  // --- Fixed State Definitions ---
  const [isPowerMode, setIsPowerMode] = useState(false);
  const [busPosition, setBusPosition] = useState(0);
  const [busFuel, setBusFuel] = useState(0); // Fixed the missing variable
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isEngineBroken, setIsEngineBroken] = useState(false);
  const [xp, setXp] = useState(1240);

// 1. Move fallback names to the top
  const fallbackNames = [
    "Shadow Traveler", 
    "Ghost Commuter", 
    "The Urban Legend", 
    "Invisible Passenger", 
    "Mystery Voyager",
    "Digital Nomad"
  ];

  // 2. Define realName (Now it exists for the lines below it!)
  const randomFallback = fallbackNames[Math.floor(Math.random() * fallbackNames.length)];
  const realName = user?.name || randomFallback;

  // 3. Now you can safely use realName.length
  const nickname = ["Route King", "Bus Boss", "Transit Legend", "Urban Nomad"][realName.length % 4];
  // --- Game Logic ---
  const handleBusLaunch = () => {
    if (isEngineBroken) return;
    
    if (busFuel < 100) {
      setBusFuel(prev => prev + 20);
    } else {
      // Launching the bus
      setBusPosition(100);
      setXp(prev => prev + 50);
      setTimeout(() => {
        setBusPosition(0);
        setBusFuel(0);
        // 30% chance of breakdown after a trip
        if (Math.random() > 0.7) setIsEngineBroken(true);
      }, 1000);
    }
  };

  return (
    <>
    <Navbar user={user}/>
    <div className={`min-h-screen transition-all duration-1000 p-4 md:p-10 font-sans overflow-hidden relative
      ${isPowerMode ? 'bg-[#050505] text-emerald-400' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* POWER MODE: Digital Rain / Matrix Effect */}
      {isPowerMode && (
        <div className="absolute inset-0 opacity-20 pointer-events-none font-mono text-[10px] overflow-hidden leading-none select-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -100 }}
              animate={{ y: 1000 }}
              transition={{ duration: Math.random() * 5 + 2, repeat: Infinity, ease: "linear" }}
              style={{ left: `${i * 5}%` }}
              className="absolute"
            >
              {Array(50).fill(0).map(() => Math.floor(Math.random() * 2)).join('\n')}
            </motion.div>
          ))}
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10"
      >
        
        {/* --- 1. THE MAIN DYNAMIC ID CARD --- */}
        <motion.div 
          className={`lg:col-span-8 rounded-[3.5rem] p-1 shadow-2xl relative overflow-hidden transition-all duration-700
            ${isPowerMode ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500'}`}
        >
          <div className={`h-full w-full rounded-[3.4rem] p-8 md:p-12 text-white relative overflow-hidden
            ${isPowerMode ? 'bg-black/90' : 'bg-white/10 backdrop-blur-md'}`}>
            
            {/* THE HIDDEN THEME TOGGLE */}
            <motion.button 
              whileHover={{ scale: 1.2, rotate: 180 }}
              whileTap={{ scale: 0.8 }}
              onClick={() => setIsPowerMode(!isPowerMode)}
              className={`absolute top-8 right-8 p-4 rounded-full border transition-all
                ${isPowerMode ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-white/20 border-white/20 text-white'}`}
            >
              <Zap fill={isPowerMode ? "currentColor" : "none"} size={24} />
            </motion.button>

            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
              <motion.div 
                animate={isPowerMode ? { boxShadow: ["0 0 0px #10b981", "0 0 20px #10b981", "0 0 0px #10b981"] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-28 h-28 bg-white/10 rounded-[2.5rem] flex items-center justify-center border border-white/20 shadow-xl"
              >
                 <Bus size={56} className={isPowerMode ? "text-emerald-400" : "text-white"} />
              </motion.div>
              <div>
               <h1 className="text-6xl font-black uppercase tracking-tighter leading-none mb-2">{realName}</h1>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <span className="text-sm font-bold uppercase tracking-[0.3em] opacity-70">{nickname}</span>
                  <div className="h-1 w-12 bg-white/30 rounded-full" />
                  <ShieldCheck size={18} className="text-cyan-300" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
              {[
                { label: "Total XP", val: xp, color: "text-yellow-400" },
                { label: "Co2 Saved", val: "12.4kg", color: "text-emerald-400" },
                { label: "Credits", val: "₹42.00", color: "text-cyan-400" },
                { label: "Trips", val: "158", color: "text-purple-400" },
              ].map((stat, i) => (
                <div key={i} className="bg-black/20 backdrop-blur-sm p-4 rounded-3xl border border-white/5">
                  <p className="text-[10px] font-black uppercase opacity-40 mb-1">{stat.label}</p>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.val}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* --- 2. THE BUS MINIGAME --- */}
        <motion.div 
          className={`lg:col-span-4 rounded-[3.5rem] p-8 flex flex-col justify-between border-2 transition-all duration-500
            ${isPowerMode ? 'bg-[#111] border-emerald-500/50 shadow-lg' : 'bg-white border-slate-200 shadow-xl'}`}
        >
          <div className="text-center">
            <h3 className="font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 mb-6">
              <Fuel className="text-orange-500" size={16} /> Fuel & Launch
            </h3>
            
            <div className="h-32 w-full bg-slate-100 rounded-[2rem] relative overflow-hidden flex items-end p-4 border border-slate-200">
               {/* Ground Track */}
               <div className="absolute bottom-4 left-4 right-4 h-1 bg-slate-300 rounded-full opacity-20" />
               
               <motion.div 
                animate={{ 
                  x: `${busPosition}%`, 
                  rotate: isEngineBroken ? [0, -10, 10, 0] : 0,
                  y: isPowerMode ? [0, -5, 0] : 0 
                }}
                transition={isEngineBroken ? { repeat: Infinity, duration: 0.5 } : { type: "spring" }}
                className={`relative z-10 ${isEngineBroken ? 'text-red-500' : 'text-indigo-600'}`}
               >
                  <Bus size={48} className={isPowerMode && !isEngineBroken ? "text-emerald-400" : ""} />
               </motion.div>
            </div>

            <div className="mt-6 flex gap-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${busFuel}%` }} className="h-full bg-orange-500" />
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {isEngineBroken ? (
              <button 
                onClick={() => setIsEngineBroken(false)}
                className="w-full py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest animate-bounce"
              >
                Engine Failure! Tap to Fix
              </button>
            ) : (
              <button 
                onClick={handleBusLaunch}
                className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all
                  ${busFuel >= 100 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-900 text-white'}`}
              >
                {busFuel >= 100 ? "LIFT OFF! 🚀" : "PUMP FUEL"}
              </button>
            )}
          </div>
        </motion.div>

        {/* --- 3. LIVE ROUTE RADAR --- */}
        <div className={`lg:col-span-7 rounded-[3.5rem] p-10 shadow-xl border transition-all
          ${isPowerMode ? 'bg-[#111] border-emerald-500/20' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black uppercase flex items-center gap-3 tracking-tighter">
              <Map className={isPowerMode ? "text-emerald-400" : "text-indigo-600"} /> Live Fleet
            </h3>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
               <span className="text-[10px] font-black uppercase opacity-50">Active Radar</span>
            </div>
          </div>

          <div className="space-y-3">
            {['Express 101', 'Loop 404'].map((route, i) => (
              <div key={i} className="group">
                <button 
                  onClick={() => setSelectedRoute(selectedRoute === i ? null : i)}
                  className={`w-full p-6 rounded-[2rem] flex items-center justify-between border-2 transition-all
                    ${selectedRoute === i ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100 bg-slate-50'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                      <Navigation size={18} className="text-indigo-600" />
                    </div>
                    <span className="font-bold">{route}</span>
                  </div>
                  <ChevronDown className={`transition-transform ${selectedRoute === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {selectedRoute === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden p-6 bg-white rounded-b-[2rem] border-x-2 border-b-2 border-slate-100 -mt-4 mb-4"
                    >
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                        <Clock size={14} /> Arriving in {i === 0 ? '4m' : '12m'}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* --- 4. THE SCANNER / TICKET --- */}
        <div className={`lg:col-span-5 rounded-[3.5rem] p-10 flex flex-col items-center justify-center relative overflow-hidden transition-all
          ${isPowerMode ? 'bg-black border border-emerald-500/40' : 'bg-slate-900'}`}>
          
          {/* Scanning Line Effect */}
          <motion.div 
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className={`absolute left-0 right-0 h-[2px] opacity-50 z-20 
              ${isPowerMode ? 'bg-emerald-400 shadow-[0_0_15px_#10b981]' : 'bg-indigo-400 shadow-[0_0_15px_#6366f1]'}`}
          />

          <div className="bg-white p-6 rounded-[2.5rem] mb-6 relative z-10">
            <QrCode size={140} className="text-slate-900" />
          </div>
          <p className={`text-[10px] font-black uppercase tracking-[0.4em] mb-2 
            ${isPowerMode ? 'text-emerald-400' : 'text-indigo-400'}`}>
            Secure Pass Active
          </p>
          <div className="flex gap-1">
             {[...Array(5)].map((_, i) => (
               <motion.div 
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                className="w-1.5 h-1.5 rounded-full bg-white" 
               />
             ))}
          </div>
        </div>

      </motion.div>
    </div>
    </>
  );
};

export default UserProfilePage;
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Flame, Zap, CreditCard, Car, MapPin, X, Award, Download, Share2, Globe, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import Navbar from '../components/Navbar';

const GreenPointsPage = ({user , setUser}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const handleJoinRevolution = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#34d399', '#fbbf24']
    });
    setIsModalOpen(true);
  };

  const earnMethods = [
    { icon: <MapPin />, title: "Distance Based", desc: "Longer trips = Higher rewards.", points: "Up to 50 pts", color: "bg-emerald-100 text-emerald-600" },
    { icon: <Flame />, title: "Daily Streaks", desc: "Bonus at 5, 15, and 30 days.", points: "500 pts Bonus", color: "bg-orange-100 text-orange-600" },
    { icon: <Zap />, title: "Off-Peak Bonus", desc: "Travel during quiet hours.", points: "+25 pts", color: "bg-yellow-100 text-yellow-600" },
    { icon: <CreditCard />, title: "Digital Payment", desc: "Use MobMagic or e-tickets.", points: "+15 pts", color: "bg-blue-100 text-blue-600" },
    { icon: <Car />, title: "Portal Services", desc: "Book cabs via our portal.", points: "+100 pts", color: "bg-purple-100 text-purple-600" },
  ];

  const rewards = [
    { goal: "100 pts", reward: "Limited Free Ride", cost: 100 },
    { goal: "200 pts", reward: "Plant a Tree", cost: 200 },
    { goal: "250 pts", reward: "Weekly Pass Discount", cost: 250 },
    { goal: "300 pts", reward: "Road Repair Fund", cost: 300 },
    { goal: "500 pts", reward: "Monthly Cashback", cost: 500 },
    { goal: "1000 pts", reward: "Carbon Offset Certificate", cost: 1000 },
  ];

  return (
    <>
    <Navbar user={user}/>
    <div className="min-h-screen bg-green-200 text-slate-800 font-sans selection:bg-emerald-100">
      
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_#ecfdf5_0%,transparent_70%)] -z-10" />
        
        <motion.div {...fadeIn} className="max-w-4xl mx-auto text-center">
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }} 
            transition={{ repeat: Infinity, duration: 4 }}
            className="inline-block p-3 rounded-2xl bg-emerald-50 border border-emerald-100 mb-6 shadow-sm"
          >
            <Leaf className="text-emerald-500 w-8 h-8" />
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-slate-900">
            Travel Green. <br/>
            <span className="text-emerald-600">Get Rewarded.</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto">
            Your daily commute is now an investment in the planet. Earn points for every sustainable choice you make.
          </p>
        </motion.div>
      </section>

      {/* Earning Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 flex items-center gap-3 text-slate-900">
          <div className="w-8 h-1 bg-emerald-500 rounded-full"/> How to Earn
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
          {earnMethods.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -8 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-3xl bg-green-100 border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all group"
            >
              <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center mb-6`}>
                {React.cloneElement(item.icon, { className: "w-6 h-6" })}
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 group-hover:text-emerald-600 transition-colors">{item.title}</h3>
              <p className="text-slate-500 mb-4">{item.desc}</p>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-sm font-bold">
                {item.points}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Rewards Showcase */}
      <section className="py-20 px-6 bg-emerald-50/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center text-slate-900">Redeem Your Impact</h2>
          <div className="space-y-3">
            {rewards.map((reward, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.01 }}
                className="flex items-center justify-between p-5 rounded-2xl bg-green-100 border border-slate-100 shadow-sm hover:border-emerald-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-slate-900">{reward.reward}</h4>
                    <p className="text-sm text-slate-400">Eco-Target Reached</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-emerald-600 font-mono font-bold">{reward.cost} PTS</span>
                  <div className="w-32 h-1 bg-slate-100 mt-2 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      className="h-full bg-emerald-500" 
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 text-center px-6">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
          <button 
            onClick={handleJoinRevolution}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-12 py-5 rounded-2xl font-black text-xl shadow-xl shadow-emerald-200 transition-all flex items-center gap-3"
          >
            <Globe className="animate-pulse" size={24} />
            Join the Green Revolution
          </button>
        </motion.div>
      </section>

      {/* Certificate Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-1 overflow-hidden"
            >
              <div className="m-4 border-[8px] border-emerald-50 rounded-[2.2rem] p-10 text-center relative">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-300 hover:text-emerald-500"><X /></button>
                <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Award className="text-emerald-600" size={40} />
                </div>
                <h3 className="text-emerald-600 font-black tracking-widest text-xs uppercase mb-2">Recognition of Impact</h3>
                <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4 italic">Green Leader</h2>
                <div className="flex justify-center gap-1 mb-8">
                  <ShieldCheck className="text-emerald-500" size={18} />
                  <span className="text-sm font-medium text-slate-500">Verified Eco-Pioneer</span>
                </div>
                <p className="text-slate-600 text-lg leading-relaxed mb-10 px-6">
                  “This certificate honors your commitment to sustainable travel. By choosing green routes, you are actively healing the atmosphere, one mile at a time.”
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition shadow-lg">
                    <Download size={18} /> Download Asset
                  </button>
                  <button className="flex-1 border-2 border-slate-100 text-slate-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition">
                    <Share2 size={18} /> Share Impact
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
    </>
  );
};

export default GreenPointsPage;
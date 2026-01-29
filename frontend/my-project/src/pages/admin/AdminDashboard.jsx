import React, { useState, useEffect } from "react";
import { fetchDashboardOverview } from "../../api/adminDashboard";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ---------------- MOCK DATA ---------------- */

const chartData = [
  { name: "Jan", value: 18 },
  { name: "Feb", value: 25 },
  { name: "Mar", value: 14 },
  { name: "Apr", value: 10 },
  { name: "May", value: 22 },
  { name: "Jun", value: 30 },
  { name: "Jul", value: 26 },
];

/* ---------------- REUSABLE COMPONENTS ---------------- */

const Card = ({ children, isDark, className = "" }) => (
  <div
    className={`
      relative overflow-hidden rounded-2xl p-6 transition-all duration-300
      ${isDark
        ? "bg-[#151933] border border-[#1f2347] hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]"
        : "bg-white border border-gray-200 hover:shadow-xl"}
      hover:-translate-y-1
      ${className}
    `}
  >
    {/* gradient hover overlay */}
    <div
      className={`
        pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition
        ${isDark
          ? "bg-gradient-to-br from-cyan-500/10 to-indigo-500/10"
          : "bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-pink-500/10"}
      `}
    />
    <div className="relative z-10">{children}</div>
  </div>
);


const KPI = ({ title, value, isDark }) => (
  <Card isDark={isDark}>
    <p className={`${isDark ? "text-slate-400" : "text-slate-500"} text-sm`}>
      {title}
    </p>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </Card>
);

const Progress = ({ label, percent, isDark }) => (
  <div className="mb-4">
    <div className="flex justify-between text-sm mb-1">
      <span className={isDark ? "text-slate-400" : "text-slate-500"}>
        {label}
      </span>
      <span>{percent}%</span>
    </div>
    <div
      className={`h-2 rounded-full ${
        isDark ? "bg-slate-700" : "bg-gray-200"
      }`}
    >
      <div
        className={`h-2 rounded-full transition-all
          ${
            isDark
              ? "bg-gradient-to-r from-cyan-500 to-indigo-500"
              : "bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500"
          }`}
        style={{ width: `${percent}%` }}
      />
    </div>
  </div>
);

const TableRow = ({ route, action, isDark }) => (
  <tr
    className={`border-b ${
      isDark ? "border-slate-700" : "border-gray-200"
    } hover:bg-black/5 transition`}
  >
    <td className="py-3">{route}</td>
    <td>{action}</td>
    <td>2 mins ago</td>
    <td className="font-medium">Completed</td>
  </tr>
);

const Alert = ({ text, isDark }) => (
  <div
    className={`rounded-xl px-4 py-3 text-sm mb-2 transition
    ${
      isDark
        ? "border border-slate-700 text-slate-400 hover:bg-slate-800"
        : "border border-gray-200 text-gray-600 hover:bg-gray-100"
    }`}
  >
    {text}
  </div>
);

/* ---------------- PAGE ---------------- */

const AdminDashboard = () => {
  const [theme, setTheme] = useState("light");
  const isDark = theme === "dark";
  const [stats, setStats] = useState(null);
const adminToken = localStorage.getItem("adminToken"); 

useEffect(() => {
  fetchDashboardOverview(adminToken)
    .then(setStats)
    .catch(err => console.error(err));
}, []);



  return (
    <div
      className={`min-h-screen transition-colors duration-500
      ${isDark ? "bg-[#0f1220] text-slate-200" : "bg-[#f6f7fb] text-slate-900"}`}
    >
      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

        {/* ================= NAVBAR ================= */}
        <div
          className={`rounded-2xl px-6 py-4 flex items-center justify-between
          ${isDark ? "bg-[#11162a]" : "bg-white"} shadow-sm`}
        >
          <div className="flex items-center gap-10">
            <h1 className="text-xl font-bold">Mobizee</h1>
            <nav
              className={`flex gap-6 text-sm ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              <span className="font-medium text-indigo-500">Dashboard</span>
              <span className="hover:text-indigo-500 cursor-pointer">Routes</span>
              <span className="hover:text-indigo-500 cursor-pointer">Buses</span>
              <span className="hover:text-indigo-500 cursor-pointer">Wallet</span>
              <span className="hover:text-indigo-500 cursor-pointer">Cards</span>
            </nav>
          </div>

          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`px-4 py-2 rounded-xl text-sm transition
            ${
              isDark
                ? "bg-slate-700 hover:bg-slate-600"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* ================= ACTION BAR ================= */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">
              Good Morning, Authority 👋
            </h2>
            <p className="text-sm text-slate-500">
              Monitor and control the transport network.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              className={`px-4 py-2 rounded-xl text-sm border transition
              ${
                isDark
                  ? "border-slate-600 hover:bg-slate-700"
                  : "border-gray-300 hover:bg-gray-100"
              }`}
            >
              Download Report
            </button>
            <button
              className="px-4 py-2 rounded-xl text-sm text-white
              bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500
              hover:shadow-lg hover:-translate-y-[1px] transition"
            >
              New Action
            </button>
          </div>
        </div>

        {/* ================= ROW 1 ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <KPI
  title="Total Routes"
  value={stats ? stats.totalRoutes : "—"}
  isDark={isDark}
/>

<KPI
  title="Active Buses"
  value={stats ? stats.totalBuses : "—"}
  isDark={isDark}
/>

<KPI
  title="Revenue Today"
  value={stats ? `₹${stats.revenueToday}` : "—"}
  isDark={isDark}
/>


          <Card isDark={isDark}>
            <h3 className="font-semibold mb-1">Live Status</h3>
            <p className="text-sm text-slate-400 mb-4">
              Network health overview
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Routes</span>
                <span>Operational</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payments</span>
                <span>Stable</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cards</span>
                <span>Normal</span>
              </div>
            </div>
          </Card>
        </div>

        {/* ================= ROW 2 ================= */}
      {/* ================= ROW 2 ================= */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

  {/* 2/3 width chart */}
  <Card isDark={isDark} className="lg:col-span-2">
    <h3 className="font-semibold mb-4">Network Usage</h3>
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="value"
          stroke={isDark ? "#a5b4fc" : "#6366f1"}
          strokeWidth={3}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </Card>

  {/* 1/3 width vertical bars */}
  <Card isDark={isDark}>
    <h3 className="font-semibold mb-4">Average Travel Time</h3>
    <Progress label="Delhi" percent={90} isDark={isDark} />
    <Progress label="Ghaziabad" percent={72} isDark={isDark} />
    <Progress label="Noida" percent={65} isDark={isDark} />
  </Card>

</div>


        {/* ================= ROW 3 ================= */}
    {/* ================= ROW 3 ================= */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

  {/* 2/3 width detailed table */}
  <Card isDark={isDark} className="lg:col-span-2">
    <h3 className="font-semibold mb-4">Recent Route Actions</h3>
    <table className="w-full text-sm">
      <thead className="text-slate-500 border-b">
        <tr>
          <th className="text-left py-2">Route</th>
          <th>Action</th>
          <th>Time</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <TableRow route="DEL_R14" action="Suspended" isDark={isDark} />
        <TableRow route="GZB_R8" action="Fare Updated" isDark={isDark} />
        <TableRow route="NOIDA_R3" action="Activated" isDark={isDark} />
      </tbody>
    </table>
  </Card>

  {/* 1/3 width alerts */}
  <Card isDark={isDark}>
    <h3 className="font-semibold mb-4">System Alerts</h3>
    <Alert text="High load on Delhi routes" isDark={isDark} />
    <Alert text="Bus maintenance overdue" isDark={isDark} />
    <Alert text="Payment spike detected" isDark={isDark} />
  </Card>

</div>


      </div>
    </div>
  );
};

export default AdminDashboard;

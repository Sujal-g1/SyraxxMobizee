import React from "react";
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

/* ---------------- PAGE ---------------- */

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

        {/* ================= NAVBAR ================= */}
        <div className="bg-white rounded-2xl px-6 py-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-10">
            <h1 className="text-xl font-bold">Mobizee</h1>
            <nav className="flex gap-6 text-sm text-gray-500">
              <span className="text-black font-medium">Dashboard</span>
              <span>Routes</span>
              <span>Buses</span>
              <span>Wallet</span>
              <span>Cards</span>
              <span>Reports</span>
            </nav>
          </div>

          <div className="w-9 h-9 rounded-full bg-gray-200" />
        </div>

        {/* ================= ACTION BAR ================= */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">
              Good Morning, Authority 👋
            </h2>
            <p className="text-sm text-gray-500">
              Control and monitor the transport network.
            </p>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-xl border text-sm">
              Download Report
            </button>
            <button className="px-4 py-2 rounded-xl bg-black text-white text-sm">
              New Action
            </button>
          </div>
        </div>

        {/* ================= ROW 1 ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          <KPI title="Total Routes" value="78" />
          <KPI title="Active Buses" value="214" />
          <KPI title="Revenue Today" value="₹42,300" />

          {/* Vertical Live Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-semibold mb-1">Live Status</h3>
              <p className="text-sm text-gray-500">
                Network health overview
              </p>
            </div>

            <div className="space-y-2 text-sm mt-4">
              <LiveItem label="Routes" value="Operational" />
              <LiveItem label="Payments" value="Stable" />
              <LiveItem label="Cards" value="Normal" />
            </div>

            <button className="mt-4 w-full border rounded-xl py-2 text-sm">
              View Details
            </button>
          </div>
        </div>

        {/* ================= ROW 2 ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Large Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold">Network Usage</h3>
              <span className="text-sm text-gray-400">Monthly</span>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#000"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Vertical Progress Bars */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Average Travel Time</h3>

            <Progress label="Delhi" percent={90} />
            <Progress label="Ghaziabad" percent={72} />
            <Progress label="Noida" percent={65} />
          </div>
        </div>

        {/* ================= ROW 3 ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Detailed Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Recent Route Actions</h3>

            <table className="w-full text-sm">
              <thead className="text-gray-500 border-b">
                <tr>
                  <th className="text-left py-2">Route</th>
                  <th className="text-left">Action</th>
                  <th className="text-left">Time</th>
                  <th className="text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                <TableRow route="DEL_R14" action="Suspended" />
                <TableRow route="GZB_R8" action="Fare Updated" />
                <TableRow route="NOIDA_R3" action="Activated" />
                <TableRow route="DEL_R21" action="Maintenance" />
              </tbody>
            </table>
          </div>

          {/* Right Vertical Bar */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4">System Alerts</h3>

            <div className="space-y-3 text-sm">
              <Alert text="High load on Delhi routes" />
              <Alert text="Bus maintenance overdue" />
              <Alert text="Payment spike detected" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

/* ---------------- COMPONENTS ---------------- */

const KPI = ({ title, value }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

const LiveItem = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const Progress = ({ label, percent }) => (
  <div className="mb-4">
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-500">{label}</span>
      <span>{percent}%</span>
    </div>
    <div className="h-2 bg-gray-200 rounded-full">
      <div
        className="h-2 bg-black rounded-full"
        style={{ width: `${percent}%` }}
      />
    </div>
  </div>
);

const TableRow = ({ route, action }) => (
  <tr className="border-b last:border-b-0">
    <td className="py-3">{route}</td>
    <td>{action}</td>
    <td>2 mins ago</td>
    <td className="font-medium">Completed</td>
  </tr>
);

const Alert = ({ text }) => (
  <div className="border rounded-xl px-4 py-3 text-gray-600">
    {text}
  </div>
);

export default AdminDashboard;

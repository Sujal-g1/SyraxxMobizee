import { useState } from "react";

export default function RouteSearch() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [buses, setBuses] = useState([]);
  const [error, setError] = useState("");

  const API = import.meta.env.VITE_API_URL || "http://localhost:5001";
  console.log("API URL:", API);


  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setBuses([]);

    try {
      const res = await fetch(`${API}/api/routes/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Search failed");
        return;
      }

      setBuses(data.buses || []);
    } catch (err) {
      console.error(err);
      setError("Server not reachable");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Search Bus Route</h2>

      <form onSubmit={handleSearch} className="space-y-4">
        <input
          type="text"
          placeholder="From (exact stop name)"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="w-full border px-4 py-2 rounded"
        />

        <input
          type="text"
          placeholder="To (exact stop name)"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-full border px-4 py-2 rounded"
        />

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          Search Buses
        </button>
      </form>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {/* Results */}
      <div className="mt-6 space-y-3">
        {buses.map((bus, index) => (
          <div key={index} className="border p-3 rounded shadow-sm">
            <p><b>Bus:</b> {bus.busNumber}</p>
            <p><b>Departure:</b> {bus.departureTime}</p>
            <p><b>Arrival:</b> {bus.arrivalTime}</p>
            <p><b>Fare:</b> ₹{bus.fare}</p>
            <p><b>Comfort:</b> {bus.comfort}</p>
          </div>
        ))}

        {buses.length === 0 && !error && (
          <p className="text-gray-500 mt-4 text-center">No buses found</p>
        )}
      </div>
    </div>
  );
}

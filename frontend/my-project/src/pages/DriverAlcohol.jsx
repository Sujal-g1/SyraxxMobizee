import { useState, useEffect } from "react";
import axios from "axios";

export default function DriverAlcohol() {
  const [value, setValue] = useState(0.02);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const random = Math.random() * 0.2;
      setValue(random);

      axios.post(`${import.meta.env.VITE_API_URL}/api/alcohol/test`, {
        driverId: "DRIVER_1",
        alcoholValue: random,
      });
      console.log("Sent alcohol value:", random);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const submit = async () => {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/alcohol/test`,
      {
        driverId: "DRIVER_1",
        alcoholValue: value,
      },
    );

    setResult(res.data);
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Driver Alcohol Simulator</h2>

      <p>Alcohol Value: {value.toFixed(2)}</p>

      <input
        className="border px-2 py-1 mt-3"
        type="number"
        value={value}
        onChange={(e) => setValue(parseFloat(e.target.value))}
        style={{ width: 300 }}
      />

      <br />
      <br />

      <button className="border px-2 py-1 mt-3" onClick={submit}>
        Submit Test
      </button>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>
            Status:{" "}
            <span
              style={{ color: result.status === "DRUNK" ? "red" : "green" }}
            >
              {result.status}
            </span>
          </h3>

          <h3>
            Ignition:{" "}
            <span
              style={{ color: result.ignition === "LOCKED" ? "red" : "green" }}
            >
              {result.ignition}
            </span>
          </h3>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import { adminLogin } from "../../api/adminAuth";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

const handleLogin = async () => {
  try {
    setError("");

    console.log("Logging in with:", email);

    const data = await adminLogin(email, password);

    console.log("Login response:", data);

    localStorage.setItem("adminToken", data.token);

    console.log("Token saved. Navigating...");

    navigate("/admin/dashboard");

  } catch (err) {
    console.error("Login error:", err);
    setError("Invalid email or password");
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <form
  onSubmit={e => {
    e.preventDefault();
    handleLogin();
  }}
  className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
>
  <h1 className="text-2xl font-bold mb-6 text-center">
    Transport Authority Login
  </h1>

 <input
  type="email"
  placeholder="Admin Email"
  autoComplete="username"
  value={email}
  onChange={e => setEmail(e.target.value)}
  className="w-full mb-4 p-3 border rounded-lg"
/>

<input
  type="password"
  placeholder="Password"
  autoComplete="current-password"
  value={password}
  onChange={e => setPassword(e.target.value)}
  className="w-full mb-4 p-3 border rounded-lg"
/>


  {error && (
    <p className="text-red-500 text-sm mb-3">{error}</p>
  )}

  <button
    type="submit"
    className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800"
  >
    Login
  </button>
</form>

      </div>
    </div>
  );
};

export default AdminLogin;

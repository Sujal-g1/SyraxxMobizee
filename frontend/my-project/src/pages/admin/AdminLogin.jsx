import React from "react";

const AdminLogin = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Transport Authority Login
        </h1>

        <input
          type="email"
          placeholder="Admin Email"
          className="w-full mb-4 p-3 border rounded-lg"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 p-3 border rounded-lg"
        />

        <button
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;

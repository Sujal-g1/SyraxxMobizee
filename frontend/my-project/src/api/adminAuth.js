const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

export async function adminLogin(email, password) {
  const res = await fetch(`${API}/api/admin/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) throw new Error("Login failed");

  return res.json();
}

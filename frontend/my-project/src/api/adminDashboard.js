const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

export async function fetchDashboardOverview(token) {
  const res = await fetch(`${API}/api/admin/dashboard/overview`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error("Failed to fetch dashboard data");
  return res.json();
}

export async function fetchDashboardUsage(token, range) {
  const res = await fetch(`${API}/api/admin/dashboard/usage?range=${range}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error("Failed to fetch usage data");
  return res.json();
}


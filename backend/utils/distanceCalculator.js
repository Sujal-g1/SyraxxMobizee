function toRad(value) {
  return (value * Math.PI) / 180;
}

// Distance between two lat/lng points (in KM)
function haversineDistance(a, b) {
  const R = 6371; // Earth radius in km

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) *
    Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

  return R * c;
}

// Total distance of a path: [stop1, stop2, stop3, ...]
function calculatePathDistance(stops) {
  let total = 0;

  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];

    if (a.lat && a.lng && b.lat && b.lng) {
      const d = haversineDistance(a, b);
      total += d;
    }
  }

  return Number(total.toFixed(2)); // km
}

module.exports = {
  calculatePathDistance
};

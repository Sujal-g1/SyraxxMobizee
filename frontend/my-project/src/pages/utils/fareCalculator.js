// src/utils/fareCalculator.js

// Example station list
export const stations = [
  { id: "ST001", name: "Central Station" },
  { id: "ST002", name: "East Park" },
  { id: "ST003", name: "Tech Valley" },
  { id: "ST004", name: "Airport Terminal" },
];

// Time-based fare rules (can replace with distance or station-based later)
const timeFareRules = [
  { maxTime: 10, fare: 20 },
  { maxTime: 20, fare: 30 },
  { maxTime: 25, fare: 35 },
];

// Get fare based on time duration
export const getFareByTime = (seconds) => {
  for (let rule of timeFareRules) {
    if (seconds <= rule.maxTime) {
      return rule.fare;
    }
  }
  return 40; // default if time exceeds all rules
};

// Example : station-based fare
export const getFareByStations = (startId, endId) => {
  // Placeholder: calculate based on station difference or route
  if (startId === endId) return 10;
  const startIndex = stations.findIndex((s) => s.id === startId);
  const endIndex = stations.findIndex((s) => s.id === endId);
  const distance = Math.abs(startIndex - endIndex);

  // Simple example: Rs 15 per hop
  return 15 * distance;
};

// Fare configuration (can be moved to DB later)
const BASE_FARE = 10;       // ₹10 minimum
const RATE_PER_KM = 2;     // ₹2 per km

function calculateFare(distanceKm) {
  if (!distanceKm || distanceKm <= 0) {
    return BASE_FARE;
  }

  const rawFare = BASE_FARE + distanceKm * RATE_PER_KM;

  // Round to nearest rupee
  const finalFare = Math.round(rawFare);

  return finalFare;
}

module.exports = {
  BASE_FARE,
  RATE_PER_KM,
  calculateFare
};

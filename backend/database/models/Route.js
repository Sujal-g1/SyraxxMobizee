const mongoose = require("mongoose");

const stopSchema = new mongoose.Schema({
  name: String,
  lat: Number,
  lng: Number,
});

const busTimingSchema = new mongoose.Schema({
  busNumber: String,
  departureTime: String, // "08:30"
  arrivalTime: String,   // "09:15"
  fare: Number,
  comfort: { type: String, enum: ["normal", "ac"], default: "normal" },
});

const routeSchema = new mongoose.Schema({
  routeId: { type: String, required: true, unique: true },
  city: String,
  from: stopSchema,
  to: stopSchema,
  stops: [stopSchema],        // ordered list of stops
  buses: [busTimingSchema],  // buses running on this route
});

module.exports = mongoose.model("Route", routeSchema);

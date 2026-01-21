// backend/database/models/Bus.js
const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true },
  route: { type: String, required: true },
  seats: { type: Number, default: 40 },
});

module.exports = mongoose.model("Bus", busSchema);

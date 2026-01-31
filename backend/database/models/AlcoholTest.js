const mongoose = require("mongoose");

const alcoholSchema = new mongoose.Schema({
  driverId: { type: String, required: true },
  alcoholValue: Number,
  status: String,
  ignition: String,
  time: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AlcoholTest", alcoholSchema);

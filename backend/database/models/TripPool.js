const mongoose = require("mongoose");

const tripPoolSchema = new mongoose.Schema({
  date: { type: String, required: true },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: "VehicleTemplate" },
  totalCapacity: Number,
  bookedSeats: { type: Number, default: 0 },
  status: { type: String, enum: ["open", "full"], default: "open" },
}, { timestamps: true });

module.exports = mongoose.model("TripPool", tripPoolSchema);

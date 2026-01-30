const mongoose = require("mongoose");

const vehicleTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  ac: { type: Boolean, default: false },
  luxuryTier: { type: String, enum: ["budget", "standard", "premium"], default: "standard" },
  basePrice: { type: Number, required: true },
  isShared: { type: Boolean, default: true },
  isPrivate: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("VehicleTemplate", vehicleTemplateSchema);

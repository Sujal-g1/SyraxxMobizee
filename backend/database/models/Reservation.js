const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  userId: String,
  poolId: { type: mongoose.Schema.Types.ObjectId, ref: "TripPool" },
  seats: Number,
  bookingType: { type: String, enum: ["shared", "private"] },
  totalPrice: Number,
  status: { type: String, default: "confirmed" },
}, { timestamps: true });

module.exports = mongoose.model("Reservation", reservationSchema);

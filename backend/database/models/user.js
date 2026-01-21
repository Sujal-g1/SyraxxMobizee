const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true ,  required: false }, // NOT required — generated automatically
  email: { type: String, required: true, unique: true },

  phone: { type: String },
  password: { type: String },

  googleAuth: { type: Boolean, default: false },

  firstName: { type: String }, 
  lastName: { type: String }, 

  user_code: { type: String, unique: true, sparse: true }, // cryptographic ID
  wallet_id: { type: String, unique: true, sparse: true }, //  wallet id
  wallet_balance: { type: Number, default: 0 }, // current balance

  bank_account: { type: String },  // optional
  ifsc: { type: String },          // optional
  upi_id: { type: String },        // optional
});


// Generate userId, user_code, wallet_id
userSchema.pre("save", function (next) {
  if (!this.userId) this.userId = crypto.randomUUID();
  if (!this.user_code) this.user_code = crypto.randomUUID();
  next();
});

module.exports = mongoose.model("User", userSchema);


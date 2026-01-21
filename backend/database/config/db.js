// backend/database/config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("RAW MONGO_URI =", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
    console.log("Connecting to Mongo URI:", process.env.MONGO_URI);
    console.log("Connected to DB name:", mongoose.connection.name);


  } catch (err) {
    console.error("❌ DB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

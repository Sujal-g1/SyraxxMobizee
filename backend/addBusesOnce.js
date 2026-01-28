require("dotenv").config();
const mongoose = require("mongoose");
const Route = require("./database/models/Route");

// 🔴 CHANGE THIS TO YOUR ACTUAL MONGO URI
const MONGO_URI = process.env.MONGO_URI;

async function addBuses() {
  try {
    console.log("🔌 Connecting to DB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected");

    // -----------------------
    // DELHI ROUTES
    // -----------------------
    const delhiResult = await Route.updateMany(
      { city: "Delhi", $or: [{ buses: { $exists: false } }, { buses: { $size: 0 } }] },
      {
        $set: {
          buses: [
            {
              busNumber: "DL701",
              departureTime: "06:00",
              arrivalTime: "07:15",
              fare: 35,
              comfort: "normal"
            },
            {
              busNumber: "DL702",
              departureTime: "08:00",
              arrivalTime: "09:15",
              fare: 55,
              comfort: "ac"
            },
            {
              busNumber: "DL703",
              departureTime: "18:00",
              arrivalTime: "19:15",
              fare: 35,
              comfort: "normal"
            }
          ]
        }
      }
    );

    console.log(`🚌 Delhi routes updated: ${delhiResult.modifiedCount}`);

    // -----------------------
    // GHAZIABAD ROUTES
    // -----------------------
    const gzbResult = await Route.updateMany(
      { city: "Ghaziabad", $or: [{ buses: { $exists: false } }, { buses: { $size: 0 } }] },
      {
        $set: {
          buses: [
            {
              busNumber: "GZ1201",
              departureTime: "05:45",
              arrivalTime: "07:30",
              fare: 45,
              comfort: "normal"
            },
            {
              busNumber: "GZ1202",
              departureTime: "07:30",
              arrivalTime: "09:15",
              fare: 65,
              comfort: "ac"
            },
            {
              busNumber: "GZ1203",
              departureTime: "17:30",
              arrivalTime: "19:15",
              fare: 45,
              comfort: "normal"
            }
          ]
        }
      }
    );

    console.log(`🚌 Ghaziabad routes updated: ${gzbResult.modifiedCount}`);

    // -----------------------
    // NOIDA ROUTES
    // -----------------------
    const noidaResult = await Route.updateMany(
      { city: "Noida", $or: [{ buses: { $exists: false } }, { buses: { $size: 0 } }] },
      {
        $set: {
          buses: [
            {
              busNumber: "ND301",
              departureTime: "06:15",
              arrivalTime: "07:00",
              fare: 30,
              comfort: "normal"
            },
            {
              busNumber: "ND302",
              departureTime: "08:30",
              arrivalTime: "09:15",
              fare: 45,
              comfort: "ac"
            },
            {
              busNumber: "ND303",
              departureTime: "18:30",
              arrivalTime: "19:15",
              fare: 30,
              comfort: "normal"
            }
          ]
        }
      }
    );

    console.log(`🚌 Noida routes updated: ${noidaResult.modifiedCount}`);

    console.log("✅ ALL BUSES ADDED SUCCESSFULLY");
    process.exit(0);

  } catch (err) {
    console.error("❌ Error adding buses:", err);
    process.exit(1);
  }
}

addBuses();

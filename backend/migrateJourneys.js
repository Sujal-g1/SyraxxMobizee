require("dotenv").config();
const mongoose = require("mongoose");
const Journey = require("./database/models/Journey");

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected");

    const r1 = await Journey.updateMany(
      { distance_km: { $exists: false } },
      { $set: { distance_km: 0 } }
    );

    const r2 = await Journey.updateMany(
      { ended_at: { $exists: false } },
      { $set: { ended_at: new Date() } }
    );

    console.log("Distance fixed:", r1.modifiedCount);
    console.log("Dates fixed:", r2.modifiedCount);

    console.log("Migration complete ✅");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();

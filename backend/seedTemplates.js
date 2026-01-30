
require("dotenv").config();
const mongoose = require("mongoose");
const VehicleTemplate = require("./database/models/VehicleTemplate");

mongoose.connect(process.env.MONGO_URI);


async function seed() {
  await VehicleTemplate.deleteMany({});

  await VehicleTemplate.insertMany([
    {
      name: "Mini Shared AC",
      capacity: 15,
      ac: true,
      luxuryTier: "standard",
      basePrice: 200,
    },
    {
      name: "Van Budget",
      capacity: 10,
      ac: false,
      luxuryTier: "budget",
      basePrice: 150,
    },
    {
      name: "Luxury Coach VIP",
      capacity: 40,
      ac: true,
      luxuryTier: "premium",
      basePrice: 350,
    },
  ]);

  console.log("Templates seeded");
  process.exit();
}

seed();

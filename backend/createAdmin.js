require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Admin = require("./database/models/Admin");

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await Admin.findOne({ email: "admin@test.com" });
    if (existing) {
      console.log("Admin already exists");
      process.exit();
    }

    const password = await bcrypt.hash("admin123", 10);

    await Admin.create({
      email: "admin@test.com",
      password,
      role: "superadmin",
      isActive: true
    });

    console.log("✅ Admin created");
    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createAdmin();

const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const admin = require("../firebaseAdmin"); 
const User = require("../database/models/user");
const WalletTransaction = require("../database/models/WalletTransaction");
const Journey = require("../database/models/Journey");
const Route = require("../database/models/Route");
const { calculatePathDistance } = require("../utils/distanceCalculator");
const { calculateFare } = require("../utils/fareCalculator");
const nodemailer = require("nodemailer");


// ================================
// SECURE Google Login Route
// ================================
router.post("/google-login", async (req, res) => {
   console.log("Headers:", req.headers);
  console.log("Raw body:", req.body);
  const { idToken } = req.body;

  try {
    if (!idToken) return res.status(400).json({ error: "No token provided" });

    // 1. Verify token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, uid } = decodedToken;

    // 2. Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        firstName: name?.split(" ")[0] || "Google",
        lastName: name?.split(" ")[1] || "User",
        googleAuth: true,
        userId: uid, // Use Firebase UID
      });
      await user.save();
    }

    // 3. Issue your backend JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password, ...userData } = user._doc;
    res.json({ user: userData, token });

  } catch (err) {
    console.error("Google login error:", err.message);
    res.status(401).json({ error: "Auth failed", details: err.message });
  }
});

// ================================

// ================================
router.post("/enable-feature", async (req, res) => {
  const { email, _id } = req.body;
  try {
    const user = await User.findOne({ _id, email });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.wallet_id) return res.status(400).json({ error: "Create wallet first" });

    if (!user.userId) user.userId = crypto.randomUUID();
    if (!user.user_code) user.user_code = crypto.randomUUID();
    user.mobmagic_enabled = true;
    await user.save();
    res.json({ success: true, user_code: user.user_code });
  } catch (err) {
    console.error("🔥 Enable-feature error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

async function generateUniqueWalletId(firstName) {
  let walletId;
  let exists = true;
  while (exists) {
    const randomPart = Math.random().toString(36).substring(2, 7);
    walletId = (firstName || "user").toLowerCase() + randomPart;
    exists = await User.exists({ wallet_id: walletId });
  }
  return walletId;
}

router.post("/create-wallet", async (req, res) => {
  const { email, bank_account, ifsc, upi_id } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.wallet_id) return res.status(400).json({ error: "Wallet exists" });

    user.wallet_id = await generateUniqueWalletId(user.firstName);
    if (bank_account) user.bank_account = bank_account;
    if (ifsc) user.ifsc = ifsc;
    if (upi_id) user.upi_id = upi_id;
    user.wallet_balance = user.wallet_balance || 0;

    await user.save();
    res.json({ message: "Wallet created", wallet_id: user.wallet_id, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/recharge-wallet", async (req, res) => {
  const { wallet_id, amount } = req.body;

  try {
    const rechargeAmount = Number(amount);
    if (!rechargeAmount || rechargeAmount <= 0) {
      return res.status(400).json({ error: "Invalid recharge amount" });
    }

    const user = await User.findOne({ wallet_id });
    if (!user) return res.status(404).json({ error: "Wallet not found" });

    const newBalance = (user.wallet_balance || 0) + rechargeAmount;

    // Update balance
    user.wallet_balance = newBalance;
    await user.save();

    // Create transaction record
    await WalletTransaction.create({
      wallet_id: user.wallet_id,
      type: "RECHARGE",
      amount: rechargeAmount,
      balance_after: newBalance,
      reference_id: null
    });

    res.json({
      message: "Wallet recharged successfully",
      wallet_balance: newBalance,
      user
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/wallet-debit", async (req, res) => {
  console.log("➡️ /wallet-debit called");

  const { wallet_id, amount, reference_id } = req.body;

  try {
    console.log("1️⃣ Request body received:", req.body);

    const debitAmount = Number(amount);
    if (!debitAmount || debitAmount <= 0) {
      console.log("❌ Invalid amount");
      return res.status(400).json({ error: "Invalid debit amount" });
    }

    console.log("2️⃣ Finding user by wallet_id:", wallet_id);
    const user = await User.findOne({ wallet_id });
    console.log("3️⃣ User found:", !!user);

    if (!user) return res.status(404).json({ error: "Wallet not found" });

    const currentBalance = user.wallet_balance || 0;
    console.log("4️⃣ Current balance:", currentBalance);

    if (currentBalance < debitAmount) {
      console.log("❌ Insufficient balance");
      return res.status(400).json({ error: "Insufficient wallet balance" });
    }

    const newBalance = currentBalance - debitAmount;
    console.log("5️⃣ New balance calculated:", newBalance);

    console.log("6️⃣ Saving user balance...");
    user.wallet_balance = newBalance;
    await user.save();
    console.log("7️⃣ User balance saved");

    console.log("8️⃣ Creating WalletTransaction...");
    const tx = await WalletTransaction.create({
      wallet_id: user.wallet_id,
      type: "FARE_DEBIT",
      amount: debitAmount,
      balance_after: newBalance,
      reference_id: reference_id || null
    });
    console.log("9️⃣ WalletTransaction created:", tx._id);

    console.log("🔟 Sending response");
    res.json({
      message: "Fare debited successfully",
      wallet_balance: newBalance,
      user
    });

  } catch (err) {
    console.error("🔥 Error in /wallet-debit:", err);
    res.status(500).json({ error: err.message });
  }
});


router.post("/journey/tap-in", async (req, res) => {
  try {
    const { user_id, mode, source_station } = req.body;

    // 1. Basic validation
    if (!user_id || !mode || !source_station) {
      return res.status(400).json({
        error: "user_id, mode and source_station are required"
      });
    }

    console.log("Tap-in request body:", req.body);

    // 2. Find user by MongoDB _id
    const user = await User.findById(user_id);

    console.log("User found:", !!user);

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    // 3. Check if user already has an active journey
    const activeJourney = await Journey.findOne({
      user_id: user._id,
      status: "ACTIVE"
    });

    if (activeJourney) {
      return res.status(400).json({
        error: "User already has an active journey"
      });
    }

    // 4. Create new journey
    const journey = await Journey.create({
      user_id: user._id,
      mode: mode,
      source_station: source_station,
      status: "ACTIVE",
      tap_in_time: new Date()
    });

    // 5. Respond
    res.json({
      message: "Tap-in successful",
      journey_id: journey._id,
      source_station: source_station,
      tap_in_time: journey.started_at
    });

  } catch (err) {
    console.error("Tap-in error:", err);
    res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
});




router.post("/journey/tap-out", async (req, res) => {
  try {
    const { journey_id, user_id, destination_station } = req.body;

    if (!journey_id || !user_id || !destination_station) {
      return res.status(400).json({
        error: "journey_id, user_id, destination_station are required"
      });
    }

    // 1. Load journey
    const journey = await Journey.findById(journey_id);
    if (!journey) {
      return res.status(404).json({ error: "Journey not found" });
    }

    if (journey.status === "COMPLETED") {
      return res.status(400).json({ error: "Journey already completed" });
    }

    const source = journey.source_station;
    const destination = destination_station;

    // 2. Find a DIRECT route that contains both source and destination
    const route = await Route.findOne({
      "stops.name": { $all: [source, destination] }
    });

    if (!route) {
      return res.status(400).json({
        error: "No direct route found between these stations"
      });
    }

    // 3. Build path between source and destination
    const stops = route.stops;

    const sourceIndex = stops.findIndex(s => s.name === source);
    const destIndex = stops.findIndex(s => s.name === destination);

    if (sourceIndex === -1 || destIndex === -1) {
      return res.status(400).json({ error: "Stations not found in route" });
    }

    let pathStops;
    if (sourceIndex <= destIndex) {
      pathStops = stops.slice(sourceIndex, destIndex + 1);
    } else {
      pathStops = stops.slice(destIndex, sourceIndex + 1).reverse();
    }

    if (pathStops.length < 2) {
      return res.status(400).json({ error: "Invalid path between stations" });
    }

    // 4. Calculate total distance using YOUR utility
    const distanceKm = calculatePathDistance(pathStops);

    // 5. Calculate fare using YOUR fare rule
    const fare = calculateFare(distanceKm);

    // 6. Load user and check wallet balance
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.wallet_balance < fare) {
      return res.status(400).json({ error: "Insufficient wallet balance" });
    }

    // 7. Debit wallet
    const newBalance = user.wallet_balance - fare;
    user.wallet_balance = newBalance;
    await user.save();

    // 8. Create wallet transaction
    await WalletTransaction.create({
      wallet_id: user.wallet_id,
      type: "FARE_DEBIT",
      amount: fare,
      balance_after: newBalance,
      reference_id: `JOURNEY_${journey_id}`,
    });

    // 9. Complete journey
    journey.destination_station = destination;
    journey.distance_km = distanceKm;
    journey.fare = fare;
    journey.status = "COMPLETED";
    journey.ended_at = new Date();

    await journey.save();

    // 10. Respond to frontend
    res.json({
      message: "Journey completed",
      journey_id: journey._id,
      source: source,
      destination: destination,
      distance_km: distanceKm,
      fare: fare,
      wallet_balance: newBalance,
    });

  } catch (err) {
    console.error("Tap-out error:", err);
    res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
});

// Get active journey for a user
router.get("/journey/active/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const journey = await Journey.findOne({
      user_id: user_id,
      status: "ACTIVE"
    });

    if (!journey) {
      return res.json({ active: false });
    }

    res.json({
      active: true,
      journey_id: journey._id,
      source_station: journey.source_station,
      started_at: journey.started_at
    });

  } catch (err) {
    console.error("Get active journey error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 📜 Get Journey History (COMPLETED journeys)
router.get("/journey/history/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const journeys = await Journey.find({
      user_id: user_id,
      status: "COMPLETED",
    }).sort({ ended_at: -1 });

    res.json({ journeys });
  } catch (err) {
    console.error("Get journey history error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// ---------------------
// ---------------------
// ---------------------


// Auth middleware (if not already defined in this file)
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// 🔥 ADD THIS ROUTE
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    console.error("GET /me error:", err);
    res.status(500).json({ error: err.message });
  }
});

// STEP 1: Initiate UPI Recharge (Create PENDING transaction)

router.post("/wallet/recharge/initiate", async (req, res) => {
   console.log("BODY RECEIVED:", req.body);
  try {
    const { wallet_id, amount } = req.body;

    if (!wallet_id || !amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid wallet_id or amount" });
    }

    const user = await User.findOne({ wallet_id });
    if (!user) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    const referenceId = "UPI_" + Date.now();

    const txn = new WalletTransaction({
      wallet_id: wallet_id,
      type: "RECHARGE",                     // ✅ valid enum
      amount: Number(amount),
      balance_after: user.wallet_balance,  // ✅ required, unchanged for now
      reference_id: referenceId,
    });
console.log("BALANCE USED FOR TXN:", user.wallet_balance);
    await txn.save();

    res.json({
      message: "Recharge initiated",
      reference_id: referenceId,
    });
  } catch (err) {
    console.error("Initiate recharge error:", err);
    res.status(500).json({ error: err.message });
  }
});

// STEP 2: Confirm UPI Recharge (Credit the wallet)

router.post("/wallet/recharge/confirm", async (req, res) => {
  try {
    const { wallet_id, reference_id } = req.body;

    if (!wallet_id || !reference_id) {
      return res.status(400).json({ error: "wallet_id and reference_id are required" });
    }

    // 1. Find initiate transaction (ONLY ONCE)
    const initTxn = await WalletTransaction.findOne({
      reference_id,
      type: "RECHARGE"
    });

    if (!initTxn) {
      return res.status(404).json({ error: "Initiate transaction not found" });
    }

    // 🔴 CRITICAL: Check if this recharge is already confirmed
    const alreadyConfirmed = await WalletTransaction.findOne({
      reference_id,
      balance_after: { $gt: initTxn.balance_after }
    });

    if (alreadyConfirmed) {
      return res.status(400).json({ error: "This recharge is already confirmed" });
    }

    const amount = initTxn.amount;

    // 2. Find user
    const user = await User.findOne({ wallet_id });
    if (!user) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    // 3. Credit wallet
    const newBalance = user.wallet_balance + amount;
    user.wallet_balance = newBalance;
    await user.save();

    // 4. Create confirm transaction
    const confirmTxn = new WalletTransaction({
      wallet_id: wallet_id,
      type: "RECHARGE",
      amount: amount,
      balance_after: newBalance,
      reference_id: reference_id,
    });

    await confirmTxn.save();

    res.json({
      message: "Recharge confirmed",
      wallet_balance: newBalance,
    });

  } catch (err) {
    console.error("Confirm recharge error:", err);
    res.status(500).json({ error: err.message });
  }
});

// STEP 3: Get Wallet Transaction History

router.get("/wallet/transactions", authMiddleware, async (req, res) => {
  try {
    // 1. Get user from token
    const user = await User.findById(req.user.id);

    if (!user || !user.wallet_id) {
      return res.status(404).json({ error: "Wallet not found for this user" });
    }

    const walletId = user.wallet_id;

    // 2. Fetch last 50 transactions, newest first
    const transactions = await WalletTransaction.find({ wallet_id: walletId })
      .sort({ created_at: -1 })
      .limit(50);

    res.json({
      wallet_id: walletId,
      transactions,
    });

  } catch (err) {
    console.error("Fetch transactions error:", err);
    res.status(500).json({ error: err.message });
  }
});


// 🔥 Get all unique stations (for autocomplete)
router.get("/stations", async (req, res) => {
  try {
    const routes = await Route.find({}, { stops: 1 });

    const stationSet = new Set();

    routes.forEach(route => {
      route.stops.forEach(stop => {
        if (stop.name) {
          stationSet.add(stop.name);
        }
      });
    });

    const stations = Array.from(stationSet).map(name => ({
      station_name: name
    }));

    res.json(stations);

  } catch (err) {
    console.error("Get stations error:", err);
    res.status(500).json({ error: "Failed to fetch stations" });
  }
});


// -------------- panic 

// 1. Setup the Email Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail
    pass: process.env.EMAIL_PASS  // Your 16-character App Password
  }
});

// 2. ROUTE: Save Emergency Contacts
// 2. ROUTE: Save Emergency Contacts
router.post("/emergency/save", async (req, res) => {
  const { userId, emails } = req.body; // In your React code, you sent user._id as userId
  try {
    const user = await User.findByIdAndUpdate(
      userId, // Change this to find by the MongoDB _id
      { emergencyEmails: emails.filter(e => e !== "") }, // Clean out empty strings
      { new: true }
    );
    
    if (!user) return res.status(404).json({ error: "User not found" });
    
    res.json({ success: true, emails: user.emergencyEmails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save contacts" });
  }
});

// 3. ROUTE: Send Panic Email Alert
// 3. ROUTE: Send Panic Email Alert
router.post("/panic", async (req, res) => {
  const { userId, lat, lon } = req.body;
  
  try {
    // Again, find by MongoDB ID if that's what the frontend is sending
    const user = await User.findById(userId);
    
    if (!user || !user.emergencyEmails || user.emergencyEmails.length === 0) {
      return res.status(404).json({ error: "No emergency contacts found." });
    }

    // Fixed the Map Link Template Literal (removed the '0' and fixed brackets)
    const mapLink = `https://www.google.com/maps?q=${lat},${lon}`;

    const mailOptions = {
      from: `"Emergency Alert System" <${process.env.EMAIL_USER}>`,
      to: user.emergencyEmails.join(", "), 
      subject: "🚨 URGENT: EMERGENCY ALERT 🚨",
      html: `
        <div style="font-family: sans-serif; border: 5px solid red; padding: 20px; text-align: center;">
          <h1 style="color: red;">HELP NEEDED!</h1>
          <p>An emergency alert has been triggered by <strong>${user.firstName || 'a user'}</strong>.</p>
          <p>Location coordinates: <strong>${lat}, ${lon}</strong></p>
          <br>
          <a href="${mapLink}" style="background-color: red; color: white; padding: 15px 25px; text-decoration: none; font-weight: bold; border-radius: 5px;">VIEW LOCATION ON MAP</a>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Emergency emails sent!" });
  } catch (err) {
    console.error("Panic Error:", err);
    res.status(500).json({ error: "Failed to send alerts." });
  }
});


module.exports = router;
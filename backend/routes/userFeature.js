const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const admin = require("../firebaseAdmin"); 
const User = require("../database/models/user");
const WalletTransaction = require("../database/models/WalletTransaction");
const Journey = require("../database/models/Journey");


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
  const { user_id, mode, source_station } = req.body;

  try {
    if (!user_id || !mode || !source_station) {
      return res.status(400).json({ error: "user_id, mode and source_station are required" });
    }

    const user = await User.findById(user_id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Card must be enabled
    if (!user.mobmagic_enabled) {
      return res.status(400).json({ error: "MobMagic card not enabled" });
    }

    // Prevent double journey
    if (user.active_journey_id) {
      return res.status(400).json({ error: "Active journey already in progress" });
    }

    // Create new Journey
    const journey = await Journey.create({
      user_id: user._id,
      mode,                 // BUS / METRO / TRAIN
      source_station,
      tap_in_time: new Date(),
      status: "ACTIVE"
    });

    // Lock user into this journey
    user.active_journey_id = journey._id;
    await user.save();

    res.json({
      message: "Tap-in successful",
      journey_id: journey._id,
      source_station,
      tap_in_time: journey.tap_in_time
    });

  } catch (err) {
    console.error("Tap-in error:", err);
    res.status(500).json({ error: err.message });
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




module.exports = router;
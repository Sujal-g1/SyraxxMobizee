const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const admin = require("../firebaseAdmin"); // Make sure this file exists with your JSON key
const User = require("../database/models/user");

// ================================
// SECURE Google Login Route
// ================================
router.post("/google-login", async (req, res) => {
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
// Existing Features (Functionality Unchanged)
// ================================
router.post("/enable-feature", async (req, res) => {
  const { email, _id } = req.body;
  try {
    const user = await User.findOne({ _id, email });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.wallet_id) return res.status(400).json({ error: "Create wallet first" });

    if (!user.userId) user.userId = crypto.randomUUID();
    if (!user.user_code) user.user_code = crypto.randomUUID();
    await user.save();
    res.json({ success: true, user_code: user.user_code });
  } catch (err) {
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
    const user = await User.findOne({ wallet_id });
    if (!user) return res.status(404).json({ error: "Wallet not found" });
    user.wallet_balance = (user.wallet_balance || 0) + Number(amount);
    await user.save();
    res.json({ message: "Success", wallet_balance: user.wallet_balance, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
const router = require("express").Router();
const Admin = require("../../database/models/Admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email, isActive: true });
  if (!admin) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, admin.password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: admin._id, role: admin.role, isAdmin: true },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({ token });
});

module.exports = router;

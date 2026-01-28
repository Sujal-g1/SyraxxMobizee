const jwt = require("jsonwebtoken");

module.exports = function adminAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Admin unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) throw new Error();
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid admin token" });
  }
};

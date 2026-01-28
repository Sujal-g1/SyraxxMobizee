const router = require("express").Router();
const adminAuth = require("../../middleware/adminAuth.middleware");
const Route = require("../../database/models/Route");

router.get("/overview", adminAuth, async (req, res) => {
  const routes = await Route.countDocuments();
  const activeRoutes = await Route.countDocuments({ status: { $ne: "suspended" } });

  res.json({
    totalRoutes: routes,
    activeRoutes
  });
});

module.exports = router;

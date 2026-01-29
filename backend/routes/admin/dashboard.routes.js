const router = require("express").Router();
const adminAuth = require("../../middleware/adminAuth.middleware");
const Route = require("../../database/models/Route");
const WalletTransaction = require("../../database/models/WalletTransaction");
const Journey = require("../../database/models/Journey");

router.get("/overview", async (req, res) => {
  try {
    /* ---------------- ROUTES ---------------- */
    const totalRoutes = await Route.countDocuments();
    const activeRoutes = totalRoutes; // until status is added

    /* ---------------- BUSES ---------------- */
    const routes = await Route.find({}, { buses: 1 });
    const totalBuses = routes.reduce(
      (sum, r) => sum + (r.buses?.length || 0),
      0
    );

    /* ---------------- REVENUE (TODAY) ---------------- */
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const revenueAgg = await WalletTransaction.aggregate([
      { $match: { createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const revenueToday = revenueAgg[0]?.total || 0;

    res.json({
      totalRoutes,
      activeRoutes,
      totalBuses,
      revenueToday
    });
  } catch (err) {
    console.error("Dashboard overview error:", err);
    res.status(500).json({ error: "Dashboard data failed" });
  }
});

// -------------------------------------

router.get("/usage", async (req, res) => {
  try {
    const data = await Journey.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$tap_in_time" },
            month: { $month: "$tap_in_time" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 7 }
    ]);

    const formatted = data.map(d => ({
      name: `${d._id.month}/${d._id.year}`,
      value: d.count
    }));

    res.json(formatted);
  } catch (err) {
    console.error("USAGE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});




module.exports = router;

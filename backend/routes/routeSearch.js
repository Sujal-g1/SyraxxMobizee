// const express = require("express");
// const router = express.Router();
// const Route = require("../database/models/Route");

// router.get("/test", (req, res) => {
//   res.json({ ok: true, message: "RouteSearch mounted correctly" });
// });


// // POST /api/routes/search

// router.post("/search", async (req, res) => {
//   console.log("HIT /api/routes/search");
//   console.log("Body:", req.body);

//   const { from, to } = req.body;

//   if (!from || !to) {
//     return res.status(400).json({ error: "from and to are required" });
//   }

//   try {
//     console.log("Querying DB...");

//     const routes = await Route.find({
//       "stops.name": { $all: [from, to] }
//     });

//     console.log("Routes found:", routes.length);

//     res.json({ routes });

//   } catch (err) {
//     console.error("Route search error:", err);
//     res.status(500).json({ error: "Server error", details: err.message });
//   }
// });


// module.exports = router;



const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ ok: true, message: "RouteSearch mounted correctly" });
});

module.exports = router;

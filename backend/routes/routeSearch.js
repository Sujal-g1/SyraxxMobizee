const express = require("express");
const router = express.Router();
const Route = require("../database/models/Route");


console.log("🔥 routeSearch router file loaded");

// TEST ROUTE
router.get("/test", (req, res) => {
  console.log("🟢 /api/routes/test HIT");
  res.json({ ok: true, message: "routeSearch working" });
});


router.post("/search", async (req, res) => {
  console.log("HIT /api/routes/search");
  console.log("Body:", req.body);

  let { from, to } = req.body;

  if (!from || !to) {
    return res.status(400).json({ error: "from and to are required" });
  }

  try {
    console.log("Resolving stops...");

    // 1. Find possible stops for FROM
    const fromMatch = await Route.findOne({
      "stops.name": { $regex: from, $options: "i" }
    });

    // 2. Find possible stops for TO
    const toMatch = await Route.findOne({
      "stops.name": { $regex: to, $options: "i" }
    });

    if (!fromMatch || !toMatch) {
      return res.json({
        routesFound: 0,
        message: "No matching stops found for given input"
      });
    }

    // 3. Resolve actual stop names + full stop objects
    const resolvedFromStop = fromMatch.stops.find(s =>
      s.name.toLowerCase().includes(from.toLowerCase())
    );

    const resolvedToStop = toMatch.stops.find(s =>
      s.name.toLowerCase().includes(to.toLowerCase())
    );

    if (!resolvedFromStop || !resolvedToStop) {
      return res.json({
        routesFound: 0,
        message: "Could not resolve stops properly"
      });
    }

    const resolvedFrom = resolvedFromStop.name;
    const resolvedTo = resolvedToStop.name;

    console.log("Resolved FROM:", resolvedFrom);
    console.log("Resolved TO:", resolvedTo);

    // 4. Exact route search using resolved names
    const routes = await Route.find({
      "stops.name": { $all: [resolvedFrom, resolvedTo] }
    });

    console.log("Routes found:", routes.length);

    if (!routes || routes.length === 0) {
      return res.json({
        routesFound: 0,
        resolvedFrom: resolvedFromStop,
        resolvedTo: resolvedToStop,
        stops: [],
        buses: []
      });
    }

    // 🔥 IMPORTANT: pick the first matched route for map drawing
    const mainRoute = routes[0];

    // 5. Collect all buses
    const results = [];

    for (const route of routes) {
      for (const bus of route.buses) {
        results.push({
          routeId: route.routeId,
          from: resolvedFrom,
          to: resolvedTo,
          busNumber: bus.busNumber,
          departureTime: bus.departureTime,
          arrivalTime: bus.arrivalTime,
          fare: bus.fare,
          comfort: bus.comfort
        });
      }
    }

    // 6. FINAL RESPONSE (map + buses both supported)
    res.json({
      routesFound: routes.length,
      resolvedFrom: {
        name: resolvedFromStop.name,
        lat: resolvedFromStop.lat,
        lng: resolvedFromStop.lng
      },
      resolvedTo: {
        name: resolvedToStop.name,
        lat: resolvedToStop.lat,
        lng: resolvedToStop.lng
      },
      stops: mainRoute.stops,   // 🔥 THIS FIXES YOUR MAP
      buses: results
    });

  } catch (err) {
    console.error("Route search error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});


module.exports = router;


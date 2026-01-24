const express = require("express");
const router = express.Router();
const Route = require("../database/models/Route");

// Utility: convert "HH:MM" to minutes
function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// Utility: get current time in minutes
function getCurrentMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

// Utility: filter & sort upcoming buses
function getUpcomingSortedBuses(buses) {
  const nowMin = getCurrentMinutes();

  return buses
    .map((b) => {
      const depMin = timeToMinutes(b.departureTime);
      return { ...b.toObject(), depMin };
    })
    .filter((b) => b.depMin >= nowMin)
    .sort((a, b) => a.depMin - b.depMin)
    .map(({ depMin, ...rest }) => rest); // remove helper field
}

// MAIN BUS SEARCH ROUTE

router.post("/buses", async (req, res) => {
  const { from, to } = req.body;

  if (!from || !to) {
    return res.status(400).json({ error: "from and to are required" });
  }

  try {
    // -----------------------------
    // 1. Resolve fuzzy stops
    // -----------------------------
    const fromMatch = await Route.findOne({
      "stops.name": { $regex: from, $options: "i" }
    });

    const toMatch = await Route.findOne({
      "stops.name": { $regex: to, $options: "i" }
    });

    if (!fromMatch || !toMatch) {
      return res.json({ type: "none", message: "No matching stops found" });
    }

    const resolvedFromStop = fromMatch.stops.find(s =>
      s.name.toLowerCase().includes(from.toLowerCase())
    );

    const resolvedToStop = toMatch.stops.find(s =>
      s.name.toLowerCase().includes(to.toLowerCase())
    );

    if (!resolvedFromStop || !resolvedToStop) {
      return res.json({ type: "none", message: "Could not resolve stops" });
    }

    const resolvedFrom = resolvedFromStop.name;
    const resolvedTo = resolvedToStop.name;

    // -----------------------------
    // 2. Try DIRECT route
    // -----------------------------
    const directRoutes = await Route.find({
      "stops.name": { $all: [resolvedFrom, resolvedTo] }
    });

    if (directRoutes.length > 0) {
      const route = directRoutes[0];

      return res.json({
        type: "direct",
        from: resolvedFrom,
        to: resolvedTo,
        buses: route.buses
      });
    }

    // -----------------------------
    // 3. Try ONE-INTERCHANGE
    // -----------------------------
    const fromRoutes = await Route.find({ "stops.name": resolvedFrom });
    const toRoutes = await Route.find({ "stops.name": resolvedTo });

    for (const r1 of fromRoutes) {
      for (const r2 of toRoutes) {
        for (const stop1 of r1.stops) {
          for (const stop2 of r2.stops) {
            if (stop1.name === stop2.name) {
              const interchange = stop1.name;

              // Buses for first leg
              const firstLegBuses = r1.buses;

              // Buses for second leg
              const secondLegBuses = r2.buses;

              return res.json({
                type: "interchange",
                from: resolvedFrom,
                to: resolvedTo,
                interchange,
                buses: {
                  firstLeg: firstLegBuses,
                  secondLeg: secondLegBuses
                }
              });
            }
          }
        }
      }
    }

    // -----------------------------
    // 4. No route found
    // -----------------------------
    return res.json({
      type: "none",
      message: "No direct or one-interchange route found"
    });

  } catch (err) {
    console.error("Bus search error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

     

module.exports = router;

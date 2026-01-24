const express = require("express");
const router = express.Router();
const Route = require("../database/models/Route");

console.log("🔥 routeSearch router file loaded");

// TEST ROUTE
router.get("/test", (req, res) => {
  res.json({ ok: true, message: "routeSearch working" });
});

// MAIN SEARCH ROUTE

router.post("/search", async (req, res) => {
  const { from, to } = req.body;

  if (!from || !to) {
    return res.status(400).json({ error: "from and to are required" });
  }

  try {
    // 1. Resolve fuzzy FROM and TO
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

    // 2. Find all routes containing FROM and TO
    const fromRoutes = await Route.find({ "stops.name": resolvedFrom });
    const toRoutes   = await Route.find({ "stops.name": resolvedTo });

    // 3. Try DIRECT routes first
    for (const route of fromRoutes) {
      const hasTo = route.stops.some(s => s.name === resolvedTo);

      if (hasTo) {
        // Build direct path
        const fromIndex = route.stops.findIndex(s => s.name === resolvedFrom);
        const toIndex   = route.stops.findIndex(s => s.name === resolvedTo);

        const path =
          fromIndex <= toIndex
            ? route.stops.slice(fromIndex, toIndex + 1)
            : route.stops.slice(toIndex, fromIndex + 1).reverse();

        return res.json({
          type: "direct",
          resolvedFrom: resolvedFromStop,
          resolvedTo: resolvedToStop,
          path,
          buses: route.buses
        });
      }
    }

    // 4. Try ONE-INTERCHANGE routes
    for (const r1 of fromRoutes) {
      for (const r2 of toRoutes) {

        for (const s1 of r1.stops) {
          for (const s2 of r2.stops) {

            // 🔥 NORMALIZED COMPARISON (THIS FIXES YOUR BUG)
            if (s1.name.trim().toLowerCase() === s2.name.trim().toLowerCase()) {

              const interchangeName = s1.name;

              // Build path from FROM → interchange in r1
              const fromIndex = r1.stops.findIndex(s => s.name === resolvedFrom);
              const interIndex1 = r1.stops.findIndex(s => s.name === interchangeName);

              const part1 =
                fromIndex <= interIndex1
                  ? r1.stops.slice(fromIndex, interIndex1 + 1)
                  : r1.stops.slice(interIndex1, fromIndex + 1).reverse();

              // Build path from interchange → TO in r2
              const interIndex2 = r2.stops.findIndex(s => s.name === interchangeName);
              const toIndex = r2.stops.findIndex(s => s.name === resolvedTo);

              const part2 =
                interIndex2 <= toIndex
                  ? r2.stops.slice(interIndex2 + 1, toIndex + 1)
                  : r2.stops.slice(toIndex, interIndex2).reverse();

              const mergedPath = [...part1, ...part2];

              return res.json({
                type: "interchange",
                resolvedFrom: resolvedFromStop,
                resolvedTo: resolvedToStop,
                interchange: interchangeName,
                path: mergedPath
              });
            }
          }
        }
      }
    }

    // 5. If nothing found
    return res.json({
      type: "none",
      message: "No direct or one-interchange route found"
    });

  } catch (err) {
    console.error("Route search error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

router.post("/buses", async (req, res) => {
  console.log("HIT /api/routes/buses");
  console.log("Body:", req.body);

  let { from, to } = req.body;

  if (!from || !to) {
    return res.status(400).json({ error: "from and to are required" });
  }

  try {
    // 1. Resolve FROM and TO (same as /search)

    const fromMatch = await Route.findOne({
      "stops.name": { $regex: from, $options: "i" }
    });

    const toMatch = await Route.findOne({
      "stops.name": { $regex: to, $options: "i" }
    });

    if (!fromMatch || !toMatch) {
      return res.json({
        type: "none",
        message: "No matching stops found"
      });
    }

    const resolvedFromStop = fromMatch.stops.find(s =>
      s.name.toLowerCase().includes(from.toLowerCase())
    );

    const resolvedToStop = toMatch.stops.find(s =>
      s.name.toLowerCase().includes(to.toLowerCase())
    );

    if (!resolvedFromStop || !resolvedToStop) {
      return res.json({
        type: "none",
        message: "Could not resolve stops properly"
      });
    }

    const resolvedFrom = resolvedFromStop.name;
    const resolvedTo = resolvedToStop.name;

    // 2. Find all routes that contain FROM and TO

    const fromRoutes = await Route.find({
      "stops.name": resolvedFrom
    });

    const toRoutes = await Route.find({
      "stops.name": resolvedTo
    });

    // 3. Try DIRECT route

    for (const route of fromRoutes) {
      const hasTo = route.stops.some(s => s.name === resolvedTo);

      if (hasTo) {
        // DIRECT route found

        return res.json({
          type: "direct",
          from: resolvedFrom,
          to: resolvedTo,
          buses: route.buses   // 🔥 THIS WAS MISSING IN YOUR CODE
        });
      }
    }

    // 4. Try ONE-INTERCHANGE route

    for (const routeA of fromRoutes) {
      for (const stop of routeA.stops) {
        const interchangeName = stop.name;

        for (const routeB of toRoutes) {
          const hasInterchange = routeB.stops.some(
            s => s.name === interchangeName
          );

          if (hasInterchange) {
            // Found interchange

            return res.json({
              type: "interchange",
              from: resolvedFrom,
              to: resolvedTo,
              interchange: interchangeName,
              buses: {
                firstLeg: routeA.buses,   // from -> interchange
                secondLeg: routeB.buses   // interchange -> to
              }
            });
          }
        }
      }
    }

    // 5. No route found

    return res.json({
      type: "none",
      message: "No direct or one-interchange route found"
    });

  } catch (err) {
    console.error("Bus search error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});



// GET ALL ROUTES FOR NETWORK VIEW
router.get("/all", async (req, res) => {
  try {
    const routes = await Route.find({}, { stops: 1, _id: 0 });
    res.json({ routes });
  } catch (err) {
    console.error("Fetch all routes error:", err);
    res.status(500).json({ error: "Failed to fetch routes" });
  }
});



module.exports = router;

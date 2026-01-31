const express = require("express");
const router = express.Router();

let alcoholData = {};

router.post("/test", (req, res) => {
  const { driverId, alcoholValue } = req.body;

  const status = alcoholValue > 0.08 ? "DRUNK" : "SAFE";

  alcoholData[driverId] = {
    alcoholValue,
    status,
    time: new Date()
  };

  res.json({ status });
});

router.get("/status", (req, res) => {
  res.json(alcoholData);
});

module.exports = router;

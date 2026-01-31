const AlcoholTest = require("../models/AlcoholTest");

const THRESHOLD = 0.08;

exports.submitTest = async (req, res) => {
  try {
    const { driverId, alcoholValue } = req.body;

    const value = parseFloat(alcoholValue);
    const status = value > THRESHOLD ? "DRUNK" : "SAFE";
    const ignition = status === "DRUNK" ? "LOCKED" : "UNLOCKED";

    const record = await AlcoholTest.create({
      driverId,
      alcoholValue: value,
      status,
      ignition
    });

    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLatestStatus = async (req, res) => {
  const data = await AlcoholTest.find().sort({ time: -1 }).limit(50);
  res.json(data);
};

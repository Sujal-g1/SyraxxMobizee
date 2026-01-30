const VehicleTemplate = require("../database/models/VehicleTemplate");
const Reservation = require("../database/models/Reservation");
const { allocateSeats } = require("../services/allocationService");

const TripPool = require("../database/models/TripPool");

exports.search = async (req, res) => {
  try {
    console.log("SEARCH HIT:", req.body);

    const { seats, ac, luxuryTier, bookingType } = req.body;

    let templates = await VehicleTemplate.find({
      capacity: { $gte: seats },
      ac,
      luxuryTier,
    });

    console.log("TEMPLATES FOUND:", templates.length);

    if (templates.length === 0) {
      templates = await VehicleTemplate.find({
        capacity: { $gte: seats },
        ac,
      });

      console.log("FALLBACK FOUND:", templates.length);
    }

    const results = templates.map(t => {
      const totalPrice =
        bookingType === "private"
          ? t.basePrice * t.capacity
          : t.basePrice * seats;

      return {
        templateId: t._id,
        name:
          bookingType === "private"
            ? `${t.name} (Private)`
            : `${t.name} (Shared)`,
        capacity: t.capacity,
        totalPrice,
        bookingType
      };
    });

    console.log("RETURNING RESULTS:", results);

    res.json(results);

  } catch (err) {
    console.error("SEARCH ERROR:", err);
    res.status(500).json({ error: "Search failed" });
  }
};



exports.reserve = async (req, res) => {
  const { userId, templateId, date, seats, bookingType } = req.body;

  const template = await VehicleTemplate.findById(templateId);
  if (!template) return res.status(404).json({ error: "Template not found" });

  const pool = await allocateSeats(template, date, seats, bookingType);

  const totalPrice =
    bookingType === "private"
      ? template.basePrice * template.capacity
      : template.basePrice * seats;

  const reservation = await Reservation.create({
    userId,
    poolId: pool._id,
    seats,
    bookingType,
    totalPrice,
  });

  res.json({
    message: "Reservation confirmed",
    reservation,
  });
};


exports.getUserReservations = async (req, res) => {
  const { userId } = req.params;

  const reservations = await Reservation.find({ userId })
    .populate({
      path: "poolId",
      populate: { path: "templateId" }
    });

  res.json(reservations);
};

exports.getPoolsByDate = async (req, res) => {
  const { date } = req.query;

  const pools = await TripPool.find({ date })
    .populate("templateId");

  res.json(pools);
};


exports.adminSummary = async (req, res) => {
  const pools = await TripPool.find().populate("templateId");
  const reservations = await Reservation.find();

  const totalSeats = pools.reduce((sum, p) => sum + p.totalCapacity, 0);
  const bookedSeats = pools.reduce((sum, p) => sum + p.bookedSeats, 0);
  const revenue = reservations.reduce((sum, r) => sum + r.totalPrice, 0);

  res.json({
    totalPools: pools.length,
    totalSeats,
    bookedSeats,
    occupancyRate: totalSeats ? (bookedSeats / totalSeats) * 100 : 0,
    totalRevenue: revenue,
  });
};

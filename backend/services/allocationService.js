const TripPool = require("../database/models/TripPool");

async function allocateSeats(template, date, seats, bookingType) {
  if (bookingType === "private") {
    const pool = await TripPool.create({
      date,
      templateId: template._id,
      totalCapacity: template.capacity,
      bookedSeats: template.capacity,
      status: "full",
    });

    return pool;
  }

  // shared booking
  let pool = await TripPool.findOne({
    date,
    templateId: template._id,
    status: "open",
  });

  if (pool && pool.bookedSeats + seats <= pool.totalCapacity) {
    pool.bookedSeats += seats;
    if (pool.bookedSeats === pool.totalCapacity) pool.status = "full";
    await pool.save();
    return pool;
  }

  // create new pool
  pool = await TripPool.create({
    date,
    templateId: template._id,
    totalCapacity: template.capacity,
    bookedSeats: seats,
    status: seats === template.capacity ? "full" : "open",
  });

  return pool;
}

module.exports = { allocateSeats };

const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/reservationController");

router.post("/search", ctrl.search);
router.post("/reserve", ctrl.reserve);

router.get("/user/:userId", ctrl.getUserReservations);
router.get("/pools", ctrl.getPoolsByDate);
router.get("/admin/summary", ctrl.adminSummary);

module.exports = router;

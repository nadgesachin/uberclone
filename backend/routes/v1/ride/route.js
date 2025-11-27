const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authentication");
const { createRideRequest,acceptRide,rejectRide,completeRide } = require("./post");

// POST /api/v1/ride/request
router.post("/request",authMiddleware, createRideRequest);
router.post("/accept",authMiddleware, acceptRide);
router.post("/complete",authMiddleware, completeRide);
router.post("/reject",authMiddleware, rejectRide);

module.exports = router;
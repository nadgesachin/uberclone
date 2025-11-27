const express = require("express");
const router = express.Router();
const driverController = require("./get");

// Driver location and status
router.get("/nearby-drivers", driverController.getNearbyDriversByCustomer);

module.exports = router;
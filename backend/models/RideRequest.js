const mongoose = require("mongoose");

const RideRequestSchema = new mongoose.Schema({
    pickupLocation: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },

    destination: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },

    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("RideRequest", RideRequestSchema);

const mongoose = require("mongoose");

const FareSchema = new mongoose.Schema({
    pickupLocation: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },

    destination: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },

    distance: {
        type: Number, // KM
        required: true
    },

    duration: {
        type: Number, // minutes
        required: true
    },

    fares: {
        bike: { type: Number, required: true },
        auto: { type: Number, required: true },
        car:  { type: Number, required: true }
    },

    // Vehicle user selects later
    selectedVehicleType: {
        type: String,
        enum: ["bike", "auto", "car", null],
        default: null
    },

    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        default: null
    },
    
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Driver",
        default: null
    },

    expiryAt: {
        type: Date,
        default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 mins validity
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("Fare", FareSchema);

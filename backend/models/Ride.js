const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    rideId: {
        type: String,
        unique: true,
        required: true,
    },
    customerId: {
        type: String,
        required: true,
    },
    driverId: {
        type: String,
        default: null,
    },
    pickupLocation: {
        lat: Number,
        lng: Number,
        address: String,
    },
    dropoffLocation: {
        lat: Number,
        lng: Number,
        address: String,
    },
    rideType: {
        type: String,
        enum: ['economy', 'comfort', 'xl', 'premium'],
        default: 'economy',
    },
    status: {
        type: String,
        enum: ['requested', 'accepted', 'ontheway', 'arrived', 'ongoing', 'completed', 'cancelled'],
        default: 'requested',
    },
    estimatedFare: Number,
    actualFare: Number,
    distance: Number,
    duration: Number,
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'wallet'],
        default: 'card',
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
    },
    rating: {
        driverRating: { type: Number, min: 1, max: 5 },
        customerRating: { type: Number, min: 1, max: 5 },
        driverReview: String,
        customerReview: String,
    },
    startTime: Date,
    endTime: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Ride', rideSchema);
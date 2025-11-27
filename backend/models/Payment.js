const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    paymentId: {
        type: String,
        unique: true,
        required: true,
    },
    rideId: {
        type: String,
        required: true,
    },
    customerId: {
        type: String,
        required: true,
    },
    driverId: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: 'INR',
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'wallet', 'upi'],
        required: true,
    },
    paymentGateway: {
        type: String,
        enum: ['stripe', 'razorpay', 'internal'],
    },
    transactionId: String,
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
    },
    breakdown: {
        baseFare: Number,
        distanceFare: Number,
        timeFare: Number,
        surgeMultiplier: {
            type: Number,
            default: 1,
        },
        discount: {
            type: Number,
            default: 0,
        },
        tax: Number,
    },
    driverEarnings: {
        type: Number,
        default: 0,
    },
    platformCommission: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    completedAt: Date,
});

module.exports = mongoose.model('Payment', paymentSchema);
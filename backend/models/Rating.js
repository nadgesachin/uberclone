const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    ratingId: {
        type: String,
        unique: true,
        required: true,
    },
    rideId: {
        type: String,
        required: true,
    },
    ratedBy: {
        type: String,
        enum: ['customer', 'driver'],
        required: true,
    },
    ratedUser: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    review: String,
    categories: {
        cleanliness: Number,
        communication: Number,
        driving: Number,
        behaviour: Number,
    },
    isAnonymous: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Rating', ratingSchema);
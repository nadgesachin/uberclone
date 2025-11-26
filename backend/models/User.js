const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userType: {
        type: String,
        enum: ['customer', 'driver'],
        required: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    phone: {
        type: String,
        unique: true,
        required: true,
    },

    // ⭐ ADD THIS ⭐
    password: {
        type: String,
        required: true,
    },

    profilePhoto: String,
    isVerified: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },

    // Driver specific
    vehicleInfo: {
        registrationNumber: String,
        model: String,
        color: String,
        vehicleType: String,
    },
    documents: {
        licenseNumber: String,
        licenseExpiry: Date,
        insuranceExpiry: Date,
        backgroundCheckDone: Boolean,
    },
    driverRating: {
        type: Number,
        default: 4.5,
        min: 1,
        max: 5,
    },
    totalRides: {
        type: Number,
        default: 0,
    },
    totalEarnings: {
        type: Number,
        default: 0,
    },

    bankAccount: {
        accountHolder: String,
        accountNumber: String,
        ifscCode: String,
    },

    // Customer specific
    customerRating: {
        type: Number,
        default: 4.5,
        min: 1,
        max: 5,
    },
    savedAddresses: [
        {
            label: String,
            lat: Number,
            lng: Number,
            address: String,
        },
    ],
    wallet: {
        balance: {
            type: Number,
            default: 0,
        },
        lastUpdated: Date,
    },

    emergencyContacts: [
        {
            name: String,
            phone: String,
        },
    ],

    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', userSchema);

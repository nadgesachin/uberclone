const mongoose = require("mongoose");
const { Schema } = mongoose;
require("routes/dbConnect");

const CustomerSchema = new Schema(
    {
        name: { type: String, required: [true, "Name is required"] },
        email: { type: String, required: [true, "Email is required"], index: { unique: true } },
        mobile: { type: String, required: [true, "Mobile is required"] },
        password: { type: String, required: [true, "Password is required"] },

        // Geography (pickup preference / home location)
        homeLocation: {
            lat: Number,
            lng: Number,
            address: String,
        },

        // Access control (minimal for customers)
        roles: [{ type: Schema.Types.ObjectId, ref: "Role" }],
        organisationIds: [{ type: Schema.Types.ObjectId, ref: "Organisation" }],

        // Ride stats
        totalRides: { type: Number, default: 0 },
        cancelledRides: { type: Number, default: 0 },

        // Wallet
        walletBalance: { type: Number, default: 0 },
        defaultPaymentMethod: { type: String, enum: ["cash", "card", "wallet"], default: "cash" },

        // Status
        isVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        inActiveDate: { type: Date, default: null },

        // Security
        isPasswordChangedOnce: { type: Boolean, default: false },
        passwordHistory: [
            {
                password: String,
                changedDate: { type: Date, default: Date.now },
            },
        ],

        createdAt: { type: Date, immutable: true, default: Date.now },
        modifiedAt: { type: Date, default: Date.now },
    },
    { timestamps: { createdAt: "createdAt", updatedAt: "modifiedAt" } }
);

CustomerSchema.path("password").validate((v) => {
    const regex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-~])[A-Za-z\d!@#$%^&*()_+=\-~]{8,125}$/;
    return v.match(regex);
}, "Please enter valid password!");

CustomerSchema.plugin(dbUpdateValidator);
CustomerSchema.plugin(dbErrorHandler);

module.exports = mongoose.model("Customer", CustomerSchema);

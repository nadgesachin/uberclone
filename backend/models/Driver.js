const mongoose = require("mongoose");
const { Schema } = mongoose;
require("routes/dbConnect");

const DriverSchema = new Schema(
    {
        name: { type: String, required: [true, "Name is required"] },
        email: { type: String, required: [true, "Email is required"], index: { unique: true } },
        mobile: { type: String, required: [true, "Mobile is required"] },
        password: { type: String, required: [true, "Password is required"] },

        // Driver Status
        status: { 
            type: String, 
            enum: ["pending", "approved", "rejected", "blocked"], 
            default: "pending" 
        },

        // KYC Documents
        documents: {
            drivingLicense: { type: String, default: "" },
            vehicleRC: { type: String, default: "" },
            insurance: { type: String, default: "" },
            aadhaar: { type: String, default: "" },
            photo: { type: String, default: "" },
            verified: { type: Boolean, default: false },
        },

        // Vehicle Details
        vehicle: {
            type: { type: String, enum: ["car", "bike", "auto"], required: true },
            model: { type: String, default: "" },
            numberPlate: { type: String, default: "" },
            color: { type: String, default: "" },
            capacity: { type: Number, default: 4 }
        },

        // Live Driver Location
        isOnline: { type: Boolean, default: false },
        currentLocation: {
            lat: Number,
            lng: Number,
            updatedAt: Date,
        },

        // Access Control
        roles: [{ type: Schema.Types.ObjectId, ref: "Role" }],
        organisationIds: [{ type: Schema.Types.ObjectId, ref: "Organisation" }],

        // Geography - (optional: if you want driver to work in limited regions)
        states: [{ type: Schema.Types.ObjectId, ref: "State" }],
        districts: [{ type: Schema.Types.ObjectId, ref: "District" }],
        blocks: [{ type: Schema.Types.ObjectId, ref: "Block" }],
        gramPanchayats: [{ type: Schema.Types.ObjectId, ref: "GramPanchayat" }],
        villages: [{ type: Schema.Types.ObjectId, ref: "Village" }],
        hamlets: [{ type: Schema.Types.ObjectId, ref: "Hamlet" }],

        // Ride Stats
        totalRides: { type: Number, default: 0 },
        cancelledRides: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 },
        totalRatings: { type: Number, default: 0 },

        // Security
        isPasswordChangedOnce: { type: Boolean, default: false },
        passwordHistory: [
            {
                password: String,
                changedDate: { type: Date, default: Date.now },
            },
        ],

        isVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        inActiveDate: { type: Date, default: null },

        createdAt: { type: Date, immutable: true, default: Date.now },
        modifiedAt: { type: Date, default: Date.now },
    },
    { timestamps: { createdAt: "createdAt", updatedAt: "modifiedAt" } }
);

DriverSchema.path("password").validate((v) => {
    const regex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-~])[A-Za-z\d!@#$%^&*()_+=\-~]{8,125}$/;
    return v.match(regex);
}, "Please enter valid password!");

DriverSchema.plugin(dbUpdateValidator);
DriverSchema.plugin(dbErrorHandler);

module.exports = mongoose.model("Driver", DriverSchema);

// IMPORTANT: Remove rootpath unless absolutely required
// require("rootpath")();

const express = require("express");
const multer = require("multer");

// Only keep what is necessary
// Remove session, pdf, bodyParser, logCreate, morganBody unless used

/*
 * MULTER CONFIG (Only if file upload is required)
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/logs");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// Router Setup
const apiRoutes = express.Router();

const authRoutes = require("../authentication/auth-routes");
apiRoutes.post("/login", authRoutes.login); 

const userRoutes = require("./user/route");
apiRoutes.use("/user", userRoutes);

const driverRoutes = require("./driver/route");
apiRoutes.use("/driver", driverRoutes);

const rideRoutes = require("./ride/route");
apiRoutes.use("/ride", rideRoutes);

module.exports = apiRoutes;

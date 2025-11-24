require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const logger = require("morgan");

const app = express();
app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(logger("dev"));
app.use(bodyParser.json({ limit: "30mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));
require("./errorHandler").process();
require("./routes/dbConnect");
require("./routes/services/redis")
require("./routes/services/kafka");

app.get("/health", (req, res) => {
  res.json({ status: "OK", uptime: process.uptime() });
});

const apiRoutes = require("./routes/v1/route");
app.use("/api/v1", apiRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

module.exports = app;

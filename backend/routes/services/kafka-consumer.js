const kafka = require("./kafka");
const Redis = require("./redis");
const Ride = require("../../models/Ride"); // Assume
const socketIo = global.socketIo;
const config = require("../config/kafka-config.json");

module.exports = async () => {
  await kafka.consumer({
    groupId: config["driver-location"].groupId,
    topic: config["driver-location"].topic,
    callBackFunction: async ({ value }) => {
      const { driverKey, lat, lng } = value;
      const driverId = driverKey.split("-")[1];

      // Find active ride for this driver
      const ride = await Ride.findOne({ driverId, status: "accepted" || "in_progress" });
      if (!ride) return;

      const riderKey = `rider-${ride.riderId}`;
      const riderSocketId = await Redis.get(riderKey);
      if (riderSocketId) {
        socketIo.to(riderSocketId).emit("driverLocationUpdate", { lat, lng });
      }
    },
  });
};
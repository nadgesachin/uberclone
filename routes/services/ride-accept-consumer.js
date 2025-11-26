// consumers/rideAcceptConsumer.js

const { consumer } = require("../services/kafka");
const config = require("../config/kafka-config.json");
const Redis = require("../services/redis");

const handleRideAccepted = async ({ value }) => {
  try {
    const data = typeof value === "string" ? JSON.parse(value) : value;

    const {
      rideRequestId,
      driverId,
      customerId,
      pickup,
      driverLocation,
    } = data;

    console.log("----------------",data);
    if (!customerId || !rideRequestId) {
      console.warn("Invalid ride-accepted payload:", data);
      return;
    }

    console.log(`Ride ACCEPTED → Ride:${rideRequestId} | Driver:${driverId} → Customer:${customerId}`);

    const socketIo = global.socketIo;
    if (!socketIo) {
      console.error("socketIo not ready! Customer will not get real-time update");
      return;
    }

    // Customer का active socket ढूंढो
    const rawResult = await Redis.get(`socket-rider-${customerId}`);
    const customerSocketId = typeof rawResult === "object" ? rawResult?.data : rawResult;

    if (customerSocketId) {
      socketIo.to(customerSocketId).emit("rideAccepted", {
        rideRequestId,
        driverId,
        message: "Driver is on the way!",
        pickup,
        driverLocation: driverLocation || null,
        acceptedAt: new Date().toISOString(),
      });
      console.log(`Customer NOTIFIED → socket:${customerSocketId} | Ride:${rideRequestId}`);
    } else {
      console.warn(`Customer ${customerId} is offline — no real-time update sent`);
    }

    // Driver का active socket ढूंढो
    const driverRawResult = await Redis.get(`socket-driver-${driverId}`);
    const driverSocketId = typeof driverRawResult === "object" ? driverRawResult?.data : driverRawResult;

    if (driverSocketId) {
      socketIo.to(driverSocketId).emit("rideAcceptedByDriver", {
        rideRequestId,
        driverId,
        message: "On the way!",
        pickup,
        driverLocation: driverLocation || null,
        acceptedAt: new Date().toISOString(),
      });
      console.log(`Customer NOTIFIED → socket:${customerSocketId} | Ride:${rideRequestId}`);
    } else {
      console.warn(`Customer ${customerId} is offline — no real-time update sent`);
    }

  } catch (err) {
    console.error("rideAcceptConsumer error:", err);
  }
};

// Consumer को start करो
module.exports = () => {
  consumer({
    groupId: "ride-api-ride-accepted",
    topic: config["ride-assigned"].topic, // ← यह config में होना चाहिए!
    callBackFunction: handleRideAccepted,
  });

  console.log("Ride Accept Consumer STARTED → Listening on topic:", config["ride-assigned"].topic);
};
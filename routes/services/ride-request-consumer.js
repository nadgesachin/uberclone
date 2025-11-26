
const { consumer } = require("../services/kafka");
const socketIo = global.socketIo;
const Redis = require("../services/redis");
const config = require("../config/kafka-config.json");

const handleRideRequest = async ({ value }) => {
  try {

    const data = typeof value === "string" ? JSON.parse(value) : value;
    const { rideRequestId, pickup, dropoff, nearbyDrivers = [] } = data;

    const socketIo = global.socketIo;
    if (!socketIo) {
      console.error("socketIo is not ready yet! Request will be missed:", rideRequestId);
      return;
    }
    
    for (const driver of nearbyDrivers) {
      const driverId = driver.driverId || driver.driverKey?.replace("driver-", "");
      if (!driverId) continue;

      const rawResult = await Redis.get(`socket-driver-${driverId}`);

      // यहाँ बस यह magic line लगाओ — हर बार काम करेगी!
      const socketId = typeof rawResult === "object" ? rawResult?.data : rawResult;

      console.log(`Notifying driver ${driverId} → socket: ${socketId}`);

      if (socketId && socketIo) {
        socketIo.to(socketId).timeout(8000).emit("newRideRequest", {
          rideRequestId,
          customerLocation: pickup,
          distance: parseFloat(driver.distanceInKm || 0).toFixed(2),
        }, (err, responses) => {
          if (err) {
            console.error(`Delivery FAILED → driver:${driverId}`, err.message,err);
          } else if (responses?.[0]?.received) {
            console.log(`DELIVERED & ACKED → driver:${driverId}`);
          } else {
            console.warn(`Sent but no ack → driver:${driverId}`);
          }
        });
      } else {
        console.log(`No active socket for driver:${driverId}`);
      }
    }

  } catch (err) {
    console.error("rideRequestConsumer error:", err);
  }
};

module.exports = () => {
  consumer({
    groupId: "ride-api-ride-request",
    topic: config["ride-request"].topic,
    callBackFunction: handleRideRequest,
  });
};
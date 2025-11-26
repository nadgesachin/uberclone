
const { consumer } = require("./kafka");
const socketIo = global.socketIo;
const Redis = require("./redis");
const config = require("../config/kafka-config.json");

const handleRideRequest = async ({ value }) => {
  try {

    const data = typeof value === "string" ? JSON.parse(value) : value;
    console.log("data",data);

    const socketIo = global.socketIo;
    if (!socketIo) {
      console.error("socketIo is not ready yet! Request will be missed:", rideRequestId);
      return;
    }
    
    

  } catch (err) {
    console.error("rideRequestConsumer error:", err);
  }
};

module.exports = () => {
  consumer({
    groupId: config["ride-ended"].groupId,
    topic: config["ride-ended"].topic,
    callBackFunction: handleRideRequest,
  });
};
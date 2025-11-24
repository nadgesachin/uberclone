const kafka = require("./kafka");
const Redis = require("./redis");

module.exports = async () => {
    await kafka.consumer({
        groupId: "driverLocationConsumer",
        topic: "driver-location",
        callBackFunction: async (message) => {

            const { driverId, customerId, lat, lng, updatedAt } = message.value;

            const customerSocketId = await Redis.get(customerId);

            if (!customerSocketId) {
                console.log("⚠️ Customer socket not found:", customerId);
                return;
            }

            global.socketIo.to(customerSocketId).emit("driver:newLocation", {
                driverId,
                lat,
                lng,
                updatedAt
            });

            console.log(`📡 Location sent → customer ${customerId}`);
        }
    });
};

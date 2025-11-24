const { Server, Socket } = require("socket.io");
const Redis = require("./redis");
const jwt = require("jsonwebtoken");
const kafka = require("./kafka");

const setupSocketConnection = async (server) => {
    return new Promise((resolve, reject) => {
        try {
            const socketIo = new Server(server, {
                cors: {
                    origin: "*",
                    methods: ["GET", "POST"],
                },
                transports: ["websocket", "polling"],
                path: "/driver/location-socket/socket.io"// optional
            });

            socketIo.on("connection", async (socket) => {
                // Get the auth token provided on handshake.
                const token = socket.handshake.auth.token;
                console.log("Socket connection attempt with token:", token);
                try {
                    // Verify the token here and get user info from JWT token.
                    let decoded = await jwt.verify(token, "SUPERSECRET123");
                    if (!decoded.userId) {
                        throw new Error("Invalid token");
                    } else {
                        console.log("client connected: ", socket.id);
                        let userId = null;
                        if (decoded.userType == "driver") {
                            userId = `driver-${decoded.userId}`;
                        } else {
                            userId = `rider-${decoded.userId}`;
                        }
                        Redis.set(userId, socket.id);
                    }
                } catch (error) {
                    console.error("Token verification failed", error);
                    socket.disconnect(true);
                    return;
                }

                // Read message received from client.
                socket.on("message_from_client", (data) => {
                    console.log("message_from_client: ", data);
                });

                socket.on("driver:updateLocation", async (data) => {
                    console.log("LIVE LOCATION:", data);

                    try {
                        let driverKey = `driver-${data.driverId}`;

                        await Redis.Client.geoAdd("drivers:live", [{
                            longitude: data.lng,
                            latitude: data.lat,
                            member: driverKey,
                        }]);

                        await Redis.Client.hSet(driverKey, {
                            lat: data.lat,
                            lng: data.lng,
                            updatedAt: Date.now(),
                        });

                        await kafka.producer({
                            topic: "driver-location-updates",
                            key: driverKey,
                            value: JSON.stringify({
                                driverKey,
                                lat: data.lat,
                                lng: data.lng,
                                updatedAt: Date.now(),
                                source: "driver-app",
                            }),
                        });

                        console.log(`📍 Updated Redis & Kafka for driver ${driverKey}`);
                    } catch (err) {
                        console.error("❌ Error updating driver location:", err);
                    }
                });
                // A client is disconnected.
                socket.on("disconnect", () => {
                    console.log("A user disconnected");
                });

                // Resolve the promise once the connection is set up
                resolve(socketIo);
            });
        } catch (error) {
            console.error("Error creating socket: ", error);
            reject(error);
        }
    });
};

const setupSocket = async (server) => {
    try {
        const socketIo = await setupSocketConnection(server)
        global.socketIo = socketIo;
    } catch (error) {
        console.error("Error setting up socket: ", error);
    }

}

module.exports = { setupSocket };
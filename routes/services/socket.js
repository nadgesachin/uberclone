const { Server, Socket } = require("socket.io");
const Redis = require("./redis");
const jwt = require("jsonwebtoken");
const kafka = require("./kafka");
const Ride = require("../../models/Ride");

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
                const token = socket.handshake.auth.token;
                console.log("New socket connection attempt →", socket.id);

                let userId, userType, socketKey;

                try {
                    const decoded = jwt.verify(token, "SUPERSECRET123");
                    userId = decoded.userId;
                    userType = decoded.userType;

                    if (!userId || !userType) throw new Error("Invalid token payload");

                    // Correct Redis key format (जो आप Redis.get में use करते हो)
                    socketKey = userType === "driver"
                        ? `socket-driver-${userId}`
                        : `socket-rider-${userId}`;

                    console.log(`Authenticated: ${userType} ${userId} → socket: ${socket.id}`);

                    // MAIN FIX: हमेशा नया socket.id update करो (overwrite!)
                    await Redis.set(socketKey, socket.id);
                    console.log(`Redis UPDATED → ${socketKey} = ${socket.id}`);

                    // Optional: पुराना socket अगर exist करे तो force disconnect करो (safety)
                    const oldSocketId = await Redis.get(socketKey);
                    if (oldSocketId && oldSocketId !== socket.id) {
                        const oldSocket = socketIo.sockets.sockets.get(oldSocketId);
                        if (oldSocket) {
                            console.log(`Force disconnecting old socket: ${oldSocketId}`);
                            oldSocket.disconnect(true);
                        }
                    }

                } catch (error) {
                    console.error("Socket auth failed:", error.message);
                    socket.emit("auth_error", { message: "Invalid token" });
                    socket.disconnect(true);
                    return;
                }

                // === Disconnect पर Redis से हटाओ ===
                socket.on("disconnect", async (reason) => {
                    console.log(`Socket disconnected: ${socket.id} | Reason: ${reason}`);

                    // थोड़ा wait करो (reconnect grace period)
                    setTimeout(async () => {
                        const currentSocketId = await Redis.get(socketKey);
                        if (currentSocketId === socket.id) {
                            await Redis.del(socketKey);
                            console.log(`Cleaned up Redis → ${socketKey} removed`);
                        }
                    }, 5000); // 5 सेकंड में अगर reconnect न हो तो delete
                });

                // बाकी events (location, accept ride, etc.)
                socket.on("driver:updateLocation", async (data) => {
                    // ... आपका existing code
                });

                socket.on("driver:acceptRide", async ({ driverId, rideId, riderId }) => {
                    // ... आपका existing code
                });

                // resolve only once (पहले connection पर)
                if (!global.socketIo) {
                    global.socketIo = socketIo;
                    resolve(socketIo);
                }
            });
        } catch (error) {
            console.error("Error creating socket: ", error);
            reject(error);
        }
    });
};

// routes/services/socket.js → setupSocket function के अंदर

const setupSocket = async (server) => {
    try {
        const socketIo = await setupSocketConnection(server);
        global.socketIo = socketIo;
        console.log("global.socketIo SET SUCCESSFULLY! Consumers can now emit.");
    } catch (error) {
        console.error("Socket setup failed:", error);
    }
};

module.exports = { setupSocket };
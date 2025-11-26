// src/services/socketClient.js
import { io } from "socket.io-client";

let socket = null;

/**
 * Connect as a DRIVER
 */
export const connectDriverSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io("http://localhost:4000", {
    path: "/driver/location-socket/socket.io",
    transports: ["websocket", "polling"], // polling fallback if websocket blocked
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
  });

  setupCommonListeners("Driver");
  return socket;
};

/**
 * Connect as a RIDER / CUSTOMER
 */
export const connectRiderSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io("http://localhost:4000", {
    path: "/driver/location-socket/socket.io",
    transports: ["websocket", "polling"],
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
  });

  setupCommonListeners("Rider");
  return socket;
};

/**
 * Get the current socket instance (shared between driver & rider)
 */
export const getSocket = () => socket;

/**
 * Disconnect socket (useful on logout)
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Common listeners – you can extend them later
 */
function setupCommonListeners(role) {
  socket.on("connect", () => {
    console.log(`✅ ${role} socket connected:`, socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log(`Socket disconnected (${role}):`, reason);
  });

  socket.on("connect_error", (err) => {
    console.error(`Socket connect error (${role}):`, err.message);
  });

  // Example: listen to ride request (driver only)
  if (role === "Driver") {
    socket.on("rideRequest", (data) => {
      console.log("New ride request:", data);
      // You can dispatch to Redux, show toast, etc.
    });
  }

  // Example: listen to driver acceptance / live location (rider only)
  if (role === "Rider") {
    socket.on("rideAccepted", (data) => {
      console.log("Ride accepted by driver:", data);
    });

    socket.on("driverLocationUpdate", (location) => {
      console.log("Live driver location:", location);
      // Update map marker here
    });
  }
}
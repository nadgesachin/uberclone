import { io } from "socket.io-client";

let socket = null;

export const connectDriverSocket = (token) => {
  socket = io("http://localhost:4000", {
    path: "/driver/location-socket/socket.io",
    transports: ["websocket"],
    auth: { token },
  });

  socket.on("connect", () => {
    console.log("✅ Driver socket connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.log("❌ Socket connect error:", err.message);
  });
};

export const getSocket = () => socket;

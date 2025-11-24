import { io } from "socket.io-client";

let socket = null;

export function connectWS(token) {
  if (!socket) {
    socket = io("http://localhost:4000", {
      path: "/driver/location-socket/socket.io",
      transports: ["websocket"],
      auth: { token },
    });

    socket.on("connect", () => {
      console.log("📡 Customer connected:", socket.id);
    });
  }
  return socket;
}

export function getSocket() {
  return socket;
}

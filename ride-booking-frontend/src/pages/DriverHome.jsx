import React, { useEffect, useState, useRef } from "react";
import MapView from "../components/Map/LeafletMap.jsx";
import { connectDriverSocket, getSocket } from "../services/socketClient.js";
import { useAuth } from "../context/AuthContext.jsx";

const DRIVER1_LOCATION = { lat: 28.450329298644583, lng: 77.0696717392092 };
const DRIVER2_LOCATION = { lat: 28.45160915731852, lng: 77.07091378833334 };
const CUSTOMER_LOCATION = { lat: 28.452155029594767, lng: 77.07314693384915 };

export default function DriverHome() {
  const [location, setLocation] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const intervalRef = useRef(null);

  const { user } = useAuth();
  const driverId = user?._id;

  const INITIAL_LOCATION =
    user?.email === "driver2@err.r" ? DRIVER2_LOCATION : DRIVER1_LOCATION;

  /* ------------------------------
  | 1. Connect socket
  ------------------------------ */
  useEffect(() => {
    const token = localStorage.getItem("token");
    connectDriverSocket(token);
    return () => getSocket().disconnect();
  }, []);

  /* ------------------------------
  | 2. Set initial map position
  ------------------------------ */
  useEffect(() => {
    if (INITIAL_LOCATION) setLocation(INITIAL_LOCATION);
  }, [user?.email]);

  /* ------------------------------
  | 3. Move Driver Along Route
  ------------------------------ */
  useEffect(() => {
    if (routePoints.length === 0) return;

    let index = 0;

    const mover = setInterval(() => {
      if (index >= routePoints.length) {
        clearInterval(mover);
        return;
      }

      const point = routePoints[index];
      setLocation(point);

      getSocket().emit("driver:updateLocation", {
        driverId: `driver-${driverId}`,
        lat: point.lat,
        lng: point.lng,
      });

      index++;
    }, 1500);

    return () => clearInterval(mover);
  }, [routePoints]);

  /* ------------------------------
  | 4. Emit location every 5 sec
  ------------------------------ */
  useEffect(() => {
    if (!location) return;

    const socket = getSocket();

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      socket.emit("driver:updateLocation", {
        driverId: `driver-${driverId}`,
        lat: location.lat,
        lng: location.lng,
      });
    }, 5000);

    return () => clearInterval(intervalRef.current);
  }, [location]);

  return (
    <div className="h-screen p-4">
      <h2 className="text-xl font-semibold mb-3">Driver Live Route</h2>

      <MapView
        center={location || INITIAL_LOCATION}
        zoom={15}
        pickup={INITIAL_LOCATION}
        dropoff={CUSTOMER_LOCATION}
        drivers={location ? [{ lat: location.lat, lng: location.lng }] : []}
        onRouteReady={(points) => setRoutePoints(points)}  // <– get route from map
      />
    </div>
  );
}

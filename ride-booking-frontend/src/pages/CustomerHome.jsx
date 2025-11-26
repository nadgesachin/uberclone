// src/pages/CustomerHome.jsx
import React, { useState, useEffect, use } from "react";
import LeafletMap from "../components/Map/LeafletMap.jsx";
import { connectRiderSocket, getSocket } from "../services/socketClient.js";
import { useAuth } from "../context/AuthContext.jsx";
import axios from "axios";

export default function CustomerHome() {
  const [myLocation, setMyLocation] = useState(null);
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [rideStatus, setRideStatus] = useState("idle");
  const [assignedDriverLocation, setAssignedDriverLocation] = useState(null);
  const [assignedDriverId, setAssignedDriverId] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [allDrivers, setAllDrivers] = useState([]);

  const { user } = useAuth();
  const customerId = user?._id;
  const userType = user?.userType || "customer";

  useEffect(() => {
    const token = localStorage.getItem("token");
    connectRiderSocket(token);
    const socket = getSocket();

    socket.on("rideAccepted", (request, callback) => {
      console.log("Received rideAccepted:", request);
      setRideStatus("accepted");
      setAssignedDriverId(request?.driverLocation);
      setSelectedDriver(request?.driverLocation);
      if (callback) callback({ received: true });
    });

    socket.on("driverLocationUpdate", ({ lat, lng }) => {
      setAssignedDriverLocation({ lat, lng });
    });

    // Test location set करो
    const testLoc = { lat: 28.447721829319384, lng: 77.07124131003076 };
    const testPickup = { lat: 28.447205452187504, lng: 77.07242955110858 };

    setMyLocation(testLoc);
    setPickup(testPickup);

    return () => socket.off();
  }, []);

  const requestRide = async () => {
    if (!pickup || !dropoff) return alert("Pickup & Dropoff required");

    const token = localStorage.getItem("token");
    if (!token) return alert("Please login again");

    try {
      const res = await axios.post(
        "http://localhost:4000/api/v1/ride/request",
        {
          customerId,
          pickup,
          dropoff,
          location: myLocation,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setRideStatus("requested");

      const fetchNearbyDrivers = async () => {
        try {
          const res = await axios.get(
            `http://localhost:4000/api/v1/driver/nearby-drivers?customerId=${customerId}&lat=${myLocation.lat}&lng=${myLocation.lng}&radius=2`
          );
          setAllDrivers(res.data.drivers || []);
          console.log("Nearby drivers loaded:", res.data.nearbyDrivers);
        } catch (err) {
          console.error("Failed to load nearby drivers:", err.response?.data || err);
        }
      };

      fetchNearbyDrivers();

      // const firstDriver = res.data.nearbyDrivers?.[0] || res.data.drivers?.[0];
      // if (firstDriver) {
      //   setSelectedDriver(firstDriver);
      // }

    } catch (err) {
      alert("Request failed");
      console.error("Ride request error:", err.response?.data || err);
    }
  };

  // useEffect(() => {
  //   if (rideStatus == "requested") {
  //     if (!myLocation?.lat || !myLocation?.lng || !customerId) {
  //       return;
  //     }

  //     const fetchNearbyDrivers = async () => {
  //       try {
  //         const res = await axios.get(
  //           `http://localhost:4000/api/v1/driver/nearby-drivers?customerId=${customerId}&lat=${myLocation.lat}&lng=${myLocation.lng}&radius=2`
  //         );
  //         setAllDrivers(res.data.drivers || []);
  //         console.log("Nearby drivers loaded:", res.data.nearbyDrivers);
  //       } catch (err) {
  //         console.error("Failed to load nearby drivers:", err.response?.data || err);
  //       }
  //     };

  //     fetchNearbyDrivers();
  //     const interval = setInterval(fetchNearbyDrivers, 10000);

  //     return () => clearInterval(interval);
  //   }
  // }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="p-5 bg-white shadow-lg">
        <h2 className="text-2xl font-bold">Customer Dashboard</h2>
        <p>Status: <strong className="text-blue-600">{rideStatus.toUpperCase()}</strong></p>

        <div className="mt-4 flex gap-4">
          <button
            onClick={requestRide}
            disabled={rideStatus !== "idle"}
            className={`px-8 py-3 rounded-lg font-bold text-white ${rideStatus === "idle" ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"
              }`}
          >
            Request Ride
          </button>

          <button
            onClick={() => setDropoff({ lat: 28.4550, lng: 77.0850 })}
            className="px-6 py-3 bg-gray-200 rounded-lg"
          >
            Set Test Dropoff
          </button>
        </div>

        <div className="mt-3 text-sm">
          <p>Pickup: {pickup ? `${pickup.lat.toFixed(6)}, ${pickup.lng.toFixed(6)}` : "Loading..."}</p>
          <p>Dropoff: {dropoff ? `${dropoff.lat.toFixed(6)}, ${dropoff.lng.toFixed(6)}` : "Not set"}</p>
        </div>
      </div>

      {/* MAP */}
      {myLocation ? (
        <LeafletMap
          center={myLocation}
          pickup={pickup}
          dropoff={dropoff}
          drivers={allDrivers}
          userType={userType}
          selectedDriver={selectedDriver}   // ← NEW PROP
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-2xl">
          Getting location...
        </div>
      )}

      {rideStatus === "accepted" && (
        <div className="absolute top-20 left-4 bg-green-600 text-white p-4 rounded-lg shadow-2xl z-50">
          <strong>Driver is coming!</strong>
          <p className="text-sm mt-1">Live tracking active</p>
        </div>
      )}
    </div>
  );
}
// src/pages/DriverHome.jsx
import React, { useEffect, useState } from "react";
import LeafletMap from "../components/Map/LeafletMap.jsx";
import { connectDriverSocket, getSocket } from "../services/socketClient.js";
import { useAuth } from "../context/AuthContext.jsx";

const RideRequestModal = ({ request, onAccept, onIgnore }) => {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (timeLeft === 0) {
      onIgnore();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onIgnore]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[99999] pointer-events-auto">
      {/* Background dim */}
      <div
        className="absolute inset-0 bg-black bg-opacity-90"
        onClick={onIgnore}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 text-center">
          <h2 className="text-3xl font-bold">New Ride Request!</h2>
          <p className="text-lg mt-2">{request.distance} km away</p>
        </div>

        <div className="p-6 text-black">
          <div className="bg-gray-100 p-4 rounded-xl text-center font-mono text-lg mb-6">
            {request.customerLocation.lat.toFixed(6)}, {request.customerLocation.lng.toFixed(6)}
          </div>

          {/* Countdown Circle */}
          <div className="flex justify-center my-8">
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="60" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                <circle
                  cx="64" cy="64" r="60"
                  stroke="#10b981" strokeWidth="8" fill="none"
                  strokeDasharray={`${(timeLeft / 30) * 377} 377`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-green-600">{timeLeft}s</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onIgnore}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-5 rounded-2xl text-xl transition"
            >
              Ignore
            </button>
            <button
              onClick={onAccept}
              disabled={request.accepting}
              className={`flex-1 font-bold py-5 rounded-2xl text-xl shadow-lg transition ${request.accepting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
                }`}
            >
              {request.accepting ? "Accepting..." : "Accept Ride"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DriverHome() {
  const [location, setLocation] = useState(null);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const { user } = useAuth();
  const driverId = user?._id;

  const DUMMY_LOCATIONS = {
    "69244c43c5e0af887e65f51f": { lat: 28.446279997890713, lng: 77.0704288704177 },
    "69244c62c5e0af887e65f522": { lat: 28.44716674131804, lng: 77.07341148670237 },
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !driverId) return;

    connectDriverSocket(token);
    const socket = getSocket();

    const dummyLoc = DUMMY_LOCATIONS[driverId];
    if (dummyLoc) {
      setLocation(dummyLoc);

      const sendLocation = () => {
        socket.emit("driver:updateLocation", {
          driverId,
          lat: dummyLoc.lat,
          lng: dummyLoc.lng,
        });
      };

      sendLocation();
      const interval = setInterval(sendLocation, 5000);

      socket.on("newRideRequest", (request, callback) => {
        console.log("Received newRideRequest:", request);
        setCurrentRequest(request);
        navigator.vibrate?.([300, 100, 300]);
        new Audio("/ride-alert.mp3").play().catch(() => { });
        if (callback) callback({ received: true });
      });

      socket.on("rideAcceptedByDriver", (request, callback) => {
        console.log("Received rideAcceptedByDriver:", request);
        setActiveRide(request);
        setSelectedCustomer(request?.pickup);
        if (callback) callback({ received: true });
      });

      return () => {
        clearInterval(interval);
        socket.off("newRideRequest");
        socket.off("rideAcceptedByDriver");
      };
    }
  }, [driverId]);

  const acceptRide = async () => {
    if (!currentRequest) return;

    setCurrentRequest(prev => ({ ...prev, accepting: true })); // loading

    try {
      const response = await fetch("http://localhost:4000/api/v1/ride/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          rideRequestId: currentRequest.rideRequestId,
          driverId,
          driverLocation: location, // optional
        }),
      });

      const data = await response.json();

      if (data.success) {
        setActiveRide({
          rideRequestId: currentRequest.rideRequestId,
          pickup: currentRequest.customerLocation,
          customerId: currentRequest.customerId,
        });
        setCurrentRequest(null);
        alert("Ride Accepted! Go to pickup location");
      } else {
        alert("Failed to accept ride");
        setCurrentRequest(prev => ({ ...prev, accepting: false }));
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
      setCurrentRequest(prev => ({ ...prev, accepting: false }));
    }
  };

  const ignoreRide = () => setCurrentRequest(null);

  // Driver का marker
  const myDriverMarker = location ? [{
    driverId,
    lat: location.lat,
    lng: location.lng,
    isMe: true
  }] : [];

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {currentRequest && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <div className="flex items-center justify-center min-h-screen pointer-events-auto">
            <RideRequestModal
              request={currentRequest}
              onAccept={acceptRide}
              onIgnore={ignoreRide}
            />
          </div>
        </div>
      )}


      <div className="flex-1 relative">
        {location ? (
          <LeafletMap
            center={{ lat: location.lat, lng: location.lng }}
            pickup={activeRide?.pickup || currentRequest?.customerLocation || null}
            dropoff={selectedCustomer}
            drivers={myDriverMarker}
            userType="driver"
            selectedCustomer={selectedCustomer} 
          />
        ) : (
          <div className="h-full flex items-center justify-center text-2xl">Starting driver mode...</div>
        )}

        <div className="absolute top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl text-lg font-bold animate-pulse z-10">
          ONLINE
        </div>
      </div>
    </div>
  );
}
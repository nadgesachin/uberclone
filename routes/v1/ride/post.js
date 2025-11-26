const RideRequest = require("../../../models/RideRequest");
const kafka = require("../../services/kafka");
const Redis = require("../../services/redis");
const config = require("../../config/kafka-config.json");

const createRideRequest = async (req, res) => {
    try {
        const { pickup, dropoff } = req.body;
        const customerId = req.user.userId;

        let radius = 5;
        const rideRequest = await RideRequest.create({
            customerId,
            pickupLocation: { lat: pickup.lat, lng: pickup.lng },
            destination: { lat: dropoff.lat, lng: dropoff.lng },
        });

        lat = Number(pickup.lat);
        lng = Number(pickup.lng);
        radius = Number(radius);

        if (Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(radius)) {
            return res.status(400).json({ error: "lat, lng and radius must be valid numbers" });
        }

        // RAW GEOSEARCH (never fails)
        const raw = await Redis.Client.sendCommand([
            "GEOSEARCH",
            "drivers:live",
            "FROMLONLAT",
            lng.toString(),        // longitude
            lat.toString(),        // latitude
            "BYRADIUS",
            radius.toString(),
            "km",
            "WITHDIST",
            "WITHCOORD"
        ]);

        console.log("RAW FROM REDIS:", raw);

        const formatted = raw.map((item) => {
            const member = item[0];
            const distance = Number(item[1]);
            const coords = item[2];

            return {
                driverKey: member,
                driverId: member.replace("driver-", ""),
                distanceInKm: distance,
                lat: Number(coords[1]),
                lng: Number(coords[0]),
            };
        });
        const nearbyDrivers = formatted;

        await kafka.producer({
            topic: config["ride-request"].topic,
            key: config["ride-request"].key,
            value: JSON.stringify({
                rideRequestId: rideRequest._id,
                customerId,
                pickup: { lat: pickup.lat, lng: pickup.lng },
                dropoff: { lat: dropoff.lat, lng: dropoff.lng },
                nearbyDrivers: formatted,
            }),
        });

        res.status(201).json({
            success: true,
            rideRequest,
            nearbyDrivers,
            message: "Ride requested successfully",
        });
    } catch (error) {
        console.error("Ride request error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const acceptRide = async (req, res) => {
  try {
    const { rideRequestId, driverId } = req.body;

    const ride = await RideRequest.findByIdAndUpdate(
      rideRequestId,
      {
        driverId,
        status: "accepted",
        acceptedAt: new Date(),
      },
      { new: true }
    ).populate("customerId").lean();

    if (!ride) return res.status(404).json({ message: "Ride not found" });

    // Kafka में ride-assigned event भेजो
    await kafka.producer({
      topic: config["ride-assigned"].topic,
      key: rideRequestId,
      value: JSON.stringify({
        rideRequestId,
        driverId,
        customerId: ride?.customerId?._id,
        pickup: ride?.pickupLocation,
        driverLocation: req.body?.driverLocation, // optional
      }),
    });

    res.json({ success: true, ride });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
    
const rejectRide = async (req, res) => {
  try {
    const { rideRequestId, driverId } = req.body;

    const ride = await RideRequest.findByIdAndUpdate(
      rideRequestId,
      {
        driverId,
        status: "accepted",
        acceptedAt: new Date(),
      },
      { new: true }
    ).populate("customerId");

    if (!ride) return res.status(404).json({ message: "Ride not found" });

    // Kafka में ride-assigned event भेजो
    await kafka.producer({
      topic: "ride-assigned",
      key: rideRequestId,
      value: JSON.stringify({
        rideRequestId,
        driverId,
        customerId: ride.customerId._id,
        pickup: ride.pickup,
        driverLocation: req.body.driverLocation, // optional
      }),
    });

    // Customer को socket से तुरंत notify (fallback)
    const riderSocketId = await Redis.get(`socket-rider-${ride.customerId._id}`);
    if (riderSocketId && global.socketIo) {
      global.socketIo.to(riderSocketId).emit("rideAccepted", {
        rideRequestId,
        driverId,
        message: "Driver is on the way!",
      });
    }

    res.json({ success: true, ride });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createRideRequest, acceptRide, rejectRide };
const Redis = require("../../services/redis");

exports.getNearbyDriversByCustomer = async (req, res) => {
    try {
        let { lat, lng, radius = 2 } = req.query;

        lat = Number(lat);
        lng = Number(lng);
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

        // raw format:
        // [
        //   ["driver-xxx", "0.123", ["77.x", "28.x"]],
        //   ...
        // ]

        const formatted = raw.map((item) => {
            const member = item[0];
            const distance = Number(item[1]);
            const coords = item[2];       // [lng, lat]

            return {
                driverKey: member,
                driverId: member.replace("driver-", ""),
                distanceInKm: distance,
                lat: Number(coords[1]),
                lng: Number(coords[0]),
            };
        });

        return res.json({
            success: true,
            count: formatted.length,
            drivers: formatted,
        });

    } catch (err) {
        console.error("getNearbyDrivers ERROR:", err);
        return res.status(500).json({ error: err.message });
    }
};



const Redis = require("../../services/redis");

exports.getNearbyDriversByCustomer = async (req, res) => {
    try {
        const { customerId, radius = 2 } = req.query;

        if (!customerId) {
            return res.status(400).json({ error: "customerId is required" });
        }

        const customerKey = `customer-${customerId}`;
        const customerData = await Redis.Client.hGetAll(customerKey);

        if (!customerData.lat || !customerData.lng) {
            return res.status(404).json({ error: "Customer location not found in Redis" });
        }

        const lat = Number(customerData.lat);
        const lng = Number(customerData.lng);

        const drivers = await Redis.geoSearch(
            "drivers:live",
            lng,
            lat,
            Number(radius),
            20
        );

        const formatted = drivers.map((d) => {
            const member = d[0];
            const distance = d[1];
            const coords = d[2];

            return {
                driverKey: member,
                driverId: member.replace("driver-", ""),
                distanceInKm: Number(distance),
                lat: Number(coords[1]),
                lng: Number(coords[0])
            };
        });

        res.json({
            success: true,
            customerLocation: { lat, lng },
            nearbyDrivers: formatted
        });

    } catch (err) {
        console.error("ERROR: ", err);
        res.status(500).json({ error: err.message });
    }
};

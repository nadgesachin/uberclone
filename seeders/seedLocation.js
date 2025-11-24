const Redis = require("./routes/services/redis");

// Pune Base Location
const BASE_LAT = 18.5204;
const BASE_LNG = 73.8567;

function randomAround(base, range = 0.01) {
    return base + (Math.random() - 0.5) * range; // ± range/2
}

async function addDrivers(count = 10) {
    console.log(`\n🚕 Adding ${count} Drivers...\n`);

    for (let i = 1; i <= count; i++) {
        const driverId = `driver-seed-${i}`;

        const lat = randomAround(BASE_LAT);
        const lng = randomAround(BASE_LNG);

        await Redis.geoAdd("drivers:live", [{
            longitude: lng,
            latitude: lat,
            member: driverId
        }]);

        await Redis.hSet(`driver:${driverId}`, {
            lat,
            lng,
            updatedAt: Date.now(),
        });

        console.log(`✔ Driver Added → ${driverId} | LAT: ${lat} | LNG: ${lng}`);
    }
}

async function addCustomers(count = 10) {
    console.log(`\n🧍 Adding ${count} Customers...\n`);

    for (let i = 1; i <= count; i++) {
        const customerId = `customer-seed-${i}`;

        const lat = randomAround(BASE_LAT);
        const lng = randomAround(BASE_LNG);

        await Redis.geoAdd("customers:live", [{
            longitude: lng,
            latitude: lat,
            member: customerId
        }]);

        await Redis.hSet(`customer:${customerId}`, {
            lat,
            lng,
            updatedAt: Date.now(),
        });

        console.log(`✔ Customer Added → ${customerId} | LAT: ${lat} | LNG: ${lng}`);
    }
}

async function startSeeding() {
    console.log("\n🔥 Seeding Redis Locations...\n");

    await addDrivers(10);
    await addCustomers(10);

    console.log("\n🎉 Seeding Complete!\n");
    process.exit(0);
}

startSeeding();

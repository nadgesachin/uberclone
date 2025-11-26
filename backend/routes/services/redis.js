// const { promisify } = require("util");
const { createClient } = require("redis");
const CONFIG = require("../config/index").REDIS;

let host, port;

if (CONFIG?.hasOwnProperty(process.env.ENV)) {
    host = CONFIG[process.env.ENV]["host"];
    port = CONFIG[process.env.ENV]["port"];
} else {
    console.log(process.env.ENV, "Env not supported");
}

// Create Redis client with improved configuration
const Client = createClient({
    url: `redis://127.0.0.1:6379`,
    // url: `redis://${host}:${port}`,
    legacyMode: false,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.error("Redis connection failed after 10 retries");
                return new Error("Redis connection failed");
            }
            return Math.min(retries * 100, 3000); // Exponential backoff
        },
        connectTimeout: 10000, // 10 seconds
        keepAlive: 5000, // Send keepalive packet every 5 seconds
    },
});

// Handle connection events
Client.on("connect", () => {
    console.log(process.env.ENV + " Redis Server Connected");
});

Client.on("error", (err) => {
    console.error("Redis Client Error:", err);
});

Client.on("ready", () => {
    console.log(process.env.ENV + " Redis Client Ready");
});

Client.on("reconnecting", () => {
    console.log("Redis Client Reconnecting...");
});

Client.on("end", () => {
    console.log("Redis Client Connection Ended");
});

// Connect to Redis with retry logic
async function connectWithRetry(retries = 5) {
    for (let i = 0; i < retries; i++) {
        try {
            await Client.connect();
            return;
        } catch (err) {
            console.error(`Redis connection attempt ${i + 1} failed:`, err);
            if (i === retries - 1) throw err;
            await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
        }
    }
}

// Ensure connection is active before operations
async function ensureConnection() {
    if (!Client.isOpen) {
        try {
            await connectWithRetry();
        } catch (err) {
            console.error("Failed to reconnect to Redis:", err);
            throw new Error("Unable to establish Redis connection");
        }
    }
}

connectWithRetry().catch(console.error);

module.exports.Client = Client;

// Redis utility functions
module.exports.get = async (key) => {
    await ensureConnection();
    try {
        const data = await Client.get(key);
        const groupKey = key.split("-").slice(0, -1).join("-") + "-*";
        const remaingAgeInSecond = await Client.ttl(key);
        return { data, groupKey, remaingAgeInSecond };
    } catch (err) {
        console.error("Redis get error:", err);
        throw err;
    }
};

module.exports.safeHSet = async (key, data) => {
    await ensureConnection();

    const type = await Client.type(key);

    // If key exists but is not a hash → FIX IT
    if (type !== "hash" && type !== "none") {
        console.warn(`⚠️ Redis key type mismatch for ${key}. Found: ${type}. Auto-fixing...`);
        await Client.del(key);
    }

    // Now we can safely write HASH
    return await Client.hSet(key, data);
};

module.exports.getMatching = async (key) => {
    await ensureConnection();
    try {
        const keys = await Client.keys(key + "*");
        const values = await Promise.all(
            keys.map(async (key) => {
                try {
                    const val = await Client.get(key);
                    return { key, val };
                } catch (err) {
                    return { key, err };
                }
            })
        );
        return values;
    } catch (err) {
        console.error("Redis getMatching error:", err);
        throw err;
    }
};

module.exports.getMatchingPromise = async (keys) => {
    await ensureConnection();
    try {
        const values = await Promise.all(
            keys.map(async (key) => {
                try {
                    const data = await Client.get(key);
                    return { key, val: data ? JSON.parse(data) : null };
                } catch (err) {
                    return { key, val: null };
                }
            })
        );
        return values;
    } catch (err) {
        console.error("Redis getMatchingPromise error:", err);
        throw err;
    }
};

module.exports.multiGet = async (keys) => {
    await ensureConnection();

    try {
        return await Client.mGet(keys);
    } catch (err) {
        console.error("Redis multiGet error:", err);
        throw err;
    }
};

module.exports.del = async (key) => {
    await ensureConnection();
    try {
        await Client.del(key);
    } catch (err) {
        console.error("Redis del error:", err);
        throw err;
    }
};

module.exports.setObj = async (key, data, expTime = 2 * 60 * 60 * 1000) => {
    await ensureConnection();
    if (!data) return;
    try {
        const value = typeof data === "object" ? JSON.stringify(data) : data;
        await Client.set(key, value, {
            EX: Math.floor(expTime / 1000), // Convert to seconds
        });
    } catch (err) {
        console.error("Redis setObj error:", err);
        throw err;
    }
};

module.exports.getObj = async (key) => {
    await ensureConnection();
    try {
        const data = await Client.get(key);
        if (!data) {
            return null;
        }
        return JSON.parse(data);
    } catch (err) {
        console.error("Redis getObj error:", err);
        throw err;
    }
};

module.exports.set = async (key, data, expiryTime = 7200) => {
    await ensureConnection();

    try {
        const value = typeof data === "object" ? JSON.stringify(data) : data;

        await Client.set(key, value, {
            EX: expiryTime, // seconds
        });

        return true;
    } catch (err) {
        console.error("Redis set error:", err);
        throw err;
    }
};


module.exports.deleteMatching = async (key) => {
    await ensureConnection();
    try {
        const keys = await Client.keys(key);
        let count = 0;

        for (const key of keys) {
            await Client.del(key);
            count++;
        }

        return `Deleted ${count} data`;
    } catch (err) {
        console.error("Redis deleteMatching error:", err);
        throw err;
    }
};

// ...existing code...

// GEO Commands
module.exports.geoAdd = async (key, members) => {
    await ensureConnection();
    try {
        return await Client.geoAdd(key, members);
    } catch (err) {
        console.error("Redis geoAdd error:", err);
        throw err;
    }
};

module.exports.geoSearch = async (key, lng, lat, radius, count = 20) => {
    await ensureConnection();

    try {
        const cmd = [
            "GEOSEARCH",
            key,
            "FROMLONLAT",
            lng.toString(),
            lat.toString(),
            "BYRADIUS",
            radius.toString(),
            "km",
            "WITHDIST",
            "WITHCOORD",
            "COUNT",
            count.toString()
        ];

        return await Client.sendCommand(cmd);
    } catch (err) {
        console.error("Redis geoSearch error:", err);
        throw err;
    }
};



module.exports.geoPos = async (key, members) => {
    await ensureConnection();
    try {
        return await Client.geoPos(key, members);
    } catch (err) {
        console.error("Redis geoPos error:", err);
        throw err;
    }
};

// Hash Commands
module.exports.hSet = async (key, data) => {
    await ensureConnection();
    try {
        return await Client.hSet(key, data);
    } catch (err) {
        console.error("Redis hSet error:", err);
        throw err;
    }
};

module.exports.hGetAll = async (key) => {
    await ensureConnection();
    try {
        return await Client.hGetAll(key);
    } catch (err) {
        console.error("Redis hGetAll error:", err);
        throw err;
    }
};

// Set Commands
module.exports.sAdd = async (key, members) => {
    await ensureConnection();
    try {
        return await Client.sAdd(key, members);
    } catch (err) {
        console.error("Redis sAdd error:", err);
        throw err;
    }
};

module.exports.sRem = async (key, members) => {
    await ensureConnection();
    try {
        return await Client.sRem(key, members);
    } catch (err) {
        console.error("Redis sRem error:", err);
        throw err;
    }
};

module.exports.sMembers = async (key) => {
    await ensureConnection();
    try {
        return await Client.sMembers(key);
    } catch (err) {
        console.error("Redis sMembers error:", err);
        throw err;
    }
};

// Sorted Set Commands
module.exports.zRem = async (key, members) => {
    await ensureConnection();
    try {
        return await Client.zRem(key, members);
    } catch (err) {
        console.error("Redis zRem error:", err);
        throw err;
    }
};

// Key Commands
module.exports.expire = async (key, seconds) => {
    await ensureConnection();
    try {
        return await Client.expire(key, seconds);
    } catch (err) {
        console.error("Redis expire error:", err);
        throw err;
    }
};

module.exports.ensureConnection = ensureConnection;
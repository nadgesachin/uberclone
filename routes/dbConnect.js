const fs = require("fs");
const cluster = require("cluster");
const mongoose = require("mongoose");
const { DB_CONNECTION: CONFIG } = require("./config/index");
const mailService = require("./services/email");

// Load env variables
const { ENV, SSH_PVT_KEY, SSH_PASSPHRASE, SSH_HOST, SSH_USERNAME, SSH_DST_HOST } = process.env;

// CLI flag for index creation
const shouldCreateIndexes = process.argv.includes("--createIndex");
console.log(`Index creation is ${shouldCreateIndexes ? "enabled" : "disabled"} (use --createIndex).`);

async function connectMongoDB(uri) {
    const options = {
        autoIndex: shouldCreateIndexes,  // replaces useCreateIndex
    };

    if (ENV === "production") {
        options.readPreference = "secondaryPreferred";
    }

    let dbName = "", dbIP = "";

    try {
        const parts = uri.split("/");
        dbName = parts.pop().split("?")[0];
        dbIP = parts[2]?.split("@")[1] || "";
    } catch {}

    try {
        await mongoose.connect(uri, options);
        console.info(`${ENV} : Database connected - ${dbName} - ${dbIP}`);
    } catch (error) {
        const errorMessage = `${require("os").hostname()} | MFORM | ${ENV} | DB Connect Error (${dbName})(${dbIP}) : ${error.message}`;

        const mailOptions = {
            from: `"Dhwani" <noreply-dbconnect@myfinaluber.com>`,
            to: [
                "nadgesachin@gmail.com",
            ].join(","),
            subject: errorMessage,
        };

        if (cluster.worker?.id === 1 && ENV !== "development") {
            await mailService.send(mailOptions);
        }

        console.error(errorMessage);
        process.exit(1);
    }
}

/* -----------------------------------
   SSH Tunnel Handling (if needed)
------------------------------------ */
if (SSH_PVT_KEY) {
    const tunnel = require("tunnel-ssh");

    let sshConfig = {
        username: SSH_USERNAME,
        host: SSH_HOST,
        port: 22,
        dstHost: SSH_DST_HOST,
        keepAlive: true,
        privateKey: fs.readFileSync(SSH_PVT_KEY),
        passphrase: SSH_PASSPHRASE,
    };

    try {
        const serverAddress = CONFIG[ENV].split("@")[1].split("/");
        sshConfig.dstPort = serverAddress[0].split(":")[1];
    } catch {}

    tunnel(sshConfig, async (err) => {
        if (err) {
            console.error("Invalid SSH config:", err);
            return;
        }

        let localUri = CONFIG[ENV].replace(/@(.*?):/, "@localhost:");
        await connectMongoDB(localUri);
    });
}

/* -----------------------------------
   Direct MongoDB Connection
------------------------------------ */
// else if (CONFIG[ENV]) {
    connectMongoDB("mongodb://localhost:27017/uberclone");
// }

module.exports = {
    mongoose,
    Schema: mongoose.Schema,
};

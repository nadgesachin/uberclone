/*
 * @Author: Anup Kumar Srivastav
 * @Date: 2022-02-18
 * @Last Modified by: anup.kumar@dhwaniris.com
 * @Last Modified time: 2022-02-18
 */

const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const baseUrl = "morgan-logs/";
/* A function that will create request logs. */
module.exports.createRequest = async function (req) {
    // let customePath = await makeCustomePath(req, "/request/");
    // let requestPath = baseUrl + customePath + ".txt";
    // let requestData = JSON.stringify({
    //     uniqueId: req.logsUniqueId,
    //     headers: req.headers,
    //     params: req.params,
    //     body: req.body,
    //     path: req.path,
    //     url: req.url,
    // });
    // await writeFile(requestPath, requestData + "\n");
    return { message: "request logs created successfully" };
};

/* A function that will create response logs. */
module.exports.createResponse = async function (req, res) {
    // let customePath = await makeCustomePath(req, "/response/");
    // let responsePath = baseUrl + customePath + ".txt";
    // let responseData = JSON.stringify({
    //     uniqueId: req.logsUniqueId,
    //     responseBody: res["__custombody__"] || null,
    // });
    // await writeFile(responsePath, responseData + "\n");
    return { message: "response logs created successfully" };
};

/* A middleware that will set the response body in a variable named `res.__custombody__` and will be
used in `module.exports.createResponse` function. */
module.exports.setResponseBody = (req, res, next) => {
    // const oldWrite = res.write,
    //     oldEnd = res.end,
    //     chunks = [];

    // res.write = function (chunk) {
    //     chunks.push(Buffer.from(chunk));
    //     oldWrite.apply(res, arguments);
    // };

    // res.end = function (chunk) {
    //     if (chunk) {
    //         chunks.push(Buffer.from(chunk));
    //     }
    //     const body = Buffer.concat(chunks).toString("utf8");
    //     res.__custombody__ = body;
    //     oldEnd.apply(res, arguments);
    // };
    next();
};

/**
 * This function is used to create a custome path for the log files.
 * @param req - The request object.
 * @param type - The type of the file.
 * @returns a string that is the date, the type of request, and the user's email or id.
 */
async function makeCustomePath(req, type) {
    let date = new Date();
    let formatedDate = date.getDate() + "_" + date.getMonth() + "_" + date.getFullYear();
    var decoded = req.headers["x-access-token"]
        ? jwt.decode(req.headers["x-access-token"], { complete: true })
        : { payload: { _id: ".loginFormGet" } };
    let customePath = req.path.match("login")
        ? req.body.email.replace(".", "_")
        : req.path.match("logout")
        ? decoded.payload.userEmail.replace(".", "_")
        : decoded.payload._id;
    return formatedDate + type + customePath;
}

/**
 * If the path doesn't exist, create it
 * @param path - The path to the directory to create.
 */
async function isExists(path) {
    if (!fs.existsSync(path)) {
        fs.mkdir(path, { recursive: true }, (err) => {
            if (err) throw err;
        });
    }
}

/**
 * Write a file to the file system
 * @param filePath - The path to the file you want to write to.
 * @param data - The data to be written to the file.
 */
async function writeFile(filePath, data) {
    try {
        const dirname = path.dirname(filePath);
        // console.log("dirname =======>",dirname,filePath)
        await isExists(dirname);
        await fs.writeFile(filePath, data, { flag: "a" }, function (err) {
            if (err) {
                // throw err;
                console.log("🚀 ~ file: logCreate.js:108 ~ err:", err);
            }
            console.log("Log saved!");
        });
    } catch (err) {
        throw new Error(err);
    }
}

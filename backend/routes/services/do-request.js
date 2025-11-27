const request = require("requestretry");
function doRequest(reqOptions, req, token, adminuser) {
    let headers = {
        "Content-Type": "application/json",
        "x-access-token":
            req && req.headers && req.headers["x-access-token"]
                ? req.headers["x-access-token"]
                : req.query.token
                ? req.query.token
                : token
    };
    if (token) {
        headers["token"] = token;
    }
    // if (req && req.body && typeof req.body == "object" && Object.keys(req.body).length !== 0) {
    //     reqOptions["body"] = req.body;
    // }
    try {
        !reqOptions["uri"].includes("historyOff") &&
            (reqOptions["uri"].includes("?")
                ? (reqOptions["uri"] += "&historyOff")
                : (reqOptions["uri"] += "?historyOff"));
        reqOptions["headers"] = headers;
        reqOptions["timeout"] = 100000000;
        reqOptions["maxAttempts"] = req && req.query && req.query.retryAttempts ? req.query.retryAttempts : 2;
        reqOptions["retryDelay"] = 500;
        reqOptions["time"] = true;
        reqOptions["retryStrategy"] = myRetryStrategy;
        return new Promise(function (resolve, reject) {
            request(reqOptions, function (error, res, body) {
                if (!error && res && (res.statusCode == 200 || res.statusCode == 201 || res.statusCode == 400)) {
                    if (res.statusCode != 200 && res.statusCode != 201) {
                        let message = {
                            statusCode: res.statusCode,
                            message: res.statusMessage,
                            reqOptions: reqOptions,
                        }; 
                    }
                    resolve(body);
                } else {
                    let msg = body ? new Error(JSON.stringify(body)) : error;
                    reject(msg);
                    /* A Promise.all() function. */
                }
            });
        });
    } catch (err) {
        throw err;
    }
}
function myRetryStrategy(err, response, body, options) {
    return {
        mustRetry: !!err || response.statusCode === 502 || response.statusCode === 504 || response.statusCode === 400,
        options: options, //then it should be passed back, it will be used for new requests
    };
}
function getBaseUrl(type) {
    let service = type == "mobile_api" ? "MOBILE" : "ADMIN";
    let baseUrl =
        process.env.ENV == "production"
            ? process.env[`${service}_API_PRODUCTION`]
            : process.env.ENV == "staging"
            ? process.env[`${service}_API_STAGING`] //"ADMIN_API_PRODUCTION"
            : process.env[`${service}_API_LOCAL`];

    baseUrl = baseUrl || `http://localhost:${process.env.PORT}`;
    baseUrl += type == "mobile_api" ? "/api/v1/" : "/api/admin/v1/";
    return baseUrl;
}
module.exports = {
    doRequest,
    getBaseUrl,
};

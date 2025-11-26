module.exports = function (req, res, next) {
    var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("url", req.url, ip);
    next();
};

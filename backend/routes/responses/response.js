const ok = require("./ok");
const badRequest = require("./badRequest");
const unAuthorized = require("./unAuthorized");
const internalError = require("./internalError");
const dbError = require("./dbError");
const dbErrorWithData = require("./dbErrorWithData");
module.exports = (req, res, next) => {
    res["Ok"] = ok;
    res["BadRequest"] = badRequest;
    res["UnAuthorized"] = unAuthorized;
    res["InternalError"] = internalError;
    res["DbError"] = dbError;
    res["dbErrorWithData"] = dbErrorWithData;
    next();
};

const moment = require("moment");
module.exports = function (data = {}, message = "", status = 400) {
    let res = this;
    let resData = {
        timestamp: moment().unix(),
        success: false,
        message: message,
    };
    var result = Object.assign({}, resData, data);
    return res.status(status).json(result);
};

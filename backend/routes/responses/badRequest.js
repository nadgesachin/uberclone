const moment = require("moment");
module.exports = function (data = [], message = "", status = 400) {
    let res = this;
    let resData = {
        timestamp: moment().unix(),
        success: false,
        message,
        data,
        stack: data && data.stack,
    };
    return res.status(status).json(resData);
};

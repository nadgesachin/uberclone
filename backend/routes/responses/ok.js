const moment = require("moment");
module.exports = function (data = [], message = "", status = 200) {
    let res = this;
    return res.status(status).json({
        timestamp: moment().unix(),
        success: true,
        message: message,
        data: data,
    });
};

var ip = require("ip");
global.error = function (where, err, mail, msg) {
    console.log(where, err);
    if (typeof err == "object") {
        err = JSON.stringify(err);
    }
    if (mail) {
        var mailOptions = {
            from: '"UberClone <nadgesachin@gmail.com>', // sender address
            to: ["nadgesachin@gmail.com"], // list of receivers
            subject: "ERROR @" + where,
            html: "<p>" + msg + "</p><p>" + err + "</p></br></br><b>Error @ " + ip.address() + " server</b>",
        };
        // transporter.sendMail(mailOptions);
    }
};

const nodeMailer = require("nodemailer");
const CONFIG = require("routes/config");

module.exports = function (attachments, subject, emails, callback) {
    let transporter = nodeMailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });
    let mailOptions = {
        from: `UberClone <${process.env.MAIL_USER}>`, // sender address
        to: emails, // list of receivers
        subject: subject,
        body: "Uber Clone.",
        attachments: attachments,
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log({ error });
            callback(0);
        } else {
            callback(1);
        }
        // console.log('Message %s sent: %s', info.messageId, info.response);
    });
};

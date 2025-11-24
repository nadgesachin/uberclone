const nodemailer = require("nodemailer");
// const EmailLog = require("../../model/EmailLog");
const AWS = require("aws-sdk");
const emailJson = require("../config/email.json");
const SES_CONFIG = {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY || "",
    secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY || "",
    region: process.env.AWS_SES_REGION || "",
};
const otpTransporter = nodemailer.createTransport({
    SES: new AWS.SES(
        process.env?.OTP_AWS_SES_ACCESS_KEY_ID && process.env?.OTP_AWS_SES_SECRET_ACCESS_KEY
            ? {
                  accessKeyId: process.env?.OTP_AWS_SES_ACCESS_KEY_ID,
                  secretAccessKey: process.env?.OTP_AWS_SES_SECRET_ACCESS_KEY,
                  region: process.env.AWS_SES_REGION || "",
              }
            : SES_CONFIG
    ),
    secure: true,
});

const createEmailLog = (data) => {
    try {
        // let emailLog = new EmailLog(data);
        // emailLog.save();
    } catch (error) {
        console.log("Exception: EmailLog Create", error);
    }
};
async function send(mailOptions) {
    return new Promise(async (resolve, reject) => {
        let logData = {};
        let isMailHog = false;
        let environment = process.env.ENV;
        try {
            let transporter;

            let mail = {
                from: '"mGrant Notifications" <noreply@mgrant.in>',
                to: mailOptions["to"],
                cc: mailOptions["cc"],
                bcc: mailOptions["bcc"],
                subject: mailOptions["subject"] || "Dhwani", // Subject line
                html: mailOptions["html"] || mailOptions["text"], // html version
                attachments: mailOptions["attachments"] || [],
            };
            if (mailOptions.otp && process.env.ENV != "development") {
                transporter = otpTransporter;
                mail.from =
                    process.env?.OTP_AWS_SES_ACCESS_KEY_ID && process.env?.OTP_AWS_SES_SECRET_ACCESS_KEY
                        ? '"mGrant Notifications" <notifications@mgrant.in>'
                        : mail.from;
            } else {
                if (["staging", "development", "demo", "uat"].includes(process.env.ENV)) {
                    //* send email to the fake smtp server(mailhog), ssl not enabled, "secure:false", only works for non-prod env's
                    isMailHog = true;
                    transporter = nodemailer.createTransport({
                        host: process.env?.mailhog_host,
                        port: process.env?.mailhog_smtp_port,
                        secure: false,
                    });
                } else {
                    // send real email
                    transporter = nodemailer.createTransport({
                        SES: new AWS.SES(SES_CONFIG),
                        secure: true,
                    });
                }
            }

            let isEmailValidated;

            if (!isMailHog) isEmailValidated = validateEmail(environment, mail);

            logData = { ...mail, env: process.env.ENV };
            /* removing body part for otp mail. */
            if (mailOptions.otp) {
                delete logData.html;
            }
            if (isEmailValidated || isMailHog) {
                let info = await transporter.sendMail(mail);
                if (info) {
                    let obj = {
                        ResponseMetadata: { RequestId: info.response },
                        MessageId: info.response,
                    };
                    // console.info(`🚀 ~ Mail Sent: `, obj.MessageId);
                    logData["messageId"] = obj.MessageId;
                    createEmailLog(logData);
                    resolve(obj);
                } else {
                    createEmailLog(logData);
                    resolve({});
                }
            }
            resolve({});
        } catch (err) {
            createEmailLog(logData);
            console.info("error", err);
            // reject(err);
        }
    });
}
function forgetMail(mailOptions, callback) {
    let transporter = nodemailer.createTransport(process.env.EMAIL);
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log({ error });
            callback(error, "");
        } else {
            callback("", info);
        }
    });
}

function validateEmail(environment, mailOptions) {
    mailOptions["to"] = convertEmails(environment, mailOptions["to"]);
    mailOptions["cc"] = convertEmails(environment, mailOptions["cc"]);
    mailOptions["bcc"] = convertEmails(environment, mailOptions["bcc"]);
    if (mailOptions["to"] && mailOptions["to"].length) {
        return true;
    }
    return false;
}

function convertEmails(environment, emails) {
    let emaildata = [];
    if (typeof emails === "string") {
        // emaildata = emails.split(",").filter((em) => !emailJson.includes(em));
        emaildata = emails.split(",");
    }
    if (Array.isArray(emails)) {
        emails.forEach((el) => {
            emaildata = el.split(",").concat(emaildata);
        });
    }
    emaildata = emaildata.filter((em) => !emailJson.includes(em));
    if (environment && !["production", "staging", "development"].includes(environment)) {
        // for staging mail are sent on mail hog setup , include demo and uat mail hog is set up there also
        emaildata = emaildata.filter((em) => em.includes("dhwaniris"));
    }
    return emaildata.join(",");
}

module.exports = { send, sendMail: send, forgetMail };

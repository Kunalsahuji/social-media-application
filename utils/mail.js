const nodemailer = require("nodemailer");
require('dotenv').config();
const {EMAIL_ID, PASS, ADDRESS} = process.env
const sendmail = async (res, user, url) => {
    try {
        const transport = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 465,
            auth: {
                user: EMAIL_ID,
                pass: PASS,
            },
        });

        const mailOptions = {
            from: ADDRESS,
            to: user.email,
            subject: "Password Reset Link",
            text: "Do not share this link to anyone",
            html: `<a href="${url}">Reset Password Link</a>`,
        };

        transport.sendMail(mailOptions, async (err, info) => {
            if (err) {
                res.send(err);
            }
            console.log(info);

            user.resetPasswordToken = 1;
            await user.save();
            res.send( `<h1 style="text-align:center; margin-top: 20px; color: tomato;">Check Inbox/Spam</h1>`)
        });
    } catch (error) {
        console.log(error)
        res.send(error);
    }
};

module.exports = sendmail;
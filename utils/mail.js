const nodemailer = require("nodemailer");

const sendmail = async (res, user, url) => {
    try {
        // const url = `http://localhost:3000/forget-password/${user._id}`;

        const transport = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 465,
            auth: {
                user: "ksahu1318@gmail.com",
                pass: "rtdytivceqkpptju",
            },
        });

        const mailOptions = {
            from: "Social Media Private Limited",
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

            // res.send(
            //     `<h1 class="text-5xl text-center mt-5 bg-red-300">Check your inbox/spam.</h1>`);
            res.send( `<h1 style="text-align:center; margin-top: 20px; color: tomato;">Check Inbox/Spam</h1>`)
        });
    } catch (error) {
        console.log(error)
        res.send(error);
    }
};

module.exports = sendmail;
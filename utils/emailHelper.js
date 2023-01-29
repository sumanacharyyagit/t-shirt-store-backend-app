const nodemailer = require("nodemailer");

const emailHandler = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_AUTH_USER, // generated ethereal user
            pass: process.env.SMTP_AUTH_PASS, // generated ethereal password
        },
    });

    const message = {
        from: "sumanacharyya999@gmail.com", // sender address
        to: options.to, // list of receivers
        subject: options.subject, // Subject line
        text: options.text, // plain text body
        // html: "<b>Hello world?</b>", // html body
    };

    // send mail with defined transport object
    await transporter.sendMail(message);
};

module.exports = emailHandler;

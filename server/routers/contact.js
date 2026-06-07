const router = require('express').Router();
const nodemailer = require('nodemailer');
require('dotenv').config();

const emailMessage = async (mail, replyTo, message, html) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

    await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: mail,
        replyTo,
        subject: `Uusi viesti käyttäjältä ${replyTo}`,
        text: message,
        html
    });
};

router.post('/', async (req, res) => {
    const { name, email, message } = req.body;
   
    console.log("Mail content: " + name + ", " + email + ", " + message);
    console.log("Process.env - " + process.env.GMAIL_USER);
    console.log('Pass length:', process.env.GMAIL_APP_PASSWORD?.length);
   
    try {
        await emailMessage(process.env.GMAIL_USER, email, name, message, `<p><b>From:</b> ${name} &lt;${email}&gt;</p><p>${message}</p>`);
        res.status(200).json({ success: true, message: 'Email sent!' });
    } catch (err) {
        console.error('Email error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to send email.' });
    }
})

module.exports = router;
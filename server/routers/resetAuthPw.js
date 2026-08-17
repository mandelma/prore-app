const resetRouter = require('express').Router()
const User = require('../models/users')
const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Route to initiate password reset
resetRouter.post("/forgot_auth", async (req, res) => {
    const { email } = req.body;

    const genericResponse = {
        result:
            "Jos tällä sähköpostiosoitteella on käyttäjätili, salasanan palautusohjeet on lähetetty sähköpostiin."
    };

    try {
        if (!email) {
            return res.status(200).json(genericResponse);
        }

        const normalizedEmail = String(email)
            .trim()
            .toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        /*
         * Turvallisuussyistä palautetaan aina sama vastaus,
         * riippumatta siitä, löytyykö käyttäjää.
         */
        if (!user) {
            return res.status(200).json(genericResponse);
        }

        const tokenResetData = {
            username: user.username,
            id: user._id.toString()
        };

        const tokenReset = jwt.sign(
            tokenResetData,
            process.env.SECRET,
            {
                expiresIn: "1h"
            }
        );

        /*
         * Productionissa käytä kiinteää frontend-osoitetta
         * ympäristömuuttujasta.
         */
        const frontendUrl =
            process.env.FRONTEND_URL ||
            `${req.protocol}://${req.get("host")}`;

        const resetUrl =
            `${frontendUrl}/reset_auth/${tokenReset}`;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: user.email,
            subject: "Uuden salasanan luominen",
            text:
                `Napsauta seuraavaa linkkiä luodaksesi uuden salasanan:\n\n${resetUrl}\n\n` +
                `Linkki on voimassa yhden tunnin ajan.`
        };

        try {
            await transporter.sendMail(mailOptions);

            console.log(
                "Password reset email sent for user:",
                user._id
            );

            user.tokenReset = tokenReset;
            await user.save();
        } catch (mailError) {
            /*
             * Älä paljasta asiakkaalle sähköpostin lähetysvirhettä
             * tavalla, joka kertoo käyttäjän olemassaolosta.
             */
            console.error(
                "Password reset email sending failed:",
                mailError
            );
        }

        return res.status(200).json(genericResponse);

    } catch (error) {
        console.error(
            "Forgot password request failed:",
            error
        );

        /*
         * Myös tässä voidaan palauttaa geneerinen vastaus,
         * jotta käyttäjätilien olemassaoloa ei voi päätellä.
         */
        return res.status(200).json(genericResponse);
    }
});

resetRouter.get('/', (req, res) => {
    const url = req.protocol + '://' + req.get('host') + "/login"
    res.send(url);
})

// Route to handle the reset token
resetRouter.get('/reset_auth/:token', async (req, res) => {
    const { token } = req.params;
    // Check if the token exists and is still valid
    const user = await User.findOne({ tokenReset: token });
    try {
        if (user) {
            // Render a form for the user to enter a new password
            //res.send('<form method="post" action="/reset-password"><input type="password" name="password" required><input type="submit" value="Reset Password"></form>');
            const decodedToken = await jwt.verify(token, process.env.SECRET)
            if (!decodedToken) {
                //return res.status(401).json({ error: 'token invalid' })
                res.json({ error: 'token expired' }).end();

            }
            res.status(200).send('valid')
            
        } else {
            //res.status(404).send('Invalid or expired token');
            res.send('Lähetetty linkki on vanhentunut. Yrittä uudelleen!')
        }
    } catch (error) {
        console.log(error.message);
        res.send("Lähetetty linkki on vanhentunut. Yrittä uudelleen!");
    }


});
// Route to update the password
resetRouter.post('/reset_auth', async (req, res) => {
    const { token, password } = req.body;
    const saltRounds = 10

    console.log("Token: " + token);
    console.log("Password: " + password);
    
    try {
        const user = await User.findOne({ tokenReset: token })

        if (password === undefined || password === '') {
            return res.status(400).json({ Error: 'Password field should not to be empty!' }).end()
        }

        user.passwordHash = await bcrypt.hash(password, saltRounds);

        user.tokenReset = null;

        await user.save();

        res.send('New password is created!')
        
    } catch (err) {
        res.send(err.message)
    }

});


module.exports = resetRouter;
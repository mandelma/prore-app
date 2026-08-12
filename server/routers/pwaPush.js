const express = require('express');
const router = express.Router();
const User = require("../models/users");

const auth = require("../middleware/httpAuth");

router.post(
    "/subscribe",
    auth,
    async (req, res) => {
        try {
            const subscription =
                req.body.subscription;

                console.log("Subscription - ", subscription);

            if (!subscription?.endpoint) {
                return res.status(400).json({
                    message: "Invalid subscription"
                });
            }

            const user = await User.findById(
                req.user.id
            );

            const alreadyExists =
                user.pushSubscriptions.some(
                    item =>
                        item.endpoint === subscription.endpoint
                );

            if (!alreadyExists) {
                user.pushSubscriptions.push(
                    subscription
                );

                await user.save();
            }

            res.json({
                success: true
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message:
                    "Failed to save push subscription"
            });
        }
    }
);

module.exports = router;
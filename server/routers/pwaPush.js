const express = require('express');
const router = express.Router();
const User = require("../models/users");

const auth = require("../middleware/httpAuth");

router.post(
    "/subscribe",
    auth,
    async (req, res) => {
        try {
            const subscription = req.body.subscription;

            console.log(
                "SUBSCRIBE DEBUG:",
                {
                    endpoint: subscription?.endpoint,
                    standalone: req.body.debug?.standalone,
                    userAgent: req.body.debug?.userAgent
                }
            );


            console.log(
                "🔥 PUSH SUBSCRIBE REQUEST",
                {
                    time: new Date().toISOString(),
                    userId: req.user.id,
                    endpoint: subscription.endpoint
                }
            );

            if (!subscription?.endpoint) {
                return res.status(400).json({
                    message: "Invalid subscription"
                });
            }

            const result = await User.updateOne(
                {
                    _id: req.user.id,

                    "pushSubscriptions.endpoint": {
                        $ne: subscription.endpoint
                    }
                },
                {
                    $push: {
                        pushSubscriptions: subscription
                    }
                }
            );

            console.log("🔥 PUSH SUBSCRIBE RESULT", {
                endpoint: subscription.endpoint,
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount
            });

            console.log(
                "Push subscription update:",
                {
                    matched: result.matchedCount,
                    modified: result.modifiedCount
                }
            );

            return res.json({
                success: true
            });

        } catch (error) {
            console.error(
                "Failed to save push subscription:",
                error
            );

            return res.status(500).json({
                message:
                    "Failed to save push subscription"
            });
        }
    }
);

module.exports = router;
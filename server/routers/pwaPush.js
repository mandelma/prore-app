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


            /* console.log(
                "🔥 PUSH SUBSCRIBE REQUEST",
                {
                    time: new Date().toISOString(),
                    userId: req.user.id,
                    endpoint: subscription.endpoint
                }
            ); */

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

router.post(
    "/unsubscribe",
    auth,
    async (req, res) => {
        try {
            const { endpoint } = req.body;

            if (
                typeof endpoint !== "string" ||
                !endpoint
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid subscription endpoint"
                });
            }

            const result = await User.updateOne(
                { _id: req.user.id },
                {
                    $pull: {
                        pushSubscriptions: {
                            endpoint
                        }
                    }
                }
            );

            console.log("PUSH UNSUBSCRIBE:", {
                userId: req.user.id,
                modifiedCount: result.modifiedCount
            });

            return res.status(200).json({
                success: true,
                removed: result.modifiedCount > 0
            });

        } catch (error) {
            console.error(
                "Push unsubscribe failed:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to unsubscribe"
            });
        }
    }
);

module.exports = router;
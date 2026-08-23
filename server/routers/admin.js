const express = require("express");
const adminRouter = express.Router();
const User = require("../models/users");
const Provider = require("../models/providers");
const Client = require("../models/recipients");

const userAuth = require("../middleware/httpAuth.js");
const adminAuth = require("../middleware/requireAdmin.js");

/* {
    users: 0,
    usersToday: 0,

    providers: 0,
    providersToday: 0,

    clients: 0,
    clientsToday: 0,

    activeBookings: 0,
    bookingsToday: 0,

    completedOrders: 0,
    completedOrdersToday: 0,

    openOffers: 0,

    inactiveUsers: 0,
    blockedUsers: 0,

    transactionVolume: 0,
    averageOrderValue: 0,

    conversionRate: 0,
    cancellationRate: 0,

    failedPayments: 0,
    unresolvedReports: 0
} */

const userStats = async () => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [stats] = await User.aggregate([
        {
            $group: {
                _id: null,

                totalCount: {
                    $sum: 1
                },

                registeredToday: {
                    $sum: {
                        $cond: [
                            { $gte: ["$createdAt", startOfToday] },
                            1,
                            0
                        ]
                    }
                }
            }
        }
    ]);

    return stats ?? {
        totalCount: 0,
        registeredToday: 0
    };
};

const clientStats = async () => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const [stats] = await Client.aggregate([
        {
            $group: {
                _id: null,

                activeCount: {
                    $sum: {
                        $cond: [
                            { $eq: ["$status", "active"] },
                            1,
                            0
                        ]
                    }
                },

                doneCount: {
                    $sum: {
                        $cond: [
                            { $eq: ["$status", "done"] },
                            1,
                            0
                        ]
                    }
                },

                createdToday: {
                    $sum: {
                        $cond: [
                            {$gte: ["$started", startOfToday]},
                            1,
                            0
                        ]
                    }
                },
                totalCount: {
                    $sum: 1
                }
            }
        }
    ]);

    return stats ?? {
        activeCount: 0,
        doneCount: 0,
        totalCount: 0,
        createdToday: 0
    };
};

adminRouter.get("/dashboard", 
    userAuth,
    adminAuth,
    async (req, res) => {

        try {
            const [_users, _clients, providerCount] = await Promise.all([
                userStats(),
                clientStats(),
                Provider.countDocuments({})
            ]);

            res.json({
                message: "Admin dashboard data",
                stats: {
                    providers: providerCount,
                    clients: _clients.totalCount,
                    activeBookings: _clients.activeCount,
                    completedOrders: _clients.doneCount,
                    users: _users.totalCount,
                    usersToday: _users.registeredToday
                }
            });
        } catch (err) {
            console.error("Admin dashboard error:", err);
            res.status(500).json({
                error: "Failed to load admin dashboard"
            });
        }
        
})

module.exports = adminRouter;
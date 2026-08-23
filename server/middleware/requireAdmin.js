const User = require("../models/users");

const requireAdmin = async (req, res, next) => {
    try {
        console.log("IN REQUIRE ADMIN: " + req.user.id)
        const user = await User.findById(
            req.user.id
        ).select("role");

        if (!user) {
            return res.status(401).json({
                error: "User not found"
            });
        }

        if (user.role !== "admin") {
            return res.status(403).json({
                error: "Admin access required"
            });
        }

        next();

    } catch (error) {
        console.error(
            "Admin authentication error:",
            error
        );

        return res.status(500).json({
            error: "Server error"
        });
    }
};

module.exports = requireAdmin;
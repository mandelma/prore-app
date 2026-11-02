require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/users");


const {
    connectDB,
    disconnectDB
} = require("../utils/database");

const deleteTestUser = async () => {
    if (process.env.NODE_ENV !== "test") {
        throw new Error("Cleanup allowed only in test environment");
    }

    const userId = process.argv[2];

    if (!mongoose.isValidObjectId(userId)) {
        throw new Error("Invalid user ID");
    }

    try {
        await connectDB();

        if (mongoose.connection.name !== "prore_test_db") {
            throw new Error("Unsafe database");
        }

        const user = await User.findById(userId);

        if (!user) {
            throw new Error("Test user not found");
        }

        if (
            !/^pw[a-f0-9]{32}$/.test(user.username) ||
            !/^pw[a-f0-9]{32}@example\.com$/.test(user.email)
        ) {
            throw new Error("Not an allowed temporary test user");
        }

        const result = await User.deleteOne({
            _id: user._id,
            username: user.username,
            email: user.email
        });

        if (result.deletedCount !== 1) {
            throw new Error("User was not deleted");
        }

        console.log("Test user deleted:", user.username);

    } finally {
        await disconnectDB();
    }
};

deleteTestUser().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
});
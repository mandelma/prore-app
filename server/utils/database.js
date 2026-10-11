const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const connectDB = async () => {
    const env = process.env.NODE_ENV;

    let mongoUrl;

    switch (env) {
        case "production":
            mongoUrl = process.env.MONGODB_URL_PUBLIC;
            break;

        case "development":
            mongoUrl = process.env.MONGODB_URL_LOCAL;
            break;

        case "test":
            mongoUrl = process.env.MONGODB_URL_TEST;
            break;

        default:
            throw new Error(`Unsupported NODE_ENV: ${env}`);
    }

    if (!mongoUrl) {
        throw new Error(`MongoDB URL is missing for ${env}`);
    }

    // Täiendav kaitse testandmebaasi jaoks
    if (env === "test") {
        const dbName = new URL(mongoUrl).pathname.replace("/", "");

        if (dbName !== "prore_test_db") {
            throw new Error(
                `Unsafe test database: ${dbName}`
            );
        }
    }

    await mongoose.connect(mongoUrl);

    console.log(`MongoDB connected (${env})`);
};

const disconnectDB = async () => {
    await mongoose.disconnect();
};

module.exports = {
    connectDB,
    disconnectDB
};
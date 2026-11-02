const { server } = require('./app.js');
const config = require('./utils/config.js');
const logger = require('./utils/logger');
const {models} = require("mongoose");
const { connectDB } = require("./utils/database");

const startServer = async () => {
    try {

        await connectDB();

        const host =
            process.env.NODE_ENV === "test"
                ? "127.0.0.1"
                : "0.0.0.0";

        server.listen(config.PORT, host, () => {
            logger.info(
                `Server running on ${host}:${config.PORT}`
            );
        });

    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
};

startServer();
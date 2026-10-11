const { server } = require('./app.js');
const config = require('./utils/config.js');
const logger = require('./utils/logger');
const {models} = require("mongoose");
const { connectDB } = require("./utils/database");

const startServer = async () => {
    try {
        await connectDB();

        server.listen(config.PORT, () => {
            logger.info(
                `Server running on port ${config.PORT}`
            );
        });
    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
};

startServer();
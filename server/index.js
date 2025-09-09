const app = require('./app.js');
const config = require('./utils/config.js');
const logger = require('./utils/logger');
const {models} = require("mongoose");

const port = process.env.Port || 3001;

console.log("PORT " + config.PORT)
app.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`)
})
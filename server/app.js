const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const serveStatic = require('serve-static');
const mongoose = require('mongoose');
const cors = require('cors');
const history = require('connect-history-api-fallback');
const path = require("path");

require('dotenv').config();

const server = require('http').Server(app);
const io = require('socket.io')(server, {
    maxHttpBufferSize: 1e8, // 100 MB
    cors: {

        //origin: 'http://localhost:8080',
        origin: '*',
        methods: ["GET", "POST"],
        transports: ['websocket'],

        credentials: true,
        // origins: [
        //     'http://localhost:8080'
        //  //   '*'
        // ]
    },
    allowEIO3: true,

});

mongoose.set('strictQuery', false);

console.log("Mongoose... " + process.env.NODE_ENV);

//if (!process.env.MONGODB_URL_LOCAL) throw new Error('MONGODB_URI is not set');
//await mongoose.connect(process.env.MONGODB_URI);

let mongo_access = "";
if (process.env.NODE_ENV === 'production') {
    console.log('App is running in production mode');
    mongo_access = process.env.MONGODB_URL_PUBLIC;
} else {
    console.log('App is running in development mode');
    mongo_access = process.env.MONGODB_URL_LOCAL
}
const connected = mongoose.connect(mongo_access, {
    //useNewUrlParser: true,
    //useUnifiedTopology: true,
    //strictPopulate: false
    //useCreateIndex: true,
    //useFindAndModify: false
});

if (connected) {
    console.log('mongo database is connected')
}else {
    console.log('error: mongo database is not connected')
}

const corsOptions ={
    //origin: true,
    origin: '*',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200,
}

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.use(history());
app.use(serveStatic(path.join(__dirname, '../dist')));

app.use('/api/users', require('./routers/users'));
app.use('/api/login', require('./routers/login'));

module.exports = server;
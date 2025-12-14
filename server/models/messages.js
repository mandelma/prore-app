const mongoose = require('mongoose');
//import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const chatDialogSchema = new Schema({
    created_ms: {type: Number},
    room: String,
    
    msg_type: String, /* Like text or */
    message: String,

    imgID: String,
    key: String,
    image: String,
    is_db_image: Boolean,
    username: String,
    date: String,
    userID: String,
    receiverID: String,
    status: String
})

chatDialogSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Chat = mongoose.model('dialog', chatDialogSchema);
module.exports = Chat;
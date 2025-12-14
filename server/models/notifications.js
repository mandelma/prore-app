const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const messageSchema = new Schema({
    user: {
        type: String
    },
    bookingId: {
        type: String
    },
    isNewMsg: {
      type: Boolean
    },
    isLink: {
        type: Boolean
    },
    title: {
        type: String
    },
    content: {
        type: String
    },
    reason: {
        type: String
    },
    author: {
        type: String
    },
    created: {
        type: Date
    }
})

messageSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Message = mongoose.model('note', messageSchema)
module.exports = Message
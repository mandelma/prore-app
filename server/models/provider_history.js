const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const proHistorySchema = new Schema({
    name: {
        type: String
    },
    header: {
        type: String
    },
    content: {
        type: String
    },
    address: {
        type: String
    },
    distance: {
        type: Number
    },
    date: {
        type: Date
    },
    user: {
        type: String
    }
    /* user: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'user'
    }, */

})

proHistorySchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.passwordHash
    }
})

const ProHistory = mongoose.model('pro_history', proHistorySchema)
module.exports = ProHistory;
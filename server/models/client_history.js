const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clientHistorySchema = new Schema({
    status: {
      type: String
    },
    header: {
        type: String
    },
    proID: {
        type: String
    },
    company: {
        type: String
    },
    id_number: {
        type: String
    },
    rating: {
        type: Object
    },
    address: {
        type: String
    },
    date: {
        type: String
    },
    professional: {
        type: Array
    },
    deal: {
        type: Object
    },
    bookerId: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'user'
    },

})

clientHistorySchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.passwordHash
    }
})

const ClientHistory = mongoose.model('client_history', clientHistorySchema)
module.exports = ClientHistory;
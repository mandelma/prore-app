const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const calendarSchema = new Schema ({

})

calendarSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.passwordHash
    }
})

module.exports = mongoose.model("calendar", calendarSchema);
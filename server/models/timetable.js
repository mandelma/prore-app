const mongoose = require('mongoose')
const Schema = mongoose.Schema

const offerRangeSchema = new Schema({
    /* timerange: {
        state: {type: String},
        title: {type: String},
        content: {type: String},
        start: {type: Date},
        end: {type: Date}
    }, */

    state: {type: String},
    isAllDay: {type: Boolean},
    title: {type: String},
    content: {type: String},
    start: {type: Date},
    end: {type: Date},



    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'provider'
    },
})

offerRangeSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const TimeRangeoffer = mongoose.model('Timerange', offerRangeSchema)

module.exports = TimeRangeoffer;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const uploadSchema = new Schema({
    created: {
        type: Date,
        default: new Date()
    },
    imageUrl: {
        type: String
    },
    key: {type: String}
})

module.exports = mongoose.model('upload', uploadSchema)
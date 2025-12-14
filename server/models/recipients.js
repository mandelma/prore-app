const mongoose = require('mongoose')
const Schema = mongoose.Schema

const recipientSchema = new Schema({
    author_id: {
        type: String,
        required: true
    },
    header: {
        type: String,
        required: true
    },
    isContactAgreement: {
        type: Boolean
    },
    address: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
    },
    longitude: {
        type: Number
    },
    professional: [
        {
            type: String,
            required:true
        }
    ],
    onTime: [
        {
            year: {
                type: Number,
                required: true
            },
            month: {
                type: Number,
                required: true
            },
            day: {
                type: Number,
                required: true
            },
            hours: {
                type: Number,
                required: true
            },
            minutes: {
                type: Number,
                required: true
            },
        }
    ],
    started: {
        type: Date
    },
    created: {
        type: Date
    },
    created_ms: {
        type: Number
    },
    date: {
        type: String
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String
    },
    ordered: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "provider"
        }
    ],
    providerID: {
        type: String
    },
    isFeedbackGiven: {
        type: Boolean
    },
    provider: {
        type: String
    },
    isIncludeOffers: {
        type: Boolean
    },
    visitors: {
        type: Array
    },

    offers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "offer"
        }
    ],
    offer: {
        type: Object
    },
    zone: {
        type: Number
    },
    // image: [
    //     {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'upload'
    //     }
    // ],

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
})

recipientSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})


const Recipient = mongoose.model('Recipient', recipientSchema)
module.exports = Recipient
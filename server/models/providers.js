const mongoose = require('mongoose')

const Schema = mongoose.Schema

const providerSchema = new Schema({
    pName: {
        type: String
    },
    created: {
        type: Date
    },
    ide: {
        type: String
    },
    description: {
        type: String,
        default: "Lyhyt kuvaus itsestään ja yrityksestä..."
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
    profession: [
        {
            type: String,
            required:true
        }
    ],
    priceByHour: {
        type: Number
    },
    range: {
        type: Number
    },
    isAvailable24_7: {
        type: Boolean
    },
    pro_link: {
        type: String
    },
    timetable: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Timerange'
        }
    ],
    proposal: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Recipient'
        }
    ],
    room: [
        {
            type: Object
        }
    ],
    // rating: [
    //     {
    //         positive: {
    //             type: Number
    //         },
    //         negative: {
    //             type: Number
    //         },
    //         text: {
    //             type: String
    //         }
    //     }
    // ],
    proTime: {
        type: Number
    },
    credit: {
        type: Number
    },
    rating: {
        positive: {
            type: Number
        },
        negative: {
            type: Number
        },
        count: {
            type: Number,
            default: 0
        }
        /*text: [
            {
                pos: {
                    type: String
                },
                neg: {
                    type: String
                }
            }
        ]*/
    },

    ratersCount: {
        type: Number,
        default: 0
    },

    feedback: [
        {
            pos: {
                type: String
            },
            neg: {
                type: String
            }
        }
    ],

    /*rating: {
        positive: {
            type: Number
        },
        negative: {
            type: Number
        }
    },*/

    reference: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'upload'
        }
    ],

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
})

providerSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Provider = mongoose.model('provider', providerSchema)
module.exports = Provider
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    createdAt: {
        type: Date,
        default: new Date()
    },
    username: {
        type: String,
        unique: true,
        minlength: 3,
        required: true
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String,

    },
    avatar: {
        type: Object
    },
    role: {
        type: String,
        enum: [
            "user",
            "admin"
        ],
        default: "user"
    },
    pushSubscriptions: [
        {
            endpoint: {
                type: String,
                required: true
            },

            expirationTime: {
                type: Number,
                default: null
            },

            keys: {
                p256dh: String,
                auth: String
            }
        }
    ],
    passwordHash: {
        type: String
    },
    tokenReset: {
        type: String
    }
});

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.passwordHash
    }
})

const User = mongoose.model('user', userSchema)
module.exports = User
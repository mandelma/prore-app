const mongoose = require("mongoose");

const { Schema, model, Types } = mongoose;

const conversationSchema = new Schema(
  {
    type: { type: String, enum: ["dm"], default: "dm" },

    participantIds: [{ type: Types.ObjectId, ref: "User", required: true }], // sorted
    participantKey: { type: String, required: true, unique: true }, // "u1_u2"

    lastMessageAt: { type: Date },
    lastMessageText: { type: String },
    lastMessageSenderId: { type: Types.ObjectId, ref: "User" },

    // map userId -> number
    unread: { type: Map, of: Number, default: {} },
  },
  { timestamps: true }
);

conversationSchema.index({ participantIds: 1, lastMessageAt: -1 });

conversationSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        //delete returnedObject._id
        delete returnedObject.__v
        return returnedObject
    }
})

const attachmentSchema = new Schema(
  {
    url: String,
    mime: String,
    size: Number,
    name: String,
    key: String,
    isImage: Boolean,
  },
  { _id: false }
);

attachmentSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const messageSchema = new Schema(
  {
    conversationId: { type: Types.ObjectId, ref: "Conversation", required: true, index: true },
    senderId: { type: Types.ObjectId, ref: "User", required: true },

    text: { type: String, default: "" },
    attachments: { type: [attachmentSchema], default: [] },

    readBy: [{ type: Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });

messageSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Conversation = model("Conversation", conversationSchema);
const Message = model("Message", messageSchema);

module.exports = { Conversation, Message };
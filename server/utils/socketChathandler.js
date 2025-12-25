const { Conversation, Message } = require('../models/chat')

const hsc = (io, socket) => {
    socket.on("join-conversation", ({ conversationId }) => {
        socket.join(`convo:${conversationId}`);
    });

    socket.on("send-message", async ({ conversationId, text, attachments }) => {
        // 1) Save message in DB
        const msg = await Message.create({
            conversationId,
            senderId: socket.userId, // set from auth middleware
            text,
            attachments,
            createdAt: new Date(),
        });

        // 2) Update conversation lastMessageAt + unread for others
        const convo = await Conversation.findById(conversationId);
        const participants = convo.participantIds.map(String);

        const unreadUpdate = {};
        for (const pid of participants) {
            if (pid !== String(socket.userId)) unreadUpdate[`unread.${pid}`] = (convo.unread?.[pid] || 0) + 1;
        }

        const updatedConvo = await Conversation.findByIdAndUpdate(
            conversationId,
            { $set: { lastMessageAt: msg.createdAt, updatedAt: msg.createdAt }, $inc: unreadUpdate },
            { new: true }
        ).lean();

        // 3) Emit message to room
        io.to(`convo:${conversationId}`).emit("message:new", msg);

        // 4) Emit conversation update to each participant user room
        // (you should have each user join `user:<id>` room on connect)
        participants.forEach((pid) => {
            io.to(`user:${pid}`).emit("conversation-upsert", updatedConvo);
        });
    });
}

module.exports = hsc;
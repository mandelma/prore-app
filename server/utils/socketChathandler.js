const { Conversation, Message } = require('../models/chat')

const onlineUsers = new Map(); // userId -> socket.id[]

const hsc = (io, socket) => {
    socket.on("join-conversation", ({ conversationId }) => {
        socket.join(`convo:${conversationId}`);
    });

    // For display users online - offline

    const userId = socket.userId;               // <- set in auth middleware

    if (!onlineUsers.has(userId)) onlineUsers.set(userId, []);
    onlineUsers.get(userId).push(socket.id);

    // Notify everyone that user is now online
    io.emit("user:online", userId);

    // Send initial list JUST to the connected user
    socket.emit("online:list", [...onlineUsers.keys()]);

    socket.on("disconnect", () => {
        const list = onlineUsers.get(userId)?.filter(id => id !== socket.id);

        if (!list.length) {
            onlineUsers.delete(userId);
            io.emit("user:offline", userId);
        } else {
            onlineUsers.set(userId, list);
        }
    });

    socket.on('upsert-convo', (otherUserId, convo) => {
        const participants = convo.participantIds.map(String);

        socket.to(otherUserId).to(socket.userId).emit('conversation-upsert', convo);
        /* participants.forEach((pid) => {
            //io.to(`user:${pid}`).emit("conversation-upsert", updatedConvo);
            socket.to(pid).to(socket.userId).emit('conversation-upsert', convo);
        }); */
    })


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
            //io.to(`user:${pid}`).emit("conversation-upsert", updatedConvo);
            socket.to(pid).to(socket.userId).emit('conversation-upsert', updatedConvo);
        });
    });
}

module.exports = hsc;
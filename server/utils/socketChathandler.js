const { Conversation, Message } = require('../models/chat')

const onlineUsers = new Map();

const hsc = (io, socket) => {
    socket.on("join-conversation", ({ conversationId }) => {
        socket.join(`convo:${conversationId}`);
    });

    socket.on("conversation:active", ({ conversationId }) => {
        socket.activeConversationId = String(conversationId);
    });

    socket.on("conversation:inactive", () => {
        socket.activeConversationId = null;
    });

    socket.on("disconnect", () => {
        socket.activeConversationId = null;
    });


    

    // For display users online - offline
    const userId = String(socket.userId);
    socket.join(`user:${userId}`);

    socket.on("join-conversation", ({ conversationId }) => {
        socket.join(`convo:${conversationId}`);
        console.log("joined room", `convo:${conversationId}`);
    });

    if (!onlineUsers.has(userId)) onlineUsers.set(userId, []);
    onlineUsers.get(userId).push(socket.id);

    // Notifying everyone that user is now online
    io.emit("user:online", userId);

    // Sending initial list JUST to the connected user
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
        
    })

}

module.exports = hsc;
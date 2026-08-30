const { Conversation, Message } = require('../models/chat')

const onlineUsers = new Map();

const hsc = (io, socket) => {
    socket.on("join-conversation", ({ conversationId }) => {
        socket.join(`convo:${conversationId}`);
    });

    /* socket.on(
        "chat:presence",
        ({ visible, conversationId }, callback) => {
            socket.data.appVisible =
                Boolean(visible);

            socket.data.activeConversationId =
                visible && conversationId
                    ? String(conversationId)
                    : null;

            console.log("CHAT PRESENCE:", {
                socketId: socket.id,
                userId: socket.userId,
                appVisible:
                    socket.data.appVisible,
                activeConversationId:
                    socket.data.activeConversationId
            });

            callback?.({
                success: true,
                socketId: socket.id,
                userId: socket.userId,
                appVisible: socket.data.appVisible,
                activeConversationId:
                    socket.data.activeConversationId
            });
        }
    ); */

    socket.on(
        "chat:presence",
        ({ visible, conversationId }, callback) => {

            console.log(
                ">>> CHAT PRESENCE RECEIVED <<<",
                {
                    time: new Date().toISOString(),
                    socketId: socket.id,
                    userId: socket.userId,
                    visible,
                    conversationId,
                    previous: {
                        appVisible: socket.data?.appVisible,
                        activeConversationId:
                            socket.data?.activeConversationId
                    }
                }
            );

            socket.data.appVisible =
                Boolean(visible);

            socket.data.activeConversationId =
                visible && conversationId
                    ? String(conversationId)
                    : null;

            console.log(
                ">>> CHAT PRESENCE STORED <<<",
                {
                    socketId: socket.id,
                    appVisible:
                        socket.data.appVisible,
                    activeConversationId:
                        socket.data.activeConversationId
                }
            );

            callback?.({
                success: true,
                socketId: socket.id,
                userId: socket.userId,
                appVisible:
                    socket.data.appVisible,
                activeConversationId:
                    socket.data.activeConversationId
            });
        }
    );


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
        const currentSockets =
            onlineUsers.get(userId) || [];

        const remainingSockets =
            currentSockets.filter(
                id => id !== socket.id
            );

        if (remainingSockets.length === 0) {
            onlineUsers.delete(userId);
            io.emit("user:offline", userId);
        } else {
            onlineUsers.set(
                userId,
                remainingSockets
            );
        }
    });

    socket.on('upsert-convo', (otherUserId, convo) => {
        const participants = convo.participantIds.map(String);

        socket.to(otherUserId).to(socket.userId).emit('conversation-upsert', convo);
        
    })

}

module.exports = hsc;
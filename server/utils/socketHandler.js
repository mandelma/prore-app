
const Dialog = require('../models/messages');

const hs = (io, socket) => {
    socket.on("join-user-room", (userId) => {
        //socket.join(userId)
        socket.join(`user:${socket.userId}`);
    })
    
    socket.on("user-action", (action) => {
        userId = action.userId;
        io.to(`user:${userId}`).emit("user-action", action);
    })
    socket.on("create booking multiple - pro", async(proIdArr, bookingId) => {
        console.log("Pro id arr length " + proIdArr.length);
        
        proIdArr.forEach(id => {
            const room = `user:${id}`
            console.log("Pro id is " + id)

            console.log("BOOKING " + bookingId)
            socket.to(room).emit("create booking mtp", id, bookingId, proIdArr);
        })
    })

    socket.on('on-pro-remove-public-offer', (bookingId, receiver) => {
        const room = `user:${receiver}`
        console.log("Receiver ++ " + receiver);
        socket.to(room).emit('handle-pro-remove-public-offer', bookingId)
    })

    // Provider created offer
    socket.on('client get offer', (addressee, clientID, offer) => {
        const room = `user:${addressee}`
        console.log("Offer to client " + offer.name);
        socket.to(room).emit('client use offer', clientID, offer);
    })

    socket.on('client-handle-offer', (sender, orderId, offerId) => {
        const room = `user:${sender}`
        console.log("Sender - " + sender);
        socket.to(room).emit('pro-handle-confirmed', {sender, orderId, offerId})
    })





    /* console.log(
        "client made request listeners BEFORE:",
        socket.listenerCount("client made request")
    ); */

    socket.on(
        "client made request",
        async (receiver, bookingId) => {
            const room = `user:${receiver}`;

            console.log(
                "Request:",
                receiver,
                bookingId
            );

            const sockets =
                await io.in(room).fetchSockets();

            console.log(
                `Receiver room ${room} has`,
                sockets.length,
                "socket(s)"
            );

            io.to(room).emit(
                "handle client request",
                { bookingId }
            );
        }
    );



    /* socket.on('pro-confirm-map-client', (eventId, receiver, bookingId, providerId, offer, note) => {

        const room = `user:${receiver}`

        console.log(
            "📡 SERVER RECEIVED",
            eventId,
            "socket:",
            socket.id
        );



        console.log("TEST receiver - ", receiver);
        console.log("Receiver id " + receiver + " ja booking id " + bookingId);
        socket.to(room).emit('handle-pro-confirm-map-client', {ei: eventId, bId: bookingId, _providerId: providerId,  _offer: offer, _note: note})
    }) */

    socket.on(
        "pro-confirm-map-client",
        (
            receiver,
            bookingId,
            providerId,
            offer,
            note,
            eventId
        ) => {
            console.log(
                "📡 SERVER RECEIVED",
                eventId,
                Date.now()
            );

            const room = `user:${receiver}`;

            console.log(
                "🚨 BEFORE SERVER EMIT",
                eventId,
                room,
                Date.now()
            );

            socket.to(room).emit(
                "handle-pro-confirm-map-client",
                {
                    eventId,
                    bId: bookingId,
                    _providerId: providerId,
                    _offer: offer,
                    _note: note
                }
            );

            console.log(
                "✅ AFTER SERVER EMIT",
                eventId,
                Date.now()
            );
        }
    );








    

    /* socket.on('client remove map booking', (bookingId) => {

    }) */

    socket.on('pro-del-map-booking', (bookingId, receiver, note) => {
        console.log("##RECEIVER## " + receiver);
        console.log("Del map booking " + receiver + " " + bookingId);
        const room = `user:${receiver}`;
        socket.to(room).emit('handle-pro-del-map-booking', receiver, bookingId, note);
    })

    socket.on('client-del-map-booking', (receiver, bookingId, note) => {
        const room = `user:${receiver}`
        console.log("Remove map offer - id: " + bookingId + " to: " + receiver);
        console.log("NOTE -- ", note);
        socket.to(room).emit('handle-client-del-map-booking', receiver, bookingId, note);
    })

    socket.on('pro del client map order notification', (bookingId, receiver, note) => {
        const room = `user:${receiver}`
        console.log("Remove pro map client offer - id: " + bookingId + " to: " + receiver);
        socket.to(room).emit('on pro del client map order note', receiver, bookingId, note);
    })

    socket.on('on-confirmed-deal-notification', (bookingId, proId, clientId, notes) => {
        const room = `user:${clientId}`
        console.log("Is coming throw?");
        socket.to(room).emit('local-confirmed-deal-notification', bookingId, notes);
    })

    socket.on('on-client-del-public-booking-notification', async (receiver, bookingId, note) => {
        const room = `user:${receiver}`
        console.log("note content: " + note.content);
        socket.to(room).emit('local-handle-del-client-public-booking', bookingId, note);
    })

    // Same socket call without pro offers / no notification, only local delete pro booking
    socket.on('on-client-del-public-booking', (receiver, bookingId) => {
        const room = `user:${receiver}`
        console.log("Receiver: " + receiver);
        socket.to(room).emit('local-client-del-public-booking', bookingId);
    })

    socket.on('on-client-confirmed-deal-motification', (receiver, bookingId, notification) => {
        const room = `user:${receiver}`
        console.log("RECEIVER ID: " + receiver);
        socket.to(room).emit('local-handle-client-confirmed-deal', bookingId, notification);
    })

    // Chat
    socket.on('set-otheruser-local-room', (otheruserId, rooms) => {
        const room = `user:${otheruserId}`
        console.log("ROOM " + rooms.type);
        console.log("Other user id - ", otheruserId);
        socket.to(room).emit('update-other-user-local-room', rooms);

    })
    socket.on('send-message', (message) => {
        
        console.log("Chat test 1 " + message.text);
        socket.to('68f55189d68a61a40cf8dc36').to(socket.userId).emit("send-private-message", message);

    })

    socket.on('client-report', (receiverId, profession, distance) => {
        const room = `user:${receiverId}`
        console.log("Report receiver id - ", receiverId);
        socket.to(room).emit('handle-client-report', profession, distance);
    })


    /* Archieve */
    socket.on('booking-done', (bookingId, target) => {
        const room = `user:${target}`
        console.log("DONE - ", target);
        socket.to(room).emit('handle-booking-done', bookingId);
    })

    socket.on('archive-booking', (target, bookingId, pHistory) => {
        const room = `user:${target}`
        console.log("Target " + target);
        console.log("pHistory - ", pHistory);
        socket.to(room).emit('handle-archive-booking', bookingId, pHistory);
    })
}

module.exports = hs;
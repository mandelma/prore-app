
const Dialog = require('../models/messages');

const hs = (socket) => {
    socket.on("create booking multiple - pro", async(proIdArr, bookingId) => {
        console.log("Pro id arr length " + proIdArr.length);
        proIdArr.forEach(id => {
            console.log("Pro id is " + id)

            console.log("BOOKING " + bookingId)
            socket.to(id).to(socket.userId).emit("create booking mtp", id, bookingId, proIdArr);
        })
    })
    socket.on('on-pro-remove-public-offer', (bookingId, receiver) => {
        console.log("Receiver ++ " + receiver);
        socket.to(receiver).to(socket.userId).emit('handle-pro-remove-public-offer', bookingId)
    })
    // Provider created offer
    socket.on('client get offer', (addressee, clientID, offer) => {
            console.log("Offer to client " + offer.name);
            socket.to(addressee).emit('client use offer', clientID, offer);
    })

    socket.on('client-handle-offer', (sender, orderId, offerId) => {
        console.log("Sender - " + sender);
        socket.to(sender).to(socket.userId).emit('pro-handle-confirmed', {sender, orderId, offerId})
    })


    // See tuleb üle vaadata kas eksisteerib!!
    socket.on("client made request", (receiver, bookingId) => {
        console.log("Request: " + receiver + " - " + bookingId);
        socket.to(receiver).to(socket.userId).emit('handle client request', {bookingId});
    })

    socket.on('on client request confirm', (receiver, bookingId, providerId, offer) => {
        console.log("TEST")
        console.log("Receiver id " + receiver + " ja booking id " + bookingId);
        socket.to(receiver).emit('handle client request confirm', {receiver, bId: bookingId, _providerId: providerId,  _offer: offer})
    })

    socket.on('del client map booking', (bookingId, receiver, note) => {
        console.log("Del map booking " + receiver + " " + bookingId);
        socket.to(receiver).to(socket.userId).emit('handle client del map booking', receiver, bookingId, note);
    })
    socket.on('del pro-side map booking', (receiver, bookingId) => {
        console.log("Remove map offer - id: " + bookingId + " to: " + receiver);
        socket.to(receiver).to(socket.userId).emit('handle pro-side del map booking', receiver, bookingId);
    })
    socket.on('pro del client map order notification', (bookingId, receiver, note) => {
        console.log("Remove pro map client offer - id: " + bookingId + " to: " + receiver);
        socket.to(receiver).to(socket.userId).emit('on pro del client map order note', receiver, bookingId, note);
    })

    socket.on('on-confirmed-deal-notification', (bookingId, proId, clientId, notes) => {
        console.log("Is coming throw?");
        socket.to(clientId).to(socket.userId).emit('local-confirmed-deal-notification', bookingId, notes);
    })

    socket.on('on-client-del-public-booking-notification', async (receiver, bookingId, note) => {
        console.log("note content: " + note.content);
        socket.to(receiver).to(socket.userId).emit('local-handle-del-client-public-booking', bookingId, note);
    })
    // Same socket call without pro offers / no notification, only local delete pro booking
    socket.on('on-client-del-public-booking', (receiver, bookingId) => {
        console.log("Receiver: " + receiver);
        socket.to(receiver).to(socket.userId).emit('local-client-del-public-booking', bookingId);
    })

    socket.on('on-client-confirmed-deal-motification', (receiver, bookingId, notification) => {
        console.log("RECEIVER ID: " + receiver);
        socket.to(receiver).to(socket.userId).emit('local-handle-client-confirmed-deal', bookingId, notification);
    })

    // Chat
    socket.on('set-otheruser-local-room', (otheruserId, rooms) => {
        console.log("ROOM " + rooms.type);
        console.log("Other user id - ", otheruserId);
        socket.to(otheruserId).to(socket.userId).emit('update-other-user-local-room', rooms);

    })
    socket.on('send-message', (message) => {
        console.log("Chat test 1 " + message.text);
        socket.to('68f55189d68a61a40cf8dc36').to(socket.userId).emit("send-private-message", message);

    })

    socket.on('client-report', (receiverId, profession, distance) => {
        console.log("Report receiver id - ", receiverId);
        const report = `Etsitaan ammattilaista - ${profession} etäisyydeltä - ${distance}`;
        socket.to(receiverId).to(socket.userId).emit('handle-client-report', report);
    })


    /* socket.on('pro-confirm-client', (receiver, providerId) => {
        console.log("Receiver --- ", receiver);
        socket.to(receiver).emit('handle-pro-confirm-client', providerId);
    }) */

    /* Archieve */
    socket.on('booking-done', (bookingId, target) => {
        console.log("DONE - ", target);
        socket.to(target).emit('handle-booking-done', bookingId);
    })

    socket.on('archieve-booking', (target, bookingId, pHistory) => {
        console.log("Target " + target);
        console.log("pHistory - ", pHistory);
        socket.to(target).to(socket.userId).emit('handle-archieve-booking', bookingId, pHistory);
    })
}

module.exports = hs;
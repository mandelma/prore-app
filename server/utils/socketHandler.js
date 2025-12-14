
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
         socket.to(addressee).to(socket.userId).emit('client use offer', clientID, offer);
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

    socket.on('on client request confirm', (receiver, bookingId, offer) => {
        console.log("TEST")
        console.log("Receiver id " + receiver + " ja booking id " + bookingId);
        socket.to(receiver).to(socket.userId).emit('handle client request confirm', {receiver, bId: bookingId, _offer: offer})
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
}

module.exports = hs;
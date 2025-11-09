
 const hs = (socket) => {
    socket.on("create booking multiple - pro", async(proIdArr, bookingId) => {
        console.log("Pro id arr length " + proIdArr.length);
        proIdArr.forEach(id => {
            console.log("Pro id is " + id)

            console.log("BOOKING " + bookingId)
            socket.to(id).to(socket.userId).emit("create booking mtp", id, bookingId, proIdArr);
        })
    })
    socket.on('client get offer', (addressee, clientID, offer) => {
         console.log("Offer to client " + offer.name);
         socket.to(addressee).to(socket.userId).emit('client use offer', clientID, offer);
    })
    
    socket.on('client-handle-offer', (sender, orderId, offerId) => {
        console.log("Sender - " + sender);
        socket.to(sender).to(socket.userId).emit('pro-handle-confirmed', {sender, orderId, offerId})
    })
}

module.exports = hs;

 const hs = (socket) => {
    socket.on("create booking multiple - pro", async(proIdArr, bookingId) => {
        console.log("Pro id arr length " + proIdArr.length);
        proIdArr.forEach(id => {
            console.log("Pro id is " + id)

            console.log("BOOKING " + bookingId)
            socket.to(id).to(socket.userId).emit("create booking mtp", id, bookingId, proIdArr);
        })
    })
}

module.exports = hs;
export const notifyBookingProviders = ({
    socket,
    providerUserIds,
    bookingId
}) => {

    if (!providerUserIds.length) {
        return false;
    }

    console.log('[PW-029 SOCKET EMIT]', {
        connected: socket.connected,
        socketId: socket.id,
        providerUserIds,
        bookingId
    });

    socket.emit(
        "create-booking-multiple",
        providerUserIds,
        bookingId
    );

    return true;
};
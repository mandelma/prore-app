export const notifyBookingProviders = ({
    socket,
    providerUserIds,
    bookingId
}) => {

    if (!providerUserIds.length) {
        return false;
    }

    socket.emit(
        "create-booking-multiple",
        providerUserIds,
        bookingId
    );

    return true;
};
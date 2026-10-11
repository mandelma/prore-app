export const isProviderMatchingBooking = async (
    provider,
    booking,
    findDistance
) => {

    const bookingZone = Number(booking.zone);
    const providerRange = Number(provider.range);

    if (
        !Number.isFinite(bookingZone) ||
        !Number.isFinite(providerRange) ||
        bookingZone <= 0 ||
        providerRange <= 0
    ) {
        return false;
    }

    const origin = [
        booking.latitude,
        booking.longitude
    ];

    const destination = [
        provider.latitude,
        provider.longitude
    ];

    const distanceData = await findDistance(
        origin,
        destination
    );

    if (
        distanceData?.distance == null ||
        distanceData.distance === ""
    ) {
        return false;
    }

    const distance = Number(distanceData?.distance);

    if (!Number.isFinite(distance)) {
        return false;
    }

    return (
        distance <= bookingZone &&
        distance <= providerRange
    );
};
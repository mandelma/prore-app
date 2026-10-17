import {
    isProviderMatchingBooking
} from "./providerMatching";

export const distributeBooking = async ({
    booking,
    providers,
    currentUserId,
    findDistance,
    addProviderData
}) => {

    const providerUserIds = [];

    for (const provider of providers) {

        const providerUserId = String(
            provider.user?.id ?? provider.user?._id ?? ""
        );

        // Klient ei saada tellimust iseendale
        if (providerUserId === String(currentUserId)) {
            continue;
        }

        try {
            const matching = await isProviderMatchingBooking(
                provider,
                booking,
                findDistance
            );

            if (!matching) {
                continue;
            }

            await addProviderData(booking.id, {
                providerId: provider.id
            });

            providerUserIds.push(providerUserId);
        } catch (error) {
            console.error(
                `Booking distribution failed for provider ${provider.id}:`,
                error
            );
        }
        
    }

    return providerUserIds;
};
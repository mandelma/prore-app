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

    console.log('[PW-029 DISTRIBUTION START]', {
        bookingId: booking.id,
        profession: booking.professionCode,
        zone: booking.zone,
        providersCount: providers.length
    });

    for (const provider of providers) {

        const providerUserId = String(
            provider.user?.id ?? provider.user?._id ?? ""
        );

        console.log('[PW-029 PROVIDER]', {
            providerId: provider.id,
            providerUserId,
            professions: provider.profession,
            range: provider.range
        });

        if (!providerUserId) {
            console.warn(
                'Provider user ID missing:',
                provider.id
            );
            continue;
        }

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

            console.log('[PW-029 MATCHING]', {
                providerId: provider.id,
                matching
            });

            if (!matching) {
                console.log(
                    '[PW-029] Provider ei vasta tingimustele:',
                    provider.id
                );
                continue;
            }

            console.log(
                '[PW-029] Adding provider to booking:',
                {
                    bookingId: booking.id,
                    providerId: provider.id
                }
            );

            await addProviderData(booking.id, {
                providerId: provider.id
            });

            providerUserIds.push(providerUserId);

            console.log(
                '[PW-029] Provider added successfully:',
                provider.id
            );

        } catch (error) {
            console.error(
                `Booking distribution failed for provider ${provider.id}:`,
                error
            );
        }
    }

    console.log('[PW-029 DISTRIBUTION RESULT]', {
        bookingId: booking.id,
        providerUserIds
    });

    return providerUserIds;
};
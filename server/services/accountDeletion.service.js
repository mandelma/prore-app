const Recipient = require("../models/recipients");

const BLOCKING_STATUSES = [
    "confirmed",
    "done"
];

const checkActiveBookings = async (userId) => {
    const id = String(userId);

    const [
        activeClientBookings,
        activeProviderBookings
    ] = await Promise.all([
        // Kasutaja kui klient
        Recipient.find({
            author_id: id,
            status: {
                $in: BLOCKING_STATUSES
            }
        }).select("_id header status"),

        // Kasutaja kui teenusepakkuja
        Recipient.find({
            confirmed_provider_user_id: id,
            status: {
                $in: BLOCKING_STATUSES
            }
        }).select("_id header status")
    ]);

    return {
        canDelete:
            activeClientBookings.length === 0 &&
            activeProviderBookings.length === 0,

        activeClientBookings,
        activeProviderBookings
    };
};

module.exports = {
    checkActiveBookings
};
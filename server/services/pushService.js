import webpush from "web-push";

webpush.setVapidDetails(
    "mailto:mandlimarko@gmail.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

export const sendPushToUser = async (user, payload) => {
    if (!user?.pushSubscriptions?.length) {
        return;
    }

    for (const subscription of user.pushSubscriptions) {
        try {
            await webpush.sendNotification(
                subscription,
                JSON.stringify(payload)
            );
        } catch (error) {
            console.error(
                "Push notification failed:",
                error.statusCode,
                error.message
            );
        }
    }
};
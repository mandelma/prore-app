const webpush = require("web-push")

webpush.setVapidDetails(
    "mailto:mandlimarko@gmail.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

const sendPushToUser__ = async (user, payload) => {
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

const sendPushToUser = async (
  user,
  payload
) => {
  if (!user?.pushSubscriptions?.length) {
    return;
  }

  const deadEndpoints = [];

  for (
    const subscription
    of user.pushSubscriptions
  ) {
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

      /*
       * 404 / 410 =
       * subscription pole enam kasutatav.
       */
      if (
        error.statusCode === 404 ||
        error.statusCode === 410
      ) {
        deadEndpoints.push(
          subscription.endpoint
        );
      }
    }
  }

  /*
   * Eemalda surnud subscription'id.
   */
  if (deadEndpoints.length > 0) {
    user.pushSubscriptions =
      user.pushSubscriptions.filter(
        subscription =>
          !deadEndpoints.includes(
            subscription.endpoint
          )
      );

    await user.save();

    console.log(
      "Removed dead push subscriptions:",
      deadEndpoints.length
    );
  }
};


module.exports = {
    sendPushToUser
};
const mongoose = require("mongoose");

const Provider =
  require("../models/providers");

const Recipient =
  require("../models/recipients");

const { Conversation } =
  require("../models/chat");

const Notification =
  require("../models/notifications");


const getChatUnreadCount =
  async userId => {

    const userObjectId =
      new mongoose.Types.ObjectId(userId);

    const conversations =
      await Conversation.find({
        participantIds: userObjectId
      })
        .select("unread")
        .lean();

    return conversations.reduce(
      (total, conversation) => {
        return (
          total +
          Number(
            conversation.unread?.[userId] ??
            0
          )
        );
      },
      0
    );
  };


const getNotificationUnreadCount =
  async userId => {

    return Notification.countDocuments({
      receiver: userId,
      isNewMsg: true
    });
  };


const getProviderBookingUnreadCount =
  async userId => {

    const provider =
      await Provider.findOne({
        personId: userId
      })
        .select("_id proposal")
        .lean();

    if (!provider) {
      return 0;
    }

    return Recipient.countDocuments({
      _id: {
        $in: provider.proposal
      },

      status: "active",

      created_ms: {
        $gt: Date.now()
      },

      visitors: {
        $nin: [provider._id]
      }
    });
};

const getUserBadgeCount =
  async userId => {

    const [
      chatUnread,
      notificationUnread,
      providerBookingUnread
    ] = await Promise.all([
      getChatUnreadCount(userId),
      getNotificationUnreadCount(userId),
      getProviderBookingUnreadCount(userId)
    ]);

    const total =
      chatUnread +
      notificationUnread +
      providerBookingUnread;

    console.log(
      "BADGE COUNT:",
      {
        userId,
        chatUnread,
        notificationUnread,
        providerBookingUnread,
        total
      }
    );

    return {
      chatUnread,
      notificationUnread,
      providerBookingUnread,
      total
    };
  };


module.exports = getUserBadgeCount;
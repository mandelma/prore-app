const express = require("express");
const mongoose = require("mongoose");
const { Conversation, Message } = require("../models/chat");

const router = express.Router();

function dmKey(a, b) {
  const [x, y] = [String(a), String(b)].sort();
  return `${x}_${y}`;
}

async function getOrCreateDM(meId, otherId) {
  const me = new mongoose.Types.ObjectId(meId);
  const other = new mongoose.Types.ObjectId(otherId);

  const key = dmKey(me, other);
  const participantIds = [me, other].sort((p, q) => String(p).localeCompare(String(q)));
  const now = new Date();

  const convo = await Conversation.findOneAndUpdate(
    { participantKey: key },
    {
      $setOnInsert: {
        type: "dm",
        participantKey: key,
        participantIds,
        unread: { [String(me)]: 0, [String(other)]: 0 },
        createdAt: now,
        //updatedAt: now,
      },
      $set: { updatedAt: now },
    },
    { upsert: true, new: true }
  );

  return convo;
}

// GET my conversations (chat list)
router.get("/conversations", async (req, res) => {
  const me = new mongoose.Types.ObjectId(req.user.id);

  const items = await Conversation.find({ participantIds: me })
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .limit(50)
    .lean();

  res.json(items);
});

// POST get/create DM with other user
router.post("/conversations/dm/:otherUserId", async (req, res) => {
  const convo = await getOrCreateDM(req.user.id, req.params.otherUserId);
  res.json(convo);
});

// GET messages (cursor pagination)
router.get("/conversations/:conversationId/messages", async (req, res) => {
  const conversationId = new mongoose.Types.ObjectId(req.params.conversationId);
  const limit = Math.min(parseInt(req.query.limit ?? "30", 10), 100);
  const before = req.query.before ? new Date(req.query.before) : null;

  const q = { conversationId };
  if (before) q.createdAt = { $lt: before };

  const items = await Message.find(q).sort({ createdAt: -1 }).limit(limit).lean();
  items.reverse(); // UI wants oldest->newest

  const nextCursor = items.length ? items[0].createdAt.toISOString() : null;
  res.json({ items, nextCursor });
});

// POST send message
router.post("/conversations/:conversationId/messages", async (req, res) => {
  const me = String(req.user.id);
  const conversationId = new mongoose.Types.ObjectId(req.params.conversationId);
  const { text = "", attachments = [] } = req.body;

  const convo = await Conversation.findById(conversationId).lean();
  if (!convo) return res.status(404).json({ error: "Conversation not found" });

  const isParticipant = convo.participantIds.some((id) => String(id) === me);
  if (!isParticipant) return res.status(403).json({ error: "Not allowed" });

  const now = new Date();
  const msg = await Message.create({
    conversationId,
    senderId: new mongoose.Types.ObjectId(me),
    text,
    attachments,
    createdAt: now,
    updatedAt: now,
  });

  const otherId = convo.participantIds.find((id) => String(id) !== me);
  const otherKey = String(otherId);

  await Conversation.updateOne(
    { _id: conversationId },
    {
      $set: {
        updatedAt: now,
        lastMessageAt: now,
        lastMessageText: text || (attachments.length ? "Attachment" : ""),
        lastMessageSenderId: new mongoose.Types.ObjectId(me),
      },
      $inc: { [`unread.${otherKey}`]: 1 },
    }
  );

  res.json(msg);
});

// POST mark read (reset my unread counter)
router.post("/conversations/:conversationId/read", async (req, res) => {
  const me = String(req.user.id);
  const conversationId = new mongoose.Types.ObjectId(req.params.conversationId);

  await Conversation.updateOne({ _id: conversationId }, { $set: { [`unread.${me}`]: 0 } });
  res.json({ ok: true });
});

module.exports = router;

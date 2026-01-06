import { defineStore, storeToRefs } from "pinia";
import { ref, computed } from "vue";
import { useLoginStore } from "./login";
import {chatService} from "@/service/chat";
import userService from "@/service/users";
import socket from "@/socket";

export const useConversationStore = defineStore("conversation", () => {
  const userAuth = useLoginStore();
  const { user } = storeToRefs(userAuth);
  const otherChatUsers = ref({});
  const openChat = ref(false);

  const conversations = ref([]);             // list of conversation summaries
  const activeConversationId = ref(null);    // selected conversation
  const messagesById = ref({});              // { [convoId]: Message[] }

  const me_id = computed(() => String(user.value?.id ?? user.value?._id ?? ""));

  const activeConversation = computed(
    () => conversations.value.find(c => String(c._id) === String(activeConversationId.value)) || null
  );

  const activeMessages = computed(() => {
    const id = activeConversationId.value;
    return id ? (messagesById.value[id] || []) : [];
  });

  // Total unread for badge
  const totalUnread = computed(() =>
    conversations.value.reduce((sum, c) => {
      const myUnread = c.unread?.[me_id.value] || 0;
      return sum + myUnread;
    }, 0)
  );

  const openChatWidget = () => { openChat.value = true; };

  const closeChatWidget = () => { openChat.value = false; activeConversationId.value = null;};

  // ---- API: list conversations
  const getConversations_xxx = async () => {
    conversations.value = await chatService.listConversations();
    // fetch missing user data only once
    for (const convo of conversations.value) {
      const otherId = convo.participantIds.find(id => id !== me_id.value);

       if (otherId && !otherChatUsers.value[otherId]) {
      const user = await userService.getUser(otherId);
      // Stored by ID
      otherChatUsers.value[otherId] = user;
    }
    }
  };

  const ensureOtherUserLoaded = async (convo) => {
    const myId = me_id.value;
    if (!convo?.participantIds) return;

    const otherId = String(
      convo.participantIds.find(id => String(id) !== myId)
    );

    if (!otherId) return;
    if (otherChatUsers.value[otherId]) return; // already cached

    try {
      const user = await userService.getUser(otherId);
      otherChatUsers.value[otherId] = user;
    } catch (e) {
      console.error("[conversationStore] getUser failed for", otherId, e);
    }
  };

  const getConversations = async () => {
    try {
      console.log("[conversationStore] getConversations called");

      const data = await chatService.listConversations();
      console.log("[conversationStore] API result:", data);

      // ensure we always set an array, even if backend wraps it
      conversations.value = Array.isArray(data)
        ? data
        : (Array.isArray(data.items) ? data.items : []);

      console.log(
        "[conversationStore] conversations.length =",
        conversations.value.length
      );

      // fetch missing user data only once

      await Promise.all(
        conversations.value.map(convo => ensureOtherUserLoaded(convo))
      );
    
     /*  const myId = me_id.value;
      for (const convo of conversations.value) {
        const otherId = String(
          convo.participantIds.find(id => String(id) !== myId)
        );

        if (otherId && !otherChatUsers.value[otherId]) {
          try {
            const user = await userService.getUser(otherId);
            otherChatUsers.value[otherId] = user;
            
          } catch (e) {
            console.error(
              "[conversationStore] getUser failed for",
              otherId,
              e
            );
          }
        }
      } */

    } catch (e) {
      console.error("[conversationStore] getConversations FAILED:", e);
      conversations.value = [];
    }
  };

  // ---- Select a conversation (join socket room + load messages)
  const selectConversation = async (convoId) => {
    activeConversationId.value = convoId;
    

    socket.emit("join-conversation", { conversationId: convoId });

    // mark read (optional)
    try { await chatService.markRead(convoId); } catch {}

    // load messages if not loaded
    if (!messagesById.value[convoId]) {
      const msgs = await chatService.listMessages(convoId);
      messagesById.value = { ...messagesById.value, [convoId]: msgs.items };
    }

    // set unread to 0 locally
    const meId = me_id.value; //String(user.value?.id ?? user.value?._id ?? "");
    conversations.value = conversations.value.map(c => {
      if (String(c._id) !== String(convoId)) return c;
      return {
        ...c,
        unread: { ...(c.unread || {}), [meId]: 0 }
      };
    });
    
  };

  // ---- Create or get DM, then select it
  const openCreateRoom = async (otherUserId) => {

    const res = await chatService.openDM(otherUserId); // could be convo or { conversation: ... }
    console.log("openDM raw res:", res);

    const conversation = res.conversation ?? res; // unwrap if needed

    console.log("openDM conversation:", conversation);
    console.log("openDM keys:", conversation && Object.keys(conversation));


    const convoId = conversation._id ?? conversation.id;


    console.log("openDM conversation:", conversation);
    console.log("CONVO ID:", convoId);

    if (!convoId) throw new Error("openDM did not return conversation id");

    ensureOtherUserLoaded(conversation);

    socket.emit('upsert-convo', otherUserId, conversation);

    upsertConversation(conversation);
    await selectConversation(convoId);
  };

  // ---- Local add message + update conversation preview list
  const addMessageLocal = (message) => {
    const convoId = String(message.conversationId);
    const current = messagesById.value?.[convoId];
    const existing = Array.isArray(current) ? current : [];

    messagesById.value = {
      ...messagesById.value,
      [convoId]: [...existing, message],
    };

    bumpConversationOnMessage(message);
  };

  // ---- Helpers
  const upsertConversation = (convo) => {
   
    const id = String(convo._id ?? convo.id);
    const idx = conversations.value.findIndex(
      c => String(c._id ?? c.id) === id
    );

    const myId = me_id.value; // computed: String(user.id || user._id || "")

    if (idx === -1) {
      conversations.value = [convo, ...conversations.value];
    } else {
      const existing = conversations.value[idx];

      // start from server unread
      let mergedUnread = convo.unread || existing.unread || {};

      // 🔑 if this is the active conversation, keep our local unread for me
      if (String(activeConversationId.value) === id) {
        mergedUnread = {
          ...mergedUnread,
          [myId]: existing.unread?.[myId] ?? 0,
        };
      }

      const copy = conversations.value.slice();
      copy[idx] = {
        ...existing,
        ...convo,
        unread: mergedUnread,
      };
      conversations.value = copy;
    }
  };

  const bumpConversationOnMessage = (message) => {
    const convoId = String(message.conversationId);
    const meId = me_id.value;

    conversations.value = conversations.value
      .map(c => {
        if (String(c._id) !== convoId) return c;

        // if message received and not active, increment unread for me
        const isActive = String(activeConversationId.value) === convoId;
        const isFromMe = String(message.senderId) === meId;

        const unread = { ...(c.unread || {}) };
        if (!isFromMe && !isActive) unread[meId] = (unread[meId] || 0) + 1;
        if (!isFromMe && isActive) unread[meId] = 0;

        return {
          ...c,
          lastMessage: { text: message.text, createdAt: message.createdAt },
          lastMessageAt: message.createdAt,
          updatedAt: message.createdAt,
          unread,
        };
      })
      // move this conversation to top
      .sort((a, b) => new Date(b.lastMessageAt || b.updatedAt) - new Date(a.lastMessageAt || a.updatedAt));
  };

  // ---- Socket listeners (call this once from App.vue after login)
  const initSocket = () => {
    socket.on("conversation-upsert", (convo) => {
      console.log("UPSERT???")
      upsertConversation(convo);
      ensureOtherUserLoaded(convo);
    });

    socket.on("message:new", (message) => {
      addMessageLocal(message);
    });

    socket.on("conversation:list:refresh", async () => {
      await getConversations();
    });
  };

  return {
    me_id,
    openChat,
    conversations,
    activeConversationId,
    activeConversation,
    messagesById,
    activeMessages,
    otherChatUsers,
    totalUnread,
    openChatWidget,
    closeChatWidget,
    getConversations,
    selectConversation,
    openCreateRoom,
    upsertConversation,
    addMessageLocal,
    initSocket,
  };
});
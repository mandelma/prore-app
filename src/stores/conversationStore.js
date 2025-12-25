import { defineStore, storeToRefs } from "pinia";
import { ref, computed } from "vue";
import { useLoginStore } from "./login";
import {chatService} from "@/service/chat";
import socket from "@/socket";

export const useConversationStore = defineStore("conversation", () => {
  const userAuth = useLoginStore();
  const { user } = storeToRefs(userAuth);

  const openChat = ref(false);

  const conversations = ref([]);             // list of conversation summaries
  const activeConversationId = ref(null);    // selected conversation
  const messagesById = ref({});              // { [convoId]: Message[] }

  const activeConversation = computed(
    () => conversations.value.find(c => String(c._id) === String(activeConversationId.value)) || null
  );

  const activeMessages = computed(() => {
    const id = activeConversationId.value;
    return id ? (messagesById.value[id] || []) : [];
  });

  const openChatWidget = () => { openChat.value = true; };

  const closeChatWidget = () => { openChat.value = false};

  // ---- API: list conversations
  const getConversations = async () => {
    conversations.value = await chatService.listConversations();
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
      messagesById.value = { ...messagesById.value, [convoId]: msgs };
    }

    // set unread to 0 locally
    const meId = String(user.value?.id ?? user.value?._id ?? "");
    conversations.value = conversations.value.map(c => {
      if (String(c._id) !== String(convoId)) return c;
      return {
        ...c,
        unread: { ...(c.unread || {}), [meId]: 0 }
      };
    });
    //openChat.value = true;
  };

  // ---- Create or get DM, then select it
  const openCreateRoom = async (otherUserId) => {

    const res = await chatService.openDM(otherUserId); // could be convo or { conversation: ... }

    const conversation = res.conversation ?? res; // unwrap if needed
    const convoId = conversation._id ?? conversation.id;

    console.log("openDM conversation:", conversation);
    console.log("CONVO ID:", convoId);

    if (!convoId) throw new Error("openDM did not return conversation id");

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

    if (idx === -1) {
      conversations.value = [convo, ...conversations.value];
    } else {
      const copy = conversations.value.slice();
      copy[idx] = { ...copy[idx], ...convo };
      conversations.value = copy;
    }
  };

  const bumpConversationOnMessage = (message) => {
    const convoId = String(message.conversationId);
    const meId = String(user.value.id);

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
      upsertConversation(convo);
    });

    socket.on("message:new", (message) => {
      addMessageLocal(message);
    });

    socket.on("conversation:list:refresh", async () => {
      await getConversations();
    });
  };

  return {
    openChat,
    conversations,
    activeConversationId,
    activeConversation,
    activeMessages,
    openChatWidget,
    closeChatWidget,
    getConversations,
    selectConversation,
    openCreateRoom,

    addMessageLocal,
    initSocket,
  };
});
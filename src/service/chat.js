//import axios from "axios";

import { chatApi } from '@/service/api'

/* const api = axios.create({
  baseURL: "/api/chat",
  // headers: { Authorization: `Bearer ${token}` } // if using JWT
});
 */
export const chatService = {
  async listConversations() {
    const { data } = await chatApi.get("/conversations");
    return data;
  },

  async openDM (otheruserId) {
    const { data } = await chatApi.post(`/conversations/dm/${otheruserId}`);
    return data;
  },

  listMessages(conversationId, { limit = 30, before } = {}) {
    const params = { limit };
    if (before) params.before = before;
    return chatApi.get(`/conversations/${conversationId}/messages`, { params }).then((r) => r.data);
  },

  sendMessage(conversationId, payload) {
    return chatApi.post(`/conversations/${conversationId}/messages`, payload).then((r) => r.data);
  },

  markRead(conversationId) {
    return chatApi.post(`/conversations/${conversationId}/read`).then((r) => r.data);
  },
};

import { chatApi } from '@/service/api'


export const chatService = {
  async listConversations() {
    const { data } = await chatApi.get("/conversations");
    return data;
  },

  async openDM (otheruserId, content) {
    const { data } = await chatApi.post(`/conversations/dm/${otheruserId}`, content);
    return data;
  },

  async listMessages (conversationId, { limit = 30, before } = {}) {
    const params = { limit };
    if (before) params.before = before;
    const { data } = await chatApi.get(`/conversations/${conversationId}/messages`, { params });
    return data;
  },

  /* async sendMessage_ (conversationId, payload) {
    const { data } = await chatApi.post(`/conversations/${conversationId}/messages`, payload);
    return data;
  }, */

  async sendMessage(conversationId, payload) {
    const { data } = await chatApi.post(
      `/conversations/${conversationId}/messages`,
      payload
    );

    return data;
  },

  /* sendMessage(conversationId, payload) {
    return chatApi.post(`/conversations/${conversationId}/messages`, payload).then((r) => r.data);
  }, */

  async markRead (conversationId) {
    const { data } = await chatApi.post(`/conversations/${conversationId}/read`);
    return data;
  },

  async setConvoState (conversationId, otherUserId, state) {
    const { data } = await chatApi.put(`/conversations/localState/${conversationId}/${otherUserId}`, state );
    return data;
  }
};
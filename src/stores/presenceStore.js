import { defineStore, storeToRefs } from "pinia";
import { ref } from 'vue';
import socket from "@/socket";

export const usePresenceStore = defineStore("presence", () => {
  const onlineUsers = ref(new Set());

  const isOnline = (userId) => onlineUsers.value.has(String(userId));

  const initPresenceSocket = (socket) => {
    socket.on("online:list", (list) => {
      onlineUsers.value = new Set(list.map(String));
    });

    socket.on("user:online", (userId) => {
      onlineUsers.value.add(String(userId));
    });

    socket.on("user:offline", (userId) => {
      onlineUsers.value.delete(String(userId));
    });
  };

  return { onlineUsers, isOnline, initPresenceSocket };
});
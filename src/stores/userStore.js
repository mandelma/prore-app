import { defineStore } from "pinia";
import { ref } from 'vue';
import { userApi } from '../service/api';
import { useLoginStore } from "./login";

export const useUserStore = defineStore("user", () => {
  const login = useLoginStore();
  const profile = ref(null); // { firstName, lastName, email, avatar, ... }

  const fetchMe = async () => {
    if (!login.user?.token) return;
    const { data } = await userApi.get("/me");   // uses auth header
    profile.value = data;
    
  };

  const updateMe = async (payload) => {
    const { data } = await userApi.patch("/me", payload);
    if ( data?.error !== 'email existing') {
      profile.value = data;                    // update UI instantly
    }
    
    return data;
  };

  return { profile, fetchMe, updateMe };
});

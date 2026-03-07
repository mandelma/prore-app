import { defineStore } from "pinia";
import { ref } from 'vue';
import { userApi } from '../service/api';
import userService from '../service/awsUploads'
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
      profile.value = data;                  // update UI instantly
    }
    
    return data;
  };

  const uploadAvatar = async(avatar) => {
    const data = new FormData();
    data.append('file', avatar);
    console.log("User id is " + profile.value?.id);
    console.log("Uploaded avatar ", data);
    const userId = profile.value?.id;
    const avatar_uploaded = await userService.uploadAvatarImage(userId, data);

    if (avatar_uploaded) {
      profile.value = {
        ...profile.value,
        avatar: {isImage: true, imageUrl: avatar_uploaded.imageUrl, key: avatar_uploaded.key}
      };
    }
    
    return avatar_uploaded;
  }

  const editAvatar = async (avatar) => {
    const userId = profile.value?.id;
    const oldKey = profile.value?.avatar?.key;
    const fd = new FormData();
    fd.append('file', avatar);
    fd.append('oldKey', oldKey);
    console.log("Avatar old image key - ", profile.value?.avatar?.key);
    console.log("FormData file:", fd.get("file"));

    const updatedAvatar = await userService.editAvatarImage(userId, fd);
    if (updatedAvatar) {
      profile.value = {
        ...profile.value,
        avatar: { isImage: true, imageUrl: updatedAvatar.imageUrl, key: updatedAvatar.key }
      };
    }
    return updatedAvatar;
  }

  const deleteAvatar = async () => {
    const userId = profile.value?.id;
    const key = profile.value?.avatar?.key;
    console.log("Remove key - " + key);

    const removedAvatar = await userService.deleteAvatar(userId, {key: key});
    profile.value = {
      ...profile.value,
      avatar: { isImage: false, name: "avatar.png" }
    };
    return removedAvatar;
  }

  return { profile, fetchMe, updateMe, uploadAvatar, editAvatar, deleteAvatar };
});

<template>
  <MDBContainer class="profile-page">
    <ToastHandler
      v-model="toastModel"
      :toast-name="toastState"
      :icon-state="toastIcon"
      :text="toastContent"
    />

    <MDBRow class="g-4">
      <MDBCol lg="4">
        <div class="form-card avatar-card">
          <MDBCard class="p-3">
            <MDBRow class="align-items-center g-3">
              <MDBCol lg="12" class="d-flex justify-content-center">
                <div class="avatar-wrap">
                  <img
                    :src="avatarSrc"
                    class="avatar-img"
                    :alt="t('profile.avatarAlt')"
                  />
                </div>
              </MDBCol>

              <MDBCol>
                <div class="d-flex flex-column">
                  <div class="fw-bold">
                    {{ t("profile.avatar") }}
                  </div>

                  <small class="text-muted">
                    {{ t("profile.avatarDescription") }}
                  </small>

                  <div class="avatar-actions">
                    <MDBBtn
                      v-if="!hasCustomAvatar"
                      color="primary"
                      @click="openAvatarPicker"
                    >
                      {{ t("profile.addAvatar") }}
                    </MDBBtn>

                    <MDBBtn
                      v-else
                      color="primary"
                      @click="openAvatarEditPicker"
                    >
                      {{ t("profile.editAvatar") }}
                    </MDBBtn>

                    <button
                      v-if="hasCustomAvatar"
                      type="button"
                      class="remove-avatar-button"
                      @click="removeAvatar"
                    >
                      {{ t("profile.removeAvatar") }}
                    </button>
                  </div>

                  <input
                    ref="avatarInput"
                    class="sr-only"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    @change="onAvatarSelected"
                  />

                  <input
                    ref="avatarEditInput"
                    class="sr-only"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    @change="onAvatarEditSelected"
                  />
                </div>
              </MDBCol>
            </MDBRow>
          </MDBCard>
        </div>
      </MDBCol>

      <MDBCol lg="8">
        <div class="form-card profile-data-card">
          <MDBBtnClose
            v-if="!isPressedEditProfile"
            white
            class="profile-close"
            :aria-label="t('profile.close')"
            @click="router.back()"
          />

          <MDBTable
            v-if="!isPressedEditProfile"
            borderless
            class="profile-table"
          >
            <tbody>
              <tr>
                <td>{{ t("profile.name") }}:</td>
                <td>{{ fullName }}</td>
              </tr>

              <tr>
                <td>{{ t("profile.username") }}:</td>
                <td>@{{ profile.username }}</td>
              </tr>

              <tr v-if="isUserPro && provider">
                <td>{{ t("profile.address") }}:</td>
                <td class="profile-value">
                  {{ provider?.address || "—" }}
                </td>
              </tr>

              <tr>
                <td>{{ t("profile.email") }}:</td>
                <td class="profile-value">
                  {{ profile.email || "—" }}
                </td>
              </tr>

              <tr>
                <td colspan="2">
                  <MDBBtn
                    block
                    size="md"
                    outline="success"
                    @click="openEditProfile"
                  >
                    {{ t("profile.editDetails") }}
                  </MDBBtn>
                </td>
              </tr>
            </tbody>
          </MDBTable>

          <EditProfile
            v-else
            @close-edit-profile="closeEditProfile"
            @save:profile="handleSaveProfile"
          />
        </div>
      </MDBCol>
    </MDBRow>
  </MDBContainer>
</template>
<script setup>
  import {
      MDBContainer,
      MDBTable,
      MDBInput,
      MDBBtn,
      MDBRow,
      MDBCol,
      MDBIcon,
      MDBBtnClose
  //MDBInput
  } from "mdb-vue-ui-kit";
  import { ref, onMounted, computed, onBeforeUnmount, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { useI18n } from "vue-i18n";
  import { storeToRefs } from "pinia";
  import ToastHandler from "./helpers/ToastHandler.vue";
  //import { loadGoogleMaps } from "./controllers/loadGoogleMap";
  import avatarFallback from '@/assets/avatar-50.png'
  import { useLoginStore } from "@/stores/login";
  import { useUserStore } from "@/stores/userStore";
  import { useProStore } from "@/stores/providerStore";

  import EditProfile from "./EditProfile.vue";

  import userService from '../service/users';

  defineOptions({
      name: 'profile'
  })

  const auth = useLoginStore();
  const userStore = useUserStore();
  const proStore = useProStore();
  const { t } = useI18n();
  const { user, credentials } = storeToRefs(auth);
  const { profile } = storeToRefs(userStore);
  const { isUserPro, provider } = storeToRefs(proStore);
  
  const router = useRouter();
  //const _avatar = avatar;

  const MAX_AVATAR_SIZE = 1_000_000;

  const ACCEPTED_AVATAR_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
];

  const avatarInput = ref(null);
  const avatarEditInput = ref(null);
  const localPreviewUrl = ref("");

  const hasCustomAvatar = computed(() => !!profile.value?.avatar?.isImage);

  const avatarSrc = computed(() => {
    //if (!profile.value.avatar.imageUrl) return;
    // 1) immediate local preview after selecting file
    if (localPreviewUrl.value) return localPreviewUrl.value;

    console.log("avatar snapshot", JSON.parse(JSON.stringify(profile.value?.avatar || null)));
    console.log("imageUrl snapshot", profile.value?.avatar?.imageUrl);
    // 2) if you store a real URL/path for uploaded image, use it
    const url = profile.value?.avatar?.imageUrl || profile.value?.avatar?.path;
    if (hasCustomAvatar.value && url) return url;
    console.log("Profile avatar url " + url);
    // 3) otherwise fallback to assets avatar
    return avatarFallback;
  });

  

  const isOpenSetAvatar = ref(false);
  //isOpenAdd: false,
  const isOpenEdit = ref(false);
  //user: null,
  const userData = ref(null);
  const isPressedEditProfile = ref(false);
  const isAddProfileImage = ref(false);
  const isEditProfileImage = ref(false);
  const isEditAddress = ref(false);
  const pro = ref(null) ;
  const client = ref([]);
  const newEmail = ref("");
  
  
  const newAddress = ref("");

  // Toasts
  const toastModel = ref(false)
  const toastState = ref('')
  const toastIcon = ref('')
  const toastContent = ref('')
  
  
  const showImage = ref(null);
  //value: null,
  const file = ref(null);
  const isProfileImageSelected = ref(false);
  const isUploaded = ref(false);
  const user_profile_image = ref([]);
  //avatar: {name: "avatar.png", image: ""} ,
  const image_id = ref(null);

  


  const fileSizeError = ref(null);
  const fileTypeError = ref(null);
  const emailErrorMessage = ref(null);

  onMounted(() => {
    //console.log("--- ", isUserPro.value ? provider.value.address : "")
    
  })

  const fullName = computed(() =>
  [
    profile.value?.firstName,
    profile.value?.lastName
  ]
    .filter(Boolean)
    .join(" ")
);

  function openAvatarPicker() {
    avatarInput.value?.click();
  }

  const openAvatarEditPicker = () => {
    avatarEditInput.value?.click();
  } 

  const validateAvatarFile = file => {
    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      showToast(
        "danger",
        "fas fa-exclamation-circle fa-lg me-2",
        "profile.invalidImageType"
      );

      return false;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      showToast(
        "danger",
        "fas fa-exclamation-circle fa-lg me-2",
        "profile.imageTooLarge"
      );

      return false;
    }

    return true;
  };

  async function onAvatarSelectedx(e) {
    const input = e.target;
    const file = input.files && input.files[0];
    if (!file) return;

    // create/replace local preview
    if (localPreviewUrl.value) URL.revokeObjectURL(localPreviewUrl.value);
    localPreviewUrl.value = URL.createObjectURL(file);

    try {
      // Upload via API/store here.
      // After success set user.avatar = { isImage:true, url:'...', name:file.name }

      const uploadAvatar = await userStore.uploadAvatar(file);
      console.log("Avatar is uploaded? - ", uploadAvatar);
      //emit("avatar-uploaded", file);

    } finally {
      // allow selecting same file again
      input.value = "";
    }
  }

  const onAvatarEditSelected_prev = async (e) => {
    const input = e.target;
    const file = input.files && input.files[0];
    if (!file) return;

    // create/replace local preview
    if (localPreviewUrl.value) URL.revokeObjectURL(localPreviewUrl.value);
    localPreviewUrl.value = URL.createObjectURL(file);

    try {

      const editAvatar = await userStore.editAvatar(file);
      console.log("Avatar is uploaded? - ", editAvatar);

    } finally {
      // allow selecting same file again
      input.value = "";
    }
  }

  const onAvatarEditSelected = async event => {
    const input = event.target;
    const selectedFile = input.files?.[0];

    if (!selectedFile) return;

    if (!validateAvatarFile(selectedFile)) {
      input.value = "";
      return;
    }

    if (localPreviewUrl.value) {
      URL.revokeObjectURL(localPreviewUrl.value);
    }

    localPreviewUrl.value =
      URL.createObjectURL(selectedFile);

    try {
      await userStore.editAvatar(selectedFile);
    } finally {
      input.value = "";
    }
  };

  const onAvatarSelected = async (event) => {
    const input = event.target;
    const selectedFile = input.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!validateAvatarFile(selectedFile)) {
      input.value = "";
      return;
    }

    if (localPreviewUrl.value) {
      URL.revokeObjectURL(localPreviewUrl.value);
    }

    localPreviewUrl.value =
      URL.createObjectURL(selectedFile);

    try {
      await userStore.uploadAvatar(selectedFile);
    } catch (error) {
      localPreviewUrl.value = "";

      showToast(
        "danger",
        "fas fa-exclamation-circle fa-lg me-2",
        "profile.avatarUploadFailed"
      );
    } finally {
      input.value = "";
    }
  }

  async function removeAvatar() {
    // Delete via API/store here.
    // After success set user.avatar = { isImage:false, name:'avatar.png' }
    if (localPreviewUrl.value) {
      URL.revokeObjectURL(localPreviewUrl.value);
      localPreviewUrl.value = "";
    }

    const delAvatar = await userStore.deleteAvatar();
    console.log("Avatar deleted?? ", delAvatar);
    //emit("avatar-removed");
  }

  onBeforeUnmount(() => {
    if (localPreviewUrl.value) URL.revokeObjectURL(localPreviewUrl.value);
  });

  const openEditProfile = () => {
    isPressedEditProfile.value = true;
  }
  const closeEditProfile = () => {
    isPressedEditProfile.value = false;
  }

  const handleSaveProfile_prev = async (newData) => {
    console.log("New profile data: ", newData);

    let existError = false;
    let localState = {
      email: "",
      address: ""
    }
    if (newData.address) {
      console.log("Address is set");
    }

    if (newData.email) {
      console.log("Email is set " + newData.email);

      const updated = await userStore.updateMe({email: newData.email});

      if (updated?.error === "email existing") {
        console.log("Email existing!");
        existError = true;

        toastState.value = 'danger'
        toastIcon.value = 'fas fa-exclamation-circle fa-lg me-2'
        toastContent.value = t("profile.emailAlreadyInUse");
        toastModel.value = true
      } else {
        localState = {
          ...localState,
          email: newData.email
        }
        
      }

    }

    if (newData.address) {
      console.log("Address under edit.");
      const edited = await proStore.updateAddress({address: newData.address});
      console.log("In profile - ", edited);
      if (edited) {
        localState = {
          ...localState,
          address: newData.address
        }
      }
    }

    console.log("Local state - ", localState);

    if (localState.email && localState.address && !existError) {
      toastState.value = 'success'
      toastIcon.value = 'fas fa-check fa-lg me-2'
      toastContent.value = t("profile.emailAndAddressUpdated");
      toastModel.value = true

      isPressedEditProfile.value = false;
    } else if (localState.email && !localState.address && !existError) {
      toastState.value = 'success'
      toastIcon.value = 'fas fa-check fa-lg me-2'
      toastContent.value = t("profile.emailUpdated");
      toastModel.value = true

      isPressedEditProfile.value = false;
    } else if (!localState.email && localState.address && !existError) {
      toastState.value = 'success'
      toastIcon.value = 'fas fa-check fa-lg me-2'
      toastContent.value = t("profile.addressUpdated");
      toastModel.value = true

      isPressedEditProfile.value = false;
    } else {
      console.log("Something wrong")
      isPressedEditProfile.value = true;
    }

  }

  const showToast = (state, icon, messageKey) => {
    toastState.value = state;
    toastIcon.value = icon;
    toastContent.value = t(messageKey);
    toastModel.value = true;
  };

  const handleSaveProfile = async newData => {
    let emailUpdated = false;
    let addressUpdated = false;

    if (newData.email) {
      const updated = await userStore.updateMe({
        email: newData.email
      });

      if (updated?.error === "email existing") {
        showToast(
          "danger",
          "fas fa-exclamation-circle fa-lg me-2",
          "profile.emailAlreadyInUse"
        );

        return;
      }

      emailUpdated = true;
    }

    if (newData.address) {
      const updated = await proStore.updateAddress({
        address: newData.address,
        lat: newData.lat,
        lng: newData.lng
      });

      addressUpdated = Boolean(updated);
    }

    if (emailUpdated && addressUpdated) {
      showToast(
        "success",
        "fas fa-check fa-lg me-2",
        "profile.emailAndAddressUpdated"
      );
    } else if (emailUpdated) {
      showToast(
        "success",
        "fas fa-check fa-lg me-2",
        "profile.emailUpdated"
      );
    } else if (addressUpdated) {
      showToast(
        "success",
        "fas fa-check fa-lg me-2",
        "profile.addressUpdated"
      );
    } else {
      return;
    }

    isPressedEditProfile.value = false;
  };
</script>
<style scoped>
.profile-page {
  max-width: 1180px;
  margin-top: 70px;
  padding-bottom: 48px;
}

.form-card {
  height: 100%;
}

.avatar-card :deep(.card),
.profile-data-card {
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.12);
}

.avatar-wrap {
  width: 148px;
  height: 148px;
  overflow: hidden;
  border: 4px solid rgba(255, 255, 255, 0.12);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}

.remove-avatar-button {
  padding: 8px 12px;
  border: 0;
  background: transparent;
  color: #dc4c64;
  font-weight: 600;
  cursor: pointer;
}

.remove-avatar-button:hover {
  text-decoration: underline;
}

.profile-data-card {
  position: relative;
  min-height: 100%;
  padding: 28px;
}

.profile-close {
  position: absolute;
  top: 12px;
  right: 12px;
}

.profile-table {
  margin: 32px 0 0;
  color: #ddd;
  font-size: 0.95rem;
}

.profile-table td {
  padding: 14px 10px;
  vertical-align: middle;
}

.profile-table td:first-child {
  width: 34%;
  color: rgba(255, 255, 255, 0.65);
  font-weight: 600;
}

.profile-value {
  color: cornflowerblue;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

@media (max-width: 991px) {
  .profile-page {
    margin-top: 32px;
  }

  .profile-data-card {
    padding: 22px 16px;
  }
}
</style>
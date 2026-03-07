<template>
    <MDBContainer style="margin-top: 70px;">

      <toast-handler
        v-model="toastModel"
        :toast-name="toastState"
        :icon-state="toastIcon"
        :text="toastContent"
      />

      <!-- <div v-if="!userData" class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div> -->
      <div>
        <MDBRow>
          <!-- <file-error
              :message = fileSizeError
          />
          <file-error
              :message = fileTypeError
          />
          <file-error
              :message = emailErrorMessage
          /> -->
          <MDBCol lg="4">
            <div class="form-card d-flex justify-content-center">
              <MDBCol lg="6" style="text-align: center;">

                <MDBCard class="p-3">
                  <MDBRow class="align-items-center g-3 ">
                    <MDBCol lg="12" class="d-flex justify-content-center">
                      <div class="avatar-wrap">
                        <img :src="avatarSrc" class="avatar-img" alt="avatar" />
                      </div>
                    </MDBCol>

                    <MDBCol>
                      <div class="d-flex flex-column">
                        <div class="fw-bold">Avatar</div>
                        <small class="text-muted">Lisää, muokkaa tai poista profiilikuvasi.</small>

                        <div class="d-flex gap-2 mt-2 flex-wrap d-flex justify-content-center">
                          <MDBBtn v-if="!hasCustomAvatar" color="primary"  @click="openAvatarPicker">
                            Lisää avatar
                          </MDBBtn>

                          <MDBBtn v-else color="primary" block @click="openAvatarEditPicker">
                            Muokkaa avataria
                          </MDBBtn>

                          <!-- <MDBBtn v-if="hasCustomAvatar" color="danger" block outline @click="removeAvatar">
                            Poistaa avatar
                          </MDBBtn> -->
                          <p
                            v-if="hasCustomAvatar"
                            class="text-danger mt-3 ms-auto w-100 text-end"
                            style="cursor:pointer;"
                            @click="removeAvatar"
                          >
                            Poista avatar
                          </p>
                        </div>

                        <input
                          ref="avatarInput"
                          class="sr-only"
                          type="file"
                          accept="image/*"
                          @change="onAvatarSelected"
                        />

                        <input
                          ref="avatarEditInput"
                          class="sr-only"
                          type="file"
                          accept="image/*"
                          @change="onAvatarEditSelected"
                        />
                      </div>
                    </MDBCol>
                  </MDBRow>
                </MDBCard>

              </MDBCol>
            </div>
          </MDBCol>
          <MDBCol  lg="8">
            <div class="form-card">
              <MDBBtnClose
                  v-if="!isPressedEditProfile"
                  white
                  style="float: right; padding: 13px;"
                  @click="router.go(-1)"
              />
              
              <MDBTable v-if="!isPressedEditProfile" borderless style="font-size: 14px; color: #ddd; text-align: left;">
                <tbody>
                <tr>
                  <td>
                    Nimi:
                  </td>
                  <td>
                    {{ profile.firstName + " " + profile.lastName }}
                  </td>
                </tr>
                
                <tr>
                  <td>
                    Username:
                  </td>
                  <td>
                    @{{ profile.username }}
                  </td>
                </tr>
                <tr v-show="isUserPro && provider">
                  <td>
                    Osoite:
                  </td>
                  <td>
                    <p style="color:cornflowerblue;">{{ provider?.address }}</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    Sähköposti:
                  </td>
                  <td>
                    <p style="color:cornflowerblue;">{{ profile.email }}</p>
                  </td>
                </tr>
                <tr>
                  <td colspan="2">
                    <MDBBtn block size="md" outline="success" @click="openEditProfile">Muokkaa tiotosi</MDBBtn>
                  </td>
                </tr>
                </tbody>
              </MDBTable>

              <edit-profile 
                v-else
                @close-edit-profile="closeEditProfile"
                @save:profile="handleSaveProfile"
              />

            </div>


          </MDBCol>
        </MDBRow>
      </div>

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

    const { user, credentials } = storeToRefs(auth);
    const { profile } = storeToRefs(userStore);
    const { isUserPro, provider } = storeToRefs(proStore);
    
    const router = useRouter();
    //const _avatar = avatar;

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

    /* const avatarSrc = computed(() => {
      const url = profile.value?.avatar?.imageUrl || profile.value?.avatar?.path;
      return url || avatarFallback;
    }); */

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

    function openAvatarPicker() {
      avatarInput.value?.click();
    }

    const openAvatarEditPicker = () => {
      avatarEditInput.value?.click();
    } 

    async function onAvatarSelected(e) {
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

    const onAvatarEditSelected = async (e) => {
      const input = e.target;
      const file = input.files && input.files[0];
      if (!file) return;

      // create/replace local preview
      if (localPreviewUrl.value) URL.revokeObjectURL(localPreviewUrl.value);
      localPreviewUrl.value = URL.createObjectURL(file);

      try {
        // Upload via API/store here.
        // After success set user.avatar = { isImage:true, url:'...', name:file.name }

        const editAvatar = await userStore.editAvatar(file);
        console.log("Avatar is uploaded? - ", editAvatar);

      } finally {
        // allow selecting same file again
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

    const validateUploadErrors = async (data, file, status) => {
      console.log("FILE " + file.type);
      console.log("Status: " + status);
      console.log("Is true or false " + file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/jpg" || file.type === "image/gif")
      const acceptedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
      if (acceptedTypes.includes(file.type)) {
        console.log("KUNNOSSA")
        console.log("File size " + file.size);
        if (file.size < 1000000) {
          if (status === "add") {
            console.log("_____Add image")
            const uploadedAvatar = await awsUploadService.uploadAvatarImage(this.user.id, data);
            const info = {
              isImage: true,
              key: uploadedAvatar.key,
              imageUrl: uploadedAvatar.imageUrl
            }
            this.$emit("updateAvatar", info,  this.showImage); // to app, for navbar avatar adding

          } else {

            const key = this.avatarObject.key;

            const editedAvatar = await awsUploadService.editAvatarImage(this.user.id, key, data);
            const editInfo = {
              isImage: true,
              key: editedAvatar.key,
              imageUrl: editedAvatar.imageUrl
            }
            console.log("_____Edit image " + editedAvatar.key);
            this.$emit("updateAvatar", editInfo, this.showImage); // to app, for navbar avatar update

          }
        } else {
          this.showImage = null;
          this.value = null;
          this.isPressedEditProfile = false;
          this.openSetAvatar = false;

          this.fileSizeError = "Kuvan koko on oltava pienempi kun 1 MB!"
          setTimeout(() => {
            this.fileSizeError = null;
          }, 3000)

        }
      } else {
        console.log("EI KUNNOSSA")

        this.fileTypeError = "Pitäisi käyttää kuvan formaatti (jpeg, jpg, png, gif)!"
        setTimeout(() => {
          this.fileTypeError = null;
        }, 3000)
        this.showImage = null;
        this.isAddProfileImage = false;
        this.isEditProfileImage = false;
        this.value = null;
      }

    }

    const openEditProfile = () => {
      isPressedEditProfile.value = true;
    }
    const closeEditProfile = () => {
      isPressedEditProfile.value = false;
    }

    const handleSaveProfile = async (newData) => {
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
          toastContent.value = 'Sähköposti on jo käytössä!'
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
        toastContent.value = 'Sähköposti ja osoite ovat muokattu onnistuneesti!'
        toastModel.value = true

        isPressedEditProfile.value = false;
      } else if (localState.email && !localState.address && !existError) {
        toastState.value = 'success'
        toastIcon.value = 'fas fa-check fa-lg me-2'
        toastContent.value = 'Sähköposti on muokattu onnistuneesti!'
        toastModel.value = true

        isPressedEditProfile.value = false;
      } else if (!localState.email && localState.address && !existError) {
        toastState.value = 'success'
        toastIcon.value = 'fas fa-check fa-lg me-2'
        toastContent.value = 'Osoite on muokattu onnistuneesti!'
        toastModel.value = true

        isPressedEditProfile.value = false;
      } else {
        console.log("Something wrong")
        isPressedEditProfile.value = true;
      }

      


      

      


      /* if (!validateProfile()) {
        console.log("VIRHE!!!");
      } else {
        console.log("Is new address?? " + pForm.address);
        console.log("Email " + pForm.email);

        if (pForm.address) {
          userData.value.address = pForm.address;
          pForm.address = "";
          isEditAddress.value = false;
        } 

        if (pForm.email) {

          
          

          const emailAlreadyExists = await userService.editEmail(user.value.id, {email: pForm.email});
          console.log("ENAIL EXISTS? " + emailAlreadyExists)
          if (emailAlreadyExists.error !== "email existing") {
            userData.value.email = pForm.email;
            pForm.email = "";
          } else {
            console.log("Email existing!")
            
          }
        } */
      //}

      /* if (newEmailAddress !== "") {
        const emailAlreadyExists = await userService.editEmail(this.user.id, {email: newEmailAddress});
        if (emailAlreadyExists.error !== "email existing") {
          this.userData.email = newEmailAddress;
        } else {
          this.emailErrorMessage = "Antamasi sähköpostiosoite on jo olemassa!"
          setTimeout(() => {
            this.emailErrorMessage = null;
          }, 2000);
        }
      }
      if (newAddress.latitude !== null) {
        if (this.pro) { // If client is provider
          await providerService.editAddress(this.pro.id, newAddress);
          this.userData.address = newAddress.address;
        }
        if (this.client.length > 0) { // If client is recipient
          for (let booking in this.client) {
            const bookingID = this.client[booking].id;
            await recipientService.editBookingAddress(bookingID, newAddress);
            this.userData.address = newAddress.address;
          }
        }

      }
      const data = new FormData();
      if (this.value !== null) {
        if (this.isAddProfileImage) {
          console.log("Saving image type " + this.file.type);


          data.append('file', this.file, this.file.name)

          await this.validateUploadErrors(data, this.file, "add");
          //this.$router.go(-1);

        } else if (this.isEditProfileImage) {
          console.log("Editing image here")
          data.append('file', this.file, this.file.name);
          await this.validateUploadErrors(data, this.file, "edit");
          //this.$router.go(-1);

        }

        this.isAddProfileImage = false;
        this.isEditProfileImage = false;

      } */

    }
</script>
<style scoped>
.avatar-panel {
  display: flex; 
  justify-content: center;
}

.avatar-wrap {
  width: 73px;
  height: 73px;
  border-radius: 9999px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(0, 0, 0, 0.03);

  display: flex;
  justify-content: center;
  align-items: center;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
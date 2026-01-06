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

            <div class="form-card">
              <MDBCol lg="6">

              <MDBRow>

                <MDBCol  >
                    <MDBIcon size="2x"><i class="fas fa-user-circle"></i></MDBIcon>

                  <!-- <img

                      :src="showImage ? showImage : avatar"
                      alt="profile_img_blob"
                      style="width: 100px; height: 100px; border: 1px solid darkgrey; border-radius: 50px; margin-bottom: 20px;"
                  /> -->
                </MDBCol>
                <p>Edit, delete avatar panel</p>
                <!-- <div v-if="showImage">
                    <div v-if="!isOpenSetAvatar && isPressedEditProfile">
                    <p @click="editProfileAvatar">Muokkaa</p>
                    </div>
                    <div v-else>
                    <p v-if="isPressedEditProfile && !isOpenSetAvatar" @click="addNewAvatar">Lisää avatar</p>
                    </div>
                </div>
                <div v-else>
                    <div v-if="avatarObject.isImage === true">
                    <div v-if="isPressedEditProfile">
                        <p @click="editProfileAvatar">Muokkaa</p>
                    </div>

                    </div>
                    <div v-else>
                    <p v-if="isPressedEditProfile && !isOpenSetAvatar" @click="addNewAvatar">Lisää avatar</p>
                    </div>
                </div> -->


                <!-- <div class="edit-panel" v-if="(isOpenSetAvatar)  ">
                  
                  <div style="display: flex; justify-content: right;">
                    <MDBBtnClose
                        white
                        class="close-btn"
                        style="float: right;"
                        @click="closeEditPanel"
                    />
                  </div>
                  <MDBRow >
                    <MDBCol>
                      <input  id="avatar-upload" type="file" @change="handleFileChange($event, i)"/>
                      <label  for="avatar-upload" class="profile-file-upload">
                  <span v-if="value">
                  Muokka tehtävän kuvausta

                   </span>
                        <span v-else>Valitse avatar</span>
                      </label>

                      <MDBBtn v-if="showImage || avatarObject.isImage === true" class="btn" block size="lg" color="danger" @click="removeProfileImage">Poista kuva</MDBBtn>
                    </MDBCol>

                  </MDBRow>

                </div> -->

                <MDBCol>

                    <p>Avatari all oleva info näitamine</p>

                  <!-- <div v-if="!isPressedEditProfile">
                    <div style="float: right; padding: 10px; width: 100%;">ˇ

                      <div class="profile-info">
                        <div v-if="pro" >
                          <h3 >{{ pro.yritys }}</h3>
                          <div style=" color: cadetblue;">

                            <div
                                v-if="((pro.proTime - new Date().getTime()) / 86400000).toFixed() <= 0"
                            >
                              <p>Valitettavasti käyttö on päättynyt!</p>
                              <p style="color: orangered; cursor: pointer;" @click="$router.push('/pay-plan')">Lattaa lisää aikaa!</p>
                            </div>
                            <div v-else-if="((pro.proTime - new Date().getTime()) / 86400000).toFixed() <= 3
                          && ((pro.proTime - new Date().getTime()) / 86400000).toFixed() > 0">
                              <p>Käyttö</p>
                              <p>{{((pro.proTime - new Date().getTime()) / 86400000).toFixed()}} päivää</p>
                              <p style="color: orangered;  cursor: pointer;" @click="$router.push('/pay-plan')">Lattaa lisää aikaa!</p>
                            </div>
                            <div v-else>
                              <div v-if="((pro.proTime - new Date().getTime()) / 86400000).toFixed() === 'NaN'" class="spinner-border" role="status">
                                <span class="visually-hidden">Loading...</span>
                              </div>
                              <div v-else>
                                <p>Käyttö: </p>
                                <p>{{((pro.proTime - new Date().getTime()) / 86400000).toFixed()}} päivää</p>
                              </div>
                            </div>
                          </div>


                        </div>

                        <p v-if="client">Sinulla on varauksia ({{client.length}})</p>
                      </div>

                    </div>
                  </div>
 -->



                </MDBCol>
              </MDBRow>

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

              
              <!-- <edit-profile
                  v-else
                  :loggedInUser = loggedInUser
                  :userData=" userData"
                  @goBackFromEditProfile = handleCloseEditProfile
                  @profile:data = handleSaveProfile
                  @saveProfileImg = handleSaveProfileImage
              /> -->

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
    import { ref, onMounted, watch } from 'vue';
    import { useRouter } from 'vue-router';
    import { storeToRefs } from "pinia";
    import ToastHandler from "./helpers/ToastHandler.vue";
    //import { loadGoogleMaps } from "./controllers/loadGoogleMap";
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
  
</style>
<template>
    <MDBBtnClose
      white
      style="float: right; cursor: pointer; padding: 13px;"
      :aria-label="t('editProfile.close')"
      @click="closeEditProfile"
  />
  <MDBContainer>
    <div class="edit-profile">
      <MDBTable  borderless style="font-size: 14px; color: #ddd; text-align: left;">
        <tbody>
        <tr>
          <td>
            {{ t("editProfile.firstName") }}:
          </td>
          <td>
            {{ profile.firstName }}
          </td>
        </tr>
        <tr>
          <td>
            {{ t("editProfile.lastName") }}:
          </td>
          <td>
            {{ profile.lastName }}
          </td>
        </tr>
        <tr>
          <td>
            {{ t("editProfile.username") }}:
          </td>
          <td>
            @{{ profile.username }}
          </td>
        </tr>
        <tr v-show="isUserPro && provider">
          <td colspan="2">
            <p style="color:cornflowerblue;">{{ provider?.address }}</p>
            <!-- <MDBInput
                size="md"
                id="new-address"
                placeholder=""
                label="Anna uusi osoitteesi..."
                v-model="pForm.address"
            />
            <span v-if="pErrors.address" class="field-footer">{{ pErrors.address }}</span> -->
            <address-autocomplete
              v-model="pForm.address"
              v-model:valid="addressValid"
              v-model:error="pErrors.address"
              :label="t('editProfile.newAddress')"
              :error="pErrors.address"
              @typing="onAddressInput"
              @place="onPlaceSelected"
            />
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <p style="color: cornflowerblue">{{ profile.email }}</p>
            <MDBInput
                type="text"
                size="md"
                :label="t('editProfile.newEmail')"
                v-model="pForm.email"
            />
            <span v-if="pErrors.email" class="field-footer text-danger">{{ pErrors.email }}</span>
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <MDBBtn block size="md" color="success" :disabled="isSaveDisabled" @click="saveProfileData">{{ t("editProfile.save") }}</MDBBtn>
          </td>
        </tr>
        </tbody>
      </MDBTable>
    </div>
  </MDBContainer>
</template>
<script setup>
    import {
        MDBContainer,
        MDBInput,
        MDBBtn,
        MDBBtnClose,
        MDBTable
    } from 'mdb-vue-ui-kit';
    import { ref, onMounted, computed, watch, reactive } from 'vue'
    import { storeToRefs } from 'pinia';
    import { useI18n } from 'vue-i18n';
    
    import { useLoginStore } from "@/stores/login";
    import { useProStore } from "@/stores/providerStore";
    import { useUserStore } from '@/stores/userStore';
    import AddressAutocomplete from './AddressAutocomplete.vue';

    defineOptions({
        name: 'edit-profile'
    })

    const emit = defineEmits(['close-edit-profile', 'save:profile']);
    const { t } = useI18n();
    const addressValid = ref(false);
    const selectedAddress = ref(null);
    const selectedPlace = ref(null);

    const pForm = reactive({
      address: "",
      lat: null,
      lng: null,
      email: ""
    })

    const pErrors = reactive({});

    const isSaveDisabled = computed(() => {
      const email = pForm.email?.trim() ?? "";
      const address = pForm.address?.trim() ?? "";

      const allFieldsEmpty = !email && !address;
      const emailIsInvalid = Boolean(email) && !isValidEmail(email);
      const addressIsInvalid = Boolean(address) && !addressValid.value;

      return allFieldsEmpty || emailIsInvalid || addressIsInvalid;
    });
        

    const validateAddress = () => {
      const address = pForm.address?.trim();

      if (!address) {
        return "";
      }

      if (
        !addressValid.value ||
        pForm.lat == null ||
        pForm.lng == null
      ) {
        return t("editProfile.selectAddressFromList");
      }

      return "";
    };

    

    /* watch(selectedPlace, (place) => {
      if (!place) return;

      pForm.address = place.address;
      pForm.lat = place.lat;
      pForm.lng = place.lng;

      pErrors.address = ""
    }); */

    /* watch(() => pForm.email, (val) => {
      if (!val) {
        pErrors.email = "";
      } else if (!isValidEmail(val)) {
        pErrors.email = t("editProfile.invalidEmail");
      } else {
        pErrors.email = "";
      }
    }); */

    watch(
      () => pForm.email,
      value => {
        const email = value?.trim() ?? "";

        if (!email) {
          pErrors.email = "";
          return;
        }

        pErrors.email = isValidEmail(email)
          ? ""
          : t("editProfile.invalidEmail");
      }
    );

    

    const authStore = useLoginStore();
    const userStore = useUserStore();
    const proStore = useProStore();

    const { user} = storeToRefs(authStore);
    const { profile } = storeToRefs(userStore);
    const { isUserPro, provider } = storeToRefs(proStore);

    const mapError = ref(false);

    onMounted(() => {
        
    })

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const onAddressInput = value => {
      pForm.address = value;
      pForm.lat = null;
      pForm.lng = null;

      selectedPlace.value = null;
      addressValid.value = false;

      pErrors.address = value.trim()
        ? t("editProfile.selectAddressFromList")
        : "";
    };

    const onPlaceSelected = place => {
      if (!place) {
        return;
      }

      selectedPlace.value = place;
      pForm.address = place.address;
      pForm.lat = place.lat;
      pForm.lng = place.lng;

      addressValid.value = true;
      pErrors.address = "";
    };

    const validateProfile = () => {
      pErrors.address = validateAddress();

      const email = pForm.email?.trim() ?? "";

      pErrors.email =
        email && !isValidEmail(email)
          ? t("editProfile.invalidEmail")
          : "";

      return !pErrors.address && !pErrors.email;
    };

    const saveProfileData = () => {
      if (!validateProfile()) {
        return;
      }

      const newProfileData = {};

      const email = pForm.email?.trim();
      const address = pForm.address?.trim();

      if (email) {
        newProfileData.email = email;
      }

      if (address) {
        newProfileData.address = address;
        newProfileData.lat = pForm.lat;
        newProfileData.lng = pForm.lng;
      }

      emit("save:profile", newProfileData);
    };

    const closeEditProfile = () => {
        emit('close-edit-profile')
    }
</script>
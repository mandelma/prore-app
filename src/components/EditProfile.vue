<template>
    <MDBBtnClose
      white
      style="float: right; cursor: pointer; padding: 13px;"
      @click="closeEditProfile"
  />
  <MDBContainer>
    <div class="edit-profile">
      <MDBTable  borderless style="font-size: 14px; color: #ddd; text-align: left;">
        <tbody>
        <tr>
          <td>
            Etunimi:
          </td>
          <td>
            {{ profile.firstName }}
          </td>
        </tr>
        <tr>
          <td>
            Sukunimi:
          </td>
          <td>
            {{ profile.lastName }}
          </td>
        </tr>
        <tr>
          <td>
            Käyttäjätunnus:
          </td>
          <td>
            @{{ profile.username }}
          </td>
        </tr>
        <tr v-show="isUserPro && provider">
          <td colspan="2">
            <p style="color:cornflowerblue;">{{ provider?.address }}</p>
            <MDBInput
                size="md"
                id="new-address"
                placeholder=""
                label="Anna uusi osoitteesi..."
                v-model="pForm.address"
            />
            <span v-if="pErrors.address" class="field-footer">{{ pErrors.address }}</span>
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <p style="color: cornflowerblue">{{ profile.email }}</p>
            <MDBInput
                type="text"
                size="md"
                label="Anna uusi sähköpostisi"
                v-model="pForm.email"
            />
            <span v-if="pErrors.email" class="field-footer">{{ pErrors.email }}</span>
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <MDBBtn block size="md" color="success" :disabled="!pForm.email && !pForm.address" @click="saveProfileData">Tallenna tiedot</MDBBtn>
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
    import { ref, onMounted, watch, reactive } from 'vue'
    import { storeToRefs } from 'pinia';
    import { loadGoogleMaps } from "./controllers/loadGoogleMap";
    import { useLoginStore } from "@/stores/login";
    import { useProStore } from "@/stores/providerStore";
    import { useUserStore } from '@/stores/userStore';

    defineOptions({
        name: 'edit-profile'
    })

    const emit = defineEmits(['close-edit-profile', 'save:profile']);

    const selectedPlace = ref(null);

    const pForm = reactive({
      address: "",
      lat: null,
      lng: null,
      email: ""
    })

    const pErrors = reactive({});

    const validateAddress = () => {

      if (!pForm.address) return;

      if (pForm.lat === null || pForm.lng === null) {
        return "Valitse osoite listasta (ei pelkkää kirjoitusta)";
      }

      return;
    };

    

    watch(selectedPlace, (place) => {
      if (!place) return;

      pForm.address = place.address;
      pForm.lat = place.lat;
      pForm.lng = place.lng;

      pErrors.address = ""
    });

    watch(() => pForm.email, (val) => {
      if (!val) {
        pErrors.email = "";
      } else if (!isValidEmail(val)) {
        pErrors.email = "Sähköpostin osoite on virheellinen!";
      } else {
        pErrors.email = "";
      }
    });

    

    const authStore = useLoginStore();
    const userStore = useUserStore();
    const proStore = useProStore();

    const { user} = storeToRefs(authStore);
    const { profile } = storeToRefs(userStore);
    const { isUserPro, provider } = storeToRefs(proStore);

    const mapError = ref(false);

    onMounted(() => {
        initGoogleMap();
    })

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    

    const validateProfile = () => {

      pErrors.address = validateAddress();

      //if (!pForm.email) {
        
        //pErrors.email = "Sähköposti on pakollinen!";
      //} 
      if (!pForm.email) pErrors.email = "";
      if (!isValidEmail(pForm.email) && pForm.email) {
        pErrors.email = "Sähköpostin osoite on virheellinen!";
      } else {
        pErrors.email = "";
      }

      return !pErrors.address && !pErrors.email;
    };

    const initGoogleMap = async() => {
      mapError.value = false;
      try {
        await loadGoogleMaps();
        console.log("Map is inited in profile! ✅");
        const center = { lat: 50.064192, lng: -130.605469 };
        // Create a bounding box with sides ~10km away from the center point
        const defaultBounds = {
          north: center.lat + 0.1,
          south: center.lat - 0.1,
          east: center.lng + 0.1,
          west: center.lng - 0.1,
        };

        const input = document.getElementById("new-address");

        const options = {
          bounds: defaultBounds,
          componentRestrictions: { country: "fi" },
          fields: ["address_components", "geometry", "icon", "name", "formatted_address"],
          strictBounds: false,
          //types: ["establishment"],
        };
        const autocomplete = new google.maps.places.Autocomplete(input, options);
        // const autocomplete = client.places.autocomplete(input, options);

        autocomplete.addListener("place_changed", () => {
          let place = autocomplete.getPlace()
          pForm.lat = place.geometry.location.lat()
          pForm.lng = place.geometry.location.lng()

          if (!place.geometry) {
            selectedPlace.value = null;
            return;
          }

          selectedPlace.value = {
            address: place.formatted_address,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };

          //pForm.address = place.formatted_address
          console.log(place)
        })
      } catch (err) {
        console.error('Google Maps failed to load ❌', err);
        mapError.value = true;
        /* mapToastModel.value = true;
        mapToastState.value = 'danger';
        mapToastIcon.value = 'fas fa-check fa-lg me-2';
        mapToastContent = 'Internet yhteys puuttuu!'; */
      }
    }

    const saveProfileData = () => {
        if (!validateProfile()) {
            console.log("--ERROR--")
        } else {
            console.log("OK");
            const newProfileData = {
                address: pForm.address,
                email: pForm.email
            }
            emit('save:profile', newProfileData);
        }
    }

    const closeEditProfile = () => {
        emit('close-edit-profile')
    }
</script>
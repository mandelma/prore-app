
<template>
  <div>
    <MDBContainer>
      <div style="">
        <toast-handler 
          v-model="toastModel"
          :toast-name="toastState"
          :icon-state="toastIcon"
          :text="toastContent"
        />
        <MDBToast
            v-model="isInitProError"
            autohide
            :delay="3000"
            :stacking="false"
            position="top-center"
            toast="danger"
            icon="fas fa-exclamation-circle fa-lg me-2"
        >
          <template #title> {{ t('providerForm.notifications.error_title') }} </template>
          <button type="button" style="visibility: hidden;" class="btn-close ms-auto" aria-label="Close" @click="hideError"></button>
          <template #small></template>
          {{proFormErrorMsg}}
        </MDBToast>
      </div>
      <div class="form-card">

        <form @submit.prevent="submitPro">
          <div class="field-wrapper">
            <MDBInput
                :label="t('providerForm.fields.company_name')"
                v-model="pForm.proName"
                id="yritys"
                size="lg"

            />
            <span v-if="pfErrors.proName" class="field-footer">{{ pfErrors.proName }}</span>
          </div>
          <div class="field-wrapper">
            <MDBInput
                :label="t('providerForm.fields.business_id')"
                v-model="pForm.ideNum"
                id="ytunnus"
                size="lg"
                />
            <span v-if="pfErrors.ideNum" class="field-footer">{{ pfErrors.ideNum }}</span>
          </div>


          <div :class="{hideProInput: !pForm.address && isProAddress}" style="width: 100%;" class="field-wrapper ">
            <div  class="input-group">
              <MDBInput
                  size="lg"
                  id="pro-location"

                  v-model="pForm.address"
                  :label="t('providerForm.fields.address')"
                  placeholder=""
                  wrapperClass="form-outline flex-grow-3"
                  :inputClass="'ps-0'"
                  aria-describedby="button-addon2"
              />
              <MDBBtn type="button" style="border:1px solid #ddd">
                <MDBIcon size="2x" @click="pForm.address ? clearProAddress() : showProAddress()">
                  <i :class="pForm.address ? 'fas fa-times' : 'fas fa-search-location'"></i>
                </MDBIcon>
              </MDBBtn>
            </div>

            <span v-if="pfErrors.address" class="field-footer">{{ pfErrors.address }}</span>
          </div>
          <!-- overlay spinner, not removing input -->
          <div v-show="!pForm.address && isProAddress"
               style="text-align: center; padding-bottom: 27px;"

          >
            <MDBSpinner grow color="info" />
          </div>
          <p style="text-align: left; color: deepskyblue; font-size: 18px;">
            {{ t('providerForm.help.radius_info') }}
          </p>
          <div class="field-wrapper">
            <MDBInput
                type="text"

                :value="rangeValue"
                @input="filterInput"
                :label="t('providerForm.fields.service_radius')"
                v-model="range"
                size="lg"
            />
          </div>


          <div class="field-wrapper">
            <Select
                style="width: 100%;"
                v-model="pForm.profession"
                :options="professions"
                filter optionLabel="label"
                optionGroupLabel="label"
                optionGroupChildren="items"
                :placeholder="t('providerForm.fields.profession')"
                v-bind:style="isNoPro ? 'color: pink; border: 1px solid red;' : 'color: white;'"
                class="w-full md:w-[30rem]"

            >

              <template #value="slotProps">
                <div v-if="slotProps.value" >
                  <!--              <img :alt="slotProps.value.label" src="https://primefaces.org/cdn/primevue/images/flag/flag_placeholder.png" :class="`mr-2 flag flag-${slotProps.value.code.toLowerCase()}`" style="width: 18px" />-->

                  <div>{{ slotProps.value.label }}</div>
                </div>
                <span v-else>
                    {{ slotProps.placeholder }}
                  </span>
              </template>
              <template #optiongroup="slotProps" >
                <div  class="flex items-center gap-2">
                  <i :class= 'slotProps.option.icon' style='font-size:17px;color:cadetblue;'></i>&nbsp;&nbsp;&nbsp;
                  <span>{{ slotProps.option.label }}</span>
                </div>
              </template>
            </Select>
            <span v-if="pfErrors.profession" class="field-footer">{{ pfErrors.profession }}</span>
          </div>

          <div class="field-wrapper">
            <MDBRadio
                :label="t('providerForm.fields.hourly_price')"
                name="aboutPrice"
                v-model="about_price"
                value="hour"
            />
          </div>

          <div class="field-wrapper">
            <MDBInput
                v-if="about_price === 'hour'"
                :label="t('providerForm.fields.hourly_price_input')"
                type="text"

                @input="filterInput"
                :value="inputValue"
                v-model="price"
                size="lg"
            />
          </div>

          <div class="field-wrapper">
            <MDBRadio
                :label="t('providerForm.fields.fixed_price')"
                name="aboutPrice"
                v-model="about_price"
                value="piece"
            />
          </div>
          <div class="field-wrapper">
            <MDBTextarea
                maxlength="100"
                v-model="proDescription"
                :label="t('providerForm.fields.description')"
            ></MDBTextarea>
            <span class="message-counter">{{ proDescription.length }} / 100</span>
          </div>


          <div class="field-wrapper">
            <MDBInput
                :label="t('providerForm.fields.website')"
                size="lg"
                v-model="pro_link"

            />
          </div>

          <MDBBtn color="primary" type="submit">
            {{ t('providerForm.buttons.create_account') }}
          </MDBBtn>
        </form>
      </div>

    </MDBContainer>
  </div>
</template>

<script setup>
import { MDBContainer, MDBInput, MDBBtn, MDBRadio, MDBTextarea, MDBCheckbox, MDBSpinner, MDBIcon, MDBToast } from 'mdb-vue-ui-kit';
import Select from 'primevue/select';
import { useI18n } from 'vue-i18n';
import { useLoginStore } from "@/stores/login.js";
import { useRouter } from 'vue-router';
import { useProStore } from '@/stores/providerStore.js';
import proList from '@/components/controllers/professions'
import {computed, onMounted, reactive, watch, ref} from 'vue';
import proService from '../../service/providers.js'
import axios from "axios";
import ToastHandler from '../helpers/ToastHandler.vue';
import {loadGoogleMaps} from "@/components/controllers/loadGoogleMap.js";
//import i18n from '../controllers/i18n.js';
defineOptions({
  name: 'provider-form'
})

const emit = defineEmits(['createPro']);

const pForm = reactive({
  proName: "",
  ideNum: "",
  profession: "",
  address: ""
});

const router = useRouter();
const { t } = useI18n();
const proAuth = useLoginStore();
const proStore = useProStore();
const pfErrors = reactive({});
const isProAddress = ref(false);
const isInitProError = ref(false);
const proFormErrorMsg = ref("");

const rangeValue = ref(null);
const professions = proList;

const lat = ref(0);
const long = ref(0);
const range = ref("");

const about_price = ref("hour");
const proDescription = ref("");
const price = ref("");
let inputValue = ref('');
const mapsError = ref(false);


const toastModel = ref(false)
const toastState = ref('')
const toastIcon = ref('')
const toastContent = ref('')

const filterInput = ref((event) => {
  // Filter out non-digit characters
  const raw = event.target.value;

  // Only allow digits and a single dot
  let filtered = raw.replace(/[^0-9.]/g, '');

  // Only allow one dot
  const parts = filtered.split('.');
  if (parts.length > 2) {
    filtered = parts[0] + '.' + parts.slice(1).join('');
  }

  // Prevent leading dot (e.g., ".5" becomes "0.5")
  if (filtered.startsWith('.')) {
    filtered = '0' + filtered;
  }

  // Update input field directly
  event.target.value = filtered;
  inputValue.value = filtered;
})

const pro_link = ref(null);
const isAvailable24_7 = ref(false);

const validateProForm = () => {
  pfErrors.proName = pForm.proName ? "" : t('providerForm.validations.name_required');
  pfErrors.ideNum = pForm.ideNum ? "" : t('providerForm.validations.business_id_required');
  pfErrors.profession = pForm.profession ? "" : t('providerForm.validations.profession_required');
  pfErrors.address = pForm.address ? "" : t('providerForm.validations.address_required');

  return !pfErrors.proName && !pfErrors.ideNum && !pfErrors.profession && !pfErrors.address;
}

watch(() => pForm.proName, () => (pfErrors.proName = ""));
watch(() => pForm.ideNum, () => (pfErrors.ideNum = ""));
watch(() => pForm.profession, () => (pfErrors.profession = ""));
watch(() => pForm.address, () => (pfErrors.address = ""));

const isLocating = ref(false)

onMounted(async() => {
  await handleMaps();
})

const handleMaps = async() => {
  try {
    await loadGoogleMaps();
    console.log("Map is inited in Pro form! ✅");

    const center = { lat: 50.064192, lng: -130.605469 };
    // Create a bounding box with sides ~10km away from the center point
    const defaultBounds = {
      north: center.lat + 0.1,
      south: center.lat - 0.1,
      east: center.lng + 0.1,
      west: center.lng - 0.1,
    };

    const input = document.getElementById("pro-location");

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
      lat.value = place.geometry.location.lat()
      long.value = place.geometry.location.lng()

      pForm.address = place.formatted_address
      console.log(place)
    })
  } catch (err) {
    console.error('Google Maps failed to load ❌', err);
    
    toastModel.value = true;
    toastState.value = 'danger'
    toastIcon.value = "fas fa-check fa-lg me-2";
    toastContent.value = t('providerForm.notifications.google_maps_failed')
    mapsError.value = true;
  }
}

const proCurrentLocation = async () => {
  if (navigator.geolocation) {
    await navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      // Show a map centered at latitude / longitude.
      lat.value = latitude
      long.value = longitude
      console.log("Pro latitude is: " + lat.value);
      showProLocationData (latitude, longitude);
    });
  }
}
const showProLocationData = (lat, long) => {
  axios.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat +
      "," + long
      + "&key=" + import.meta.env.VITE_APP_MAP_KEY)
      .then(response => {
        if (response.data.error_message) {
          //this.error = response.data.error_message;

          console.log(response.data.error_message)
        } else {
          pForm.address = response.data.results[1].formatted_address;
          console.log("Address now " + pForm.address);
        }

      })
      .catch(error => {
        //this.error = error.message
        console.log(error.message)
      })
}

const showProAddress = () => {
  isProAddress.value = true;
  proCurrentLocation();
}

const clearProAddress = () => {
  isProAddress.value = false;
  pForm.address = '';
}

const parseDmyTime = (str) => {
  const m = str?.match(/^(\d{2})\/(\d{2})\/(\d{4}),?\s+(\d{2}):(\d{2})$/);
  if (!m) return null;
  const [, dd, mm, yyyy, HH, MM] = m.map(Number);
  return new Date(yyyy, mm - 1, dd, HH, MM);
}

const submitPro = async() => {
  if (!validateProForm()) {
    console.log("Some error! " + pfErrors);

    proFormErrorMsg.value = t('providerForm.notifications.form_fields_required');
    isInitProError.value = true;
  } else {
    console.log("Provider is created!")
    console.log("Submit pro");
    const provider = {
      pName: pForm.proName,
      ide: pForm.ideNum,
      description: proDescription.value,
      address: pForm.address,
      latitude: lat.value,
      longitude: long.value,
      profession: pForm.profession.label,
      //priceByHour: this.price,
      priceByHour: about_price.value === "hour" ? price.value : null,
      range: range.value === null ? 0 : range.value,
      proLink: pro_link.value,
      isAvailable24_7: false,
    }
    const newProvider = await proService.addProvider(proAuth.user.id, provider);
    console.log("Added provider::: " + newProvider)
    if (newProvider) {
      newProvider.user = {id: proAuth.user.id, username: proAuth.user.username};
      //emit('createPro', newProvider);
      proStore.createPro(newProvider);
      router.push("/admin/provider");
    } else {
      console.log(t('providerForm.notifications.provider_create_failed'));
    }
  }
}


</script>

<style scoped>
.hideProInput {
  display: none;
}
.message-counter {
  float: right;
}
</style>
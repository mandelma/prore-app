<template>
  <div>
    <MDBContainer>
      <div style="padding: 13px 0 20px 0;">
        <MDBToast
            v-model="isInitProError"
            autohide
            :delay="3000"
            :stacking="false"
            position="top-center"
            toast="danger"
            icon="fas fa-exclamation-circle fa-lg me-2"
        >
          <template #title> TAPAHTUI VIRHE! </template>
          <button type="button" style="visibility: hidden;" class="btn-close ms-auto" aria-label="Close" @click="hideError"></button>
          <template #small></template>
          {{proFormErrorMsg}}
        </MDBToast>
      </div>
      <div class="form-card">

        <form @submit.prevent="submitPro">
          <div class="field-wrapper">
            <MDBInput
                label="Anna yrityksen tai oma nimi *"
                v-model="pForm.proName"
                id="yritys"
                size="lg"

            />
            <span v-if="pfErrors.proName" class="field-footer">{{ pfErrors.proName }}</span>
          </div>
          <div class="field-wrapper">
            <MDBInput
                label="Anna yrityksen y-tunnus"
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
                  label="Anna osoite"
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
          <p style="text-align: left; color: deepskyblue; font-size: 18px;">jos sädettä ei ole merkitty, se tarkoittaa, että tarjoat palvelua vain määritetyssä osoitteessa</p>
          <div class="field-wrapper">
            <MDBInput
                type="text"

                :value="rangeValue"
                @input="filterInput"
                label="Anna toiminta-alueen säde - km"
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
                placeholder="Anna om aammatti *"
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
                label="Tuntihinta"
                name="aboutPrice"
                v-model="about_price"
                value="hour"
            />
          </div>

          <!--        v-model="price"-->
          <div class="field-wrapper">
            <MDBInput
                v-if="about_price === 'hour'"
                label="Anna tuntihinta"
                type="text"

                @input="filterInput"
                :value="inputValue"
                v-model="price"
                size="lg"
            />
          </div>

          <div class="field-wrapper">
            <MDBRadio
                label="Urakkahinta"
                name="aboutPrice"
                v-model="about_price"
                value="piece"
            />
          </div>
<!--          style="width: 100%; color: #ddd; "-->
          <div class="field-wrapper">
            <MDBTextarea
                maxlength="100"
                v-model="proDescription"
                label="Kirjuta siia midagi endast ja oma tegevusest..."
            ></MDBTextarea>
            <span class="message-counter">{{ proDescription.length }} / 100</span>
          </div>


          <div class="field-wrapper">
            <MDBInput
                label="Anna yrityksen kotisivun osoite jos on"
                size="lg"
                v-model="pro_link"

            />
          </div>
<!--          style="margin: 20px 0 20px 0; text-align: left;"-->
          <div class="field-wrapper">
            <MDBCheckbox  label="Saatavilla 24/7"  v-model="isAvailable24_7" />
          </div>


          <MDBBtn color="primary" type="submit">Luo tili</MDBBtn>
        </form>
      </div>

    </MDBContainer>
  </div>
</template>

<script setup>
import { MDBContainer, MDBInput, MDBBtn, MDBRadio, MDBTextarea, MDBCheckbox, MDBSpinner, MDBIcon, MDBToast } from 'mdb-vue-ui-kit';
import Select from 'primevue/select';
import { useLoginStore } from "@/stores/login.js";
import { useRouter } from 'vue-router';
import proList from '@/components/controllers/professions'
import {computed, onMounted, reactive, watch, ref} from 'vue';
import proService from '../../service/providers.js'
import axios from "axios";
import {loadGoogleMaps} from "@/components/controllers/loadGoogleMap.js";
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
const proAuth = useLoginStore();
const pfErrors = reactive({});
const isProAddress = ref(false);
const isInitProError = ref(false);
const proFormErrorMsg = ref("");
//const proName = ref("");
//const ideNum = ref("");
const rangeValue = ref(null);
const professions = proList;
//const profession = ref("");
const lat = ref(0);
const long = ref(0);
const range = ref("");
//const pAddress = ref("");
const about_price = ref("hour");
const proDescription = ref("");
const price = ref("");
let inputValue = ref('');
const mapsError = ref(false);
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
  pfErrors.proName = pForm.proName ? "" : "Nimi on pakollinen!";
  pfErrors.ideNum = pForm.ideNum ? "" : "Ident num on pakollinen!";
  pfErrors.profession = pForm.profession ? "" : "Ammatti on pakollinen!";
  pfErrors.address = pForm.address ? "" : "Osoite on pakollinen!";

  return !pfErrors.proName && !pfErrors.ideNum && !pfErrors.profession && !pfErrors.address;
}

watch(() => pForm.proName, () => (pfErrors.proName = ""));
watch(() => pForm.ideNum, () => (pfErrors.ideNum = ""));
watch(() => pForm.profession, () => (pfErrors.profession = ""));
watch(() => pForm.address, () => (pfErrors.address = ""));

// const dpOptions = computed(() => {
//   const L = labels[locale.value] ?? labels.en
//   return {
//     firstDay: L.firstDay,
//     monthsFull: L.monthsFull,
//     monthsShort: L.monthsShort,
//     weekdaysFull: L.weekdaysFull,
//     weekdaysShort: L.weekdaysShort,
//     // choose an input format you want (affects the text in the input)
//     format: 'dd.mm.yyyy'
//   }
// })

const isLocating = ref(false)                     // used to show the spinner

// const showSpinner = computed(() => {
//   const hasProAddress =
//       typeof pForm.address === 'string'
//           ? pForm.address.trim().length > 0
//           : !!pForm.address
//   return !hasProAddress && isLocating.value
// })

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


  // const date = new Date()              // current date
  // const formatted = date.toLocaleDateString('en-US', {
  //   year: 'numeric',
  //   month: '2-digit',
  //   day: '2-digit'
  // })
  // console.log(formatted)               // → 09/26/2025
  //
  // date.toLocaleDateString('en-GB')     // → 26/09/2025
  // date.toLocaleDateString('de-DE')     // → 26.09.2025
}

const submitPro = async() => {
  if (!validateProForm()) {
    console.log("Some error! " + pfErrors);

    proFormErrorMsg.value = "Form kentät pitää huomioida!";
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
      isAvailable24_7: isAvailable24_7.value,
    }
    const newProvider = await proService.addProvider(proAuth.user.id, provider);
    console.log("Added provider::: " + newProvider)
    if (newProvider) {
      newProvider.user = {id: proAuth.user.id, username: proAuth.user.username};
      emit('createPro', newProvider);
      router.push("/pro-panel");
    } else {
      console.log("Tapahtui virhe, yritä uudelleen!");
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
<template>
  <div>
<!--    v-bind:style="isNoPro ? 'color: pink; border: 1px solid red;' : 'color: white;'"-->
    <MDBContainer>
<!--      g-3 needs-validation   -->
      <div style="padding: 13px 0 20px 0;">
        <MDBToast
            v-model="isInitClientError"
            autohide
            :delay="3000"
            :stacking="false"
            position="top-center"
            toast="danger"
            icon="fas fa-exclamation-circle fa-lg me-2"
        >
          <template #title>VIRHE LOMAKEELLA! </template>
          <button type="button" style="visibility: hidden;" class="btn-close ms-auto" aria-label="Close" @click="hideError"></button>
          <template #small></template>
          {{clientFormErrorMsg}}
        </MDBToast>
      </div>
      <div class="form-card">
        <p style="margin-top: 10px; color: #00BFFFFF;">{{t('client_form_offersOrQuickSolution')}}</p>
        <form novalidate @submit.prevent="createClient" autocomplete="off" style=" padding: 5px;">
          <MDBRow>

            <MDBCol col="10">
              <div class="field-wrapper">
                <div>
                  <Select
                      style="width: 100%;"
                      v-model="form.profession"
                      :options="professions"
                      filter optionLabel="label"
                      optionGroupLabel="label"
                      optionGroupChildren="items"
                      placeholder="Valitse ammattilainen *"

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
                </div>

                <span v-if="errors.profession" class="field-footer">{{ errors.profession }}</span>
              </div>
            </MDBCol>

            <MDBCol col="2">
              <div style="width: 100%;" @click="router.push('/pro-around')">
                <img class="mapGif" :src="mapImage" alt="from_map" />
              </div>

            </MDBCol>
          </MDBRow>

          <div class="field-wrapper">
            <MDBInput
                label="Syötä tilauksen avainsana *"
                v-model="form.orderHeader"
                size="lg"
                invalidFeedback="Ole hyvä ja kirjoita avainsana."
                validFeedback="Ok!"
                required

            />
            <span v-if="errors.orderHeader" class="field-footer">{{ errors.orderHeader }}</span>
            <!-- custom error text -->


          </div>

          <MDBRow>


            <MDBCol lg="6">

<!--              Form address {{form.address}}-->


              <div :class="{hideInput: !form.address && isAddress}" style="width: 100%;" class="field-wrapper ">
                <div  class="input-group">
                  <MDBInput
                      size="lg"
                      id="location"

                      v-model="form.address"
                      label="Anna osoite"
                      placeholder=""
                      wrapperClass="form-outline flex-grow-3"
                      :inputClass="'ps-0'"
                      aria-describedby="button-addon2"
                  />
                  <MDBBtn type="button" style="border:1px solid #ddd">
                    <MDBIcon size="2x" @click="form.address ? clearAddress() : showAddress()">
                      <i :class="form.address ? 'fas fa-times' : 'fas fa-search-location'"></i>
                    </MDBIcon>
                  </MDBBtn>
                </div>

                <span v-if="errors.address" class="field-footer">{{ errors.address }}</span>
              </div>
              <!-- overlay spinner, not removing input -->
              <div v-show="!form.address && isAddress"
                   style="text-align: center; padding-bottom: 27px;"

              >
                <MDBSpinner grow color="info" />
              </div>

            </MDBCol>
            <MDBCol>
              <div class="field-wrapper">
                <MDBInput
                    type="text"

                    :value="preferredRangeValue"
                    @input="filterClientInput"
                    label="Anna säde mistä maksimi haet ammattilaista - km"
                    v-model="desiredRange"
                    size="lg"
                />
              </div>
            </MDBCol>

          </MDBRow>
          <div >

            <p style="text-align: left;">Mihin aikaan tarvitset ammattilaista?</p>
            <div class="field-wrapper">
              <MDBDateTimepicker
                  size="lg"
                  label="Valitse tehtävän päivämäärä ja aika"
                  v-model="form.dateTime"

                  :datepicker="{
                  ...L
                }"
                  :timepicker="{
                  ...L,
                  hoursFormat: 24
                }"

                  :key="reInitKey"
                  disablePast
              />
              <span v-if="errors.dateTime" class="field-footer">{{ errors.dateTime }}</span>
              
            </div>

          </div>

          <div style="color: #fff;">

          </div>

          <div class="field-wrapper">
            <MDBCheckbox
                label="Vastaukset voi lähettää sähköpostiin!"
                name="agreement_as_client"
                v-model="isClientContactAgreement"
                value="true"
                wrapperClass="mb-4"
            />
          </div>

          <MDBRow>
            <MDBCol lg="6">
              <div class="field-wrapper">
                <MDBTextarea
                    maxlength="70"
                    label="Kuvaus tilauksen sisällöstä *"
                    rows="3"
                    v-model="form.explanation"
                    invalidFeedback="Ole hyvä ja kirjoita tehtävän kuvaus."
                    validFeedback="Ok!"
                    required
                />
                <span v-if="errors.explanation" class="field-footer">{{ errors.explanation }}</span>
                <span class="message-counter"> {{form.explanation.length}} / 70</span>
              </div>

            </MDBCol>
            <MDBCol lg="6">
<!--              <p>Range {{desiredRange}}</p><br>-->
<!--              <p>Range 2 {{preferredRangeValue}}</p>-->
<!--              <error-notification :message = imgLoadErrorMessage />-->
<!--              <img v-if="showImage" :src="showImage" style="width: 200px; margin-bottom: 20px;" alt="..."/>-->
<!--              <label v-if="!isUploaded" for="file-upload" class="custom-file-upload">-->

<!--                <span v-if="value">-->
<!--                    {{t('receiver_form_orderContentImageEdit')}} {{value.name}}-->

<!--                </span>-->
<!--                <span v-else>{{t('receiver_form_orderContentImage')}}</span>-->

<!--              </label>-->

<!--              <input id="file-upload" type="file" @change="handleFileChange"/>-->

<!--              <MDBBtn v-if="isImageSelected" outline="danger" size="lg" block @click="removeFile">Poista valitsettu kuva</MDBBtn>-->
<!--              <MDBBtn v-if="isImageSelected"-->
<!--                      outline="success"-->
<!--                      size="lg"-->
<!--                      block-->
<!--                      style="margin-bottom: 10px;"-->
<!--                      @click="uploadImage">Lataa valitsettu kuva</MDBBtn>-->

            </MDBCol>

          </MDBRow>

          <MDBBtn color="primary" size="lg"  style="margin-top:13px; margin-bottom: 20px;" type="submit">Submit</MDBBtn>

        </form>
<!--        <recipient-page :header="form.address"/>-->
      </div>
<!--      <MDBBtn block @click="$router.push('/follow-pos')">Start watching</MDBBtn>-->
    </MDBContainer>
  </div>
</template>

<script setup>
/* global google */
import {MDBContainer, MDBRow, MDBCol, MDBBtn, MDBCheckbox, MDBTextarea, MDBToast, MDBInput, MDBIcon, MDBDateTimepicker, MDBSpinner, MDBDatepicker, MDBTimepicker} from "mdb-vue-ui-kit";

import { ref, onMounted, onUnmounted, onBeforeUnmount, computed, nextTick, reactive, watch } from 'vue'
import { useLoginStore } from "@/stores/login.js";
import proList from '@/components/controllers/professions'
import Select from 'primevue/select';
import map_image from '@/assets/map.gif'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n';
import clientService from '../../service/recipients';
import { loadGoogleMaps} from '../controllers/loadGoogleMap.js'
import RecipientPage from '@/components/recipient/RecipientPage.vue'

import '@/styles/pro-select.css';
defineOptions({
  name: 'recipient-form'
});

const emit = defineEmits(['createBookingMultiple'])

const { locale, t } = useI18n();

const router = useRouter();

const form = reactive({
  profession: "",
  orderHeader: "",
  address: "",
  dateTime: "",
  explanation: ""
});
const errors = reactive({});


const validateForm = () => {
  errors.profession = form.profession ? "" : "Profession is required";
  errors.orderHeader = form.orderHeader ? "" : "Header is required";
  errors.address = form.address ? "" : "Address is required";
  errors.dateTime = form.dateTime ? "" : "Date is required";
  errors.explanation = form.explanation ? "" : "Kuvaus is required";

  return !errors.profession && !errors.orderHeader && !errors.address && !errors.dateTime && !errors.explanation;
}

watch(() => form.profession, () => (errors.profession = ""));
watch(() => form.orderHeader, () => (errors.orderHeader = ""));
watch(() => form.address, () => (errors.address = ""));
watch(() => form.dateTime, () => (errors.dateTime = ""));
watch(() => form.explanation, () => (errors.explanation = ""));

const filterClientInput = ref((event) => {
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
  preferredRangeValue.value = filtered;
})

const MAX = ref(50);
const isInitClientError = ref(false);
const clientFormErrorMsg = ref("");
const selectedLang = ref("");
const userAuth = useLoginStore();
const preferredRangeValue = ref('');
const isAddress = ref(false);
const myLocation = ref("");
const isClientContactAgreement = ref(false);
const professions = proList;
const mapImage = map_image;
const desiredRange = ref("")
//const range = ref(null);
const lat = ref(null);
const lng = ref(null);

const o = ref(null);

const mdbLocale = computed(() => {
  const map = { en: 'en', fi: 'fi', sv: 'sv', et: 'et' }
  return map[locale.value] ?? 'fi'
})

// label sets (add your own langs as needed)
const L = computed(() => {
  switch (locale.value) {
    case 'en':
      return {
        firstDay: 0,
        title: "Select date",
        monthsFull:  ['January','February','March','April','May','June','July','August','September','October','November','December'],
        monthsShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        weekdaysFull:  ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
        weekdaysShort: ['Su','Mo','Tu','We','Th','Fr','Sa'],
        weekdaysNarrow: ['S','M','T','W','T','F','S'],
        cancelBtnText: 'Cancel',

        cancelLabel: 'Cansel',
        okLabel: 'OK',
        twelveHour: true


      }
    case 'sv':
      return {
        firstDay: 1,
        title: "Rootsi date",
        monthsFull:  ['januari','februari','mars','april','maj','juni','juli','augusti','september','oktober','november','december'],
        monthsShort: ['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec'],
        weekdaysFull:  ['söndag','måndag','tisdag','onsdag','torsdag','fredag','lördag'],
        weekdaysShort: ['sö','må','ti','on','to','fr','lö'],
        weekdaysNarrow: ['S','M','T','O','T','F','L'],
        cancelBtnText: 'Avbryt',

        cancelLabel: 'Avbryt',
        okLabel: 'OK',
        twelveHour: false
      }
    case 'et':
      return {
        firstDay: 1,
        title: "Vali kuupäev",
        monthsFull:  ['jaanuar','veebruar','märts','aprill','mai','juuni','juuli','august','september','oktoober','november','detsember'],
        monthsShort: ['jaan','veebr','märts','apr','mai','juuni','juuli','aug','sept','okt','nov','dets'],
        weekdaysFull:  ['pühapäev','esmaspäev','teisipäev','kolmapäev','neljapäev','reede','laupäev'],
        weekdaysShort: ['P','E','T','K','N','R','L'],
        weekdaysNarrow: ['P','E','T','K','N','R','L'],
        cancelBtnText: 'Tühista',

        cancelLabel: 'Tühista',
        okLabel: 'OK',
        twelveHour: false
      }
    default:
      return {
        firstDay: 1,
        title: "Valitse päivämäärä",
        monthsFull:  ['tammikuu','helmikuu','maaliskuu','huhtikuu','toukokuu','kesäkuu','heinäkuu','elokuu','syyskuu','lokakuu','marraskuu','joulukuu'],
        monthsShort: ['tammi','helmi','maalis','huhti','touko','kesä','heinä','elo','syys','loka','marras','joulu'],
        weekdaysFull:  ['sunnuntai','maanantai','tiistai','keskiviikko','torstai','perjantai','lauantai'],
        weekdaysShort: ['su','ma','ti','ke','to','pe','la'],
        weekdaysNarrow: ['S','M','T','K','T','P','L'],
        cancelBtnText: 'Peruuta',
        clearLabel: 'Poista',

        cancelLabel: 'Peruuta',
        okLabel: 'Ok',
        twelveHour: false
      }
  }
})

// force a *full* re-init of both pickers whenever locale changes
const reInitKey = computed(() => `dt-${locale.value}`)


// Reactive options derived from current locale
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

// const tpOptions = computed(() => {
//   const L = labels[locale.value] ?? labels.en
//   return {
//     cancelLabel: L.time.cancelLabel,
//     okLabel: L.time.okLabel,
//     twelveHour: L.time.twelveHour
//   }
// })

// Force remount when locale changes so popup re-inits with new labels
//const reinitKey = computed(() => `dt-${locale.value}`)



const isLocating = ref(false)                     // used to show the spinner


const currentLang = computed(() => locale.value.split('-')[0])
watch(currentLang, (lang) => {
  console.log(`Hetke keelevalik - ${lang}`);
  selectedLang.value = lang;
}, { immediate: true })


onMounted(async() => {
  validateMaps();


})

const validateMaps = async() => {
  try {
    await loadGoogleMaps();
    console.log("Map is inited in Recipient form! ✅");
    const center = { lat: 50.064192, lng: -130.605469 };
    // Create a bounding box with sides ~10km away from the center point
    const defaultBounds = {
      north: center.lat + 0.1,
      south: center.lat - 0.1,
      east: center.lng + 0.1,
      west: center.lng - 0.1,
    };

    const input = document.getElementById("location");

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
      lng.value = place.geometry.location.lng()

      form.address = place.formatted_address
      console.log(place)
    })
  } catch (err) {
    console.error('Google Maps failed to load ❌', err);
    mapsError.value = true;
  }
}


const myCurrentLocation = async() => {
  if (navigator.geolocation) {
    await navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      // Show a map centered at latitude / longitude.
      lat.value = latitude
      lng.value = longitude
      showClientLocationData (latitude, longitude)
    });
  }

}


const showClientLocationData = (lat, long) => {
  axios.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat +
      "," + long
      + "&key=" + import.meta.env.VITE_APP_MAP_KEY)
      .then(response => {
        if (response.data.error_message) {
          //this.error = response.data.error_message;

          console.log(response.data.error_message)
        } else {
          form.address = response.data.results[1].formatted_address;
          console.log("Address now " + form.address);
        }

      })
      .catch(error => {
        //this.error = error.message
        console.log(error.message)
      })
}

const showAddress = () => {
  isAddress.value = true;
  myCurrentLocation();
}

const clearAddress = () => {
  isAddress.value = false;
  form.address = '';

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

const parseDmyTime = (str) => {
  const m = str?.match(/^(\d{2})\/(\d{2})\/(\d{4}),?\s+(\d{2}):(\d{2})$/);
  if (!m) return null;
  const [, dd, mm, yyyy, HH, MM] = m.map(Number);
  return new Date(yyyy, mm - 1, dd, HH, MM);
}

const createClient = async() => {
  if (!validateForm()) {
    console.log("Midagi puudu:", form);


    const dateObj = parseDmyTime(form.dateTime);
    let ms;
    if (dateObj) {
      o.value = dateObj;
      ms = dateObj.getTime();
      console.log("Milliseconds:", ms);  // e.g. 1758976800000
    } else {
      console.log("Invalid date string");
    }




    clientFormErrorMsg.value = "Kentät pitäisi huomioida!"
    isInitClientError.value = true;
  } else {
    console.log("Header - " + form.orderHeader);
    const dateObj = parseDmyTime(form.dateTime);
    let ms;
    if (dateObj) {
      o.value = dateObj;
      console.log("DATE - " + dateObj);
      ms = dateObj.getTime();
      console.log("Milliseconds:", ms);  // e.g. 1758976800000
    } else {
      console.log("Invalid date string");
    }

    const client = {
      created: dateObj,
      created_ms: ms,
      dateStr: form.dateTime,
      header: form.orderHeader,
      agreement: isClientContactAgreement.value,
      address: form.address,
      latitude: lat.value,
      longitude: lng.value,
      zone: desiredRange.value !== "" ? desiredRange.value : 0,
      professional: form.profession.label,
      isIncludeOffers: true,
      description: form.explanation,
      status: "notSeen",
      //imageId: this.imgId ? this.imgId : []
    }

    const booking = await clientService.addRecipient(userAuth.user.id, client);

    if (booking) {
      emit('createBookingMultiple', booking)
    }

  }

}

</script>

<style >
.message-counter {
  float: right;
  opacity: 0.5;
}

  .mapGif {
    width: 40px;
    cursor: pointer;
  }
  @media (max-width: 480px) {
    /*.mapGif {*/
    /*  width: 30px;*/
    /*}*/
  }


.hideInput {
  display: none;
}

</style>
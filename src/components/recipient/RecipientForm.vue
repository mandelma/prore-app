<template>
  <div>
<!--    v-bind:style="isNoPro ? 'color: pink; border: 1px solid red;' : 'color: white;'"-->
    <MDBContainer>
<!--      g-3 needs-validation   -->
      <div class="form-card">
        <p style="margin-top: 10px;">{{t('client_form_offersOrQuickSolution')}}</p>
        <form class="g-3 needs-validation" novalidate @submit.prevent="checkForm" autocomplete="off" style=" padding: 5px;">
          <MDBRow>

            <MDBCol col="10">
              <div style="text-align: left; padding-bottom: 23px;">
                <Select
                    style="width: 100%;"
                    v-model="profession"
                    :options="professions"
                    filter optionLabel="label"
                    optionGroupLabel="label"
                    optionGroupChildren="items"
                    placeholder="Valitse ammattilainen"
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

            </MDBCol>

            <MDBCol col="2">
              <div style="width: 100%;" @click="$router.push('/pro-around')">
                <img class="mapGif" :src="mapImage" alt="from_map" />
              </div>

            </MDBCol>
          </MDBRow>


          <MDBInput
              counter :maxlength="30"

              label="Syötä tilauksen avainsana"
              v-model="orderHeader"

              size="lg"

              invalidFeedback="Ole hyvä ja kirjoita avainsana."
              validFeedback="Ok!"
              required
              wrapperClass="mb-4"
          >
          </MDBInput>

          <MDBRow>
            <MDBCol lg="6">

              <div  class="input-group mb-3">
                <!-- MDB input inside input-group -->
                <MDBInput
                    size="lg"
                    id="location"
                    v-model="address"
                    label="Anna osoite"
                    placeholder=""
                    wrapperClass="form-outline flex-grow-3"
                    :inputClass="'ps-0'"
                    aria-describedby="button-addon2"
                />

                <MDBBtn  style="border: 1px solid #ddd;" type="button" @click="clearAddress">
                  <i class="fas fa-times" ></i>
                </MDBBtn>
              </div>

            </MDBCol>
            <MDBCol lg="6">
              <div style="margin-bottom: 13px;">

                <MDBInput
                    size="lg"
                    label="Valitse haluamasi alue - km"
                    type="number"
                    onkeypress="return event.charCode >= 48" min="0"
                    v-model="range"
                >

                </MDBInput>


              </div>
            </MDBCol>

          </MDBRow>
          <div >

<!--            <div class="grid grid-cols-2 gap-3" :key="reInitKey">-->
<!--              &lt;!&ndash; DATE: pass props directly, not via :options &ndash;&gt;-->
<!--              <MDBDatepicker-->
<!--                  v-model="datePart"-->
<!--                  label="Date"-->
<!--                  :firstDay="L.firstDay"-->
<!--                  :monthsFull="L.monthsFull"-->
<!--                  :monthsShort="L.monthsShort"-->
<!--                  :weekdaysFull="L.weekdaysFull"-->
<!--                  :weekdaysShort="L.weekdaysShort"-->
<!--                  format="dd.mm.yyyy"-->
<!--                  disablePast-->
<!--              />-->

<!--              &lt;!&ndash; TIME: pass labels directly &ndash;&gt;-->
<!--              <MDBTimepicker-->
<!--                  v-model="timePart"-->
<!--                  label="Time"-->
<!--                  :cancelLabel="L.cancelLabel"-->
<!--                  :okLabel="L.okLabel"-->
<!--                  :twelveHour="L.twelveHour"-->
<!--              />-->
<!--            </div>-->









            <MDBDateTimepicker
                size="lg"
                label="Select Date and Time"
                v-model="dateTime"

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
          </div>

          <!--          auto-position="top"-->

          <p style="text-align: left;">Mihin aikaan tarvitset ammattilaista?</p>

          <div style="color: #fff;">

          </div>

          <div style="text-align: left;">
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
              <MDBTextarea
                  maxlength="70"
                  label="Kuvaus tilauksen sisällöstä..."
                  rows="3"
                  v-model="explanation"
                  invalidFeedback="Ole hyvä ja kirjoita tehtävän kuvaus."
                  validFeedback="Ok!"
                  required
              />
              <span class="message-counter"> {{explanation.length}} / 70</span>
            </MDBCol>
            <MDBCol lg="6">
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

          <MDBBtn outline="success" size="lg"  @click="addRecipient" style="margin-top:5px; margin-bottom: 20px;" type="submit">Submit</MDBBtn>

        </form>
      </div>
<!--      <MDBBtn block @click="$router.push('/follow-pos')">Start watching</MDBBtn>-->
    </MDBContainer>
  </div>
</template>

<script setup>
/* global google */
import {MDBContainer, MDBRow, MDBCol, MDBBtn, MDBCheckbox, MDBTextarea, MDBBtnClose, MDBInput, MDBIcon, MDBDateTimepicker, MDBDatepicker, MDBTimepicker} from "mdb-vue-ui-kit";

import { ref, onMounted, computed } from 'vue'
import proList from '@/components/controllers/professions'
import Select from 'primevue/select';
import map_image from '@/assets/map.gif'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n';
//import {useI18n} from "vue-i18n/dist/vue-i18n";
import '@/styles/pro-select.css';
defineOptions({
  name: 'recipient-form'
  // you can also set other options here if needed
})

const { locale, t } = useI18n();

const router = useRouter();
const profession = ref("");
const professions = proList;
const explanation = ref("");
const mapImage = map_image;
const orderHeader = ref("");
const range = ref(null);
const address = ref(null);
const lat = ref(null);
const lng = ref(null);
const dateTime = ref("");
//const datePart = ref('')
//const timePart = ref('')
//const combined = computed(() => datePart.value && timePart.value ? `${datePart.value} ${timePart.value}` : '')

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
        clearLabel: 'fuck',

        cancelLabel: 'Peruuta',
        okLabel: 'Ok',
        twelveHour: false
      }
  }
})

// force a *full* re-init of both pickers whenever locale changes
const reInitKey = computed(() => `dt-${locale.value}`)


// Reactive options derived from current locale
const dpOptions = computed(() => {
  const L = labels[locale.value] ?? labels.en
  return {
    firstDay: L.firstDay,
    monthsFull: L.monthsFull,
    monthsShort: L.monthsShort,
    weekdaysFull: L.weekdaysFull,
    weekdaysShort: L.weekdaysShort,
    // choose an input format you want (affects the text in the input)
    format: 'dd.mm.yyyy'
  }
})

const tpOptions = computed(() => {
  const L = labels[locale.value] ?? labels.en
  return {
    cancelLabel: L.time.cancelLabel,
    okLabel: L.time.okLabel,
    twelveHour: L.time.twelveHour
  }
})

// Force remount when locale changes so popup re-inits with new labels
//const reinitKey = computed(() => `dt-${locale.value}`)






onMounted(() => {
  clientCurrentLocation();
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

    address.value = place.formatted_address
    console.log(place)
  })
})

const clientCurrentLocation = async () => {
  if (navigator.geolocation) {
    await navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      // Show a map centered at latitude / longitude.
      lat.value = latitude
      lng.value = longitude
      console.log("Latitude is: " + lat.value);
      showClientLocationData (latitude, longitude);
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
          address.value = response.data.results[1].formatted_address;
          console.log("Address now " + address.value);
        }

      })
      .catch(error => {
        //this.error = error.message
        console.log(error.message)
      })
}

const clearAddress = () => {
  address.value = null;
}

</script>

<style >
  input label {
    color: red;
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
</style>
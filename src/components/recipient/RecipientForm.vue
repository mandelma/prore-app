<template>
  <div>
    <MDBContainer>
<!--      g-3 needs-validation   -->

      <HandleToast
        v-model="toastModel"
        :toast-name="toastState"
        :icon-state="toastIcon"
        :text="toastContent"
      />

      <!-- <HandleMapErrorToast
        v-model="mapToastModel"
        :toast-name="mapToastState"
        :icon-state="mapToastIcon"
        :text="mapToastContent" 
      /> -->

      <!-- <button @click="testToast">Show toast</button> -->


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
        <div style="display: flex; justify-content: space-between;">
          <p style="margin-top: 10px; color: #00BFFFFF;">{{t('client_form_offersOrQuickSolution')}}</p>
          <MDBBtnClose white @click="router.go(-1)"/>
        </div>
        
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
                      :placeholder="t('client_form_profession_field')"

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
                :label="t('client_form_title')"
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

              <div :class="{hideInput: !form.address && isAddress}" style="width: 100%;" class="field-wrapper ">
                <div  class="input-group">
                  <MDBInput
                      size="lg"
                      id="location"

                      v-model="form.address"
                      :label="t('client_form_address')"
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
                    :label="t('client_form_range')"
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
                  :label="t('client_form_when_field')"
                  v-model="form.dateTime"
                  :toggleButton="false"
                  inputToggle

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
              :label="t('client_form_allow_email')"
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
                    :label="t('client_form_description')"
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
              

              <div v-if="!isAddPhotos">
                <div>
                  <MDBBtn v-if="!isAddPhotos && !addedPhotos.length" color="light" @click="isAddPhotos = true">Lisää halutessasi kuvia tehtävästä</MDBBtn>
                  <MDBBtn v-else color="light" @click="isAddPhotos = true">Muokkaa kuvia</MDBBtn>
                </div>
                
                

                <div v-if="addedPhotos?.length" class="photos-grid">
                  
                  <figure
                    v-for="(photo, idx) in addedPhotos"
                    :key="photo.id || idx"
                    class="photo-card"
                  >
                    <img class="photo-img" :src="photo.imageUrl || photo.previewUrl" :alt="photo.alt || 'Booking photo'" />
                    <div v-if="photo?.text?.trim()" class="photo-overlay">
                
                      <p>{{ photo.text }}</p>
                    </div>
                  </figure>
                  
                </div>

                <div v-else class="empty-state">
                  
                  <p v-if="!addedPhotos.length" class="empty-state__text">Kuvien lisääminen auttaa palveluntarjoajia arvioinnissa.</p>
                </div>


              </div>

              <!-- Booking pictures section -->
              <form v-else class="panel__body" @submit.prevent="saveBookingPhotos">
                <div class="form-card">
                  
                  <div class="divider"></div>

                  <div class="photos">
                    <div class="photos__header">
                      <h5 class="section-title">Kuvat</h5>
                      <MDBBtn color="primary" @click="openFilePicker">Lisää kuvia</MDBBtn>
                      
                      <input
                        ref="fileInput"
                        class="sr-only"
                        type="file"
                        accept="image/*"
                        multiple
                        @change="onFilesSelected"
                      />

                      <input
                          ref="replaceInput"
                          class="sr-only"
                          type="file"
                          accept="image/*"
                          @change="onReplaceSelected"
                      />
                    </div>

                    <!-- (Optional) dropzone -->
                    <div
                      class="dropzone"
                      @dragenter.prevent="onDragEnter"
                      @dragover.prevent
                      @dragleave="onDragLeave"
                      @drop.prevent="onDrop"
                      :class="{ 'dropzone--active': isDragOver }"
                    >
                      <p class="dropzone__title">Vedä ja pudota kuvia tähän</p>
                      <p class="dropzone__text">tai paina “Lisää kuvia”</p>
                    </div>

                    <div v-if="draftPhotos?.length" class="photos-grid">
                      <figure
                        v-for="(photo, idx) in draftPhotos"
                        :key="photo.id || idx"
                        class="photo-card"
                      >
                         <div class="photo-media">
                          <img class="photo-img" :src="photo.imageUrl || photo.previewUrl" :alt="photo.alt || 'Booking photo'" />
                          <textarea
                            v-model="photo.text"
                            class="photo-caption"
                            placeholder="Lisää kuvaus..."
                          ></textarea>
                          <!-- <div class="photo-overlay">
                            <textarea v-model="photo.text" placeholder="Lisää kuvaus..." />
                          </div> -->
                        </div>
                        <figcaption class="photo-actions">
                          
                          <i class="fas fa-trash-alt fa-lg" style="color: red;" @click="removeDraftPhoto(idx)"></i>
                          
                        </figcaption>
                      </figure>
                    </div>
                  </div>

                  <div class="actions">
                    <button class="btn btn-danger" type="button" @click="cancelAddPhotos">
                      Peruuta
                    </button>

                    <button class="btn btn-success" type="submit" :disabled="!isDirty">
                      Tallenna
                    </button>
                  </div>

                </div>
              </form>
            </MDBCol>

          </MDBRow>

          <MDBBtn color="primary" size="lg"  style="margin-top:13px; margin-bottom: 20px;" type="submit">{{ t('client_form_btn_send') }}</MDBBtn>

        </form>
      </div>
    </MDBContainer>
  </div>
</template>

<script setup>
/* global google */
import {MDBContainer, MDBRow, MDBCol, MDBBtn, MDBCheckbox, MDBTextarea, MDBToast, MDBInput, MDBIcon, MDBDateTimepicker, MDBSpinner, MDBDatepicker, MDBTimepicker, MDBBtnClose} from "mdb-vue-ui-kit";

import { ref, onMounted, onUnmounted, onBeforeUnmount, computed, nextTick, reactive, watch } from 'vue'
import { useLoginStore } from "@/stores/login.js";
import proList from '@/components/controllers/professions'
import Select from 'primevue/select';
import map_image from '@/assets/map.gif'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n';
import clientService from '../../service/recipients';
import uploadService from '../../service/awsUploads';
import { loadGoogleMaps} from '../controllers/loadGoogleMap.js'
import RecipientPage from '@/components/recipient/RecipientPage.vue'
import HandleMapErrorToast from '@/components/helpers/ToastHandler.vue'
import HandleToast from '@/components/helpers/ToastHandler.vue'
import '@/styles/pro-select.css';

defineOptions({
  name: 'recipient-form'
});

const emit = defineEmits(['createBookingMultiple'])

const { locale, t } = useI18n();

const router = useRouter();
const route = useRoute();

const form = reactive({
  profession: "",
  orderHeader: "",
  address: "",
  dateTime: "",
  explanation: ""
});
const errors = reactive({});


const validateForm = () => {
  errors.profession = form.profession ? "" : "Ammatti on pakollinen kenttä";
  errors.orderHeader = form.orderHeader ? "" : "Avainsana on pakollinen kenttä";
  errors.address = form.address ? "" : "Osoite on pakollinen kenttä";
  errors.dateTime = form.dateTime ? "" : "Päivämäära on pakollinen kenttä";
  errors.explanation = form.explanation ? "" : "Kuvaus on pakollinen kentta";

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
const mapError = ref(false);
const desiredRange = ref("")
//const range = ref(null);
const lat = ref(null);
const lng = ref(null);

const o = ref(null);

// Photos variables
const isAddPhotos = ref(false);
const addedPhotos = ref([]);
const draftPhotos = ref([]);
const removedPhotoIds = ref([]);
const fileInput = ref(null);
const replaceInput = ref(null);
const isDragOver = ref(false);
let dragCounter = 0;

const toastModel = ref(false)
const toastState = ref('')       // 'success' | 'danger' | 'info' | etc.
const toastIcon = ref('')        // optional
const toastContent = ref('')

const mapToastModel = ref(false);
const mapToastState = ref('');
const mapToastIcon = ref('');
const mapToastContent = ref('');


function testToast() {
  toastState.value = 'success'
  toastIcon.value = 'fas fa-exclamation-circle fa-lg me-2'
  toastContent.value = 'Hallo Helsinki'
  toastModel.value = true
}



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

const isLocating = ref(false)                     // used to show the spinner


const currentLang = computed(() => locale.value.split('-')[0])
watch(currentLang, (lang) => {
  console.log(`Hetke keelevalik - ${lang}`);
  selectedLang.value = lang;
}, { immediate: true })


onMounted(async() => {
  validateMaps();

  //console.log("P --- ", professions)

  getReadyDataParams()
})

const validateMaps = async() => {
  mapError.value = false;
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
    mapError.value = true;
    mapToastModel.value = true;
    mapToastState.value = 'danger';
    mapToastIcon.value = 'fas fa-check fa-lg me-2';
    mapToastContent.value = 'Internet yhteys puuttuu!';
  }
}

const getReadyDataParams = () => {
  const clientData = route.query.content;

  if (clientData) {
    const parsed = JSON.parse(clientData);

    console.log("C Data - ", parsed);

    // 🔥 Find matching option object
    const selectedProfession = professions
    .flatMap(group => group.items)
    .find(p => p.label === parsed.professional);

    if (selectedProfession) {
      form.profession = selectedProfession;
    } else {
      console.log("Profession not found in options");
    }
  } else {
    console.log("No client data");
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

// When entering edit mode, create draft from photos existing
/* watch(isAddPhotos, (val) => {
  draftPhotos.value = val ? createDraftFromPhotos() : [];
}); */














watch(draftPhotos, () => {
  console.log("draft changed");
}, { deep: true });

const normalizeForCompare = (img) => ({
  id: img.imageId ?? img._id ?? img.id ?? img.key ?? null,
  url: img.imageUrl ?? img.url ?? img.path ?? img.location ?? null,
  text: img.text ?? "",
  order: img.order ?? 0,
  isNew: !!img.file || (!!img.previewUrl && !img.imageUrl),
});

const signature = (arr) =>
  Array.isArray(arr)
    ? arr
        .map(normalizeForCompare)
        .map(x =>
          [
            x.isNew ? "NEW" : x.id ?? "",
            x.url ?? "",
            (x.text ?? "").trim(),
          ].join("|")
        )
        .join("||")
    : "";


/* const isDirty = computed(() => {
  if (!draftPhotos.value) return false;

  const a = signature(draftPhotos.value);
  const b = signature(addedPhotos.value);

  return a !== b;
}) */

// Copy photos
const clonePhoto = (p) => ({...p});

watch(isAddPhotos, (val) => {
  if (val) {
    draftPhotos.value = addedPhotos.value.map(clonePhoto);
    removedPhotoIds.value = [];
  }
});

const isDirty = computed(() => {
  return signature(draftPhotos.value) !== signature(addedPhotos.value);
});

const serverPhotoFormat = (p) => {
  const upload = p.imageId && typeof p.imageId === "object" ? p.imageId : null;

  return {
    imageId: upload?._id ?? p.imageId ?? p.id ?? p._id ?? null,
    imageUrl: upload?.imageUrl ?? p.imageUrl ?? p.url ?? p.path ?? p.location ?? null,
    text: p.text || "",
    order: p.order ?? 0,
    previewUrl: null,
    file: null,
    slotId: crypto.randomUUID(),
  };
};

/* const createDraftFromPhotos = () => {
  return {
    photos: (addedPhotos.value || []).map(serverPhotoFormat),
  };
} */

const openFilePicker = () => {
  fileInput.value?.click();
  console.log("Clicked")
  if (!isAddPhotos.value) isAddPhotos.value = true;

  //if (!draftPhotos.value) return;
}
function onFilesSelected(e) {
  const files = Array.from(e.target.files || []);
  addFiles(files);
  e.target.value = "";
}

function onDragEnter(e) {
  if (!e.dataTransfer?.types.includes("Files")) return;
  dragCounter++;
  isDragOver.value = true;
}

function onDragLeave(e) {
  dragCounter--;
  if (dragCounter === 0) {
    isDragOver.value = false;
  }
}

function onDrop(e) {
  dragCounter = 0;
  isDragOver.value = false;

  const files = Array.from(e.dataTransfer.files || []).filter(f =>
    f.type.startsWith("image/")
  );

  if (files.length) {
    addFiles(files);
  }
}

function addFiles(files) {
  //if (!draftPhotos.value.length) return;
  //draftPhotos.value = [];

  for (const file of files) {
    draftPhotos.value.push({
      imageId: null,
      imageUrl: null,
      previewUrl: URL.createObjectURL(file),
      file,
      text: "",
      order: draftPhotos.value.length,
      slotId: crypto.randomUUID(),
    });
  }
}

const removeDraftPhoto__ = (idx) => {
  if (!isAddPhotos.value) isAddPhotos.value = true;
  
  if (!draftPhotos.value?.length) return;
  
  const photo = draftPhotos.value[idx];

  removedPhotoIds.value.push(photo.id)
  
  if (photo?.previewUrl?.startsWith("blob:")) {
    URL.revokeObjectURL(photo.previewUrl);
  }

  draftPhotos.value.splice(idx, 1);
  //if (addedPhotos.value.length) addedPhotos.value.splice(idx, 1);
}

const removeDraftPhoto = (idx) => {
  const photo = draftPhotos.value?.[idx];
  if (!photo) return;

  /* if (photo.previewUrl?.startsWith("blob:")) {
    URL.revokeObjectURL(photo.previewUrl);
  } */

  draftPhotos.value.splice(idx, 1);
};

const cancelAddPhotos__ = () => {
  console.log("Cancelled to add photos");

  isAddPhotos.value = false;
}

const cancelAddPhotos = () => {
  draftPhotos.value.forEach(p => {
    if (p.previewUrl?.startsWith("blob:") && !addedPhotos.value.some(a => a.previewUrl === p.previewUrl)) {
      URL.revokeObjectURL(p.previewUrl);
    }
  });

  draftPhotos.value = addedPhotos.value.map(clonePhoto);
  removedPhotoIds.value = [];
  isAddPhotos.value = false;
};

const saveBookingPhotos__ = () => {
  console.log("Saving booking photos");
  //addedPhotos.value = [...draftPhotos.value];
  addedPhotos.value = draftPhotos.value.map(p => ({ ...p }));
  isAddPhotos.value = false;
}

const uploadBookingPhotos__ = async () => {
  const pending = (addedPhotos.value || []).filter(p => p.file);

  if (!pending.length) {
    return { uploaded: [] };
  }

  const fd = new FormData();
  pending.forEach(p => fd.append("files", p.file));

  const res = await uploadService.uploadClientImage(fd);

  const uploaded = Array.isArray(res) ? res : [res].filter(Boolean);

  return { uploaded };
};

const uploadBookingPhotos = async () => {
  const pending = addedPhotos.value.filter(p => p.file);

  if (!pending.length) {
    return { uploaded: [] };
  }

  const fd = new FormData();
  pending.forEach(p => fd.append("files", p.file));

  const res = await uploadService.uploadClientImage(fd);

  console.log("UPLOAD RAW RESPONSE:", res);

  const uploaded =
    res?.data?.uploaded ??
    res?.data?.uploads ??
    res?.data?.files ??
    res?.uploaded ??
    res?.uploads ??
    res?.files ??
    res?.data ??
    res;

  return {
    uploaded: Array.isArray(uploaded) ? uploaded : [uploaded].filter(Boolean),
  };
};

const saveBookingPhotos = () => {
  addedPhotos.value = draftPhotos.value.map(clonePhoto);

  // only here commit removed ids if needed for backend
  removedPhotoIds.value = draftPhotos.value
    .filter(p => p._removed)
    .map(p => p.imageId ?? p._id ?? p.id)
    .filter(Boolean);

  isAddPhotos.value = false;
};

const buildPhotosPayload = () => {
  return {
    photos: (addedPhotos.value || [])
      .map((p, index) => ({
        imageId: p.imageId,
        text: p.text?.trim() || "",
        order: index,
      })),
    removedPhotoIds: [...new Set(removedPhotoIds.value.filter(Boolean))],
  };
};

const parseDmyTime = (str) => {
  const m = str?.match(/^(\d{2})\/(\d{2})\/(\d{4}),?\s+(\d{2}):(\d{2})$/);
  if (!m) return null;
  const [, dd, mm, yyyy, HH, MM] = m.map(Number);
  return new Date(yyyy, mm - 1, dd, HH, MM);
}

const getUploadId = (upload) =>
  upload?._id ??
  upload?.id ??
  upload?.imageId ??
  upload?.file?._id ??
  upload?.file?.id ??
  upload?.upload?._id ??
  upload?.upload?.id;

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

    const pendingPhotos = addedPhotos.value.filter(p => p.file);

    const { uploaded } = await uploadBookingPhotos();

    const photosForBackend = pendingPhotos
    .map((photo, index) => {
      const upload = uploaded[index];
      const imageId = getUploadId(upload);

      return {
        imageId,
        text: photo.text?.trim() || "",
        order: index,
      };
    })
    .filter(p => p.imageId);

    const photosForLocalState = pendingPhotos
    .map((photo, index) => {
      const upload = uploaded[index];
      const imageId = getUploadId(upload);

      return {
        imageId,
        imageUrl:
          upload?.imageUrl ||
          upload?.url ||
          upload?.location ||
          upload?.path ||
          photo.previewUrl,
        /* previewUrl: photo.previewUrl, */
        text: photo.text?.trim() || "",
        order: index,
        slotId: photo.slotId,
      };
    })
    .filter(p => p.imageId || p.previewUrl);

    const client = {
      author_id: userAuth.user.id,
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
      photos: photosForBackend,
      status: "active",
    }

    const booking = await clientService.addRecipient(userAuth.user.id, client);

   
    if (booking) {
      emit("createBookingMultiple", {
        ...booking,
        photos: photosForLocalState,
      });
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

.hideInput {
  display: none;
}

/* Photos */
.photos__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.photo-card {
  position: relative;
  margin: 13px 0;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,.10);
  background: rgba(0,0,0,.02);
}

.photo-caption {
  width: 100%;
  margin-top: 9px;
  background: rgb(25, 36, 43);
  resize: none;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 6px 8px;
  font-size: 14px;
  min-height: 50px;
}


.photo-media {
  position: relative;
}

/* image stays normal */
.photo-img {
  display: block;
  width: 100%;
  border-radius: 8px;
}

/* overlay ONLY covers the image */
.photo-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;

  background: rgba(0, 0, 0, 0.5);
  /* background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8),
    rgba(0, 0, 0, 0.2),
    transparent
  ); */
  padding: 6px;
  border-radius: 0 0 8px 8px;
  font-size: 13px;
}

.photo-overlay p {
  display: -webkit-box;
  -webkit-line-clamp: 3;   /* max 3 lines */
  -webkit-box-orient: vertical;
  overflow: hidden  ;
  
}

/* textarea styling */
.photo-overlay textarea {
  width: 100%;
  background: transparent;
  color: white;
  border: none;
  resize: none;
}

.photo-overlay textarea:focus {
  outline: none;
}
.photo-img {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}







/* .photo-img {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
} */

.photo-actions {
  /* display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 8px; */
  display: flex;
  justify-content: right;
  padding: 12px;
  background: #ddd;
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 8px;
}

.icon-btn {
  border: 1px solid rgba(0,0,0,.12);
  background: #fff;
  border-radius: 10px;
  padding: 8px 10px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}

.icon-btn--danger {
  border-color: rgba(220, 38, 38, .35);
}

.empty-state__title {
  margin: 0;
  font-size: 13px;
}

.empty-state__text {
  margin: 6px 0 0;
  font-size: 12px;
  opacity: 0.7;
}

.dropzone {
  border: 1px dashed rgba(255,255,255,.25);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 13px;
  transition: transform .08s ease, border-color .08s ease, background .08s ease;
}

.dropzone--active {
  border-color: rgba(59,130,246,.9);
  border-radius: 12px;
  margin: 0 5px 13px 5px;
  background: rgba(59,130,246,.08);
  transform: scale(1.01);
}


.dropzone__title {
  margin: 0;
  font-size: 13px;
}

.dropzone__text {
  margin: 6px 0 0;
  font-size: 12px;
  opacity: 0.7;
}

@media (max-width: 980px){
  .photos-grid{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 600px){
  .photos-grid{ grid-template-columns: 1fr; }
}

</style>
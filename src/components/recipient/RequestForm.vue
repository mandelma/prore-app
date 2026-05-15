<template>
    <MDBContainer>
        <form style="background-color: #0b1618; padding: 17px; border: 1px solid #1B2330; border-radius: 8px;">
          <div style="display: flex; justify-content: right;">
            <MDBBtn type="button" outline="info" @click="handleOpenChat">
              <i class="far fa-comments fa-2x"></i>
            </MDBBtn>

            
            
          </div>
        
          <div class="field-wrapper">
            <p>{{ props.target?.profession.join(', ')}}</p>
          </div>
          <div class="field-wrapper">

            <MDBDateTimepicker
              v-if="!props.date"
              size="lg"
              label="Valitse tehtävän päivämäärä ja aika"
              v-model="dateTime"
              :toggleButton="false"
              inputToggle

              :datepicker="{
              ...L
              }"
                :timepicker="{
                ...L,
                hoursFormat: 24
              }"

              
                disablePast
            />
            </div>

            <!-- <p>{{ formatLocalDate(props.date) }}</p> -->
            <div >
            <p v-if="props.date || dateTime">{{ props.date }}</p>
            
          
            <p v-else style="color: red;">Tehtävän päivämäärä ja kellonaika on pakollinen</p>
          </div>

       

          <div style="width: 100%;" class="field-wrapper">
            <div class="input-group">
              <MDBInput
                size="lg"
                id="request-address-input"
                v-model="form.address"
                label="Anna osoite *"
                placeholder=""
                wrapperClass="form-outline flex-grow-3"
                :inputClass="'ps-0'"
                aria-describedby="button-addon2"
              />

              <MDBBtn
                type="button"
                style="border:1px solid #ddd"
                @click="form.address ? clearAddress() : showAddress()"
              >
                <MDBIcon size="2x">
                  <i :class="form.address ? 'fas fa-times' : 'fas fa-search-location'"></i>
                </MDBIcon>
              </MDBBtn>
            </div>

            <span v-if="errors.address" class="field-footer">{{ errors.address }}</span>
          </div>

          <div v-show="isLoadingAddress" style="text-align: center; padding-bottom: 27px;">
            <MDBSpinner grow color="info" />
          </div>

          <div class="field-wrapper">
              <MDBInput
                  label="Syötä tilauksen avainsana *"
                  v-model="form.requestHeader"
                  size="lg"
                  invalidFeedback="Ole hyvä ja kirjoita avainsana."
                  validFeedback="Ok!"
                  required

              />
              <span v-if="errors.requestHeader" class="field-footer">{{ errors.requestHeader }}</span>
              <!-- custom error text -->
              
          <div style="margin-top: 17px;" class="field-wrapper">
              <MDBTextarea
                  maxlength="70"
                  label="Kuvaus tilauksen sisällöstä *"
                  rows="3"
                  v-model="form.requestContent"
                  invalidFeedback="Ole hyvä ja kirjoita tehtävän kuvaus."
                  validFeedback="Ok!"
                  required
              />
              <span v-if="errors.requestContent" class="field-footer">{{ errors.requestContent }}</span>
              <span class="message-counter"> {{form.requestContent.length}} / 70</span>
              </div>

          </div>




          <!-- About pictures -->
           <div v-if="!isAddPhotos">
              <div>
                <MDBBtn v-if="!isAddPhotos && !addedPhotos.length" color="light" @click="isAddPhotos = true">Lisää halutessasi kuvia tehtävästä</MDBBtn>
                <MDBBtn v-else color="light" @click="isAddPhotos = true">Muokkaa kuvia</MDBBtn>
              </div>
              
              

              <!-- <div v-if="addedPhotos?.length" class="photos-grid">
                
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
                
              </div> -->

              <BookingPhotos
                
                :photos="addedPhotos"
                :editable="isAddPhotos"
                @remove="removeDraftPhoto"
              />
              
              <!-- v-else -->
              <div v-if="!addedPhotos?.length" class="empty-state">
                
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


                  

                  <!-- <div v-if="draftPhotos?.length" class="photos-grid">
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
                        
                      </div>
                      <figcaption class="photo-actions">
                        
                        <i class="fas fa-trash-alt fa-lg" style="color: red;" @click="removeDraftPhoto(idx)"></i>
                        
                      </figcaption>
                    </figure>
                  </div> -->

                  

                  <BookingPhotos
                    
                    :photos="draftPhotos"
                    :editable="isAddPhotos"
                    @remove="removeDraftPhoto"
                  />


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
          <!-- Send booking if date is entered -->
          <div style="display: flex; justify-content: right; margin-top: 17px;">
            <MDBBtn color="primary" :disabled="!props.date && !dateTime" @click="handleRequest">LÄHETÄÄ TILAUS</MDBBtn>
          </div>
          
        </form>
        
    </MDBContainer>
</template>
<script setup>
  import { ref, onMounted, onUnmounted, onBeforeUnmount, computed, nextTick, reactive, watch } from 'vue'
  import {MDBContainer, MDBTextarea, MDBInput, MDBBtn, MDBIcon, MDBDateTimepicker, MDBSpinner} from 'mdb-vue-ui-kit';
  import { storeToRefs } from 'pinia';
  import { useConversationStore } from '@/stores/conversationStore';
  import { useMapStore } from '@/stores/mapStore';
  import { loadGoogleMaps } from '../controllers/loadGoogleMap';
  import { getBottomRightAnchor } from '../helpers/chatGeometry.js';
  import BookingPhotos from './BookingPhotos.vue';
  import uploadService from '@/service/awsUploads.js';

  import { useBookingPhotos as useBookingPhotosLogic } from '@/components/helpers/useBookingPhotos.js';;

  defineOptions({
      name: 'request-form'
  })
  const props = defineProps({
      target: {type: null},
      date: String,
      isOpen: Boolean
  })
  const emit = defineEmits(['sendRequest', 'open-chat']);


  const fileInput = ref(null);
  const addedPhotos = ref([]);

  const {
    draftPhotos,
    isAddPhotos,
    isDragOver,
    isDirty,
    onFilesSelected,
    onDragEnter,
    onDragLeave,
    onDrop,
    removeDraftPhoto,
    cancelAddPhotos,
    saveBookingPhotos,
  } = useBookingPhotosLogic(addedPhotos);

  const openFilePicker = () => {
    fileInput.value?.click();
    if (!isAddPhotos.value) isAddPhotos.value = true;
  };

  //Needed i18
  //const reInitKey = computed(() => `dt-${locale.value}`)

  const geocoder = ref(null)
  const lat = ref(null);
  const lng = ref(null);
  const dateTime = ref(null);

  const addressInput = ref(null)
  const autocomplete = ref(null)

  const suppressAutocomplete = ref(false)

  const mapError = ref(false);
  const isAddress = ref(false);
  const isLoadingAddress = ref(false);
  const form = reactive({
    address: "",  
    requestHeader: "",
    requestContent: ""
  });
  const mapStore = useMapStore();
  const conversationStore = useConversationStore();

  const { userPos, lastKnownPos, mapsReady, isLocating, locationError } = storeToRefs(mapStore);

  const errors = reactive({});

  const validateForm = () => {
    errors.address = form.address ? "" : "Osoite on pakollinen kenttä";
    errors.requestHeader = form.requestHeader ? "" : "Avainsana on pakollinen kentä!";
    errors.requestContent = form.requestContent ? "" : "Tilauksen lyhyt kuvaus on pakollinen!";

    return !errors.address && !errors.requestHeader && !errors.requestContent;
  }

  watch(() => form.address, () => (errors.address = ""));

  watch(() => form.requestHeader, () => (errors.requestHeader = ""));

  watch(() => form.requestContent, () => (errors.requestContent = ""));

  watch(props.date, (date) => {
    if (date) {
      dateTime.value = date
    }
  })



  watch(() => props.isOpen, async (open) => {
    if (open) {
      await nextTick()
      setTimeout(async () => {
        await initAutocomplete()
      }, 100)
    }
  })

  const isValidDate = (d) => d instanceof Date && !isNaN(+d);

  onMounted( async () => {
    //await loadGoogleMaps()

    try {
      const initPromise = mapStore.init()
      await nextTick()

      const pos = userPos.value || lastKnownPos.value
      if (pos) {
        lat.value = pos.lat
        lng.value = pos.lng
        await getAddressFromCoords(pos.lat, pos.lng)
      }

      await initPromise
      await initAutocomplete()
    } catch (err) {
      console.error("Map init failed:", err)
    }

  })

  const getAddressFromCoords = async (lat, lng) => {
    try {
      if (!geocoder.value) {
        geocoder.value = new google.maps.Geocoder()
      }

      const response = await geocoder.value.geocode({
        location: { lat, lng },
        region: "fi",
      })

      const result = response.results?.[0]
      if (!result) return null

      form.address = result.formatted_address

      return result
    } catch (err) {
      console.error("Reverse geocoding failed:", err)
      return null
    }
  }


  /* const testPredictions = () => {
    const service = new google.maps.places.AutocompleteService()

    service.getPlacePredictions(
      {
        input: "Helsinki",
        componentRestrictions: { country: "fi" },
        types: ["address"],
      },
      (predictions, status) => {
        console.log("status:", status)
        console.log("predictions:", predictions)
      }
    )
  }
  */

  const initAutocomplete = async () => {
    await nextTick()

    const root = document.getElementById("request-address-input")
    const input = root?.tagName === "INPUT" ? root : root?.querySelector("input")

    console.log("root:", root)
    console.log("input:", input, input?.tagName)

    if (!(input instanceof HTMLInputElement)) {
      console.error("Not a real input element")
      return
    }

    if (autocomplete.value) {
      google.maps.event.clearInstanceListeners(autocomplete.value)
      autocomplete.value = null
    }

    autocomplete.value = new google.maps.places.Autocomplete(input, {
      componentRestrictions: { country: "fi" },
      fields: ["address_components", "geometry", "place_id", "formatted_address"],
      strictBounds: false,
    })

    autocomplete.value.addListener("place_changed", () => {
      const place = autocomplete.value.getPlace()
      console.log("place:", place)

      if (!place.geometry) return

      lat.value = place.geometry.location.lat()
      lng.value = place.geometry.location.lng()
      form.address = place.formatted_address || ""
    })
  }

  const showAddress = async () => {
    isLoadingAddress.value = true
    suppressAutocomplete.value = true

    try {
      const pos = userPos.value || lastKnownPos.value

      if (pos) {
        lat.value = pos.lat
        lng.value = pos.lng
        await getAddressFromCoords(pos.lat, pos.lng)
      }

      await nextTick()

      const root = document.getElementById("request-address-input")
      const input = root?.tagName === "INPUT" ? root : root?.querySelector("input")
      input?.blur()
    } finally {
      isLoadingAddress.value = false

      setTimeout(() => {
        suppressAutocomplete.value = false
      }, 300)
    }
  }

  const clearAddress = () => {
    isAddress.value = false;
    form.address = '';

    
  }

  /* function parseMaybeDate(v) {
    if (v instanceof Date) return isValidDate(v) ? v : null;
    if (typeof v === 'string') {
      const d = new Date(v);
      return isValidDate(d) ? d : null;
    }
    if (typeof v === 'number') {
      const d = new Date(v);
      return isValidDate(d) ? d : null;
    }
    return null;
  } */

  const fromLocalInput = (v) => {
    if (!v) return null;
    if (v instanceof Date) return isValidDate(v) ? v : null;

    if (typeof v === 'string') {
      // 1) ISO or ISO-like
      const dIso = new Date(v.includes('T') ? v : v.replace(',', '').replace(' ', 'T'));
      if (isValidDate(dIso)) return dIso;

      // 2) "YYYY-MM-DD, HH:mm" or "YYYY-MM-DD HH:mm"
      let m = v.match(/^(\d{4})-(\d{2})-(\d{2})[,\s]+(\d{2}):(\d{2})(?::(\d{2}))?$/);
      if (m) {
        const [, y, mo, d, h, mi, s] = m.map(Number);
        return new Date(y, mo - 1, d, h, mi, s || 0); // local time
      }

      // 3) "DD.MM.YYYY HH:mm"
      m = v.match(/^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/);
      if (m) {
        const [, d, mo, y, h, mi, s] = m.map(Number);
        return new Date(y, mo - 1, d, h, mi, s || 0);
      }
    }
    return null;
  };

  const handleOpenChat = () => {
    const otherId = props.target?.user?.id;
    console.log("Open chat in request modal: " + otherId);

    emit("open-chat", {
      otherId,
      bookingId: null,
      mode: "client",
      anchor: getBottomRightAnchor()
    });
    
  }

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

  const getUploadId = (upload) =>
    upload?._id ??
    upload?.id ??
    upload?.imageId ??
    upload?.file?._id ??
    upload?.file?.id ??
    upload?.upload?._id ??
    upload?.upload?.id;

  const handleRequest = async() => {

    if (!validateForm()) {
        console.log("No validated");
    } else {
      console.log("Validated");

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

      emit('sendRequest', {
        date: dateTime.value,
        address: form.address,
        myLat: lat?.value,
        myLng: lng?.value, 
        header: form.requestHeader,
        content: form.requestContent,
        serverPhotos: photosForBackend,
        localPhotos: photosForLocalState
      });
    }
  }

</script>
<style >
.pac-container {
  z-index: 99999 !important;
}
/* .pac-container {
  z-index: 99999 !important;
} */
</style>
<style scoped>
.message-counter {
  float: right;
  opacity: 0.5;
}
.hideInput {
  display: none;
}

</style>
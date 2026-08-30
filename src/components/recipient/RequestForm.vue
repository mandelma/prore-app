<template>
    <MDBContainer>
        <form style="background-color: #0b1618; padding: 17px; border: 1px solid #1B2330; border-radius: 8px;">
          <div style="display: flex; justify-content: right;">
            <MDBBtn type="button" outline="info" @click="handleOpenChat">
              <i class="far fa-comments fa-2x"></i>
            </MDBBtn>
          
          </div>
          xxx
          <div class="field-wrapper">
            <p>{{ props.target?.profession.map(profession => localProfessionName(profession)).join(', ') }}</p>
          </div>
          <div class="field-wrapper">

            <MDBDateTimepicker
              v-if="!props.date"
              size="lg"
              :label="t('requestForm.dateTimeLabel')"
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
            <small
                v-if="!props.date && !dateTime"
                class="profession-field__error"
              >
                <i class="fa-solid fa-circle-exclamation" />
                {{ t('requestForm.dateTimeRequired') }}
            </small>
          </div>
          
          <div >
            <p v-if="props.date || dateTime">
              {{ formattedDateTime }}
            </p>
          
            <!-- <p v-else class="text-danger">{{ t('requestForm.dateTimeRequired') }}</p> -->
            
          </div>

          <AddressAutocomplete
            v-model="form.address"
            v-model:valid="addressValid"
            :active="props.isOpen"
            :label="t('requestForm.addressLabel')"
            :error="errors.address"
            @typing="onAddressInput"
            @place="onPlaceSelected"
          />

          <div v-show="isLoadingAddress" style="text-align: center; padding-bottom: 27px;">
            <MDBSpinner grow color="info" />
          </div>

          <div class="field-wrapper">
            <MDBInput
                :label="t('requestForm.requestHeaderLabel')"
                v-model="form.requestHeader"
                size="lg"
                :invalidFeedback="t('requestForm.requestHeaderInvalid')"
                :validFeedback="t('requestForm.validOk')"
                required

            />
            <!-- <span v-if="errors.requestHeader" class="field-footer">{{ errors.requestHeader }}</span> -->
            <small
                v-if="errors.requestHeader"
                class="field__error"
              >
                <i class="fa-solid fa-circle-exclamation" />
                {{ errors.requestHeader }}
            </small>
            <!-- custom error text -->
          </div>
          <div style="margin-top: 17px;" class="field-wrapper">
              <MDBTextarea
                  maxlength="70"
                  :label="t('requestForm.requestContentLabel')"
                  rows="3"
                  v-model="form.requestContent"
                  :invalidFeedback="t('requestForm.requestContentInvalid')"
                  :validFeedback="t('requestForm.validOk')"
                  required
              />
              <!-- <span v-if="errors.requestContent" class="field-footer">{{ errors.requestContent }}</span> -->
              <small
                v-if="errors.requestContent"
                class="field__error"
              >
                <i class="fa-solid fa-circle-exclamation" />
                {{ errors.requestContent }}
            </small>
              <span class="message-counter"> {{form.requestContent.length}} / 70</span>
          </div>

          <!-- About pictures -->
           <div v-if="!isAddPhotos">
              <div>
                <MDBBtn v-if="!isAddPhotos && !addedPhotos.length" color="light" @click="isAddPhotos = true">{{ t('requestForm.addOptionalPhotos') }}</MDBBtn>
                <MDBBtn v-else color="light" @click="isAddPhotos = true">{{ t('requestForm.editPhotos') }}</MDBBtn>
              </div>
              
              <BookingPhotos
                
                :photos="addedPhotos"
                :editable="isAddPhotos"
                @remove="removeDraftPhoto"
              />
              
              <!-- v-else -->
              <div v-if="!addedPhotos?.length" class="empty-state">
                
                <p v-if="!addedPhotos.length" class="empty-state__text">{{ t('requestForm.photosHelp') }}</p>
              </div>

            </div>

            <!-- Booking pictures section -->
            <form v-else class="panel__body" @submit.prevent="saveBookingPhotos">
              <div class="form-card">
                
                <div class="divider"></div>

                <div class="photos">
                  <div class="photos__header">
                    <h5 class="section-title">{{ t('requestForm.photos') }}</h5>
                    <MDBBtn color="primary" @click="openFilePicker">{{ t('requestForm.addPhotos') }}</MDBBtn>
                    
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
                    <p class="dropzone__title">{{ t('requestForm.dropPhotos') }}</p>
                    <p class="dropzone__text">{{ t('requestForm.orClickAddPhotos') }}</p>
                  </div>

                  <BookingPhotos
                    
                    :photos="draftPhotos"
                    :editable="isAddPhotos"
                    @remove="removeDraftPhoto"
                  />

                </div>

                <div class="actions">
                  <button class="btn btn-danger" type="button" @click="cancelAddPhotos">
                    {{ t('requestForm.cancel') }}
                  </button>

                  <button class="btn btn-success" type="submit" :disabled="!isDirty">
                    {{ t('requestForm.save') }}
                  </button>
                </div>

              </div>
            </form>
          <!-- Send booking if date is entered -->
          <div style="display: flex; justify-content: right; margin-top: 17px;">
            <MDBBtn color="primary" :disabled="!props.date && !dateTime" @click="handleRequest">{{ t('requestForm.sendOrder') }}</MDBBtn>
          </div>
        </form>
    </MDBContainer>
</template>
<script setup>
  import { ref, onMounted, onUnmounted, onBeforeUnmount, computed, nextTick, reactive, watch } from 'vue'
  import {MDBContainer, MDBTextarea, MDBInput, MDBBtn, MDBIcon, MDBDateTimepicker, MDBSpinner} from 'mdb-vue-ui-kit';
  import { useI18n } from 'vue-i18n';
  import { storeToRefs } from 'pinia';
  import { useConversationStore } from '@/stores/conversationStore';
  import { useMapStore } from '@/stores/mapStore';
  import { useProfessionStore } from '@/stores/professionStore';
  import { loadGoogleMaps } from '../controllers/loadGoogleMap';
  import { getBottomRightAnchor } from '../helpers/chatGeometry.js';
  import { getFormatted } from '../helpers/formatDatepicker.js';
  import BookingPhotos from './BookingPhotos.vue';
  import uploadService from '@/service/awsUploads.js';
  import AddressAutocomplete from '../AddressAutocomplete.vue';

  //import { useLocationFieldLogic } from '@/components/helpers/locationFieldLogic.js';

  import { useBookingPhotos as useBookingPhotosLogic } from '@/components/helpers/useBookingPhotos.js';

  defineOptions({
      name: 'request-form'
  })
  const props = defineProps({
    target: {
      type: Object,
      default: null
    },
    date: {
    type: String,
    default: ""
    },
    isOpen: {
      type: Boolean,
      default: false
    }
  })
  const emit = defineEmits(['sendRequest', 'open-chat']);

  const professionStore = useProfessionStore();
  const { professions } = storeToRefs(professionStore);

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

  const { t, locale } = useI18n();
  const geocoder = ref(null)
  const lat = ref(null);
  const lng = ref(null);
  const dateTime = ref(null);

  //const addressInput = ref(null)
  //const autocomplete = ref(null)

  //const suppressAutocomplete = ref(false)

  const mapError = ref(false);
  const isAddress = ref(false);
  const addressValid = ref(false);
  const selectedPlace = ref(null);

  const isLoadingAddress = ref(false);
  const form = reactive({
    address: "",  
    requestHeader: "",
    requestContent: "",
    
  });
  const mapStore = useMapStore();
  const conversationStore = useConversationStore();

  const { userPos, lastKnownPos, mapsReady, isLocating, locationError } = storeToRefs(mapStore);

  const errors = reactive({});
  const isValidating = ref(false);

  /* const {
    onAddressInput,
    onPlaceSelected,
    validateAddress,
    selectedPlace,
    addressValid
  } = useLocationFieldLogic(form, errors); */

  // Date formatting for datepicker
  const L = computed(() => {
    return getFormatted(locale.value)
  })

  const localeMap = {
    fi: "fi-FI",
    en: "en-GB",
    sv: "sv-SE",
    et: "et-EE",
    ru: "ru-RU"
  };

  const formattedDateTime = computed(() => {
    const value = props.date || dateTime.value;
    const date = fromLocalInput(value);

    if (!date) return value || "";

    return date.toLocaleString(
      localeMap[locale.value] || "fi-FI",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }
    );
  });

  const getLocalizedValue = translations => {
    if (!translations) {
      return "";
    }

    return (
      translations[locale.value] ||
      translations.en ||
      translations.fi ||
      Object.values(translations).find(Boolean) ||
      ""
    );
  };

  const localProfessionName = (code) => {
    const professionObj = professions.value.find(
      profession => profession.code === code
    );
    return getLocalizedValue(professionObj?.name) || code;
  };

 

  const validateInputAddress = () => {

    if (!form.address) return;

    if (lat.value === null || lng.value === null) {
      console.log("Address is not valid, lat/lng missing");
      addressError.value = "Valitse osoite listasta (ei pelkkää kirjoitusta)";
      return "Valitse osoite listasta (ei pelkkää kirjoitusta)";
    }

    return;
  };

  const validateForm = () => {
  errors.requestHeader = form.requestHeader?.trim()
    ? ""
    : t("requestForm.requestHeaderRequired");

  errors.requestContent = form.requestContent?.trim()
    ? ""
    : t("requestForm.requestContentRequired");

  const isAddressValid = validateAddress();

  return (
    !errors.requestHeader &&
    !errors.requestContent &&
    isAddressValid
  );
};

  const validateHeader = () => {
    if (!isValidating.value) return;
    errors.requestHeader = form.requestHeader ? "" : t('requestForm.requestHeaderRequired');
  };

  watch(() => form.requestHeader, validateHeader);

  const validateContent = () => {
    if (!isValidating.value) return;
    errors.requestContent = form.requestContent ? "" : t('requestForm.requestContentRequired');
  };

  watch(() => form.requestContent, validateContent);

  const validateAddress = () => {
    const address = form.address?.trim();

    if (!address) {
      errors.address = t("requestForm.addressRequired");
      return false;
    }

    if (
      !addressValid.value ||
      lat.value === null ||
      lng.value === null
    ) {
      errors.address = t(
        "recipientForm.addressAutocompleteError"
      );

      return false;
    }

    errors.address = "";
    return true;
  };
  

 watch(
  () => form.address,
  () => {
    if (!isValidating.value) return;

    validateAddress();
  }
);

  /* watch(props.date, (date) => {
    if (date) {
      dateTime.value = date
    }
  }) */

  watch(
  () => props.date,
    date => {
      if (date) {
        dateTime.value = date;
      }
    },
    { immediate: true }
  );

  

  const isValidDate = (d) => d instanceof Date && !isNaN(+d);

  const onAddressInput = value => {
    form.address = value ?? "";

    selectedPlace.value = null;
    lat.value = null;
    lng.value = null;
    addressValid.value = false;

    if (!isValidating.value) {
      errors.address = "";
      return;
    }

    if (!form.address.trim()) {
      errors.address = t(
        "requestForm.addressRequired"
      );
    } else {
      errors.address = t(
        "recipientForm.addressAutocompleteError"
      );
    }
  };

  const onPlaceSelected = place => {
    if (!place) return;

    selectedPlace.value = place;

    form.address = place.address ?? "";
    lat.value = place.lat ?? null;
    lng.value = place.lng ?? null;

    addressValid.value =
      lat.value !== null &&
      lng.value !== null;

    errors.address = addressValid.value
      ? ""
      : t("recipientForm.addressAutocompleteError");
  };

  onMounted( async () => {

    try {
      addressValid.value = false;
      const initPromise = mapStore.init()
      await nextTick()

      const pos = userPos.value || lastKnownPos.value
      if (pos) {
        lat.value = pos.lat
        lng.value = pos.lng
        const result = await getAddressFromCoords(pos.lat, pos.lng)
        addressValid.value = Boolean(result)
      }

      await initPromise

      const freshPos =
      userPos.value ||
      lastKnownPos.value;

      if (
        freshPos &&
        !form.address
      ) {
        lat.value = freshPos.lat;
        lng.value = freshPos.lng;

        const result = await getAddressFromCoords(
          freshPos.lat,
          freshPos.lng
        );

        addressValid.value = Boolean(result);
      }
      
    } catch (err) {
      console.error("Map init failed:", err);
      addressValid.value = false;
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
    isValidating.value = true;
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
      console.log("Request dt value = " + dateTime.value);
      emit('sendRequest', {
        date: dateTime.value,
        address: form.address,
        myLat: lat?.value,
        myLng: lng?.value, 
        header: form.requestHeader,
        content: form.requestContent,
        serverPhotos: photosForBackend,
        localPhotos: photosForLocalState,
        /* budget: {
          min: form.budgetMin,
          max: form.budgetMax
        }    */
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
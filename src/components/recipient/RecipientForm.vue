<template>
  <div>
    <MDBContainer>
      <HandleToast
        v-model="toastModel"
        :toast-name="toastState"
        :icon-state="toastIcon"
        :text="toastContent"
      />

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
          <template #title>{{ t('recipientForm.formErrorTitle') }} </template>
          <button type="button" style="visibility: hidden;" class="btn-close ms-auto" aria-label="Close" @click="hideError"></button>
          <template #small></template>
          {{clientFormErrorMsg}}
        </MDBToast>
      </div>
      <div style="display: flex; justify-content: flex-end;">
          
          <MDBBtnClose white @click="router.go(-1)"/>
        </div>
      
      <form
        class="booking-form"
        novalidate
        autocomplete="off"
        @submit.prevent="createClient"
      >
        <!-- 1. Teenus -->
        <section class="booking-section">
          <div class="booking-section__header">
            <div class="booking-section__icon">
              <i class="fa-solid fa-briefcase" />
            </div>

            <div>
              <h3>{{ t("recipientForm.serviceSectionTitle") }}</h3>
              <p>{{ t("recipientForm.serviceSectionHelp") }}</p>
            </div>
          </div>

          <div class="booking-grid booking-grid--profession">
            <div class="booking-field">
              <label class="booking-label">
                {{ t("recipientForm.profession") }}
                <span class="booking-required">*</span>
              </label>

              <Select
                style="width: 100%;"
                v-model="form.profession"
                :options="groupedProfessions"
                option-label="label"
                option-value="code"
                option-group-label="label"
                option-group-children="items"
                filter
                filter-by="label"
                :placeholder="t('recipientForm.professionalPlaceholder')"
                class="booking-control"
              >
                <template #optiongroup="{ option }">
                  <div class="profession-group">
                    <i :class="option.icon" />
                    &nbsp;&nbsp;<span>{{ option.label }}</span>
                  </div>
                </template>

                <template #option="{ option }">
                  <div class="profession-option">
                    <i :class="option.icon" />
                    <strong>&nbsp;&nbsp;&nbsp;{{ option.label }}</strong>
                    <div>
                      <small v-if="option.localizedDescription">
                        {{ option.localizedDescription }}
                      </small>
                    </div>
                  </div>
                </template>
              </Select>
              <small
                v-if="errors.profession"
                class="profession-field__error"
              >
                <i class="fa-solid fa-circle-exclamation" />
                {{ errors.profession }}
              </small>
            </div>

            <button
              type="button"
              class="map-link"
              @click="router.push('/pro-around')"
            >
              <img
                :src="mapImage"
                :alt="t('recipientForm.openMap')"
              />

              <span>{{ t("recipientForm.openMap") }}</span>
            </button>
          </div>
        </section>

        <!-- 2. Ametipõhised andmed -->
        <section
          v-if="selectedProfession"
          class="booking-section booking-section--profession"
        >
          <div class="booking-section__header">
            <div class="booking-section__icon">
              <i
                :class="
                  selectedProfession.icon ||
                  'fa-solid fa-clipboard-list'
                "
              />
            </div>

            <div>
              <h3>{{ selectedProfessionName }}</h3>

              <p>
                {{
                  getLocalizedValue(
                    selectedProfession.description
                  )
                }}
              </p>
            </div>
          </div>

          <div class="profession-fields__grid">
            <!-- sinu praegune dünaamiliste väljade v-for -->
            <div
              v-for="field in sortedCustomFields"
              :key="field.key"
              class="profession-field"
              :class="{
                'profession-field--full': field.type === 'textarea'
              }"
            >
              <label
                v-if="
                  field.type !== 'boolean' &&
                  field.type !== 'checkbox'
                "
                :for="`profession-field-${field.key}`"
                class="profession-field__label"
              >
                {{ getLocalizedValue(field.label) }}

                <span
                  v-if="field.required"
                  class="profession-field__required"
                >
                  *
                </span>
              </label>
              
              <div
                v-if="field.type === 'text'"
                class="profession-field__control"
              >
                <i class="fa-solid fa-pen profession-field__icon" />

                <input
                  :id="`profession-field-${field.key}`"
                  v-model.trim="form.customFieldValues[field.key]"
                  type="text"
                  class="profession-field__input"
                  :placeholder="getLocalizedValue(field.placeholder)"
                />
              </div>

              <div
                v-else-if="field.type === 'number'"
                class="profession-field__control"
              >
                <i class="fa-solid fa-hashtag profession-field__icon" />

                <input
                  :id="`profession-field-${field.key}`"
                  v-model.number="form.customFieldValues[field.key]"
                  type="number"
                  class="profession-field__input"
                  :placeholder="getLocalizedValue(field.placeholder)"
                />
              </div>

              <Select
                v-else-if="field.type === 'select'"
                :id="`profession-field-${field.key}`"
                v-model="form.customFieldValues[field.key]"
                :options="getTranslatedOptions(field.options)"
                option-label="label"
                option-value="value"
                :placeholder="getLocalizedValue(field.placeholder)"
                class="profession-field__select"
              />

              <MultiSelect
                v-else-if="field.type === 'multiselect'"
                :id="`profession-field-${field.key}`"
                v-model="form.customFieldValues[field.key]"
                :options="getTranslatedOptions(field.options)"
                option-label="label"
                option-value="value"
                :placeholder="getLocalizedValue(field.placeholder)"
                display="chip"
                filter
                class="profession-field__select"
              />

              <label
                v-else-if="
                  field.type === 'boolean' ||
                  field.type === 'checkbox'
                "
                class="profession-field__checkbox"
              >
                <input
                  v-model="form.customFieldValues[field.key]"
                  type="checkbox"
                  class="profession-field__checkbox-input"
                />

                <span class="profession-field__checkbox-box">
                  <i class="fa-solid fa-check" />
                </span>

                <span class="profession-field__checkbox-label">
                  {{ getLocalizedValue(field.label) }}
                </span>
              </label>

              <textarea
                v-else-if="field.type === 'textarea'"
                :id="`profession-field-${field.key}`"
                v-model.trim="form.customFieldValues[field.key]"
                class="profession-field__textarea"
                :placeholder="getLocalizedValue(field.placeholder)"
                rows="4"
              />

              <small
                v-if="errors[field.key]"
                class="profession-field__error"
              >
                <i class="fa-solid fa-circle-exclamation" />
                {{ errors[field.key] }}
              </small>

              <small
                v-if="getLocalizedValue(field.helpText)"
                class="profession-field__help"
              >
                <i class="fa-regular fa-circle-question" />
                {{ getLocalizedValue(field.helpText) }}
              </small>
            </div>
          </div>
        </section>

        <!-- 3. Tellimuse põhiandmed -->
        <section class="booking-section">
          <div class="booking-section__header">
            <div class="booking-section__icon">
              <i class="fa-solid fa-location-dot" />
            </div>

            <div>
              <h3>{{ t("recipientForm.bookingDetailsTitle") }}</h3>
              <p>{{ t("recipientForm.bookingDetailsHelp") }}</p>
            </div>
          </div>

          <div class="booking-grid">
            <div class="booking-field booking-field--full">
              <label class="booking-label">
                {{ t("recipientForm.orderKeyword") }}
                <span class="booking-required">*</span>
              </label>

              <input
                v-model.trim="form.orderHeader"
                class="booking-input"
                type="text"
                :placeholder="generatedOrderHeader"
                @input="orderHeaderEdited = true"
              />
              <small
                v-if="errors.orderHeader"
                class="profession-field__error"
              >
                <i class="fa-solid fa-circle-exclamation" />
                {{ errors.orderHeader }}
              </small>

              <small class="booking-help">
                {{ t("recipientForm.orderHeaderHelp") }}
              </small>
            </div>
            
            <div class="booking-field booking-field--wide">
              <AddressAutocomplete
                v-model="form.address"
                v-model:valid="addressValid"
                v-model:error="errors.address"
                :label="t('recipientForm.addressLabel')"
                :error="errors.address"
                @typing="onAddressInput"
                @place="onPlaceSelected"
              />
            </div>

            <div class="booking-field">
              <label class="booking-label">
                {{ t("recipientForm.radiusLabel") }}
              </label>

              <div class="input-with-unit">
                <input
                  v-model.number="desiredRange"
                  class="booking-input"
                  type="number"
                  min="1"
                  max="50"
                />

                <span>km</span>
              </div>
            </div>

            <div class="booking-field booking-field--full">
              <label class="booking-label">
                {{ t("recipientForm.dateTimeLabel") }}
                <span class="booking-required">*</span>
              </label>

              <MDBDateTimepicker
                v-model="form.dateTime"
                :toggle-button="false"
                input-toggle
                :datepicker="{ ...L }"
                :timepicker="{ ...L, hoursFormat: 24 }"
                :key="reInitKey"
                disable-past
                size="lg"
              />
            </div>
            
          </div>
          <small
              v-if="errors.dateTime"
              class="profession-field__error"
            >
              <i class="fa-solid fa-circle-exclamation" />
              {{ errors.dateTime }}
            </small>
        </section>

        <!-- 4. Eelarve -->
        <section class="booking-section">
          <div class="booking-section__header booking-section__header--compact">
            <div>
              <h3>{{ t("recipientForm.budget") }}</h3>
              <p>{{ t("recipientForm.budgetHelp") }}</p>
            </div>

            <MDBCheckbox
              v-model="isBudget"
              :label="t('recipientForm.addBudget')"
            />
          </div>

          <div
            v-if="isBudget"
            class="booking-grid booking-grid--budget"
          >
            <div class="booking-field">
              <MDBInput
                v-model="form.budgetMin"
                type="number"
                min="0"
                :label="t('recipientForm.budgetMin')"
                @keydown="preventInvalidKeys"
              />
              <small
              v-if="errors.budgetMin"
              class="profession-field__error"
            >
              <i class="fa-solid fa-circle-exclamation" />
              {{ errors.budgetMin }}
            </small>
            </div>
            

            <div class="booking-field">
              <MDBInput
                v-model="form.budgetMax"
                type="number"
                min="0"
                :label="t('recipientForm.budgetMax')"
                @keydown="preventInvalidKeys"
              />
              <small
                v-if="errors.budgetMax"
                class="profession-field__error"
              >
                <i class="fa-solid fa-circle-exclamation" />
                {{ errors.budgetMax }}
              </small>
            </div>
            
          </div>
        </section>

        <!-- 5. Kirjeldus ja pildid -->
        <section class="booking-section">
          <div class="booking-section__header">
            <div class="booking-section__icon">
              <i class="fa-solid fa-align-left" />
            </div>

            <div>
              <h3>{{ t("recipientForm.descriptionAndPhotos") }}</h3>
              <p>{{ t("recipientForm.descriptionAndPhotosHelp") }}</p>
            </div>
          </div>

          <div class="booking-grid booking-grid--content">
            <div class="booking-field">
              <div class="booking-input-wrapper">
                <MDBTextarea
                  v-model="form.explanation"
                  maxlength="1000"
                  rows="6"
                  :label="t('recipientForm.descriptionLabel')"
                />
                <span class="booking-required-corner">*</span>
              </div>
              
              <small
                v-if="errors.explanation"
                class="profession-field__error"
              >
                <i class="fa-solid fa-circle-exclamation" />
                {{ errors.explanation }}
              </small>

              <span class="message-counter">
                {{ form.explanation.length }} / 1000
              </span>
            </div>

            <div class="booking-field">
              <!-- sinu olemasolev fotode lisamise osa -->
              <div v-if="!isAddPhotos">
                <div>
                  <MDBBtn v-if="!isAddPhotos && !addedPhotos.length" color="light" @click="isAddPhotos = true">{{ t('recipientForm.addOptionalPhotos')}}</MDBBtn>
                  <MDBBtn v-else color="light" @click="isAddPhotos = true">{{ t('recipientForm.editPhotos') }}</MDBBtn>
                </div>

                <BookingPhotos
                 
                  :photos="addedPhotos"
                  :editable="isAddPhotos"
                  @remove="removeDraftPhoto"
                />
                
                <div v-if="!addedPhotos?.length" class="empty-state">
                  
                  <p v-if="!addedPhotos.length" class="empty-state__text">{{ t('recipientForm.photosHelp') }}</p>
                </div>


              </div>

              <!-- Booking pictures section -->
              <form v-else class="panel__body" @submit.prevent="saveBookingPhotos">
                <div class="form-card">
                  
                  <div class="divider"></div>

                  <div class="photos">
                    <div class="photos__header">
                      <h5 class="section-title">{{ t('recipientForm.photos') }}</h5>
                      <MDBBtn color="primary" @click="openFilePicker">{{ t('recipientForm.addPhotos') }}</MDBBtn>
                      
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
                      <p class="dropzone__title">{{ t('recipientForm.dropPhotos') }}</p>
                      <p class="dropzone__text">{{ t('recipientForm.orClickAddPhotos') }}</p>
                    </div>

                    <BookingPhotos
                      
                      :photos="draftPhotos"
                      :editable="isAddPhotos"
                      @remove="removeDraftPhoto"
                    />


                  </div>

                  <div class="actions">
                    <button class="btn btn-danger" type="button" @click="cancelAddPhotos">
                      {{ t('recipientForm.cancel') }}
                    </button>

                    <button class="btn btn-success" type="submit" :disabled="!isDirty">
                      {{ t('recipientForm.save') }}
                    </button>
                  </div>

                </div>
              </form>
            </div>
          </div>
        </section>

        <section class="booking-submit">
          <MDBCheckbox
            v-model="isClientContactAgreement"
            :label="t('recipientForm.emailAgreement')"
            name="agreement_as_client"
          />

          <MDBBtn
            color="primary"
            size="lg"
            type="submit"
            class="booking-submit__button"
          >
            {{ t("recipientForm.submitOrder") }}
          </MDBBtn>
        </section>
      </form>
      
    </MDBContainer>
  </div>


</template>



<script setup>
/* global google */
import {MDBContainer, MDBRow, MDBCol, MDBBtn, MDBCheckbox, MDBTextarea, MDBToast, MDBInput, MDBIcon, MDBDateTimepicker, MDBSpinner, MDBDatepicker, MDBTimepicker, MDBBtnClose} from "mdb-vue-ui-kit";

import { ref, onMounted, onUnmounted, onBeforeUnmount, computed, nextTick, reactive, watch } from 'vue'
import { useLoginStore } from "@/stores/login.js";
import proList from '@/components/controllers/professions'
import { storeToRefs } from "pinia";
import MultiSelect from "primevue/multiselect";
import Select from 'primevue/select';
import map_image from '@/assets/map.gif'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n';
import AddressAutocomplete from '@/components/AddressAutocomplete.vue'
import clientService from '../../service/recipients';
import uploadService from '../../service/awsUploads';
import { useProfessionStore } from "@/stores/professionStore";
import { loadGoogleMaps} from '../controllers/loadGoogleMap.js'
import RecipientPage from '@/components/recipient/RecipientPage.vue'
import HandleMapErrorToast from '@/components/helpers/ToastHandler.vue'
import HandleToast from '@/components/helpers/ToastHandler.vue'

import BookingPhotos from '@/components/recipient/BookingPhotos.vue';
//import { useBookingPhotos } from '@/helpers/useBookingPhotos.js';

import { useBookingPhotos as useBookingPhotosLogic } from '@/components/helpers/useBookingPhotos.js';

import '@/styles/pro-select.css';

defineOptions({
  name: 'recipient-form'
});

const emit = defineEmits(['createBookingMultiple'])

const { locale, t } = useI18n();

const professionStore = useProfessionStore();

const { professions, professionCategories } = storeToRefs(professionStore);

const router = useRouter();
const route = useRoute();

const customFields = ref(null);

const form = reactive({
  profession: "",
  orderHeader: "",
  address: "",
  lat: null,
  lng: null,
  dateTime: "",
  explanation: "",
  budgetMin: null,
  budgetMax: null,

  keyword: "",
  description: "",
  customFieldValues: {}
});

// Client can edit order header value
const orderHeaderEdited = ref(false);

const currentProfession = ref(null);

const isBudget = ref(false);
const errors = reactive({});
const isValidating = ref(false);

const addressValid = ref(false);
const selectedPlace = ref(null);

const validateCustomFields = () => {
  let valid = true;

  for (const field of sortedCustomFields.value) {
    const value =
      form.customFieldValues[field.key];

    if (!field.required) {
      errors[field.key] = "";
      continue;
    }

    const missing =
      value === null ||
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);

    if (missing) {
      errors[field.key] =
        t("recipientForm.requiredField");

      valid = false;
    } else {
      errors[field.key] = "";
    }
  }

  return valid;
};

const validateForm = () => {
  errors.profession = form.profession ? "" : t('recipientForm.professionRequired');
  errors.orderHeader = form.orderHeader ? "" : t('recipientForm.orderKeywordInvalid');
  errors.address = form.address ? "" : t('recipientForm.addressRequired');

  errors.dateTime = form.dateTime ? "" : t('recipientForm.dateRequired');
  errors.explanation = form.explanation ? "" : t('recipientForm.descriptionRequired');
  //errors.budgetMin = form.budgetMin != null ? "" : t('recipientForm.budgetMinRequired');
  //errors.budgetMax = form.budgetMax != null ? "" : t('recipientForm.budgetMaxRequired');

  if (form.address && (form.lat === null || form.lng === null) ) {
      errors.address = t('recipientForm.addressAutocompleteError');
  } else if (!form.address) {
      errors.address = t('recipientForm.addressRequired');
  } else {
      errors.address = "";
  }

  if (
      form.budgetMin != null &&
      form.budgetMax != null &&
      Number(form.budgetMin) > Number(form.budgetMax)
    ) {
      errors.budgetMin = t('recipientForm.budgetMinTooHigh');
      errors.budgetMax = t('recipientForm.budgetMaxTooLow');
    }

  const customFieldsValid =
    validateCustomFields();

  return (
    !errors.profession && 
    !errors.orderHeader && 
    !errors.address && 
    !errors.dateTime && 
    !errors.explanation && 
    !errors.budgetMin && 
    !errors.budgetMax &&
    customFieldsValid
  )
}

const validateBudgets = () => {
  if (!isValidating.value) return;
  // Required validation
  /* if (form.budgetMin == null || form.budgetMin === "") {
    errors.budgetMin = t('recipientForm.budgetMinRequired');
  } else {
    errors.budgetMin = "";
  }

  if (form.budgetMax == null || form.budgetMax === "") {
    errors.budgetMax = t('recipientForm.budgetMaxRequired');
  } else {
    errors.budgetMax = "";
  } */

  // Range validation only if both exist
  if (
    form.budgetMin !== null &&
    form.budgetMin !== "" &&
    form.budgetMax !== null &&
    form.budgetMax !== "" &&
    Number(form.budgetMin) > Number(form.budgetMax)
  ) {
    errors.budgetMin = t('recipientForm.budgetMinTooHigh');
    errors.budgetMax = t('recipientForm.budgetMaxTooLow');
  } else {
    if (form.budgetMin === "" && form.budgetMax !== "") {
      errors.budgetMin = t('recipientForm.budgetMinRequired');
    } else if (form.budgetMin !== "" && form.budgetMax === "") {
      errors.budgetMax = t('recipientForm.budgetMaxRequired');
    } else {
      errors.budgetMin = errors.budgetMax = "";
    }
     
  }
};

watch(
  [() => form.budgetMin, () => form.budgetMax],
  validateBudgets
);

watch(() => form.profession, () => (errors.profession = ""));
watch(() => form.orderHeader, () => (errors.orderHeader = ""));
watch(() => form.address, () => (errors.address = ""));
watch(() => form.dateTime, () => (errors.dateTime = ""));
watch(() => form.explanation, () => (errors.explanation = ""));

// Invalid key check in budget fields
const preventInvalidKeys = (e) => {
  if (['-', '+'].includes(e.key)) {
    e.preventDefault();
  }
};

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
//const professions = proList;
const mapImage = map_image;
const mapError = ref(false);
const desiredRange = ref("")
//const range = ref(null);
const lat = ref(null);
const lng = ref(null);

const o = ref(null);

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

const getTranslatedOptions = (options = []) => {
    return options.map(option => ({
        ...option,
        label: getLocalizedValue(option.label)
    }));
};

const selectedProfession = computed(() => {
  if (!form.profession) {
    return null;
  }

  return (
    professions.value.find(
      profession =>
        profession.code === form.profession
    ) ?? null
  );
});

const selectedProfessionName = computed(() => {
  return getLocalizedValue(
    selectedProfession.value?.name
  );
});

const firstRelevantDetail = computed(() => {
  const paintArea =
    form.customFieldValues.paintArea;

  if (
    !Array.isArray(paintArea) ||
    paintArea.length === 0
  ) {
    return "";
  }

  const field =
    selectedProfession.value?.customFields?.find(
      item => item.key === "paintArea"
    );

  const option = field?.options?.find(
    item => item.value === paintArea[0]
  );

  return getLocalizedValue(option?.label);
});



const generatedOrderHeader = computed(() => {
  const professionName =
    selectedProfessionName.value;

  if (!professionName) {
    return "";
  }

  const detail =
    firstRelevantDetail.value;

  return detail
    ? `${professionName} – ${detail}`
    : professionName;
});












// Täida pealkiri automaatselt ainult seni,
// kuni kasutaja pole seda ise muutnud.
watch(
  generatedOrderHeader,
  value => {
    if (
      value &&
      !orderHeaderEdited.value
    ) {
      form.orderHeader = value;
    }
  },
  {
    immediate: true
  }
);

watch(() => form.profession,
  async (newValue) => {
    console.log("NEW - " + newValue)
    if (newValue) {
      const result = await professionStore.professionByCode(newValue);
      currentProfession.value = getLocalizedValue(result)
    }
      
  }
);

watch(
  () => form.profession,
  newCode => {
    console.log("Valitud ameti kood:", newCode);
    console.log(
      "Valitud ameti objekt:",
      selectedProfession.value
    );
  }
);



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



/* const selectedProfession = computed(() => {
  for (const group of professions.value) {
    const profession = group.items.find(
      item => item.code === form.value.profession
    );

    if (profession) {
      console.log("Profession - ", profession);
      return profession;
    }
  }

  return null;
}); */



const sortedCustomFields = computed(() => {
  return [...(selectedProfession.value?.customFields || [])]
    .filter(field => field.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
});


const groupedProfessions = computed(() => {
  return professionCategories.value
    .filter(category => category.enabled)
    .sort((a, b) => {
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    })
    .map(category => {
      const items = professions.value
        .filter(profession => {
          return (
            profession.enabled &&
            profession.categoryCode === category.code
          );
        })
        .sort((a, b) => {
          return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
        })
        .map(profession => ({
          ...profession,

          label: getLocalizedValue(profession.name),

          localizedDescription: getLocalizedValue(
            profession.description
          )
        }));

      

      return {
        code: category.code,
        label: getLocalizedValue(category.name),
        description: getLocalizedValue(category.description),
        icon: category.icon,
        sortOrder: category.sortOrder,
        items
      };
    })
    .filter(category => category.items.length > 0);
});







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
        title: t("recipientForm.datePickerTitle"),
        monthsFull:  ['January','February','March','April','May','June','July','August','September','October','November','December'],
        monthsShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        weekdaysFull:  ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
        weekdaysShort: ['Su','Mo','Tu','We','Th','Fr','Sa'],
        weekdaysNarrow: ['S','M','T','W','T','F','S'],
        cancelBtnText: t("recipientForm.datePickerCancel"),

        cancelLabel: t("recipientForm.datePickerCancel"),
        okLabel: t("recipientForm.datePickerOk"),
        twelveHour: true


      }
    case 'sv':
      return {
        firstDay: 1,
        title: t("recipientForm.datePickerTitle"),
        monthsFull:  ['januari','februari','mars','april','maj','juni','juli','augusti','september','oktober','november','december'],
        monthsShort: ['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec'],
        weekdaysFull:  ['söndag','måndag','tisdag','onsdag','torsdag','fredag','lördag'],
        weekdaysShort: ['sö','må','ti','on','to','fr','lö'],
        weekdaysNarrow: ['S','M','T','O','T','F','L'],
        cancelBtnText: t("recipientForm.datePickerCancel"),

        cancelLabel: t("recipientForm.datePickerCancel"),
        okLabel: t("recipientForm.datePickerOk"),
        twelveHour: false
      }
    case 'et':
      return {
        firstDay: 1,
        title: t("recipientForm.datePickerTitle"),
        monthsFull:  ['jaanuar','veebruar','märts','aprill','mai','juuni','juuli','august','september','oktoober','november','detsember'],
        monthsShort: ['jaan','veebr','märts','apr','mai','juuni','juuli','aug','sept','okt','nov','dets'],
        weekdaysFull:  ['pühapäev','esmaspäev','teisipäev','kolmapäev','neljapäev','reede','laupäev'],
        weekdaysShort: ['P','E','T','K','N','R','L'],
        weekdaysNarrow: ['P','E','T','K','N','R','L'],
        cancelBtnText: t("recipientForm.datePickerCancel"),

        cancelLabel: t("recipientForm.datePickerCancel"),
        okLabel: t("recipientForm.datePickerOk"),
        twelveHour: false
      }
    case 'ru':
      return {
        firstDay: 1,
        title: t("recipientForm.datePickerTitle"),
        monthsFull:  ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'],
        monthsShort: ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'],
        weekdaysFull:  ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'],
        weekdaysShort: ['вс','пн','вт','ср','чт','пт','сб'],
        weekdaysNarrow: ['В', 'П', 'В', 'С', 'Ч', 'П', 'С'],
        cancelBtnText: t("recipientForm.datePickerCancel"),

        cancelLabel: t("recipientForm.datePickerCancel"),
        okLabel: t("recipientForm.datePickerOk"),
        twelveHour: false
      }
    default:
      return {
        firstDay: 1,
        title: t("recipientForm.datePickerTitle"),
        monthsFull:  ['tammikuu','helmikuu','maaliskuu','huhtikuu','toukokuu','kesäkuu','heinäkuu','elokuu','syyskuu','lokakuu','marraskuu','joulukuu'],
        monthsShort: ['tammi','helmi','maalis','huhti','touko','kesä','heinä','elo','syys','loka','marras','joulu'],
        weekdaysFull:  ['sunnuntai','maanantai','tiistai','keskiviikko','torstai','perjantai','lauantai'],
        weekdaysShort: ['su','ma','ti','ke','to','pe','la'],
        weekdaysNarrow: ['S','M','T','K','T','P','L'],
        cancelBtnText: t("recipientForm.datePickerCancel"),
        clearLabel: t("recipientForm.datePickerClear"),

        cancelLabel: t("recipientForm.datePickerCancel"),
        okLabel: t("recipientForm.datePickerOk"),
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
  //validateMaps();

  //console.log("form.profession =", form.profession);
  //console.log("professions.value[0] =", professions.value[0]);

  

  /* console.log(
    "Professions:",
    JSON.stringify(professions.value, null, 2)
  ); */

  //console.log("P --- ", professions)

  //getReadyDataParams()
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
    mapToastContent.value = t('recipientForm.internetMissing');
  }
}

// Validating address field: if user types an address but doesn't select from the autocomplete, lat/lng will be null. Show error in that case.
watch([() => form.address, () => form.lat, () => form.lng], () => {
  if (form.address && (form.lat === null || form.lng === null)) {
    errors.address = t('recipientForm.addressAutocompleteError');
  } else {
    errors.address = "";
  }
});

const validateProAddress = () => {

  if (!form.address) return;

  if (form.lat === null || form.lng === null) {
    console.log("Address is not valid, lat/lng missing");
    errors.address = "Valitse osoite listasta (ei pelkkää kirjoitusta)";
    return "Valitse osoite listasta (ei pelkkää kirjoitusta)";
  }

  return;
};

const onAddressInput = (value) => {
  form.address = value;

  selectedPlace.value = null;
  form.lat = null;
  form.lng = null;

  console.log(
    "Address input changed:",
    value,
    "lat:",
    form.lat,
    "lng:",
    form.lng
  );

  if (value.trim()) {
    validateProAddress();
    errors.address =
      t("recipientForm.addressAutocompleteError");
    
  } else {
    errors.address = "";
  }
};

function onPlaceSelected(place) {
  selectedPlace.value = place;
  console.log("Place selected:", place);
  form.address = place.address;
  form.lat = place.lat;
  form.lng = place.lng;

  lat.value = place.lat;
  lng.value = place.lng;

  errors.address = "";

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

// ----------------------------------------------


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

watch(draftPhotos, () => {
  console.log("draft changed");
}, { deep: true });

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

const getSelectedOptionsSnapshot = (
  field,
  selectedValue
) => {
  if (!Array.isArray(field.options)) {
    return [];
  }

  const values = Array.isArray(selectedValue)
    ? selectedValue
    : [selectedValue];

  return field.options
    .filter(option =>
      values.includes(option.value)
    )
    .map(option => ({
      value: option.value,

      label: {
        fi: option.label?.fi || "",
        en: option.label?.en || "",
        sv: option.label?.sv || "",
        et: option.label?.et || "",
        ru: option.label?.ru || ""
      }
    }));
};

const buildCustomFieldsSnapshot = () => {
  return sortedCustomFields.value.map(field => {
    const selectedValue =
      form.customFieldValues[field.key];

    return {
      key: field.key,
      type: field.type,

      label: {
        fi: field.label?.fi || "",
        en: field.label?.en || "",
        sv: field.label?.sv || "",
        et: field.label?.et || "",
        ru: field.label?.ru || ""
      },

      placeholder: {
        fi: field.placeholder?.fi || "",
        en: field.placeholder?.en || "",
        sv: field.placeholder?.sv || "",
        et: field.placeholder?.et || "",
        ru: field.placeholder?.ru || ""
      },

      value: selectedValue,

      selectedOptions:
        getSelectedOptionsSnapshot(
          field,
          selectedValue
        )
    };
  });
};
const createClient = async() => {
  isValidating.value = true;
  if (!validateForm()) {
    console.log("Midagi puudu:", form);

    console.log("selectedProfession", selectedProfession.value);
    console.log("sortedCustomFields", sortedCustomFields.value);
    console.log("form.profession", form.profession);


    const dateObj = parseDmyTime(form.dateTime);
    let ms;
    if (dateObj) {
      o.value = dateObj;
      ms = dateObj.getTime();
      console.log("Milliseconds:", ms);  // e.g. 1758976800000
    } else {
      console.log("Invalid date string");
    }

    clientFormErrorMsg.value = t('recipientForm.formFieldsRequired')
    isInitClientError.value = true;
  } else {


    const customFieldsSnapshot =
      buildCustomFieldsSnapshot();

    console.log(
      "customFieldsSnapshot:",
      JSON.stringify(
        customFieldsSnapshot,
        null,
        2
      )
    );


    //console.log("Header - " + form.orderHeader);
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

    /* const client = {
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
      isBudget: isBudget.value,
      budget: {
        min: form.budgetMin,
        max: form.budgetMax
      },  
      photos: photosForBackend,
      status: "active",
    } */
    const client = {
      author_id: userAuth.user.id,

      created: dateObj,
      created_ms: ms,
      dateStr: form.dateTime,

      header:
        form.orderHeader.trim() ||
        generatedOrderHeader.value,

      professionCode: form.profession,
      professional: selectedProfessionName.value,



      customFieldValues: {
        ...form.customFieldValues
      },

      customFields: customFieldsSnapshot,

      

      agreement: isClientContactAgreement.value,

      address: form.address,
      latitude: form.lat,
      longitude: form.lng,

      zone: Number(desiredRange.value) || 0,

      description: form.explanation.trim(),

      isBudget: isBudget.value,

      budget: isBudget.value
        ? {
            min:
              form.budgetMin !== ""
                ? Number(form.budgetMin)
                : null,

            max:
              form.budgetMax !== ""
                ? Number(form.budgetMax)
                : null
          }
        : null,

      photos: photosForBackend,

      isIncludeOffers: true,
      status: "active"
    };

    const booking = await clientService.addRecipient(userAuth.user.id, client);

   
    if (booking) {
      emit("createBookingMultiple", {
        ...booking,
        photos: photosForLocalState,
      });
      isValidating.value = false;
    }

  }

}

</script>

<style scoped>

.booking-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
}

.booking-input-wrapper {
  position: relative;
}

.booking-required-corner {
  position: absolute;
  top: 8px;
  right: 12px;
  z-index: 10;

  color: #ff5d6c;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;

  pointer-events: none;
}

.booking-section {
  width: 100%;
  padding: 22px;
  box-sizing: border-box;
  border: 1px solid rgba(139, 197, 202, 0.24);
  border-radius: 15px;
  background:
    linear-gradient(
      145deg,
      rgba(31, 44, 59, 0.98),
      rgba(22, 33, 46, 0.98)
    );
  box-shadow:
    0 12px 28px rgba(0, 0, 0, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.booking-section__header {
  display: flex;
  align-items: center;
  gap: 13px;
  padding-bottom: 17px;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.booking-section__header--compact {
  justify-content: space-between;
  padding-bottom: 0;
  margin-bottom: 0;
  border-bottom: 0;
}

.booking-section__header h3 {
  margin: 0;
  color: #f1f5f7;
  font-size: 18px;
  font-weight: 650;
}

.booking-section__header p {
  margin: 4px 0 0;
  color: rgba(220, 229, 234, 0.62);
  font-size: 13px;
  line-height: 1.45;
}

.booking-section__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  border: 1px solid rgba(95, 158, 160, 0.35);
  border-radius: 12px;
  color: #91c9cd;
  background: rgba(95, 158, 160, 0.13);
  font-size: 18px;
}

.booking-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  width: 100%;
}

.booking-grid--profession {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
}

.booking-grid--budget {
  margin-top: 18px;
}

.booking-grid--content {
  align-items: start;
}

.booking-field {
  min-width: 0;
}

.booking-field--wide {
  grid-column: span 1;
}

.booking-field--full {
  grid-column: 1 / -1;
}

.booking-label {
  display: block;
  margin-bottom: 7px;
  color: #dde6ea;
  font-size: 13px;
  font-weight: 600;
}

.booking-required {
  color: #ff91a0;
}

.booking-input {
  width: 100%;
  min-height: 44px;
  padding: 0 13px;
  box-sizing: border-box;
  border: 1px solid #39495d;
  border-radius: 9px;
  color: #f0f4f6;
  background: #182332;
  font-size: 14px;
  outline: none;
}

.booking-input:focus {
  border-color: #72aeb2;
  box-shadow: 0 0 0 3px rgba(95, 158, 160, 0.14);
}

.booking-help,
.booking-error {
  display: block;
  margin-top: 6px;
  font-size: 12px;
}

.booking-help {
  color: rgba(214, 224, 230, 0.55);
}

.booking-error {
  color: #ff95a3;
}

.input-with-unit {
  position: relative;
}

.input-with-unit .booking-input {
  padding-right: 48px;
}

.input-with-unit span {
  position: absolute;
  top: 50%;
  right: 14px;
  color: rgba(220, 229, 234, 0.58);
  font-size: 13px;
  transform: translateY(-50%);
}

.map-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-width: 72px;
  padding: 8px;
  border: 1px solid rgba(139, 197, 202, 0.25);
  border-radius: 10px;
  color: #bdd9dc;
  background: rgba(95, 158, 160, 0.07);
  cursor: pointer;
}

.map-link img {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.map-link span {
  font-size: 11px;
}

.booking-submit {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 4px 2px 20px;
}

.booking-submit__button {
  min-width: 220px;
}

@media (max-width: 900px) {
  .booking-form {
    gap: 18px;
  }

  .booking-section {
    padding: 18px;
  }

  .booking-grid {
    grid-template-columns: 1fr;
  }

  .booking-grid--profession {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .booking-field--full,
  .booking-field--wide {
    grid-column: auto;
  }

  .profession-fields__grid {
    grid-template-columns: 1fr;
  }

  .profession-field--full {
    grid-column: auto;
  }
}

@media (max-width: 600px) {
  .booking-section {
    padding: 15px;
    border-radius: 12px;
  }

  .booking-section__header {
    align-items: flex-start;
  }

  .booking-section__header--compact {
    flex-direction: column;
    align-items: flex-start;
    gap: 13px;
  }

  .booking-grid--profession {
    grid-template-columns: 1fr;
  }

  .map-link {
    width: 100%;
    flex-direction: row;
  }

  .booking-submit {
    flex-direction: column;
    align-items: stretch;
  }

  .booking-submit__button {
    width: 100%;
    min-width: 0;
  }
}















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

/* Budget */
.budget-field {
  display: flex;
  gap: 17px;
}

/* Professions */
.profession-fields {
  width: 100%;
  margin-top: 24px;
  padding: 20px;
  box-sizing: border-box;
  border: 1px solid rgba(139, 197, 202, 0.28);
  border-radius: 14px;
  background: #202c3b;
}

.profession-fields__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 17px;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.profession-fields__header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border: 1px solid rgba(95, 158, 160, 0.35);
  border-radius: 11px;
  color: #8bc5ca;
  background: rgba(95, 158, 160, 0.14);
  font-size: 18px;
}

.profession-fields__title {
  margin: 0;
  color: #f0f4f6;
  font-size: 17px;
  font-weight: 600;
}

.profession-fields__subtitle {
  margin: 3px 0 0;
  color: rgba(220, 228, 235, 0.64);
  font-size: 13px;
}

.profession-fields__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 17px;
}

.profession-field {
  min-width: 0;
}

.profession-field--full {
  grid-column: 1 / -1;
}

.profession-field__label {
  display: block;
  margin: 0 0 7px;
  color: #e0e7eb;
  font-size: 13px;
  font-weight: 600;
}

.profession-field__required {
  margin-left: 3px;
  color: #ff8d9a;
}

.profession-field__control {
  position: relative;
  width: 100%;
}

.profession-field__icon {
  position: absolute;
  top: 50%;
  left: 13px;
  z-index: 2;
  color: #78aeb2;
  font-size: 14px;
  pointer-events: none;
  transform: translateY(-50%);
}

.profession-field__input,
.profession-field__textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #39495d;
  border-radius: 9px;
  color: #eef3f5;
  background: #182332;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.profession-field__input {
  height: 41px;
  padding: 0 13px;
}

.profession-field__control .profession-field__input {
  padding-left: 39px;
}

.profession-field__textarea {
  min-height: 102px;
  padding: 12px 13px;
  resize: vertical;
  line-height: 1.5;
}

.profession-field__input::placeholder,
.profession-field__textarea::placeholder {
  color: rgba(218, 226, 232, 0.38);
}

.profession-field__input:focus,
.profession-field__textarea:focus {
  border-color: #72aeb2;
  box-shadow: 0 0 0 3px rgba(95, 158, 160, 0.14);
}

/* Boolean ja checkbox */

.profession-field__checkbox {
  position: relative;
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  min-height: 41px;
  padding: 9px 12px;
  box-sizing: border-box;
  border: 1px solid #39495d;
  border-radius: 9px;
  color: #e0e7eb;
  background: #182332;
  cursor: pointer;
  user-select: none;
}

.profession-field__checkbox:hover {
  border-color: rgba(139, 197, 202, 0.65);
}

.profession-field__checkbox-input {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  opacity: 0;
  pointer-events: none;
}

.profession-field__checkbox-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 21px;
  height: 21px;
  flex: 0 0 21px;
  box-sizing: border-box;
  border: 1px solid #6e8f98;
  border-radius: 5px;
  color: transparent;
  background: #111b28;
  transition: all 0.2s ease;
}

.profession-field__checkbox-input:checked
  + .profession-field__checkbox-box {
  color: #ffffff;
  border-color: cadetblue;
  background: cadetblue;
}

.profession-field__checkbox-input:focus-visible
  + .profession-field__checkbox-box {
  box-shadow: 0 0 0 3px rgba(95, 158, 160, 0.2);
}

.profession-field__checkbox-box i {
  font-size: 11px;
}

.profession-field__checkbox-label {
  color: #e0e7eb;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
}

/* Abi- ja veatekstid */

.profession-field__help,
.profession-field__error {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  margin-top: 6px;
  font-size: 11px;
  line-height: 1.4;
}

.profession-field__help {
  color: rgba(210, 220, 226, 0.55);
}

.profession-field__error {
  color: #ff96a3;
}

/* PrimeVue Select ja MultiSelect */

.profession-field__select {
  width: 100%;
}

.profession-fields :deep(.p-select),
.profession-fields :deep(.p-multiselect) {
  width: 100%;
  min-height: 41px;
  border: 1px solid #39495d;
  border-radius: 9px;
  color: #eef3f5;
  background: #182332;
  box-shadow: none;
}

.profession-fields :deep(.p-select:hover),
.profession-fields :deep(.p-multiselect:hover) {
  border-color: rgba(139, 197, 202, 0.65);
}

.profession-fields :deep(.p-select.p-focus),
.profession-fields :deep(.p-multiselect.p-focus),
.profession-fields :deep(.p-select.p-inputwrapper-focus),
.profession-fields :deep(.p-multiselect.p-inputwrapper-focus) {
  border-color: #72aeb2;
  box-shadow: 0 0 0 3px rgba(95, 158, 160, 0.14);
}

.profession-fields :deep(.p-select-label),
.profession-fields :deep(.p-multiselect-label) {
  display: flex;
  align-items: center;
  min-height: 39px;
  padding: 9px 12px;
  box-sizing: border-box;
  color: #eef3f5;
  font-size: 14px;
}

.profession-fields :deep(.p-select-label.p-placeholder),
.profession-fields :deep(.p-multiselect-label.p-placeholder) {
  color: rgba(218, 226, 232, 0.38);
}

.profession-fields :deep(.p-select-dropdown),
.profession-fields :deep(.p-multiselect-dropdown) {
  width: 40px;
  color: #86bdc1;
}

.profession-fields :deep(.p-multiselect-label-container) {
  min-width: 0;
}

.profession-fields :deep(.p-multiselect-chip-item) {
  max-width: 100%;
}

.profession-fields :deep(.p-chip) {
  color: #eaf1f3;
  background: rgba(95, 158, 160, 0.22);
}

.profession-fields :deep(.p-chip-label) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* PrimeVue overlay avaneb sageli body all,
   seega scoped CSS ei pruugi seda tabada. */
:global(.p-select-overlay),
:global(.p-multiselect-overlay) {
  border: 1px solid #39495d;
  color: #eef3f5;
  background: #182332;
}

:global(.p-select-option),
:global(.p-multiselect-option) {
  color: #e5ecef;
}

:global(.p-select-option:hover),
:global(.p-multiselect-option:hover) {
  background: rgba(95, 158, 160, 0.14);
}

:global(.p-select-option-selected),
:global(.p-multiselect-option-selected) {
  color: #ffffff;
  background: rgba(95, 158, 160, 0.28);
}

@media (max-width: 720px) {
  .profession-fields {
    padding: 16px;
  }

  .profession-fields__grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .profession-field--full {
    grid-column: auto;
  }
}

</style>
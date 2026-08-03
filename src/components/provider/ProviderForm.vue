
<template>
  <div class="provider-form-page">
    <MDBContainer>
      <ToastHandler
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
        <template #title>
          {{ t("providerForm.notifications.error_title") }}
        </template>

        <button
          type="button"
          class="btn-close ms-auto"
          style="visibility: hidden"
          aria-label="Close"
          @click="hideError"
        />

        <template #small />

        {{ proFormErrorMsg }}
      </MDBToast>

      <form
        class="provider-form"
        novalidate
        autocomplete="off"
        @submit.prevent="submitPro"
      >
        <!-- Päis -->
        <header class="provider-form__hero">
          <div class="provider-form__hero-icon">
            <i class="fa-solid fa-building" />
          </div>

          <div>
            <h1>
              {{ t("providerForm.buttons.create_account") }}
            </h1>

            <p>
              {{ t("providerForm.help.account_intro") }}
            </p>
          </div>
        </header>

        <!-- Ettevõtte andmed -->
        <section class="provider-section">
          <div class="provider-section__header">
            <div class="provider-section__icon">
              <i class="fa-solid fa-briefcase" />
            </div>

            <div>
              <h2>
                {{ t("providerForm.sections.company") }}
              </h2>

              <p>
                {{ t("providerForm.help.company_info") }}
              </p>
            </div>
          </div>

          <div class="provider-grid">
            <div class="provider-field">
              <label
                for="yritys"
                class="provider-label"
              >
                {{ t("providerForm.fields.company_name") }}

                <span class="provider-required">*</span>
              </label>

              <MDBInput
                id="yritys"
                v-model="pForm.proName"
                size="lg"
                :label="t('providerForm.fields.company_name')"
              />

              <small
                v-if="pfErrors.proName"
                class="provider-error"
              >
                <i class="fa-solid fa-circle-exclamation" />
                {{ pfErrors.proName }}
              </small>
            </div>

            <div class="provider-field">
              <label
                for="ytunnus"
                class="provider-label"
              >
                {{ t("providerForm.fields.business_id") }}

                <!-- <span class="provider-required">*</span> -->
              </label>

              <MDBInput
                id="ytunnus"
                v-model="pForm.ideNum"
                size="lg"
                :label="t('providerForm.fields.business_id')"
              />

              <small
                v-if="pfErrors.ideNum"
                class="provider-error"
              >
                <i class="fa-solid fa-circle-exclamation" />
                {{ pfErrors.ideNum }}
              </small>
            </div>

            <div class="provider-field provider-field--full">
              <label class="provider-label">
                {{ t("providerForm.fields.website") }}
              </label>

              <MDBInput
                v-model="pro_link"
                size="lg"
                :label="t('providerForm.fields.website')"
              />
            </div>
          </div>
        </section>

        <!-- Aadress ja teeninduspiirkond -->
        <section class="provider-section">
          <div class="provider-section__header">
            <div class="provider-section__icon">
              <i class="fa-solid fa-location-dot" />
            </div>

            <div>
              <h2>
                {{ t("providerForm.sections.location") }}
              </h2>

              <p>
                {{ t("providerForm.help.radius_info") }}
              </p>
            </div>
          </div>

          <div class="provider-grid">
            <div class="provider-field provider-field--full">
              <label class="provider-label">
                {{ t("providerForm.fields.address") }}

                <span class="provider-required">*</span>
              </label>

              <div class="provider-address-field">
                <AddressAutocomplete
                  v-model="pForm.address"
                  v-model:valid="addressValid"
                  :label="t('providerForm.fields.address')"
                  :error="pfErrors.address"
                  @typing="onAddressInput"
                  @place="onPlaceSelected"
                />
              </div>
            </div>

            <div class="provider-field">
              <label class="provider-label">
                {{ t("providerForm.fields.service_radius") }}
              </label>

              <div class="provider-input-unit">
                <MDBInput
                  v-model="range"
                  type="text"
                  inputmode="numeric"
                  size="lg"
                  :label="
                    t('providerForm.fields.service_radius')
                  "
                  @input="filterRangeInput"
                />

                <span class="provider-input-unit__label">
                  km
                </span>
              </div>

              <small class="provider-help">
                <i class="fa-solid fa-circle-info" />

                {{ t("providerForm.help.radius_info") }}
              </small>
            </div>
          </div>
        </section>

        <!-- Amet -->
        <section class="provider-section">
          <div class="provider-section__header">
            <div class="provider-section__icon">
              <i class="fa-solid fa-screwdriver-wrench" />
            </div>

            <div>
              <h2>
                {{ t("providerForm.sections.profession") }}
              </h2>

              <p>
                {{ t("providerForm.help.profession_info") }}
              </p>
            </div>
          </div>

          <div class="provider-field">
            <label class="provider-label">
              {{ t("providerForm.fields.profession") }}

              <span class="provider-required">*</span>
            </label>

            <SelectProfession
              :form="pForm"
              :errors="pfErrors"
              :label="t('providerForm.fields.profession')"
            />

            <!-- <small
              v-if="pfErrors.profession"
              class="provider-error"
            >
              <i class="fa-solid fa-circle-exclamation" />

              {{ pfErrors.profession }}
            </small> -->
          </div>
        </section>

        <!-- Hinnastamine -->
        <section class="provider-section">
          <div class="provider-section__header">
            <div class="provider-section__icon">
              <i class="fa-solid fa-euro-sign" />
            </div>

            <div>
              <h2>
                {{ t("providerForm.sections.pricing") }}
              </h2>

              <p>
                {{ t("providerForm.help.pricing_info") }}
              </p>
            </div>
          </div>

          <div class="pricing-options">
            <label
              class="pricing-option"
              :class="{
                'pricing-option--active':
                  about_price === 'hour'
              }"
            >
              <MDBRadio
                v-model="about_price"
                name="aboutPrice"
                value="hour"
                :label="
                  t('providerForm.fields.hourly_price')
                "
              />

              <span class="pricing-option__description">
                {{
                  t(
                    "providerForm.help.hourly_price_info"
                  )
                }}
              </span>
            </label>

            <label
              class="pricing-option"
              :class="{
                'pricing-option--active':
                  about_price === 'piece'
              }"
            >
              <MDBRadio
                v-model="about_price"
                name="aboutPrice"
                value="piece"
                :label="
                  t('providerForm.fields.fixed_price')
                "
              />

              <span class="pricing-option__description">
                {{
                  t(
                    "providerForm.help.fixed_price_info"
                  )
                }}
              </span>
            </label>
          </div>

          <div
            v-if="about_price === 'hour'"
            class="provider-field pricing-input"
          >
            <label class="provider-label">
              {{
                t(
                  "providerForm.fields.hourly_price_input"
                )
              }}
            </label>

            <div class="provider-input-unit">
              <MDBInput
                v-model="price"
                type="text"
                inputmode="decimal"
                size="lg"
                :label="
                  t(
                    'providerForm.fields.hourly_price_input'
                  )
                "
                @input="filterPriceInput"
              />

              <span class="provider-input-unit__label">
                €/h
              </span>
            </div>
          </div>
        </section>

        <!-- Kirjeldus -->
        <section class="provider-section">
          <div class="provider-section__header">
            <div class="provider-section__icon">
              <i class="fa-solid fa-align-left" />
            </div>

            <div>
              <h2>
                {{ t("providerForm.sections.description") }}
              </h2>

              <p>
                {{ t("providerForm.help.description_info") }}
              </p>
            </div>
          </div>

          <div class="provider-field">
            <div class="provider-textarea-wrapper">
              <MDBTextarea
                v-model="proDescription"
                maxlength="100"
                rows="4"
                :label="
                  t('providerForm.fields.description')
                "
              />

              <span class="message-counter">
                {{ proDescription.length }} / 100
              </span>
            </div>
          </div>
        </section>

        <!-- Salvestamine -->
        <section class="provider-submit">
          <div class="provider-submit__info">
            <i class="fa-solid fa-shield-halved" />

            <span>
              {{ t("providerForm.help.submit_info") }}
            </span>
          </div>

          <MDBBtn
            color="primary"
            size="lg"
            type="submit"
            class="provider-submit__button"
          >
            <i class="fa-solid fa-user-plus" />

            {{ t("providerForm.buttons.create_account") }}
          </MDBBtn>
        </section>
      </form>
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

import AddressAutocomplete from "@/components/AddressAutocomplete.vue";
import SelectProfession from "@/components/helpers/SelectProfession.vue";
import { useLocationFieldLogic } from "@/components/helpers/locationFieldLogic.js";
//import i18n from '../controllers/i18n.js';
defineOptions({
  name: 'provider-form'
})

const emit = defineEmits(['createPro']);

const pForm__ = reactive({
  proName: "",
  ideNum: "",
  profession: "",
  address: ""
});

const pForm = reactive({
  proName: "",
  ideNum: "",
  profession: "",
  address: "",
  lat: null,
  lng: null
});

const pfErrors = reactive({
  proName: "",
  ideNum: "",
  profession: "",
  address: ""
});

const router = useRouter();
const { t } = useI18n();
const proAuth = useLoginStore();
const proStore = useProStore();
//const pfErrors = reactive({});
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

//const addressValid = ref(false);


const toastModel = ref(false)
const toastState = ref('')
const toastIcon = ref('')
const toastContent = ref('')

const {
  addressValid,
  onAddressInput,
  onPlaceSelected,
  validateAddress
} = useLocationFieldLogic(
  pForm,
  pfErrors
);


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
  pfErrors.proName = pForm.proName?.trim()
    ? ""
    : t("providerForm.validations.name_required");

  /* pfErrors.ideNum = pForm.ideNum?.trim()
    ? ""
    : t(
        "providerForm.validations.business_id_required"
      ); */

  pfErrors.profession = pForm.profession
    ? ""
    : t(
        "providerForm.validations.profession_required"
      );

  const isAddressValid = validateAddress();

  return (
    !pfErrors.proName &&
    !pfErrors.ideNum &&
    !pfErrors.profession &&
    isAddressValid
  );
};

watch(() => pForm.proName, () => (pfErrors.proName = ""));
//watch(() => pForm.ideNum, () => (pfErrors.ideNum = ""));
watch(() => pForm.profession, () => (pfErrors.profession = ""));
watch(() => pForm.address, () => (pfErrors.address = ""));

const isLocating = ref(false)

onMounted(async() => {
  //await handleMaps();
})



const proCurrentLocation__ = async () => {
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
const showProLocationData__ = (lat, long) => {
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

const showProAddress__ = () => {
  isProAddress.value = true;
  proCurrentLocation();
}

const clearProAddress__ = () => {
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
      latitude: pForm.lat,
      longitude: pForm.lng,
      profession: [pForm.profession],
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
.provider-form-page {
  width: 100%;
  padding: 24px 0 40px;
}

.provider-form {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
  gap: 22px;
}

/* Vormipäis */

.provider-form__hero {
  display: flex;
  align-items: center;
  gap: 17px;
  padding: 22px;
  border: 1px solid rgba(139, 197, 202, 0.24);
  border-radius: 16px;
  background:
    linear-gradient(
      145deg,
      rgba(36, 51, 68, 0.98),
      rgba(23, 34, 47, 0.98)
    );
  box-shadow:
    0 14px 34px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.provider-form__hero-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  flex: 0 0 54px;
  border: 1px solid rgba(95, 158, 160, 0.42);
  border-radius: 15px;
  color: #9ad0d4;
  background: rgba(95, 158, 160, 0.15);
  font-size: 22px;
}

.provider-form__hero h1 {
  margin: 0;
  color: #f3f7f8;
  font-size: clamp(21px, 3vw, 28px);
  font-weight: 700;
}

.provider-form__hero p {
  margin: 5px 0 0;
  color: rgba(218, 228, 233, 0.64);
  font-size: 14px;
  line-height: 1.5;
}

/* Sektsioonid */

.provider-section {
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

.provider-section__header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding-bottom: 17px;
  margin-bottom: 19px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.provider-section__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 43px;
  height: 43px;
  flex: 0 0 43px;
  border: 1px solid rgba(95, 158, 160, 0.34);
  border-radius: 12px;
  color: #91c9cd;
  background: rgba(95, 158, 160, 0.13);
  font-size: 17px;
}

.provider-section__header h2 {
  margin: 0;
  color: #f1f5f7;
  font-size: 18px;
  font-weight: 650;
}

.provider-section__header p {
  margin: 4px 0 0;
  color: rgba(220, 229, 234, 0.61);
  font-size: 13px;
  line-height: 1.45;
}

/* Grid */

.provider-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  width: 100%;
  gap: 18px;
}

.provider-field {
  min-width: 0;
}

.provider-field--full {
  grid-column: 1 / -1;
}

.provider-label {
  display: block;
  margin: 0 0 7px;
  color: #dfe7eb;
  font-size: 13px;
  font-weight: 600;
}

.provider-required {
  margin-left: 3px;
  color: #ff91a0;
}

/* MDB väljad */

.provider-field :deep(.form-outline) {
  width: 100%;
}

.provider-field :deep(.form-control) {
  min-height: 44px;
  border-color: #39495d;
  color: #eef3f5;
  background: #182332;
}

.provider-field :deep(.form-control:focus) {
  border-color: #72aeb2;
  box-shadow: 0 0 0 3px rgba(95, 158, 160, 0.14);
}

.provider-field :deep(.form-label) {
  color: rgba(225, 234, 239, 0.68);
}

.provider-field :deep(.form-control:focus ~ .form-label),
.provider-field :deep(.form-control.active ~ .form-label) {
  color: #91c9cd;
}

/* Veateated ja abitekstid */

.provider-error,
.provider-help {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 7px;
  font-size: 12px;
  line-height: 1.4;
}

.provider-error {
  color: #ff95a3;
}

.provider-help {
  color: rgba(210, 221, 227, 0.58);
}

/* Aadress */

.address-field {
  position: relative;
  width: 100%;
  min-height: 44px;
}

.address-field__controls {
  display: flex;
  align-items: stretch;
  width: 100%;
}

.address-field__controls :deep(.form-outline) {
  flex: 1 1 auto;
  min-width: 0;
}

.address-field__button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  flex: 0 0 54px;
  padding: 0 !important;
  border: 1px solid #39495d !important;
  border-left: 0 !important;
  border-radius: 0 8px 8px 0 !important;
  color: #91c9cd !important;
  background: rgba(95, 158, 160, 0.09) !important;
  box-shadow: none !important;
}

.address-field__button:hover {
  color: #ffffff !important;
  background: rgba(95, 158, 160, 0.2) !important;
}

.address-field__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 90px;
  gap: 10px;
  color: rgba(222, 231, 235, 0.68);
  font-size: 13px;
}

.hideProInput {
  display: none;
}

/* Ühikuga sisend */

.provider-input-unit {
  position: relative;
}

.provider-input-unit :deep(.form-control) {
  padding-right: 62px;
}

.provider-input-unit__label {
  position: absolute;
  top: 50%;
  right: 15px;
  z-index: 4;
  color: rgba(220, 229, 234, 0.58);
  font-size: 13px;
  pointer-events: none;
  transform: translateY(-50%);
}

/* Ametite Select */

.provider-profession-select {
  width: 100%;
}

.provider-profession-select--error {
  border: 1px solid #ff7f91 !important;
  border-radius: 8px;
}

.provider-section :deep(.p-select) {
  width: 100%;
  min-height: 44px;
  border: 1px solid #39495d;
  border-radius: 9px;
  color: #eef3f5;
  background: #182332;
  box-shadow: none;
}

.provider-section :deep(.p-select:hover) {
  border-color: rgba(139, 197, 202, 0.65);
}

.provider-section :deep(.p-select.p-focus),
.provider-section :deep(.p-select.p-inputwrapper-focus) {
  border-color: #72aeb2;
  box-shadow: 0 0 0 3px rgba(95, 158, 160, 0.14);
}

.provider-section :deep(.p-select-label) {
  display: flex;
  align-items: center;
  min-height: 42px;
  padding: 9px 12px;
  color: #eef3f5;
}

.provider-section :deep(.p-select-label.p-placeholder) {
  color: rgba(218, 226, 232, 0.4);
}

.provider-section :deep(.p-select-dropdown) {
  color: #86bdc1;
}

.profession-selected,
.profession-group,
.profession-option {
  display: flex;
  align-items: center;
  gap: 10px;
}

.profession-selected i,
.profession-group i,
.profession-option > i {
  color: #8bc5ca;
}

.profession-option {
  align-items: flex-start;
}

.profession-option div {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.profession-option small {
  margin-top: 3px;
  color: rgba(210, 220, 226, 0.58);
  line-height: 1.35;
}

/* Hinnastamine */

.pricing-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.pricing-option {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 92px;
  padding: 15px;
  box-sizing: border-box;
  border: 1px solid #39495d;
  border-radius: 11px;
  background: #182332;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.pricing-option:hover {
  border-color: rgba(139, 197, 202, 0.65);
}

.pricing-option--active {
  border-color: #72aeb2;
  background: rgba(95, 158, 160, 0.13);
  box-shadow: 0 0 0 3px rgba(95, 158, 160, 0.1);
}

.pricing-option__description {
  color: rgba(213, 224, 230, 0.58);
  font-size: 12px;
  line-height: 1.45;
}

.pricing-input {
  max-width: 460px;
  margin-top: 18px;
}

/* Kirjeldus */

.provider-textarea-wrapper {
  position: relative;
}

.provider-textarea-wrapper :deep(textarea) {
  min-height: 110px;
  padding-bottom: 27px;
}

.message-counter {
  position: absolute;
  right: 12px;
  bottom: 8px;
  color: rgba(217, 226, 231, 0.48);
  font-size: 11px;
}

/* Submit */

.provider-submit {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 20px;
  border: 1px solid rgba(139, 197, 202, 0.24);
  border-radius: 14px;
  background: rgba(24, 35, 50, 0.92);
}

.provider-submit__info {
  display: flex;
  align-items: center;
  gap: 9px;
  color: rgba(215, 225, 230, 0.62);
  font-size: 13px;
}

.provider-submit__info i {
  color: #83bec2;
}

.provider-submit__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 230px;
  gap: 9px;
  border-radius: 10px;
  font-weight: 650;
  background:
    linear-gradient(
      135deg,
      #268ead,
      #3b82f6
    ) !important;
  box-shadow:
    0 9px 22px rgba(59, 130, 246, 0.3);
}

/* PrimeVue overlay paikneb body all */

:global(.p-select-overlay) {
  border: 1px solid #39495d;
  color: #eef3f5;
  background: #182332;
}

:global(.p-select-option) {
  color: #e5ecef;
}

:global(.p-select-option:hover) {
  background: rgba(95, 158, 160, 0.14);
}

:global(.p-select-option-selected) {
  color: #ffffff;
  background: rgba(95, 158, 160, 0.28);
}

/* Tahvel */

@media (max-width: 800px) {
  .provider-form-page {
    padding-top: 16px;
  }

  .provider-section {
    padding: 18px;
  }

  .provider-grid,
  .pricing-options {
    grid-template-columns: 1fr;
  }

  .provider-field--full {
    grid-column: auto;
  }
}

/* Mobiil */

@media (max-width: 600px) {
  .provider-form {
    gap: 16px;
  }

  .provider-form__hero,
  .provider-section {
    padding: 15px;
    border-radius: 12px;
  }

  .provider-form__hero {
    align-items: flex-start;
  }

  .provider-form__hero-icon {
    width: 46px;
    height: 46px;
    flex-basis: 46px;
    border-radius: 12px;
    font-size: 19px;
  }

  .provider-section__header {
    gap: 11px;
    padding-bottom: 14px;
    margin-bottom: 16px;
  }

  .provider-section__icon {
    width: 39px;
    height: 39px;
    flex-basis: 39px;
  }

  .provider-submit {
    flex-direction: column;
    align-items: stretch;
  }

  .provider-submit__button {
    width: 100%;
    min-width: 0;
  }

  .address-field__button {
    width: 50px;
    flex-basis: 50px;
  }
}
</style>
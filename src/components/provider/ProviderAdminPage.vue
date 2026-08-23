<template>
  <MDBContainer v-if="!provider">
    <p>{{ t('providerAdmin.loading') }}</p>
  </MDBContainer>
  <MDBContainer 
    v-else 
    fluid 
    class="py-3 
    provider-admin"
    :style="{
    '--header-stack-height':
      `${headerStackHeight}px`
  }"
  >
    
    <!-- Ülemine päis -->
    <div class="header-stack" >
      <header class="provider-topbar">
        <div class="provider-identity">
          <div class="provider-avatar" aria-hidden="true">
            {{
              (provider.pName ||
                t("providerAdmin.providerFallback"))
                .charAt(0)
                .toUpperCase()
            }}
          </div>

          <div class="provider-identity__content">
            <h1 class="provider-name">
              {{
                provider.pName ||
                t("providerAdmin.providerFallback")
              }}
            </h1>

            <small class="provider-updated">
              {{
                t("providerAdmin.updatedAt", {
                  date: formatDateTime(provider.updatedAt)
                })
              }}
            </small>
          </div>
        </div>

        <span
          v-if="provider.status"
          class="availability-pill"
          :class="{
            'availability-pill--available':
              provider.status === 'Saatavilla',
            'availability-pill--agreement':
              provider.status !== 'Saatavilla'
          }"
        >
          <span class="availability-pill__dot" />

          {{
            provider.status === "Saatavilla"
              ? t("providerAdmin.available")
              : t("providerAdmin.byAgreement")
          }}
        </span>
      </header>

      <div
        v-if="clientReport"
        class="ticker"
      >
        <div
          :key="tickerKey"
          class="ticker__row"
        >
          <span class="ticker__icon">●</span>
          <span>{{ clientReport }}</span>
        </div>
      </div>

      <div >
        
      </div>
    </div>

    <!-- SCROLLITAVAD BANNERID -->

    <!-- :style="{
        marginTop: `${headerStackHeight + 50}px`
      }" -->
    <div
      class="notifications-banner banner-position"
    >
      <NotificationStatusBanner
        :is-authenticated="isAuthenticated"
        :permission="notificationPermission"
        @show-blocked-modal="$emit('show-notification-help')"
        @show-notifications-modal="$emit('show-set-notifications')"
      />

      <!-- <AdminMessage
        :is-authenticated="isAuthenticated"
      /> -->
    </div>


    <!-- Statistika -->
    <section class="provider-stats page-content">
      <article class="provider-stat-card">
        <div class="provider-stat-card__header">
          <!-- <div class="provider-stat-card__icon provider-stat-card__icon--availability">
            <MDBIcon icon="toggle-on" />
          </div> -->
          <div class="provider-stat-card__icon" :class="{
            'provider-stat-card__icon--availability':
            provider.status === 'Saatavilla',
            'provider-start-card__icon--warning':
            provider.status !== 'Saatavilla'
          }">
            <MDBIcon icon="toggle-on" />
          </div>

          <span class="provider-stat-card__label">
            {{ t("providerAdmin.mapManagement") }}
          </span>
        </div>

        <button
          type="button"
          class="provider-stat-card__action"
          :class="{
            'provider-stat-card__action--success':
              provider.status === 'Sovittaessa',
            'provider-stat-card__action--warning':
              provider.status !== 'Sovittaessa'
          }"
          @click="handleAvailability"
        >
          {{
            provider.status === "Sovittaessa"
              ? t("providerAdmin.available")
              : t("providerAdmin.byAgreement")
          }}
        </button>
      </article>

      <button
        type="button"
        class="provider-stat-card provider-stat-card--interactive"
        :disabled="!confirmedClients.length"
        @click="router.push('/calendar')"
      >
        <div class="provider-stat-card__header">
          <div class="provider-stat-card__icon provider-stat-card__icon--confirmed">
            <MDBIcon icon="calendar-check" />
          </div>

          <span class="provider-stat-card__label">
            {{ t("providerAdmin.confirmedOrders") }}
          </span>
        </div>

        <strong class="provider-stat-card__value">
          {{ confirmedClients.length }}
        </strong>
      </button>

      <button
        type="button"
        class="provider-stat-card provider-stat-card--interactive"
        :disabled="!providerHistory.length"
        @click="router.push('/p-archive')"
      >
        <div class="provider-stat-card__header">
          <div class="provider-stat-card__icon provider-stat-card__icon--archive">
            <MDBIcon icon="box-archive" />
          </div>

          <span class="provider-stat-card__label">
            {{ t("providerAdmin.archivedOrders") }}
          </span>
        </div>

        <strong class="provider-stat-card__value">
          {{ providerHistory.length }}
        </strong>
      </button>
      <!-- :style="{ '--watermark': `url(${logo})` }" -->
      <article
        class="provider-stat-card provider-stat-card--credit"
        
      >
        <div class="provider-stat-card__header">
          <div class="provider-stat-card__icon provider-stat-card__icon--credit">
            <MDBIcon icon="clock" />
          </div>

          <span class="provider-stat-card__label">
            {{ t("providerAdmin.activeTime") }}
          </span>
        </div>

        <template v-if="credit <= 0" >
          <strong class="provider-stat-card__credit provider-stat-card__credit--expired">
            {{ t("providerAdmin.usageTimeEnded") }}
          </strong>

          <button
            type="button"
            class="provider-stat-card__link"
            @click="router.push('/pay-plan')"
          >
            {{ t("providerAdmin.loadTime") }}
          </button>
        </template>

        <template v-else>
          <strong class="provider-stat-card__value">
            {{ credit }}
          </strong>

          <span class="provider-stat-card__unit">
            {{ t("providerAdmin.creditDays", { count: credit }) }}
          </span>

          <button
            type="button"
            class="provider-stat-card__link"
            @click="router.push('/pay-plan')"
          >
            {{ t("providerAdmin.loadMoreTime") }}
          </button>
        </template>
      </article>
    </section>

    <!-- Kiirtegevused -->
    <section class="quick-actions">
      <button
        type="button"
        class="quick-action"
        @click="openReferences"
      >
        <span class="quick-action__icon">
          <MDBIcon icon="images" />
        </span>

        <span class="quick-action__content">
          <strong>
            {{ t("providerAdmin.taskImages") }}
          </strong>
        </span>

        <MDBIcon
          icon="chevron-right"
          class="quick-action__arrow"
        />
      </button>

      <button
        type="button"
        class="quick-action"
        @click="showFeedback"
      >
        <span class="quick-action__icon quick-action__icon--rating">
          <MDBIcon icon="star" />
        </span>

        <span class="quick-action__content">
          <strong>
            {{ t("providerAdmin.feedback") }}
          </strong>

          <small>
            {{ provider?.rating || 0 }}
            / 5 ·
            {{ provider?.ratersCount || 0 }}
          </small>
        </span>

        <MDBIcon
          icon="chevron-right"
          class="quick-action__arrow"
        />
      </button>

      <button
        type="button"
        class="quick-action"
        @click="seeClients"
      >
        <span class="quick-action__icon quick-action__icon--clients">
          <MDBIcon icon="users" />
        </span>

        <span class="quick-action__content">
          <strong>
            {{ t("providerAdmin.clientsOnMap") }}
          </strong>
        </span>

        <MDBIcon
          icon="chevron-right"
          class="quick-action__arrow"
        />
      </button>
    </section>


    <!-- <MDBBtn color="warning" @click="enablePushNotifications">
      Luba teavitused
    </MDBBtn>



    <div style="padding: 20px; background: white; color: black;">
      <button @click="checkPush">
        Check PWA Push
      </button>

      <pre style="white-space: pre-wrap;">
        {{ debug }}
      </pre>
    </div><br> -->

      
    <MDBRow class="g-3">
      <MDBCol md="5" lg="4">
        <MDBCard class="h-100">
          <MDBCardBody v-if="!isPanelInfoEditSection">
            
            <div class="d-flex align-items-center justify-content-between mb-2">
              <h6 class="mb-0">{{ t('providerAdmin.provider') }}</h6>
              <div class="d-flex gap-2">
                
                <MDBBtn size="sm" color="primary" @click="isPanelInfoEditSection = true">
                  {{ t('providerAdmin.edit') }}
                </MDBBtn>
              </div>
            </div>

            <div class="vstack gap-3">
    
              <div style="text-align: left;">
                <!-- <div class="text-muted info-panel" >{{ draftProvider.name }}</div> -->
                <div class="text-muted info-panel">{{ draftProvider.description }}</div>
                <div class="text-muted info-panel">{{ draftProvider.address }}</div>
                <div class="text-muted info-panel">
                  {{ t('providerAdmin.serviceAreaValue', {
                    range: draftProvider.range ? draftProvider.range : 0
                  }) }}
                </div>
                <div class="text-muted info-panel">{{ draftProvider.profession.map(p => localProfessionName(p)).join(", ") }}</div>
                <div class="text-muted info-panel">
                  {{ t('providerAdmin.hourlyRateValue', {
                    price: draftProvider.priceByHour
                  }) }}
                </div>
                <div class="info-panel">
                  {{ t('providerAdmin.notes') }}
                  <p class="text-muted">{{ draftProvider?.notes ? draftProvider.notes : t('providerAdmin.noNotes') }}</p>
                </div>
                
              </div>
             
            </div>
          </MDBCardBody>
          <MDBCardBody v-else>
            
            <div class="d-flex align-items-center justify-content-between mb-2">
              <h6 class="mb-0 no-edit-panel" @click="isPanelInfoEditSection = false">{{ t('providerAdmin.exit') }}</h6>
              <div class="d-flex gap-2">
                <MDBBtn size="sm" color="light" outline @click="resetProvider" :disabled="busy || !providerDirty">
                  {{ t('providerAdmin.reset') }}
                </MDBBtn>
                <MDBBtn size="sm" color="primary" @click="saveProvider" :disabled="!canSaveProvider">
                  {{ t('providerAdmin.save') }}
                </MDBBtn>
              </div>
            </div>

            <div class="vstack gap-3">
              
              <MDBInput :label="t('providerAdmin.description')" v-model="draftProvider.description" @input="markDirty('provider')" />

              <fieldset class="fs-box">
                <legend class="fs-legend">{{ t('providerAdmin.address') }}</legend>
                <div>
                  <p class="text-muted" style="color:cornflowerblue; font-size: 12px;; text-align: left;">{{ draftProvider.address }}</p>

                  <address-autocomplete
                    v-model="pmForm.address"
                    v-model:valid="addressValid"
                    v-model:error="pmError.address"
                    :label="t('providerAdmin.enterNewAddress')"
                    :error="pmError.address"
                    @typing="onAddressInput"
                    @place="onPlaceSelected"
                  />
                  
                </div>
              </fieldset>
              

              <!-- Current professions list -->
              <fieldset class="fs-box">
                <legend class="fs-legend">{{ t('providerAdmin.professions') }}</legend>
                <div>
                  <MDBTable  style="font-size: 14px; color: #ddd; width: 100%; text-align: left;">
                    <tbody>
                      <tr v-for="(pro, index) in draftProvider.profession" :key="pro">
                        
                        <td>{{localProfessionName(pro) || pro}}</td>
                        <td>
                          <MDBBtnClose
                            v-if="draftProvider.profession.length > 1"
                            white
                            @click="removeProfession(index)"
                            :disabled="draftProvider.profession.length === 1"
                            title="At least one profession is required"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </MDBTable>
           

                  <div class="field-wrapper">
                    <Select
                      style="width: 100%;"
                      v-model="selectedProfession"
                      :options="groupedProfessions"
                      option-label="label"
                      option-value="code"
                      option-group-label="label"
                      option-group-children="items"
                      filter
                      filter-by="label"
                      showClear
                      appendTo="body"
                      :placeholder="t('providerAdmin.enterNewProfession')"
                      @update:modelValue="onProfessionPicked"
                    >
                      <template #optiongroup="{ option }">
                        <div class="profession-group">
                          <i :class="option.icon" />
                          &nbsp;&nbsp;<span>{{ option.label }}</span>
                        </div>
                      </template>

                      <template #option="{ option }">
                        <div class="profession-option">
                          <i style="color: orange;" :class="option.icon" />
                          <strong>&nbsp;&nbsp;&nbsp;{{ option.label }}</strong>
                          <div>
                            <small v-if="option.localizedDescription">
                              {{ option.localizedDescription }}
                            </small>
                          </div>
                        </div>
                      </template>
                    </Select>
                  </div>
                </div>
                
              </fieldset>
     
              <!-- <MDBInput :label="t('providerAdmin.serviceAreaKm')" v-model="draftProvider.range" :value="field" @input="filterInput" /> -->
              <MDBInput
                :label="t('providerAdmin.serviceAreaKm')"
                v-model="draftProvider.range"
                type="text"
                inputmode="numeric"
                @input="filterPositiveInteger($event, 'range')"
              />
                              
              <!-- <MDBInput :label="t('providerAdmin.hourlyRate')" type="text" v-model="draftProvider.priceByHour" :value="field" @input="filterInput" /> -->
              <MDBInput
                :label="t('providerAdmin.hourlyRate')"
                v-model="draftProvider.priceByHour"
                type="text"
                inputmode="decimal"
                @input="filterPositiveDecimal($event, 'priceByHour')"
              />

              <MDBTextarea :label="t('providerAdmin.notes')" rows="3" v-model="draftProvider.notes"
                @input="markDirty('provider')" />

              <MDBRow class="g-2">
                <MDBCol col="6">
                  
                </MDBCol>
                <MDBCol col="6">
                  
                </MDBCol>
              </MDBRow>

            </div>
          </MDBCardBody>
        </MDBCard>
      </MDBCol>

      <!-- Clients + extra useful sections -->
      <MDBCol md="7" lg="8">

        <!-- DESKTOP -->
        <div class="d-none d-md-block">
          <MDBCard class="mb-3">
            <MDBCardBody>
              <div class="orders-header">
                <h6 class="mb-0">{{ t('providerAdmin.orders') }}</h6>

                <MDBInput
                  size="sm"
                  :label="t('providerAdmin.search')"
                  v-model="clientQuery"
                  class="orders-search"
                />
              </div>

              <client-offers-list
                :clients="filteredClients"
                @handle-user-action="$emit('handle-user-action', $event)"
                @open-chat="$emit('open-chat', $event)"
                @toast="handleToast"
              />

              <div v-if="filteredClients.length === 0" class="text-muted small py-2">
                {{ t('providerAdmin.noSearchResults') }}
              </div>
            </MDBCardBody>
          </MDBCard>
        </div>

        <!-- MOBILE -->
        <div class="d-block d-md-none mobile-orders order-section" >
          <div class="orders-header px-2">
            <h6 class="mb-0">{{ t('providerAdmin.orders') }}</h6>

            <MDBInput
              size="sm"
              :label="t('providerAdmin.search')"
              v-model="clientQuery"
              class="orders-search"
            />
          </div>

          <client-offers-list
            :clients="filteredClients"
            @handle-user-action="$emit('handle-user-action', $event)"
            @open-chat="$emit('open-chat', $event)"
            @toast="handleToast"
          />

          <div v-if="filteredClients.length === 0" class="text-muted small py-2 px-2">
            {{ t('providerAdmin.noSearchResults') }}
          </div>
        </div>

        

        <!-- Extras: schedule + alerts + billing snapshot -->
        <MDBRow v-if="!isMobile" class="g-3 extras-row">
          <MDBCol class="extras-col" col="12">
            <MDBCard v-if="isCalendar">
              <MDBCardBody>
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <table class="table-sm small" style="width: 40%; text-align: left;">
                    <tbody>
                      <tr>
                        <th>
                          {{ t('providerAdmin.freeTimes') }}
                        </th>
                        <td>
                          <span style="color: orange;">{{ activeTimesCount }}</span>
                        </td>
                      </tr>
                      <tr>
                        <th>
                          {{ t('providerAdmin.notes') }}
                        </th>
                        <td>
                          <span style="color: palevioletred;">{{ activeNotesCount }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <p class="no-calendar" @click="isCalendar = false">{{ t('providerAdmin.done') }}</p>
                  <!-- <MDBBtn size="sm" color="light" outline @click="openSchedule">Hallita</MDBBtn> -->
                </div>
              <calendar />
              </MDBCardBody>
              
              
            </MDBCard>
            
            <MDBCard v-else class="h-100">
              <MDBCardBody>
                <div class="d-flex align-items-center justify-content-between mb-2">

                  <table class="table-sm small" style="width: 40%; text-align: left;">
                    <tbody>
                      <tr>
                        <th>
                          {{ t('providerAdmin.freeTimes') }}
                        </th>
                        <td>
                          <span style="color: orange;">{{ activeTimesCount }}</span>
                        </td>
                      </tr>
                      <tr>
                        <th>
                          {{ t('providerAdmin.notes') }}
                        </th>
                        <td>
                          <span style="color: palevioletred;">{{ activeNotesCount }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <MDBBtn size="sm" color="light" outline @click="openSchedule">{{ t('providerAdmin.calendar') }}</MDBBtn>
                </div>
                <div style="text-align: left;">
                  <div class="semibold" style="color: #708090;">
                    {{ t('providerAdmin.addEntriesToCalendar') }}
                  </div>
                  <div class="text-muted small">
                    {{ t('providerAdmin.calendarVisibilityHelp') }}
                  </div>
                </div>
                
              </MDBCardBody>
            </MDBCard>
          </MDBCol>

          <MDBCol class="extras-col" col="12">
            <MDBCard class="h-100">
              <MDBCardBody>
                
                <!-- <div style="border-top: 1px solid orange;">
                  <img class="logo-hero__img img-box"
                    style="border-radius: 100%; margin-top: 13px;"
                    :src="logo"
                    alt="Prokeikkatori logo" width="100%"  />
                </div> -->
                <div style="display: flex; justify-content: space-between; margin-top: 14px;">
                  <MDBBtn v-if="isBookings" color="light" @click="router.push('/client-panel')">{{ t('providerAdmin.myOrders') }}</MDBBtn>
                  <p v-else></p>
                  <MDBBtn outline="success" rounded @click="router.push('/client-form')"><span class="btn__icon">🔍</span> {{ t('providerAdmin.lookingForService') }}</MDBBtn>
                </div>
                
                
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBCol>
    </MDBRow>

    <toast-handler 
      v-model="toastModel"
      :toast-name="toastState"
      :icon-state="toastIcon"
      :text="toastContent"
    />

    <!-- Simple toast -->
    <div class="toast-wrap" v-if="toast.show">
      <div class="toast-card shadow-sm border rounded p-3 bg-white">
        <div class="d-flex justify-content-between align-items-start gap-3">
          <div class="min-w-0">
            <div class="fw-semibold">{{ toast.title }}</div>
            <div class="small text-muted">{{ toast.message }}</div>
          </div>
          <button class="btn btn-sm btn-link p-0" @click="toast.show = false">✕</button>
        </div>
      </div>
    </div>
    
  </MDBContainer>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, reactive, ref, watch, nextTick } from "vue";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBBtn,
  MDBBtnClose,
  MDBInput,
  MDBTextarea,
  MDBTable,
  MDBBadge,
  MDBIcon,
  MDBModal,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
} from "mdb-vue-ui-kit";
import { useI18n } from "vue-i18n";
import { useRouter } from 'vue-router'
import logo from '@/assets/logo_trans_main-edited.png';
import Select from 'primevue/select';
import ProGallery from "./ProGallery.vue";
import professionList from '@/components/controllers/professions';
import AddressAutocomplete from "../AddressAutocomplete.vue";
import Stars from "../Stars.vue";
import { loadGoogleMaps } from "../controllers/loadGoogleMap";
import { storeToRefs } from "pinia";
import { useProStore } from "@/stores/providerStore";
import { useClientStore } from "@/stores/recipientStore";
import { useProArchiveStore } from "@/stores/pArchiveStore";
import { useProfessionStore } from "@/stores/professionStore";
import { useLoginStore } from "@/stores/login.js";
import map_image from '@/assets/map.gif'
import ToastHandler from "../helpers/ToastHandler.vue";
import Calendar from "../Calendar.vue";
//import ClientOffer from "./ClientOffer.vue";
import ClientOffersList from "./ClientOffersList.vue";
import NotificationStatusBanner from "../NotificationStatusBanner.vue";
import AdminMessage from "../AdminMessage.vue";
import providerService from '../../service/providers'
import socket from "@/socket";

const emit = defineEmits(["handle-user-action", "open-chat", "show-notification-help", "show-set-notifications"]);
const props = defineProps({
  isMobile: {type: Boolean},
  providerId: { type: [String, Number], required: true },
  notificationPermission: {
    type: String,
    default: ""
  },

  isAuthenticated: {
    type: Boolean,
    default: false
  }
});

const { t, locale } = useI18n();
const providerStore = useProStore();
const clientStore = useClientStore();
const providerArchiveStore = useProArchiveStore();
const professionStore = useProfessionStore();
const loginStore = useLoginStore();
const router = useRouter();
const { incomingOffers, proCalendarEvents, reference, proTimetable } = storeToRefs(providerStore);
const { isBookings } = storeToRefs(clientStore);
const { providerHistory } = storeToRefs(providerArchiveStore);
const { professionCategories, professions } = storeToRefs(professionStore);
const { token } = storeToRefs(loginStore);

const addressValid = ref(false);

const referenceToShow = computed(() => reference.value);

const appeared = ref("Asiakas")
const credit = computed(() => providerStore.proCredit);
const provider = computed(() => providerStore.provider);

const headerStackRef = ref(null);
const headerStackHeight = ref(0);
let resizeObserver = null;

const pro_map = map_image;

const profession = ref("");
//const professions = professionList;

const selectedProfession = ref(null);

//const reference = ref([]);

const addressEl = ref(null)
let autocomplete = null
let placeListener = null

const dirty = reactive({ provider: false });

const selectedPlace = ref(null);
const pmForm = reactive({
  address: "",
  lat: null,
  lng: null
})

const pmError = reactive({});

const mapError = ref(false);
const isMainPanel = ref(true);


// Local editable draft (always an object so inputs never crash)
const draftProvider = reactive(emptyProviderDraft());

const providerDirty = computed(() => dirty.provider);

const isPanelInfoEditSection = ref(false);

const isCalendar = ref(false);

//const field = ref("");

const clientOpen = ref(false);

const clientReport = ref('');

//const clients = ref([]);
const clientQuery = ref("");

// For observing head stack height
const updateHeaderStackHeight = () => {
  headerStackHeight.value =
    headerStackRef.value?.offsetHeight || 0;
};

const hasNotificationBanner = computed(() => {
  return (
    props.isAuthenticated &&
    props.notificationPermission &&
    props.notificationPermission !== "granted"
  );
});

const validateProAddress = () => {

  if (!pmForm.address) return;

  if (pmForm.lat === null || pmForm.lng === null) {
    return "Valitse osoite listasta (ei pelkkää kirjoitusta)";
  }

  return;
};

function onAddressInput(value) {
  pmForm.address = value;
  addressValid.value = false;

  selectedPlace.value = null;
  pmForm.lat = null;
  pmForm.lng = null;

  if (value.trim()) {
    pmError.address = t(
      "providerAdmin.addressAutocompleteError"
    );
  } else {
    pmError.address = "";
  }

  markDirty("provider");
}

function onPlaceSelected(place) {
  selectedPlace.value = place;

  pmForm.address = place.address;
  pmForm.lat = place.lat;
  pmForm.lng = place.lng;

  draftProvider.address = place.address;

  addressValid.value = true;
  pmError.address = "";

  markDirty("provider");
}

// Group professions by category and sort them
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

async function onProfessionPicked (val) {
  if (!val) return
  console.log("Profession picked:", val);
  const professionObj = professions.value.find(
    profession => profession.code === val
  );
  
  console.log("Profession object:", professionObj.name);

  const localizedProfessionName = getLocalizedValue(
    professionObj?.name
  );

  console.log("Localized profession name:", localizedProfessionName);

  const p = String(val).trim()
  if (!p) return

  // ensure array exists
  if (!Array.isArray(draftProvider.profession)) draftProvider.profession = []

  // avoid duplicates
  if (!draftProvider.profession.includes(p)) {
    draftProvider.profession.push(p)
    markDirty("provider")
  }

  await nextTick()
  selectedProfession.value = null
}


/* const selectedProfessionName = computed(() => {
  return getLocalizedValue(
    selectedProfession.value?.name
  );
}); */

// Get localized profession name by code
const localProfessionName = (code) => {
  const professionObj = professions.value.find(
    profession => profession.code === code
  );
  return getLocalizedValue(professionObj?.name) || code;
};

// Check if the address has changed from the original provider address
const addressChanged = computed(() => {
  return pmForm.address.trim() !== (provider.value?.address ?? "").trim();
});

// Determine if the provider can be saved based on various conditions
const canSaveProvider = computed(() => {
  if (busy.value) return false;
  if (!providerDirty.value) return false;

  // Kui aadressi pole muudetud, ei pea autocomplete'i uuesti valima
  if (!addressChanged.value) return true;

  // Muudetud aadress peab olema soovituste loendist valitud
  return addressValid.value;
});


/* watch(selectedPlace, (place) => {
  if (!place) return;

  if (!addressValid.value) {
    pmError.address = "Valitse osoite listasta (ei pelkkää kirjoitusta)";
    console.log("Address not valid, selectedPlace is invalid ❌");
    return;
  }
  pmForm.address = place.address;
  pmForm.lat = place.lat;
  pmForm.lng = place.lng;

  pmError.address = ""
}); */

// When store provider changes (loaded from DB / refreshed), copy to draft
watch(
  () => providerStore.provider,
  (p) => {
    const pro = p ?? null; // because providerStore.provider is a ref
    console.log("Pro ", pro)
    if (!pro) {
      Object.assign(draftProvider, emptyProviderDraft());
      providerDirty.value = false;
      return;
    }
    Object.assign(draftProvider, mapProviderToDraft(pro));
    pmForm.address = draftProvider.address;
    pmForm.lat = pro?.lat ?? null;
    pmForm.lng = pro?.lng ?? null;

    selectedPlace.value = null;
    addressValid.value = true;
    pmError.address = "";

    dirty.provider = false;
  },
  { immediate: true, deep: false }
);

watch(
  headerStackRef,
  async (el) => {
    resizeObserver?.disconnect();
    resizeObserver = null;

    if (!el) {
      headerStackHeight.value = 0;
      return;
    }

    await nextTick();

    updateHeaderStackHeight();

    resizeObserver = new ResizeObserver(() => {
      updateHeaderStackHeight();
    });

    resizeObserver.observe(el);
  },
  { flush: "post" }
);

const clients = computed(
  () => incomingOffers.value
)

const confirmedClients = computed(() => proCalendarEvents.value);



const handleToast = (payload) => {
  console.log("Toast payload - " + payload.state + " " + payload.message);
  onToast(payload.icon, payload.message, payload.color);

}

const tickerKey = ref(0);

function onClientReport(report) {
  clientReport.value = String(report);
  tickerKey.value++; // force restart animation
}

onMounted( async() => {
  socket.off("handle-client-report", onClientReport);
  socket.on("handle-client-report", onClientReport);

  
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});

const handleAvailability = async () => {
  console.log("Availability " + provider.value?.status);
  const status = provider.value?.status;
  let current = "";
  
  if (status === 'Saatavilla') {
    current = 'Sovittaessa'
  } else {
    current = "Saatavilla"
  }

  const statement = {
    status: current
  }

  await providerStore.updateStatus(statement);
}

// Available times, notes timestamp comparison
const activeTimesCount = computed(() => 
  proTimetable.value.filter(at => 
    at.state === 'time' &&
    new Date(at.end).getTime() > Date.now()
  ).length
)

const activeNotesCount = computed(() =>
  proTimetable.value.filter(an => 
    an.state === 'vacation' &&
    new Date(an.end).getTime() > Date.now()
  ).length
)


const showFeedback = () => {
  //router.push('/feedback');
  router.push({name: 'pro-feedback', params: {id: provider.value.id}})
}

/* const persistableImages = (arr) =>
  (arr || []).map(img => ({
    _id: img._id ?? img.imageId ?? null,
    imageUrl: img.imageUrl ?? null,
    key: img.key ?? null,
  })).filter(x => x._id || x.imageUrl);
 */
const openReferences = () => {
  router.push("/reference");
}

const seeClients = () => {
  console.log("Display clients on map.");
  router.push("/client-around");
}

function removeProfession(index) {
  // prevent removing the last one
  if (draftProvider.profession.length <= 1) return

  draftProvider.profession.splice(index, 1)
  markDirty("provider")
}

function normalizeProfessions(val) {
  // already correct
  if (Array.isArray(val)) {
    // if it's ["A, B"] -> split
    if (val.length === 1 && typeof val[0] === 'string' && val[0].includes(',')) {
      return val[0]
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    }
    // if it's ["A","B"] -> keep
    return val.map(v => String(v).trim()).filter(Boolean)
  }

  // string -> split by comma
  if (typeof val === 'string') {
    return val
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
  }

  // null/undefined -> empty
  return []
}

function resetProvider() {
  const pro = provider.value ?? null;

  Object.assign(
    draftProvider,
    pro ? mapProviderToDraft(pro) : emptyProviderDraft()
  );

  pmForm.address = draftProvider.address;
  pmForm.lat = pro?.lat ?? null;
  pmForm.lng = pro?.lng ?? null;

  selectedPlace.value = null;
  addressValid.value = true;
  pmError.address = "";

  dirty.provider = false;
}

async function saveProvider() {
  const pro = providerStore.provider ?? null;
  console.log("Provider - ", pro);
  if (!pro) return;

  onToast("fas fa-check fa-lg me-2", `${pro.pName} tiedot ovat päivitetty onnistuneesti!`, "success");
  busy.value = true;
  try {
    // Only send editable fields
    const payload = toPlain(draftProvider);

    payload.profession = normalizeProfessions(payload.profession)
    payload.updatedAt = new Date();
    
    // Save via store -> store updates provider.value with DB result
    const updatedMain = await providerStore.updateProviderPanel(pro.id, payload);

    if (updatedMain) {
      isPanelInfoEditSection.value = false;
    }

    // No need to manually update draft; watcher will sync when provider.value changes
    dirty.provider = false;
  } finally {
    busy.value = false;
  }
}


// ---- helpers ----
function emptyProviderDraft() {
  return {
    name: "",
    
    address: "",
    profession: [],
    status: "xx",
    
    notes: "",
    
  };
}

/* name: pro?.pName ?? "",
 email: pro?.email ?? "",
 phone: pro?.phone ?? "",
 timezone: pro?.timezone ?? "Europe/Helsinki",
 portalEnabled: !!pro?.portalEnabled,*/

// Creating provider object   profession: pro?.profession.join(', ') ?? "",
function mapProviderToDraft(pro) {
  return {
    name: pro?.pName ?? "",
    description: pro?.description ?? "",
    profession: normalizeProfessions(pro.profession),
    
    range: pro?.range ?? "",
    priceByHour: pro?.priceByHour ?? "",
    
    
    address: pro?.address ?? "",
    isAvailable24_7: pro?.isAvailable24_7 ?? "Active",
    
    notes: pro?.notes ?? "",
    status: pro?.status ?? ""
  };
}

function toPlain(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


/**
 * Props
 * - providerId: this page should be used only for the selected provider (e.g. route param)
 */

const providerId = computed(() => props.providerId);

// State
const busy = ref(false);

const providerx = reactive({
  id: "",
  name: "",
  email: "",
  phone: "",
  address: "",
  status: "Active",
  timezone: "Europe/Helsinki",
  notes: "",
  portalEnabled: true,
  updatedAt: null,
});

/* const draftProvider = reactive({
  name: "",
  email: "",
  phone: "",
  address: "",
  status: "Active",
  timezone: "Europe/Helsinki",
  notes: "",
  portalEnabled: true,
}); */



const upcomingAppointments = ref([]);
const alerts = ref([]);
const billing = reactive({ openInvoices: 0, nextPayout: null });



const clientModalOpen = ref(false);
const newClient = reactive({ name: "", email: "", status: "Active" });

const toast = reactive({ show: false, title: "", message: "" });
let toastTimer = null;

// Derived

const hasDirty = computed(() => providerDirty.value);

const toastModel = ref(false)
const toastState = ref('')
const toastIcon = ref('')
const toastContent = ref('')

const filteredClients = computed(() => {
  const q = clientQuery.value.trim().toLowerCase();
  if (!q) return clients.value;

  return clients.value.filter((c) => {
    const first = (c?.user?.firstName ?? "").toLowerCase();
    const last  = (c?.user?.lastName ?? "").toLowerCase();
    const status = (c?.status ?? "").toLowerCase();
    const email  = (c?.user?.email ?? c?.email ?? "").toLowerCase();

    return (
      first.includes(q) ||
      last.includes(q) ||
      email.includes(q) ||
      status.includes(q)
    );
  });
});



/* watchEffect(() => {
  console.log("first rendered item keys:", Object.keys(filteredClients.value?.[0] || {}))
}) */

// Lifecycle


// bootstrap();

// Actions
async function bootstrap() {
  busy.value = true;
  try {
    const [p, cs, appts, ts, b] = await Promise.all([
      apiGetProvider(providerId.value),
      apiGetClients(providerId.value),
      apiGetAppointments(providerId.value),
      apiGetAlerts(providerId.value),
      apiGetBilling(providerId.value),
    ]);

    //assignProvider(p);
    //assignDraftProvider(p);
    //clients.value = cs;
    upcomingAppointments.value = appts;
    alerts.value = ts;
    billing.openInvoices = b.openInvoices;
    billing.nextPayout = b.nextPayout;

    dirty.provider = false;
  } catch (e) {
    notify("Error", "Failed to load provider page.");
    // eslint-disable-next-line no-console
    console.error(e);
  } finally {
    busy.value = false;
  }
}

function refreshAll() {
  bootstrap();
}

function filterPositiveInteger(event, fieldName) {
  const raw = event.target.value;

  // Lubab ainult numbreid 0–9
  const filtered = raw.replace(/\D/g, "");

  event.target.value = filtered;
  draftProvider[fieldName] = filtered;

  markDirty("provider");
}

function filterPositiveDecimal(event, fieldName) {
  const raw = event.target.value;

  // Muudab koma punktiks
  let filtered = raw.replace(",", ".");

  // Eemaldab kõik peale numbrite ja punkti
  filtered = filtered.replace(/[^0-9.]/g, "");

  // Lubab ainult ühe punkti
  const parts = filtered.split(".");

  if (parts.length > 2) {
    filtered = `${parts[0]}.${parts.slice(1).join("")}`;
  }

  // ".5" -> "0.5"
  if (filtered.startsWith(".")) {
    filtered = `0${filtered}`;
  }

  // Maksimaalselt kaks komakohta
  if (filtered.includes(".")) {
    const [whole, decimal] = filtered.split(".");
    filtered = `${whole}.${decimal.slice(0, 2)}`;
  }

  event.target.value = filtered;
  draftProvider[fieldName] = filtered;

  markDirty("provider");
}

const filterInput___ = ref((event) => {
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
  field.value = filtered;

  markDirty('provider');
})

function markDirty(section) {
  if (section === "provider") dirty.provider = true;
}

async function saveAll() {
  if (providerDirty.value) await saveProvider();
  else notify("Nothing to save", "No changes detected.");
}

function openClientModal() {
  newClient.name = "";
  newClient.email = "";
  newClient.status = "Active";
  clientModalOpen.value = true;
}

async function createClient() {
  if (!newClient.name.trim()) {
    notify("Validation", "Client name is required.");
    return;
  }
  if (newClient.email && !isValidEmail(newClient.email)) {
    notify("Validation", "Please enter a valid email.");
    return;
  }

  busy.value = true;
  try {
    const created = await apiCreateClient(providerId.value, toPlain(newClient));
    clients.value = [created, ...clients.value];
    clientModalOpen.value = false;
    notify("Client added", `${created.name} linked to provider.`);
  } catch (e) {
    notify("Error", "Could not add client.");
    // eslint-disable-next-line no-console
    console.error(e);
  } finally {
    busy.value = false;
  }
}

function viewClient(c) {
  notify("Client", `Open client: ${c.user.firstName}`);
  onToast('fas fa-info-circle fa-lg me-2', `Asiakas ${c.user.firstName} tiedot`, "info");
  // Example:
  // router.push({ name: "ClientDetail", params: { clientId: c.id } })
}

function messageClient(c) {
  notify("Message", `Start message to: ${c.name}`);
}

async function unlinkClient(c) {
  const ok = window.confirm(`Unlink ${c.name} from this provider?`);
  if (!ok) return;

  busy.value = true;
  try {
    await apiUnlinkClient(providerId.value, c.id);
    clients.value = clients.value.filter((x) => x.id !== c.id);
    notify("Unlinked", `${c.name} removed from provider.`);
  } catch (e) {
    notify("Error", "Could not unlink client.");
    // eslint-disable-next-line no-console
    console.error(e);
  } finally {
    busy.value = false;
  }
}

function openSchedule() {
  //notify("Schedule", "Open schedule management (wire to your router).");
  isCalendar.value = true;
}

function openBilling() {
  notify("Billing", "Open billing page (wire to your router).");
}

/* function addAlert() {
  const id = `t_${Math.random().toString(16).slice(2)}`;
  alerts.value = [{ id, title: "New task", detail: "Follow up with provider about missing docs." }, ...alerts.value];
  notify("Added", "Task created.");
} */

function completeAlert(t) {
  alerts.value = alerts.value.filter((x) => x.id !== t.id);
  notify("Done", "Task completed.");
}

// Helpers
/* function assignProvider(p) {
  provider.id = p.id ?? providerId.value;
  provider.name = p.name ?? "";
  provider.email = p.email ?? "";
  provider.phone = p.phone ?? "";
  provider.address = p.address ?? "";
  provider.status = p.status ?? "Active";
  provider.timezone = p.timezone ?? "Europe/Helsinki";
  provider.notes = p.notes ?? "";
  provider.portalEnabled = !!p.portalEnabled;
  provider.updatedAt = p.updatedAt ?? null;
} */

/* function assignDraftProvider(p) {
  draftProvider.name = p.name ?? "";
  draftProvider.email = p.email ?? "";
  draftProvider.phone = p.phone ?? "";
  draftProvider.address = p.address ?? "";
  draftProvider.status = p.status ?? "Active";
  draftProvider.timezone = p.timezone ?? "Europe/Helsinki";
  draftProvider.notes = p.notes ?? "";
  draftProvider.portalEnabled = !!p.portalEnabled;
} */

/* function toPlain(obj) {
  return JSON.parse(JSON.stringify(obj));
} */

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);

  return d.toLocaleString("fi-FI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/* function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
} */


const onToast = (icon, content, color) => {
  console.log("Toast work?")
  toastModel.value = true;
  toastState.value = color;
  toastIcon.value = icon;
  toastContent.value = content;
  nextTick(() => {
    toastModel.value = true
  })
}

function notify(title, message) {
  toast.show = true;
  toast.title = title;
  toast.message = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.show = false), 3500);
}

async function apiUpdateProvider(id, payload) {
  await sleep(180);
  return { ...payload, id, updatedAt: new Date().toISOString() };
}

async function apiGetClients(providerId) {
  await sleep(120);
  return [
    { id: "c1", name: "Aino Korhonen", email: "aino@example.com", lastVisit: "2025-12-18T10:00:00.000Z", status: "Active" },
    { id: "c2", name: "Mika Laine", email: "mika@example.com", lastVisit: "2025-11-02T14:00:00.000Z", status: "Active" },
    { id: "c3", name: "Sara Niemi", email: "", lastVisit: null, status: "Inactive" },
  ].map((c) => ({ ...c, providerId }));
}

async function apiCreateClient(providerId, payload) {
  await sleep(180);
  return {
    id: `c_${Math.random().toString(16).slice(2)}`,
    name: payload.name,
    email: payload.email,
    status: payload.status,
    lastVisit: null,
    providerId,
  };
}

async function apiUnlinkClient() {
  await sleep(120);
  return true;
}

async function apiGetAppointments() {
  await sleep(120);
  return [
    { id: "a1", clientName: "Aino Korhonen", startAt: "2026-01-08T09:30:00.000Z", service: "Consultation", status: "Confirmed" },
    { id: "a2", clientName: "Mika Laine", startAt: "2026-01-10T12:00:00.000Z", service: "Follow-up", status: "Pending" },
  ];
}

async function apiGetAlerts() {
  await sleep(100);
  return [
    { id: "t1", title: "Missing insurance info", detail: "Client Sara Niemi has incomplete insurance fields." },
    { id: "t2", title: "Verify bank details", detail: "Bank payout details need re-validation." },
  ];
}

async function apiGetBilling() {
  await sleep(100);
  return { openInvoices: 2, nextPayout: "2026-01-15T00:00:00.000Z" };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
</script>

<style scoped>
.provider-admin {
  --admin-surface: #182231;
  --admin-surface-soft: rgba(255, 255, 255, 0.035);
  --admin-surface-hover: rgba(255, 255, 255, 0.06);
  --admin-border: rgba(255, 255, 255, 0.09);
  --admin-border-strong: rgba(255, 255, 255, 0.15);
  --admin-text: #f1f5f9;
  --admin-text-secondary: #a9b5c6;
  --admin-text-muted: #748196;
  --admin-accent: #38bdf8;
  --admin-accent-soft: rgba(56, 189, 248, 0.12);
  --admin-success: #34d399;
  --admin-success-soft: rgba(52, 211, 153, 0.12);
  --admin-warning: #fbbf24;
  --admin-warning-soft: rgba(251, 191, 36, 0.12);
  --admin-danger: #fb7185;
  --admin-danger-soft: rgba(251, 113, 133, 0.12);
  --admin-purple: #a78bfa;
  --admin-radius: 16px;
  --admin-shadow: 0 14px 34px rgba(0, 0, 0, 0.16);

  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding-bottom: 45px;
  color: var(--admin-text);
  text-align: left;
}

/* Fixed header */

.header-stack {
  position: fixed;
  top: 87px;
  left: 0;
  z-index: 1000;
  width: 100%;
  padding-bottom: 7px;
  border-bottom: 1px solid var(--admin-border);
  background: rgba(18, 27, 40, 0.92);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(14px);
  
  
}

.notifications-banner {
  width: 100%;
  margin: 0;
  padding: 0;
}

.banner-position {
  margin-top:
    calc(var(--header-stack-height) + 60px);
}

.page-content {
  padding-top: 12px;
}

.provider-topbar {
  display: flex;
  min-height: 64px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  max-width: 1240px;
  margin: 0 auto;
  padding: 10px 18px;
}

.provider-identity {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 11px;
}

.provider-avatar {
  display: inline-flex;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 12px;
  background: var(--admin-accent-soft);
  color: #7dd3fc;
  font-size: 0.95rem;
  font-weight: 750;
}

.provider-identity__content {
  min-width: 0;
}

.provider-name {
  overflow: hidden;
  margin: 0;
  color: var(--admin-text);
  font-size: 1rem;
  font-weight: 720;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.provider-updated {
  display: block;
  overflow: hidden;
  margin-top: 2px;
  color: var(--admin-text-muted);
  font-size: 0.67rem;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.availability-pill {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 7px;
  padding: 6px 10px;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  white-space: nowrap;
}

.availability-pill--available {
  border-color: rgba(52, 211, 153, 0.24);
  background: var(--admin-success-soft);
  color: #6ee7b7;
}

.availability-pill--agreement {
  border-color: rgba(251, 191, 36, 0.24);
  background: var(--admin-warning-soft);
  color: #fcd34d;
}

.availability-pill__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 7px currentColor;
}

/* Ticker */

.ticker {
  display: flex;
  height: 31px;
  align-items: center;
  overflow: hidden;
  border-top: 1px solid var(--admin-border);
  background: rgba(8, 14, 24, 0.72);
}

.ticker__row {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding-left: 18px;
  color: var(--admin-text-secondary);
  font-size: 0.7rem;
  white-space: nowrap;
  will-change: transform, opacity;
  animation: provider-ticker 12s linear forwards;
}

.ticker__icon {
  color: var(--admin-success);
  font-size: 0.5rem;
}

@keyframes provider-ticker {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }

  8% {
    opacity: 1;
  }

  90% {
    opacity: 1;
  }

  100% {
    transform: translateX(105vw);
    opacity: 0;
  }
}



/* Statistics */

.provider-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.provider-stat-card {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 112px;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  overflow: hidden;
  padding: 15px;
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius);
  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.025),
      transparent 48%
    ),
    var(--admin-surface);
  box-shadow: var(--admin-shadow);
  color: inherit;
  text-align: left;
}

button.provider-stat-card {
  width: 100%;
  font: inherit;
}

.provider-stat-card--interactive {
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.provider-stat-card--interactive:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: rgba(56, 189, 248, 0.3);
  background-color: #202c3d;
}

.provider-stat-card--interactive:disabled {
  cursor: default;
  opacity: 0.55;
}

.provider-stat-card--interactive:focus-visible,
.provider-stat-card__action:focus-visible,
.provider-stat-card__link:focus-visible,
.quick-action:focus-visible {
  outline: 2px solid var(--admin-accent);
  outline-offset: 2px;
}

.provider-stat-card__header {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 9px;
}

.provider-stat-card__icon {
  display: inline-flex;
  width: 35px;
  height: 35px;
  flex: 0 0 35px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 0.85rem;
}

.provider-stat-card__icon--availability {
  background: var(--admin-success-soft);
  color: #6ee7b7;
}

.provider-start-card__icon--warning {
  background: var(--admin-warning-soft);
  color: #fcd34d;
}

.provider-stat-card__icon--confirmed {
  background: var(--admin-accent-soft);
  color: #7dd3fc;
}

.provider-stat-card__icon--archive {
  background: rgba(167, 139, 250, 0.12);
  color: #c4b5fd;
}

.provider-stat-card__icon--credit {
  background: var(--admin-warning-soft);
  color: #fcd34d;
}

.provider-stat-card__label {
  color: var(--admin-text-secondary);
  font-size: 0.7rem;
  font-weight: 600;
  line-height: 1.35;
}

.provider-stat-card__value {
  color: var(--admin-text);
  font-size: 1.55rem;
  font-weight: 760;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.provider-stat-card__unit {
  color: var(--admin-text-muted);
  font-size: 0.67rem;
}

.provider-stat-card__action {
  width: 100%;
  min-height: 37px;
  padding: 8px 10px;
  border: 1px solid transparent;
  border-radius: 9px;
  font: inherit;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
}

.provider-stat-card__action--success {
  border-color: rgba(52, 211, 153, 0.28);
  background: var(--admin-success-soft);
  color: #6ee7b7;
}

.provider-stat-card__action--warning {
  border-color: rgba(251, 191, 36, 0.28);
  background: var(--admin-warning-soft);
  color: #fcd34d;
}

.provider-stat-card--credit::before {
  position: absolute;
  inset: 0;
  background-image: var(--watermark);
  background-position: right -15px bottom -20px;
  background-repeat: no-repeat;
  background-size: 105px;
  content: "";
  opacity: 0.07;
  pointer-events: none;
}

.provider-stat-card--credit > * {
  position: relative;
  z-index: 1;
}

.provider-stat-card__credit {
  color: var(--admin-text);
  font-size: 0.78rem;
  font-weight: 700;
}

.provider-stat-card__credit--expired {
  color: #fda4af;
}

.provider-stat-card__link {
  width: fit-content;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--admin-accent);
  font: inherit;
  font-size: 0.68rem;
  font-weight: 700;
  cursor: pointer;
}

/* Quick actions */

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 18px;
}

.quick-action {
  display: flex;
  min-width: 0;
  min-height: 68px;
  align-items: center;
  gap: 11px;
  padding: 12px 14px;
  border: 1px solid var(--admin-border);
  border-radius: 14px;
  background: var(--admin-surface);
  box-shadow: 0 9px 24px rgba(0, 0, 0, 0.12);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.quick-action:hover {
  transform: translateY(-2px);
  border-color: rgba(56, 189, 248, 0.26);
  background: #202c3d;
}

.quick-action__icon {
  display: inline-flex;
  width: 39px;
  height: 39px;
  flex: 0 0 39px;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background: var(--admin-accent-soft);
  color: #7dd3fc;
}

.quick-action__icon--rating {
  background: var(--admin-warning-soft);
  color: #fcd34d;
}

.quick-action__icon--clients {
  background: var(--admin-success-soft);
  color: #6ee7b7;
}

.quick-action__content {
  display: grid;
  min-width: 0;
  flex: 1;
  gap: 3px;
}

.quick-action__content strong {
  overflow: hidden;
  color: var(--admin-text);
  font-size: 0.76rem;
  font-weight: 700;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quick-action__content small {
  color: var(--admin-text-muted);
  font-size: 0.66rem;
}

.quick-action__arrow {
  color: var(--admin-text-muted);
  font-size: 0.66rem;
}

/* MDB cards */

.provider-admin :deep(.card) {
  overflow: hidden;
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius);
  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.02),
      transparent 45%
    ),
    var(--admin-surface);
  box-shadow: var(--admin-shadow);
  color: var(--admin-text);
}

.provider-admin :deep(.card-body) {
  padding: 18px;
}

.provider-admin :deep(.card-title),
.provider-admin :deep(h5),
.provider-admin :deep(h6) {
  color: var(--admin-text);
}

/* Provider information */

.info-panel {
  padding: 12px 0;
  border-bottom: 1px solid var(--admin-border);
  color: var(--admin-text-secondary) !important;
  font-size: 0.79rem;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.info-panel:last-child {
  border-bottom: 0;
}

.no-edit-panel,
.no-calendar {
  margin: 0;
  color: #fda4af;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
}

.no-edit-panel:hover,
.no-calendar:hover {
  color: var(--admin-danger);
}

/* Fieldsets */

.fs-box {
  min-inline-size: 0;
  padding: 14px;
  border: 1px solid var(--admin-border-strong);
  border-radius: 13px;
  background: var(--admin-surface-soft);
}

.fs-legend {
  float: none;
  width: auto;
  margin: 0 0 0 9px;
  padding: 0 8px;
  color: var(--admin-text-secondary);
  font-size: 0.69rem;
  font-weight: 650;
}

.edit-profession-panel {
  padding: 10px;
  border: 1px solid rgba(251, 191, 36, 0.25);
  border-radius: 11px;
  background: var(--admin-warning-soft);
}

/* Selects and inputs */

.provider-admin :deep(.form-select) {
  border-color: #334155;
  border-radius: 11px;
  background-color: #0f172a;
  color: #e5e7eb;
}

.provider-admin :deep(.form-select:focus) {
  border-color: var(--admin-accent);
  background-color: #0f172a;
  box-shadow: 0 0 0 0.18rem rgba(56, 189, 248, 0.18);
  color: #e5e7eb;
}

.provider-admin :deep(.form-select option) {
  background-color: #020617;
  color: #cbd5e1;
}

.provider-admin :deep(.form-control) {
  border-color: #334155;
  background-color: rgba(15, 23, 42, 0.8);
  color: var(--admin-text);
}

.provider-admin :deep(.form-control:focus) {
  border-color: var(--admin-accent);
  background-color: #0f172a;
  box-shadow: 0 0 0 0.18rem rgba(56, 189, 248, 0.18);
  color: var(--admin-text);
}

.search-wrap :deep(.form-outline) {
  min-width: 180px;
}

/* Orders */

.mobile-orders {
  width: 100%;
  margin: 0;
  padding: 0;
}

.order-section {
  overflow: hidden;
  width: 100%;
  margin-bottom: 14px;
  padding: 14px 0;
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius);
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow);
}

.orders-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 13px;
  margin-bottom: 13px;
}

.orders-search {
  width: 230px;
}

.min-w-0 {
  min-width: 0;
}

/* Calendar summary */

.provider-admin :deep(.table-sm) {
  margin: 0;
  color: var(--admin-text-secondary);
}

.provider-admin :deep(.table-sm th),
.provider-admin :deep(.table-sm td) {
  padding: 4px 7px;
  border: 0;
  font-size: 0.72rem;
}

.provider-admin :deep(.table-sm th) {
  color: var(--admin-text-muted);
  font-weight: 600;
}

/* Toast */

.toast-wrap {
  position: fixed;
  right: 12px;
  bottom: 12px;
  left: 12px;
  z-index: 1050;
  display: flex;
  justify-content: center;
}

.toast-card {
  width: min(520px, 100%);
  border: 1px solid var(--admin-border) !important;
  border-radius: 13px !important;
  background: #f8fafc !important;
  color: #172033;
}

/* Miscellaneous */

.client-card {
  border-radius: var(--admin-radius);
}

.proMap {
  width: 17px;
  cursor: pointer;
}

.pac-container {
  z-index: 99999 !important;
}

.btn__icon {
  font-size: 0.8rem;
  filter: drop-shadow(
    0 0 6px rgba(73, 210, 255, 0.45)
  );
}

/* Responsive */

@media (max-width: 1250px) {
  .extras-row > .extras-col {
    flex: 0 0 100%;
    max-width: 100%;
  }
}

@media (max-width: 900px) {
  .provider-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  

  .provider-topbar {
    min-height: 57px;
    padding: 8px 11px;
  }

  .provider-avatar {
    width: 34px;
    height: 34px;
    flex-basis: 34px;
    border-radius: 9px;
    font-size: 0.8rem;
  }

  .provider-name {
    max-width: 47vw;
    font-size: 0.84rem;
  }

  .provider-updated {
    max-width: 47vw;
    font-size: 0.59rem;
  }

  .availability-pill {
    gap: 5px;
    padding: 5px 8px;
    font-size: 0.61rem;
  }

  .ticker {
    height: 27px;
  }

  .ticker__row {
    padding-left: 11px;
    font-size: 0.62rem;
  }

  .notifications-banner {
    padding: 6px 0;
  }

  .banner-position {
  margin-top:
    calc(var(--header-stack-height, 0) + 50px);
}


  .page-content {
    padding-top: 8px;
    
  }
  .provider-stats {
    gap: 8px;
  }

  .provider-stat-card {
    min-height: 94px;
    gap: 8px;
    padding: 11px;
    border-radius: 13px;
  }

  .provider-stat-card__icon {
    width: 30px;
    height: 30px;
    flex-basis: 30px;
    border-radius: 8px;
    font-size: 0.72rem;
  }

  .provider-stat-card__label {
    font-size: 0.61rem;
  }

  .provider-stat-card__value {
    font-size: 1.2rem;
  }

  .provider-stat-card__action {
    min-height: 32px;
    padding: 6px 7px;
    font-size: 0.62rem;
  }

  .quick-actions {
    gap: 8px;
  }

  .quick-action {
    min-height: 60px;
    gap: 8px;
    padding: 9px;
    border-radius: 12px;
  }

  .quick-action__icon {
    width: 32px;
    height: 32px;
    flex-basis: 32px;
    border-radius: 9px;
    font-size: 0.77rem;
  }

  .quick-action__content strong {
    font-size: 0.65rem;
  }

  .quick-action__content small {
    font-size: 0.57rem;
  }

  .quick-action__arrow {
    display: none;
  }

  .orders-header {
    align-items: stretch;
    flex-direction: column;
  }

  .orders-search {
    width: 100%;
  }

  .provider-admin :deep(.card-body) {
    padding: 14px;
  }
}

@media (max-width: 500px) {
  .provider-admin {
    padding-right: 8px;
    padding-left: 8px;
  }

  .provider-stat-card--credit {
    background-size: auto;
  }

  .notifications-banner {
    padding: 6px 0;
  }

  .banner-position {
  margin-top:
    calc(var(--header-stack-height) + 47px);
}


  .page-content {
    padding-top: 8px;
    
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .quick-action {
    min-height: 55px;
  }

  .map-client-text {
    display: none;
  }

  .btn-desc {
    font-size: 0.62rem;
  }
}

@media (max-width: 380px) {
  .provider-name,
  .provider-updated {
    max-width: 40vw;
  }

  .availability-pill {
    padding: 5px 6px;
  }

  .notifications-banner {
    padding: 6px 0;
  }


  .page-content {
    padding-top: 8px;
    
  }

  .availability-pill__dot {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ticker__row {
    animation: none;
  }

  .quick-action,
  .provider-stat-card--interactive {
    transition: none;
  }
}
</style>
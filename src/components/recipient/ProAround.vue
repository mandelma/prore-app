<template>
 
  <div>
    
    <div  style="position: relative; z-index: 1; opacity: 0.8; border-radius: 10px;">
      
      <div
        v-show="isMainPanel"
        class="client-map-panel"
      >
        <!-- Paneeli päis -->
        <div class="map-panel-header">
          <div class="map-panel-heading">
            <div class="map-panel-heading__icon">
              <i class="fa-solid fa-magnifying-glass-location" />
            </div>

            <div>
              <h2 class="map-panel-title">
                {{ t("proAround.searchTitle") }}
              </h2>

              <p class="map-panel-subtitle">
                {{ t("proAround.searchHelp") }}
              </p>
            </div>
          </div>

          <div class="map-panel-actions">
            <button
              type="button"
              class="map-panel-icon-button"
              :title="t('proAround.refresh')"
              @click="refreshMapState"
            >
              <i class="fa-solid fa-rotate-right" />
            </button>

            <button
              type="button"
              class="map-panel-icon-button"
              :title="t('proAround.collapsePanel')"
              @click="isMainPanel = false"
            >
              <i class="fa-solid fa-expand" />
            </button>

            <button
              type="button"
              class="map-panel-icon-button map-panel-icon-button--close"
              :title="t('proAround.close')"
              @click="$router.go(-1)"
            >
              <i class="fa-solid fa-xmark" />
            </button>
          </div>
        </div>

        <!-- Aadress -->
        <div class="map-panel-field">
          <label class="map-panel-label">
            {{ t("proAround.addressLabel") }}

            <span class="map-panel-required">*</span>
          </label>

          <div
            :class="{
              hideClientInput: !address && isAddress
            }"
          >
            <AddressAutocomplete
              v-model="address"
              v-model:valid="addressValid"
              :label="t('proAround.addressLabel')"
              :error="addressError"
              @typing="onAddressInput"
              @place="onPlaceSelected"
            />
          </div>
        </div>

        <!-- Amet -->
        <div class="map-panel-field">
          <label class="map-panel-label">
            {{ t("proAround.professionalPlaceholder") }}

            <span class="map-panel-required">*</span>
          </label>

          <SelectProfession
            v-model="profession"
            :label="t('proAround.professionalPlaceholder')"
            :errors="{
              profession: panelProError
                ? t('proAround.professionRequired')
                : ''
            }"
            @change="changedProfession"
          />
        </div>

        <!-- Aeg -->
        <div
          v-show="isDistSelection"
          class="map-panel-field map-panel-time"
        >
          <div class="map-panel-field-header">
            <div>
              <label class="map-panel-label">
                {{ t("proAround.selectDateOrNow") }}
              </label>

              <small class="map-panel-field-help">
                {{ t("proAround.dateTimeHelp") }}
              </small>
            </div>

            <label class="map-now-toggle">
              <input
                v-model="isDateNow"
                type="checkbox"
                class="map-now-toggle__input"
                @change="removeDateIfExist"
              />

              <span class="map-now-toggle__control">
                <i class="fa-solid fa-check" />
              </span>

              <span class="map-now-toggle__label">
                {{ t("proAround.now") }}
              </span>
            </label>
          </div>

          <MDBDateTimepicker
            v-if="!isDateNow"
            v-model="dt"
            size="md"
            :label="t('proAround.dateTimeLabel')"
            :toggle-button="false"
            input-toggle
            :datepicker="{ ...L }"
            :timepicker="{ ...L, hoursFormat: 24 }"
            :key="reInitKey"
            disable-past
            class="map-datetime-picker"
          />
        </div>

        <!-- Otsinguraadius -->
        <div class="map-panel-field">
          <label class="map-panel-label">
            {{ t("proAround.searchArea") }}

            <span class="map-panel-required">*</span>
          </label>

          <MDBSelect
            id="distance"
            v-model:selected="selectedRange"
            :options="rangeOptions"
            :label="t('proAround.searchArea')"
            size="md"
            class="map-range-select"
          />

          <small
            v-if="panelRangeError"
            class="map-panel-error"
          >
            <i class="fa-solid fa-circle-exclamation" />

            {{ t("proAround.distanceRequired") }}
          </small>
        </div>

        <!-- Tulemus puudub -->
        <div
          v-if="
            countOfSelectedProfessional === 0 &&
            clickedPanelGet
          "
          class="map-panel-empty"
        >
          <i class="fa-solid fa-location-dot" />

          <span>
            {{ t("proAround.noProfessionals") }}
          </span>
        </div>

        <!-- Footer -->
        <div class="map-panel-footer">
          <button
            type="button"
            class="map-panel-reset"
            @click="refreshMapState"
          >
            <i class="fa-solid fa-arrow-rotate-left" />

            {{ t("proAround.refresh") }}
          </button>

          <MDBBtn
            color="primary"
            class="map-panel-search-button"
            @click="onGetProviders"
          >
            <i class="fa-solid fa-magnifying-glass" />

            {{ t("proAround.search") }}
          </MDBBtn>
        </div>
      </div>




      <!--Displaying when no main panel open-->
      <MDBBtn
        v-show="!isMainPanel"
        color="dark"
        style="position: absolute; opacity: 0.8; top: 60px; left: 10px; z-index: 2;"
        @click="isMainPanel = true"
      >
        {{ t("proAround.selection") }}
      </MDBBtn>
      
    </div>
    

    <div style="padding: 13px 0 20px 0;">
        <MDBToast
            v-model="isRequestSent"
            autohide
            :delay="3000"
            :stacking="false"
            position="top-center"
            toast="success"
            icon="fas fa-check fa-lg me-2"
        >
          <template #title>{{ t("proAround.requestSent") }}</template>
          <button type="button" style="visibility: hidden;" class="btn-close ms-auto" aria-label="Close" @click="hideError"></button>
          <template #small></template>
          <p>{{ rs_success_msg }}</p>
        </MDBToast>
      </div>

    <div>
      <MDBModal
        tabindex="-1"
        centered
        v-model="displayProPanel"
      >
        <MDBModalHeader class="modal-header-custom">
          <div style="display: flex; justify-content:space-between; align-items: center; gap: 23px;">
            <MDBIcon v-if="!onProvider?.user?.avatar?.isImage"  icon="user" class="icon" />
            <img
              v-else
              :src="onProvider?.user?.avatar?.imageUrl"
              class="rounded-circle"
              height="53"
              alt=""
              loading="lazy"
            />
            <h2>{{ onProvider.pName }}</h2>
          </div>
        </MDBModalHeader>
        <MDBModalBody>
          <request-form  
            v-if="target?.id !== providerId"
            :target="target" 
            :date="dt" 
            @open-chat="$emit('open-chat', $event)"
            @sendRequest="handleSendRequest"
          />
        </MDBModalBody>
        <!-- <MDBModalFooter>
          <MDBBtn color="primary" @click="sendRequest(onProvider)">Tilaa yritys</MDBBtn>
          <button @click="testToast">Show toast</button>
        </MDBModalFooter> -->
      </MDBModal>
    </div>
    
  </div>
  
  <div id="map-container">
    <div
      v-if="!isMapLoaded && !locationFailed"
      class="spinner-overlay"
    >
      <div class="spinner"></div>
    </div>

    <div
      v-else-if="locationFailed"
      class="spinner-overlay"
    >
      <div class="location-error-box">
        {{ t("proAround.locationFetchFailed") }}
      </div>
    </div>

    <div
      id="map"
      :class="{ 'map-ready': isMapLoaded }"
    ></div>
  </div>
</template>

<script setup>
// const props = defineProps({
//   lat: { type: Number, required: true },
//   lng: { type: Number, required: true },
// });
import {MDBIcon, MDBBtnClose, MDBInput, MDBBtn, MDBCheckbox, MDBSelect, MDBSpinner, MDBDateTimepicker, MDBModal, MDBModalHeader, MDBModalBody, MDBModalFooter, MDBToast} from 'mdb-vue-ui-kit';
import { ref, onMounted, watch, computed, createApp, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import Select from 'primevue/select';
import proList from '@/components/controllers/professions'
//import { Loader } from "@googlemaps/js-api-loader"; // official way
import axios from 'axios';
import { storeToRefs } from 'pinia';
import { getFormatted } from '../helpers/formatDatepicker.js';
import {loadGoogleMaps} from "@/components/controllers/loadGoogleMap.js";
import providerService from '@/service/providers'
import match from '@/components/controllers/compare_dt'
import { useMapStore } from '@/stores/mapStore';
import { useClientStore } from '@/stores/recipientStore';
import { useLoginStore } from '@/stores/login';
import { useProStore } from '@/stores/providerStore';
import { useConversationStore } from '@/stores/conversationStore';
import { useProfessionStore } from '@/stores/professionStore';
import ToastHandler from '../helpers/ToastHandler.vue';
import RequestForm from './RequestForm.vue';
import AddressAutocomplete from '../AddressAutocomplete.vue';
import SelectProfession from '../helpers/SelectProfession.vue';


import { getChatWindowGeometry, getBottomRightAnchor } from '../helpers/chatGeometry.js';

import Stars from '../Stars.vue';
import ProReferencePublic from './ProReferencePublic.vue';
import socket from '@/socket';

//import { useMapStore } from '@/stores/mapStore';
//const location = useMapStore();
defineOptions({
  name: "pro-around"
})

const emit = defineEmits([ 'open-chat' ]);
const { t, locale } = useI18n();
const mapStore = useMapStore();
const convoStore = useConversationStore();
const professionStore = useProfessionStore();
const { userPos, lastKnownPos, mapsReady, isLocating, locationError } = storeToRefs(mapStore);
const { otherChatUsers } = storeToRefs(convoStore);
const { professionCategories, professions } = storeToRefs(professionStore);

const address = ref("");
const selectedPlaceId = ref(null)
const selectedAddressComponents = ref([])
const myLat = ref( null);
const myLng = ref(null);
const mapsError = ref(false);
//const professions = proList;
const profession = ref("");
const isAddress = ref(false);
const isMapLoaded = ref(false);
const currentProfession = ref("");
const isDistSelection = ref(false);
const selectedRange = ref(null);
const distBtw = ref(0);
const stateActive = ref(false);
const isMainPanel = ref(true);
const countOfSelectedProfessional = ref(0);
const reInitKey = ref(0);
const dt = ref(null);
const showDt = ref(null);
const target = ref(null);
const handleMatch = match;
const visibleProCount = ref(0);
const isDateNow = ref(false);
const displayProPanel = ref(false);

const clickedPanelGet = ref(false);

const onProvider = ref(null);
const isRequestSent = ref(false);
const rs_success_msg = ref("");
const rs_error_msg = ref("");

const panelProError = ref(false);
const panelRangeError = ref(false);

const addressValid = ref(false);
const selectedPlace = ref(null);
const addressError = ref("");

const clientStore = useClientStore();
const auth = useLoginStore();
const providerStore = useProStore();

const { user } = storeToRefs(auth);
const { providerId } = storeToRefs(providerStore);


/* const toastModel = ref(false)
const toastState = ref('')
const toastIcon = ref('')
const toastContent = ref('') */

function testToast() {
  toastState.value = 'danger'
  toastIcon.value = 'fas fa-check fa-lg me-2'
  toastContent.value = 'Hallo Helsinki'
  toastModel.value = true
}

const rangeOptions = ref([
  {text: '0 km', value: 0},
  {text: '1 km', value: 1},
  {text: '10 km', value: 10},
  {text: '20 km', value: 20},
  {text: '30 km', value: 30},
  {text: '40 km', value: 40},
  {text: '50 km', value: 50},
  {text: '60 km', value: 60},
  {text: '70 km', value: 70},
  {text: '80 km', value: 80},
  {text: '90 km', value: 90},
  {text: '100 km', value: 100},
  {text: '200 km', value: 200},
  {text: '300 km', value: 300},
])

// Date formatting for datepicker
  const L = computed(() => {
    return getFormatted(locale.value)
  })

const isMapReady = ref(false);
const geocoder = ref(null)
let map = null;
let userMarker = null;
let providerMarkers = [];
let infoWindow = null;

//const isLocating = ref(true)
const locationFailed = ref(false)

let lastMapState = {
  zoom: null,
  center: null,
};

const startPos = computed(() => userPos.value || lastKnownPos.value)

watch(selectedRange, (newVal) => {
  console.log("Dist is changed ", newVal);

})


const initMap = (lat, lng) => {
  if (map) return map;

  const el = document.getElementById("map");

  if (!el) {
    throw new Error("Map container not found");
  }

  isMapLoaded.value = false;

  map = new google.maps.Map(el, {
    center: { lat, lng },
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapId: "DEMO_MAP_ID",
  });

  infoWindow = new google.maps.InfoWindow();

  google.maps.event.addListenerOnce(
    map,
    "idle",
    () => {
      isMapLoaded.value = true;
    }
  );

  return map;
};

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

    address.value = result.formatted_address
    // save these if you need them
    selectedPlaceId.value = result.place_id
    selectedAddressComponents.value = result.address_components

    return result
  } catch (err) {
    console.error("Reverse geocoding failed:", err)
    return null
  }
}

const initAutocomplete = async () => {
  await nextTick();

  const input = document.getElementById("client-input")
  if (!input) return;

  const center = userPos.value || lastKnownPos.value || { lat: 60.1699, lng: 24.9384 };
  // centerMap()
  const defaultBounds = {
    north: center.lat + 0.1,
    south: center.lat - 0.1,
    east: center.lng + 0.1,
    west: center.lng - 0.1,
  };
  const options = {
    bounds: defaultBounds,
    componentRestrictions: { country: "fi" },
    fields: ["address_components", "geometry", "icon", "name", "place_id", "formatted_address"],
    strictBounds: false,
  };
  const autocomplete = new google.maps.places.Autocomplete(input, options)
  
  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace()

    if (!place.geometry) {
      console.log("Place has no geometry")
      return
    }

    myLat.value = place.geometry.location.lat()
    myLng.value = place.geometry.location.lng()

    address.value = place.formatted_address || "";
    showUserMarker(myLat.value, myLng.value);
      map.setCenter({
      lat: myLat.value,
      lng: myLng.value
    });
    selectedPlaceId.value = place.place_id || null
    selectedAddressComponents.value = place.address_components || []

    console.log("Address:", address.value)
    console.log("Lat:", myLat.value)

    
  })
}

watch(isMainPanel, (val) => {
  if(!val) {
    panelProError.value = false;
    panelRangeError.value = false;
  }
})

watch(isDateNow, (state) => {
  if (state) {
    dt.value = toPickerString(new Date());
    reInitKey.value++;
    const dateNow = new Date();
    const formatted = dateNow.toLocaleString("fi-FI", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // Convert "2025-11-12, 18:37" → "2025-11-12, 18:37"
    const final = formatted.replace(",", "");
    showDt.value = final;
  } else {
    dt.value = null;
    showDt.value = null;
    reInitKey.value++;
  }
})

// About address autocomplite
watch([() => address.value, () => myLat.value, () => myLng.value], () => {
  if (address.value && (myLat.value === null || myLng.value === null)) {
    addressError.value = t('recipientForm.addressAutocompleteError');
  } else {
    addressError.value = "";
  }
});

const validateAddress = () => {

  if (!address.value) return;

  if (myLat.value === null || myLng.value === null) {
    console.log("Address is not valid, lat/lng missing");
    addressError.value = "Valitse osoite listasta (ei pelkkää kirjoitusta)";
    return "Valitse osoite listasta (ei pelkkää kirjoitusta)";
  }

  return;
};

const onAddressInput = (value) => {
  address.value = value;

  selectedPlace.value = null;
  myLat.value = null;
  myLng.value = null;

  console.log(
    "Address input changed:",
    value,
    "lat:",
    myLat.value,
    "lng:",
    myLng.value
  );

  if (value.trim()) {
    validateAddress();
    addressError.value =
      t("recipientForm.addressAutocompleteError");
    
  } else {
    addressError.value = "";
  }
};

function onPlaceSelected(place) {
  selectedPlace.value = place;
  console.log("Place selected:", place);
  address.value = place.address;
  myLat.value = place.lat;
  myLng.value = place.lng;


  addressError.value = "";

}


onMounted(async () => {
  try {
    locationFailed.value = false;
    isMapLoaded.value = false;
    addressValid.value = false;

    const initPromise = mapStore.init();

    await nextTick();

    const pos =
      userPos.value ||
      lastKnownPos.value;

    if (pos) {
      myLat.value = pos.lat;
      myLng.value = pos.lng;

      initMap(pos.lat, pos.lng);
      showUserMarker(pos.lat, pos.lng);

      const result = await getAddressFromCoords(
        pos.lat,
        pos.lng
      );

      addressValid.value = Boolean(result);

      await initAutocomplete();
    }

    await initPromise;

    const freshPos =
      userPos.value ||
      lastKnownPos.value;

    if (freshPos && !map) {
      myLat.value = freshPos.lat;
      myLng.value = freshPos.lng;

      initMap(freshPos.lat, freshPos.lng);
      showUserMarker(freshPos.lat, freshPos.lng);

      const result = await getAddressFromCoords(
        freshPos.lat,
        freshPos.lng
      );

      addressValid.value = Boolean(result);

      await initAutocomplete();
    }

    if (!freshPos && !pos) {
      locationFailed.value = true;
      addressValid.value = false;
    }
  } catch (err) {
    console.error("Map init failed:", err);

    locationFailed.value = true;
    isMapLoaded.value = false;
    addressValid.value = false;
  }
});

function applyUserPosition() {
  if (!userPos.value) return
  if (!map) return

  myLat.value = userPos.value.lat
  myLng.value = userPos.value.lng

  centerMap(userPos.value.lat, userPos.value.lng)
  showUserMarker(userPos.value.lat, userPos.value.lng)
}

watch(
  userPos,
  (pos) => {
    if (!pos) return

    myLat.value = pos.lat
    myLng.value = pos.lng

    if (!map) return

    centerMap(pos.lat, pos.lng)
    showUserMarker(pos.lat, pos.lng)
  },
  { immediate: true }
)


const hasProfession = computed(() => {
  if (!profession.value) return false;

  // PrimeVue object case
  if (typeof profession.value === "object")
    return !!profession.value.label;

  // string case
  if (typeof profession.value === "string")
    return profession.value.trim() !== "";

  return false;
});

/* watch(hasProfession, (ok) => {
  if (!ok) {
    selectedRange.value = 0;
    profession.value = null;
    showClientLocationOnTheMap(profession.value?.label, selectedRange.value);
    
  }
}); */

watch(() => profession.value, (newVal) => {
  if (newVal) {
    console.log("New profession is null or empty " + newVal);
  } else {
    console.log("Profession is null or empty " + newVal);
    //selectedRange.value = 0;
    //showClientLocationOnTheMap(profession.value?.label, selectedRange.value);
  }
});

const changedProfession = () => {
      console.log("Changed " + profession.value);
      //this.showClientLocationOnTheMap(this.prof.label, this.distBtw);
      currentProfession.value = profession.value;
      isDistSelection.value = true;
}


function toPickerString(d = new Date()) {
  const pad = n => String(n).padStart(2, '0')
  const y = d.getFullYear()
  const m = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  const hh = pad(d.getHours())
  const mm = pad(d.getMinutes())
  return `${y}-${m}-${day}, ${hh}:${mm}`
}

// Search providers button click handler
const onGetProviders = () => {
  clickedPanelGet.value = false;
  panelProError.value = false;
  panelRangeError.value = false;
  let errors = false;
  if (!profession.value) {
    panelProError.value = true;
    errors = true;
    console.log("Get providers " + profession.value);
    console.log("Sel range " + selectedRange.value);
  };

  if (selectedRange.value === 0) {
    errors = true;
    panelRangeError.value = true;
    showClientLocationOnTheMap(profession.value, selectedRange.value);
  }

  if (!addressValid.value) {
    errors = true;
    addressError.value = t('recipientForm.addressAutocompleteError');
  }

 

  if (!errors) {
    clickedPanelGet.value = true;
    
    showClientLocationOnTheMap(profession.value, selectedRange.value);
    updateMapDistance(map, {lat: myLat.value, lng: myLng.value}, selectedRange.value);
  }
  
  
   
}

const centerMap = (lat, lng, zoom = 13) => {
  if (!map) return;
  map.setCenter({ lat, lng });
  map.setZoom(zoom);
};

const showUserMarker = (lat, lng) => {
  if (!map) return;

  if (!userMarker) {
    userMarker = new google.maps.Marker({
      position: { lat, lng },
      map,
      title: t("proAround.yourLocation"),
      icon: circleMarker('darkgrey')
    });
  } else {
    userMarker.setPosition({ lat, lng });
  }
};

let radiusCircle = null;

const updateMapDistance = (map, clientLatLng, selectedKm) => {
  //const clientLatLng = { lat: 60.1699, lng: 24.9384 }
  if (radiusCircle) {
    radiusCircle.setMap(null);
  }

  radiusCircle = new google.maps.Circle({
    map,
    center: clientLatLng,
    radius: selectedKm * 1000,
    strokeColor: "#2E7D32",
    strokeOpacity: 0.9,
    strokeWeight: 2,
    fillColor: "#2E7D32",
    fillOpacity: 0.12
  });

  map.fitBounds(radiusCircle.getBounds());
}

const providerIcon = (provider) => {

  if (provider.status === "Saatavilla") {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: "green",
      fillOpacity: 1,
      strokeColor: "#003300",
      strokeWeight: 2,
      scale: 10
    };
  }

  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: "orange",
    fillOpacity: 1,
    strokeColor: "#663300",
    strokeWeight: 2,
    scale: 10
  };
}

function providerMarkerContent(provider) {
  const root = document.createElement("div");
  root.className = "provider-marker";

  const avatar = document.createElement("div");
  avatar.className = "provider-marker__avatar";

  if (provider?.user?.avatar?.isImage && provider?.user?.avatar?.imageUrl) {
    avatar.style.backgroundImage = `url("${provider.user.avatar.imageUrl}")`;
    avatar.style.backgroundSize = "cover";
    avatar.style.backgroundPosition = "center";
    avatar.style.backgroundRepeat = "no-repeat";
  } else {
    avatar.innerHTML = `<i class="fas fa-user"></i>`;
    avatar.classList.add("provider-marker__avatar--fallback");
  }

  const badge = document.createElement("div");
  badge.className = "provider-marker__badge";
  badge.classList.add(
    provider.status === "Saatavilla" || provider.isAvailable24_7
      ? "provider-marker__badge--available"
      : "provider-marker__badge--negotiable"
  );

  root.appendChild(avatar);
  root.appendChild(badge);

  return root;
}

function providerMarkerContent_test(provider) {
  const el = document.createElement("div");
  el.style.width = "32px";
  el.style.height = "32px";
  el.style.borderRadius = "50%";
  el.style.background = "red";
  el.style.border = "2px solid white";
  return el;
}

const clearProviderMarkers = () => {
  providerMarkers.forEach(marker => {
    marker.map = null;
  });
  providerMarkers = [];
};

// If coords are same
const getOffsetPosition = (lat, lng, index, total) => {
  if (total <= 1) {
    return { lat, lng };
  }

  const radius = 0.00025; // umbes 20–30 m
  const angle = (2 * Math.PI * index) / total;

  return {
    lat: lat + radius * Math.cos(angle),
    lng: lng + radius * Math.sin(angle),
  };
};

const addProviderMarker_prev = (provider) => {
  if (!map) return null;

  const lat = Number(provider.latitude);
  const lng = Number(provider.longitude);


  console.log(
    "ADDING MARKER:",
    provider.pName,
    "lat:", lat,
    "lng:", lng
  );


  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    console.log("Invalid provider coordinates", provider);
    return null;
  }

  const marker = new google.maps.marker.AdvancedMarkerElement({
    map,
    position: { lat, lng },
    title: provider.pName,
    content: providerMarkerContent(provider),
  });

  providerMarkers.push(marker);
  return marker;
};

const addProviderMarker = (provider) => {
  if (!map) return null;

  const lat = Number(provider.latitude);
  const lng = Number(provider.longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    console.log("Invalid provider coordinates", provider);
    return null;
  }

  const sameLocationProviders = providers.filter(
    p =>
      Number(p.latitude) === lat &&
      Number(p.longitude) === lng
  );

  const index = sameLocationProviders.findIndex(
    p => p.id === provider.id
  );

  const position = getOffsetPosition(
    lat,
    lng,
    index,
    sameLocationProviders.length
  );

  const marker = new google.maps.marker.AdvancedMarkerElement({
    map,
    position,
    title: provider.pName,
    content: providerMarkerContent(provider),
  });

  providerMarkers.push(marker);

  return marker;
};





const saveMapState = () => {
  if (!map) return;

  lastMapState.zoom = map.getZoom();
  lastMapState.center = {
    lat: map.getCenter().lat(),
    lng: map.getCenter().lng(),
  };

  console.log("Saved map state:", lastMapState);
};

const restoreMapState = () => {
  if (!map || !lastMapState.zoom || !lastMapState.center) return;

  map.setZoom(lastMapState.zoom);
  map.setCenter(lastMapState.center);
};

const notifyProvidersAboutInterest = (provider, profession, pcDist) => {
  console.log("Message to " + provider.user.firstName + " and dist: " + pcDist);
  const userId = provider.user.id;

  socket.emit('client-report', userId, profession, pcDist);
}

const distanceBtw = (originLat, originLng, destLat, destLng) => {
  var origin = new google.maps.LatLng(originLat, originLng);
  var destination = new google.maps.LatLng(destLat, destLng);
  return (google.maps.geometry.spherical.computeDistanceBetween(origin, destination) / 1000).toFixed(2);
}

const otherUserLocations = async (providers, profession, dist) => {
  //const client = new Client({});

  
  if (!window.google || !window.google.maps) {
    console.error('Google Maps not loaded yet')
    return
  }
  console.log("Profession and dist... " + profession + " " + dist)
  console.log("lat - " + myLat.value)

  if (!window.google || !window.google.maps) return
  if (!map) return
  if (myLat.value == null || myLng.value == null) return

  
  clearProviderMarkers()

  console.log("Users count: " + providers.length)
  console.log("Current distance " + dist)
  let date;
  if (dt.value) {
    console.log("Booking date 2 " + new Date(dt.value));
    date = new Date(dt.value);
  }

  let count = 0;

  if (providers.length > 0) {

    const infowindow = new google.maps.InfoWindow({
      pixelOffset: new google.maps.Size(0, -10)
    });

    let starsApp = null;
    let referenceApp = null;
    let currentProvider = null;
    let currentProviderIndex = null;
    let currentMatching = false;
    let isOpenReferences = false;
    let currentMarker = null;

    infowindow.addListener("domready", () => {
      const mountEl = document.getElementById("stars-mount");
      const mountRefEl = document.getElementById("reference-mount");

      // unmount old Vue apps first
      if (starsApp) {
        starsApp.unmount();
        starsApp = null;
      }

      if (referenceApp) {
        referenceApp.unmount();
        referenceApp = null;
      }

      // mount stars
      if (mountEl && currentProvider) {
        starsApp = createApp(Stars, {
          rating: currentProvider.rating
        });
        starsApp.mount(mountEl);
      }

      // mount references
      if (mountRefEl && currentProvider !== null && isOpenReferences) {
        referenceApp = createApp(ProReferencePublic, {
          references: currentProvider.reference
        });
        referenceApp.mount(mountRefEl);
      }

      document.getElementById("custom-close")?.addEventListener(
        "click",
        () => {
          starsApp?.unmount();
          starsApp = null;

          referenceApp?.unmount();
          referenceApp = null;

          //isMainPanel.value = true;
          infowindow.close();
        },
        { once: true }
      );

      const defaultClose = document.querySelector(".gm-ui-hover-effect");
      if (defaultClose) defaultClose.style.display = "none";

      const iw = document.getElementById("custom-iw");
      const closeBtn = document.getElementById("custom-close");
      if (!iw) return;

      iw.classList.remove("iw-close");
      void iw.offsetWidth;
      iw.classList.add("iw-open");

      closeBtn?.addEventListener(
        "click",
        () => {
          iw.classList.remove("iw-open");
          iw.classList.add("iw-close");
          setTimeout(() => infowindow.close(), 190);
        },
        { once: true }
      );
    });
    
    for (let pos = 0; pos < providers.length; pos++) {
      console.log("-----Firma------- " + providers[pos].pName);
      
      let myLatLong = [myLat.value, myLng.value];

      providers[pos].profession.forEach(prof => {
        if (prof === profession) {

          const proClientDist = distanceBtw(myLat.value, myLng.value, providers[pos].latitude, providers[pos].longitude);
          notifyProvidersAboutInterest(providers[pos], profession, proClientDist);

          console.log("Pro " + prof)
          
          if (distanceBtw(myLat.value, myLng.value, providers[pos].latitude, providers[pos].longitude) <= dist) {
            count ++;

            console.log("PROVIDER - ", providers[pos]);

            const clientDate = parseDmyTime(dt.value);

            console.log("Cliend date format: ", clientDate);
            let marker = null;
            let matching = false;
            
            if (providers[pos].status === 'Saatavilla') {
              matching = true;
              marker = addProviderMarker(providers[pos], 'seagreen', 'darkgreen');
            } else if (providers[pos].isAvailable24_7) {
              matching = true;
              marker = addProviderMarker(providers[pos], 'seagreen', 'darkgreen');
            } else if (providers[pos].timetable.length > 0) {
              matching = providers[pos].timetable.some(time =>
                handleMatch.providerMatchingForClient(clientDate, time.start, time.end)
              );

              marker = matching
                ? addProviderMarker(providers[pos], 'seagreen', 'darkgreen')
                : addProviderMarker(providers[pos], 'orange', 'darkorange');
            } else {
              marker = addProviderMarker(providers[pos], 'orange', 'darkorange');
            }

            const feedbackText = providers[pos].feedback
            .map(f => {
              const date = new Date(f.date).toLocaleString();
              return `${date} - ${f.sender}: ${f.text}`;
            })
            .join("\n");

            window.myGlobalFunction = (idx) => handleSelectedPro(providers[idx]);

            window.toggleFeedback = () => {
              const el = document.getElementById("feedback-section");
              if (!el) return;
              el.style.display = el.style.display === "none" ? "block" : "none";
            };

            window.myChatFunction = (idx) => {
              console.log("Chat button clicked")
              handleOpenChat(providers[idx]?.user?.id);
            }

            window.myReferenceFunction = (idx) => {
              console.log("Reference is clicked:", idx);

              isOpenReferences = !isOpenReferences;
              renderInfoWindow(idx);

              if (currentMarker) {
                infowindow.open({ map, anchor: currentMarker, shouldFocus: false });
              }
            };

            
            // ✅ marker click ONLY opens
            marker.addListener("click", () => {
              if (!marker) return;
              currentProvider = providers[pos];
              currentProviderIndex = pos;
              currentMatching = matching;
              currentMarker = marker;
              isOpenReferences = false;

              renderInfoWindow(pos);
              infowindow.open({ map, anchor: marker, shouldFocus: false });

              if (window.innerWidth <= 480 && marker.position) {
                map.panTo(marker.position);
                map.panBy(0, -140);
              }
            });
            
            const renderInfoWindow = (p) => {
              const provider = providers[p];

              const hasImage = !!provider?.user?.avatar?.isImage;

              const avatarHtml = hasImage
                ? `<img
                    src="${provider.user.avatar.imageUrl}"
                    class="rounded-circle"
                    height="57"
                    width="57"
                    style="object-fit:cover;"
                    alt=""
                    loading="eager"
                  /><div class="provider">${provider.pName}</div><div>${provider.description}</div>`
                : `<i class="far fa-user fa-3x icon"></i><div class="provider">${provider.pName}</div><div>${provider.description}</div>`;

              function escapeHtml(str) {
                return String(str).replace(/[&<>"']/g, ch => ({
                  "&": "&amp;",
                  "<": "&lt;",
                  ">": "&gt;",
                  '"': "&quot;",
                  "'": "&#39;"
                }[ch]));
              }

              const feedbackHtml = (provider.feedback || [])
                .filter(f => f && f.text && f.text.trim() !== "")
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map(f => `
                  <div class="feedback-item">
                    <div class="feedback-meta">
                      <span class="feedback-sender">${escapeHtml(f.sender || t("proAround.unknown"))}</span>
                      <span class="feedback-date">${new Date(f.date).toLocaleString("fi-FI")}</span>
                    </div>
                    <div class="feedback-text">${escapeHtml(f.text)}</div>
                  </div>
                `)
                .join("");
            
              const orderButton = provider.id !== providerId.value && otherChatUsers.value[provider?.user?.id]
                ? `<button class="order-btn" onclick="myGlobalFunction(${p})">${t("proAround.order")}</button>`
                : `<div class="order-btn-placeholder"></div>`;

              const chatButton = provider.id !== providerId.value
                ? `<button class="chat-btn" onclick="myChatFunction(${p})">
                    <i class="far fa-comments fa-2x"></i>
                  </button>`
                : "";

              const referenceBtn = `
                <div class="reference-btn" onclick="myReferenceFunction(${p})">
                  ${isOpenReferences ? t("proAround.closeWorkSamples") : t("proAround.openWorkSamples")}
                </div>
              `;
              infowindow.setContent(`
                <div class="custom-info-window" id="custom-iw">
                  <button id="custom-close" class="close-btn" aria-label="Close">×</button>

                  <div class="header">
                    <div class="stars" id="stars-mount"></div>
                    <div class="raters-count text-semibold small">
                      / ${providers[p].ratersCount}
                    </div>
                  </div>
                  <table class="info-table" role="presentation">
                    <tr>
                      <td>${avatarHtml}</td>
                      <td colspan="2">
                        ${
                          feedbackHtml
                            ? `
                              <button class="bottom-btn" onclick="toggleFeedback()"> ${t("proAround.feedback")} </button>
                              
                            `
                            : ""
                        }
                      </td>
                    </tr>
                  </table>
                  <div id="feedback-section" class="feedback-section" style="display:none;">
                    <div class="feedback-title">${t("proAround.feedbackCloseHint")}</div>
                    <div class="feedback-list">
                      ${feedbackHtml}
                    </div>
                  </div>
                  <table class="info-table" role="presentation">
                    <tr>
                      <th>${t("proAround.availability")}</th>
                      <td>${currentMatching || providers[p].status === 'Saatavilla' ? t("proAround.available") : t("proAround.negotiable")}</td>
                    </tr>
                    <tr>
                      <th>${t("proAround.profession")}</th>
                      <td>${providers[p].profession.join(', ')}</td>
                    </tr>
                    <tr>
                      <th>${t("proAround.information")}</th>
                      <td><span class="info-link">${t("proAround.website")}</span></td>
                    </tr>
                    <tr>
                      <th>${providers[p].priceByHour 
                        ? t('proAround.hourlyRate') : t('proAround.contractPrice')}</th>
                      <td>
                        ${providers[p].priceByHour ? t("proAround.currencyEur", {
                          amount: providers[p].priceByHour
                        }) 
                        : t("proAround.negotiable")}
                      </td>
                    </tr>
                    <tr>
                      <th>${referenceBtn}</th>
                    </tr>
                    <tr>
                      <td colspan="2">
                        <div id="reference-mount"></div>
                      </td>
                    </tr>
                  </table>
                  
                  <div class="infowindow-footer">
                    ${orderButton}
                    ${chatButton}
                  </div>
                  
                </div>
              `);
            }

          }

        }
      })

    }







    visibleProCount.value = count;

    if (count > 0) {
      console.log("Pro count existing..." + count);
      isMainPanel.value = false;
      //this.isActiveProffs = true;
      //this.isMainPanel = false;

    } else {
      console.log("Pro count not existing...")
      //this.isActiveProffs = false;
    }
    countOfSelectedProfessional.value = count;
    console.log("countxx " + count)
    //this.identifyProfText();
    //console.log("Count " + this.countOfSelectedClients)

  }

}

const refreshMapState = async() => {
  saveMapState();
  await showClientLocationOnTheMap(currentProfession.value, selectedRange.value);

  restoreMapState();
}

const showClientLocationOnTheMap = async(profession, range) => {

  console.log("Current distance herexx  ")
  const providers = await providerService.getProviders()
  if (providers) {
    otherUserLocations(providers, profession, range);
  }

}

const findSuitablePro = () => {
  if (address.value) {
    //this.isPressedFindBtn = true;
    showClientLocationOnTheMap(currentProfession.value, selectedRange.value);
  } else {
    console.log("No address given!");
    //this.isNoAddressGiven = false;
  }

}

// Open provider marker infowindow
const handleSelectedPro = (pro) => {
  console.log("Ordered company: " + pro.pName);
  target.value = pro;
  onProvider.value = pro;
  displayProPanel.value = true;
}

watch (otherChatUsers, (users) => {
  console.log("Chat users--- ", users)
})

//Open chat widget inside marker infowindow
const handleOpenChat = (otherId) => {
  console.log("Opening chat window from infowindow - " + otherId);

  emit("open-chat", {
    otherId,
    bookingId: null,
    mode: "client",
    anchor: getBottomRightAnchor()
  });

  //convoStore.openCreateRoom(otherId);
  //convoStore.openChatWidget();
}

//Open provider references
const handleOpenReferences = () => {
  console.log("Handle open reference");
  isOpenReferences.value = true;
}

const handleCloseReferences = () => {
  isOpenReferences.value = false;
}

const parseDmyTime = (str) => {
  const m = str?.match(/^(\d{2})\/(\d{2})\/(\d{4}),?\s+(\d{2}):(\d{2})$/);
  if (!m) return null;
  const [, dd, mm, yyyy, HH, MM] = m.map(Number);
  return new Date(yyyy, mm - 1, dd, HH, MM);
}

const handleSendRequest = async (_form) => {
  const userId = await auth.user.id;
  const receiverId = target.value.user.id;
  console.log("Sending request to " + target.value.user.username);

  const dateObj = parseDmyTime(dt.value) || parseDmyTime(_form.date);
  let ms;
  if (dateObj) {
      //o.value = dateObj;
      ms = dateObj.getTime();
      console.log("Milliseconds:", ms);  // e.g. 1758976800000
  } else {
      console.log("Invalid date string");
  }

  console.log("dt value - " + dt.value);
  console.log("_form.date - " + _form.date)
  

  const mainDate = dt.value ? dt.value : _form.date;

  console.log("mainDate - " + mainDate)

  const request = {
    author_id: userId,
    created: dateObj,
    dateStr: mainDate,
    created_ms: ms,
    header: _form.header,
    agreement: false,
    address: _form.address,
    latitude: _form.myLat,
    longitude: _form.myLng,
    zone: 0,
    professional: profession.value.label,
    isIncludeOffers: false,
    description: _form.content,
    photos: _form.serverPhotos || [],
    //budget: _form.budget,
    status: "active",
  }


  displayProPanel.value = false;
  //rs_success_msg.value = "Tilaus lähetetty onnistuneesti!"
  //isRequestSent.value = true;



  clientStore.onRequest(receiverId, userId, target.value, user.value, request, _form.localPhotos, () => {
    // success callback
    console.log("Request sent successfully");
    rs_success_msg.value = tr("proAround.requestSent");
    isRequestSent.value = true;
  }, (err) => {
    // error callback
    console.error("Failed to send request:", err);
    rs_error_msg.value = tr("proAround.requestFailed");
    isRequestSent.value = false;
  });

  /* toastState.value = 'danger'
  toastIcon.value = 'fas fa-check fa-lg me-2'
  toastContent.value = 'Hallo Helsinki'
  toastModel.value = true */
} 

const showAddress = () => {
  isAddress.value = true;
  //userCurrentLocation();
  //getAddressFrom (myLat.value, myLng.value);
}
const clearAddress = () => {
  isAddress.value = false;
  address.value = '';
}



const circleMarker = (color) => ({
  path: google.maps.SymbolPath.CIRCLE,
  fillColor: color,
  fillOpacity: 1,
  strokeColor: "#000",
  strokeWeight: 1,
  scale: 8
});

const pinSymbol = (color, stroke_color) => {
  const priceTag = document.createElement("div");

  priceTag.className = "price-tag";
  priceTag.textContent = "$2.5M";
  return {
    path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
    fillColor: color,
    fillOpacity: 1,
    strokeColor: stroke_color,
    strokeWeight: 2,
    scale: 1,
    labelOrigin: {
      x: 60,
      y: -25
    }
  };
}

</script>
<style scoped>
html, body, #app {
  overflow-x: hidden;
  width: 100%;
}
</style>
<style scoped>
html {

  overflow-y: scroll;
}

:deep(.modal-dialog) {
  margin-left: auto !important;
  margin-right: auto !important;
  max-width: min(500px, 95vw) !important;
}

:deep(body.modal-open) { padding-right: 0 !important; }
:deep(body.modal-open .fixed-top,
body.modal-open .sticky-top,
body.modal-open .navbar) { padding-right: 0 !important; }








/* .client-map-panel {
  position: absolute;
  top: 48px;
  right: 24px;
  width: min(420px, calc(100vw - 32px));
  padding: 18px;
  border-radius: 18px;
  background: rgba(22, 27, 34, 0.82);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.35);
  color: #fff;
  z-index: 1000;
}

.panel-header,
.panel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-header {
  margin-bottom: 14px;
}

.panel-refresh {
  border: 0;
  background: transparent;
  color: #f2c078;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-icon,
.panel-close {
  cursor: pointer;
  opacity: 0.8;
  transition: 0.2s ease;
}

.panel-icon:hover,
.panel-close:hover {
  opacity: 1;
  transform: scale(1.05);
}

.field-wrapper {
  width: 100%;
  margin-bottom: 12px;
}

.section-label {
  margin: 4px 0 10px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.78);
}

.modern-input-group,
.modern-select,
.modern-mdb-select {
  width: 100%;
}

.clear-btn {
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
  background: rgba(255, 255, 255, 0.08) !important;
  color: #fff !important;
}

.select-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.select-group i {
  font-size: 16px;
  color: #6fd0d4;
}

.field-error {
  border: 1px solid #ff6b8a !important;
  border-radius: 8px;
}

.error-text {
  color: #ff8a8a;
  font-size: 13px;
  margin: 6px 0 0;
}

.empty-text {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
}

.search-btn {
  border-radius: 10px;
  padding: 7px 18px;
  margin-top: 12px;
  font-weight: 600;
  background: linear-gradient(135deg, #2aa7c9, #3b82f6) !important;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
}

.modern-checkbox {
  color: rgba(255, 255, 255, 0.85);
}

@media (max-width: 768px) {
  .client-map-panel {
    position: fixed;
    top: auto;
    right: 12px;
    left: 12px;
    bottom: calc(12px + env(safe-area-inset-bottom));
    width: auto;
    max-height: calc(100dvh - 24px - env(safe-area-inset-bottom));
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 16px;
  }

  
}

@media only screen and (max-width: 1000px) {
  #address-panel {
    display: none !important;
  }
 
} */

.client-map-panel {
  position: absolute;
  top: 48px;
  right: 24px;
  z-index: 1000;

  width: min(410px, calc(100vw - 32px));
  max-height: calc(100dvh - 130px);
  padding: 18px;
  box-sizing: border-box;

  overflow-y: auto;
  overscroll-behavior: contain;

  border: 1px solid rgba(139, 197, 202, 0.24);
  border-radius: 18px;

  color: #eef4f6;

  background:
    linear-gradient(
      145deg,
      rgba(31, 44, 59, 0.96),
      rgba(20, 31, 44, 0.96)
    );

  box-shadow:
    0 22px 55px rgba(0, 0, 0, 0.38),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);

  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

/* Päis */

.map-panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;

  padding-bottom: 15px;
  margin-bottom: 17px;

  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.map-panel-heading {
  display: flex;
  align-items: flex-start;
  min-width: 0;
  gap: 11px;
}

.map-panel-heading__icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 40px;
  height: 40px;
  flex: 0 0 40px;

  border: 1px solid rgba(95, 158, 160, 0.35);
  border-radius: 11px;

  color: #92cbd0;
  background: rgba(95, 158, 160, 0.14);
  font-size: 16px;
}

.map-panel-title {
  margin: 1px 0 0;

  color: #f4f7f8;
  font-size: 17px;
  font-weight: 650;
  line-height: 1.25;
}

.map-panel-subtitle {
  margin: 4px 0 0;

  color: rgba(219, 229, 234, 0.58);
  font-size: 12px;
  line-height: 1.4;
}

.map-panel-actions {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 6px;
}

.map-panel-icon-button {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 34px;
  height: 34px;
  padding: 0;

  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9px;

  color: rgba(232, 239, 242, 0.72);
  background: rgba(255, 255, 255, 0.05);

  cursor: pointer;
  transition:
    color 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.map-panel-icon-button:hover {
  color: #ffffff;
  border-color: rgba(139, 197, 202, 0.42);
  background: rgba(95, 158, 160, 0.16);
  transform: translateY(-1px);
}

.map-panel-icon-button--close:hover {
  color: #ffb1bb;
  border-color: rgba(255, 116, 132, 0.38);
  background: rgba(255, 92, 112, 0.12);
}

/* Väljad */

.map-panel-field {
  width: 100%;
  margin-bottom: 15px;
}

.map-panel-label {
  display: block;
  margin-bottom: 7px;

  color: #dfe8eb;
  font-size: 12px;
  font-weight: 600;
}

.map-panel-required {
  margin-left: 2px;
  color: #ff8e9d;
}

.map-panel-field-help {
  display: block;
  margin-top: 3px;

  color: rgba(213, 224, 229, 0.5);
  font-size: 11px;
  line-height: 1.35;
}

.map-panel-field-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 10px;
}

/* Aadress ja SelectProfession */

.client-map-panel :deep(.field-wrapper) {
  width: 100%;
  margin: 0;
}

.client-map-panel :deep(.input-group) {
  width: 100%;
}

.client-map-panel :deep(.booking-input-wrapper) {
  min-width: 0;
}

.client-map-panel :deep(.form-control) {
  color: #edf3f5;
  background: #182332;
  border-color: #39495d;
}

.client-map-panel :deep(.form-control:focus) {
  border-color: #72aeb2;
  box-shadow: 0 0 0 3px rgba(95, 158, 160, 0.14);
}

.client-map-panel :deep(.p-select) {
  width: 100%;
  min-height: 43px;

  color: #edf3f5;
  border: 1px solid #39495d;
  border-radius: 9px;
  background: #182332;
  box-shadow: none;
}

.client-map-panel :deep(.p-select:hover) {
  border-color: rgba(139, 197, 202, 0.62);
}

.client-map-panel :deep(.p-select.p-focus),
.client-map-panel :deep(.p-select.p-inputwrapper-focus) {
  border-color: #72aeb2;
  box-shadow: 0 0 0 3px rgba(95, 158, 160, 0.14);
}

.client-map-panel :deep(.p-select-label) {
  display: flex;
  align-items: center;

  min-height: 41px;
  padding: 9px 12px;

  color: #edf3f5;
  font-size: 13px;
}

.client-map-panel :deep(.p-select-label.p-placeholder) {
  color: rgba(218, 227, 232, 0.42);
}

/* Kohe-valik */

.map-now-toggle {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 7px;

  padding: 6px 9px;

  border: 1px solid rgba(139, 197, 202, 0.22);
  border-radius: 9px;

  background: rgba(95, 158, 160, 0.07);
  cursor: pointer;
}

.map-now-toggle__input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.map-now-toggle__control {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 18px;
  height: 18px;

  border: 1px solid #68878f;
  border-radius: 5px;

  color: transparent;
  background: #111b28;

  font-size: 9px;
  transition: 0.2s ease;
}

.map-now-toggle__input:checked
  + .map-now-toggle__control {
  color: #ffffff;
  border-color: cadetblue;
  background: cadetblue;
}

.map-now-toggle__label {
  color: #dce7ea;
  font-size: 12px;
  font-weight: 600;
}

/* Datepicker */

.map-datetime-picker {
  width: 100%;
}

.client-map-panel :deep(.datetimepicker) {
  width: 100%;
}

/* MDB kauguse Select */

.map-range-select {
  width: 100%;
}

.client-map-panel :deep(.select-wrapper) {
  width: 100%;
}

.client-map-panel :deep(.select-input) {
  color: #edf3f5;
  border-color: #39495d;
  background: #182332;
}

/* Veateade */

.map-panel-error,
.field__error {
  display: flex;
  align-items: flex-start;
  gap: 6px;

  margin-top: 7px;

  color: #ff96a3;
  font-size: 12px;
  line-height: 1.4;
}

/* Tühi tulemus */

.map-panel-empty {
  display: flex;
  align-items: center;
  gap: 9px;

  padding: 11px 12px;
  margin: 2px 0 14px;

  border: 1px solid rgba(244, 174, 92, 0.24);
  border-radius: 10px;

  color: #eec28d;
  background: rgba(226, 146, 53, 0.09);

  font-size: 12px;
  line-height: 1.4;
}

.map-panel-empty i {
  flex: 0 0 auto;
}

/* Footer */

.map-panel-footer {
  display: grid;
  grid-template-columns: auto minmax(160px, 1fr);
  align-items: center;
  gap: 11px;

  padding-top: 15px;
  margin-top: 4px;

  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.map-panel-reset {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;

  min-height: 42px;
  padding: 0 13px;

  border: 1px solid rgba(139, 197, 202, 0.2);
  border-radius: 9px;

  color: rgba(219, 229, 234, 0.7);
  background: rgba(255, 255, 255, 0.04);

  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.map-panel-reset:hover {
  color: #ffffff;
  background: rgba(95, 158, 160, 0.13);
}

.map-panel-search-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  min-height: 42px;
  gap: 8px;

  border-radius: 10px;
  font-weight: 650;

  background:
    linear-gradient(
      135deg,
      #278eae,
      #3b82f6
    ) !important;

  box-shadow:
    0 8px 20px rgba(59, 130, 246, 0.3);
}

/* Scrollbar */

.client-map-panel {
  scrollbar-width: thin;
  scrollbar-color:
    rgba(139, 197, 202, 0.32)
    transparent;
}

.client-map-panel::-webkit-scrollbar {
  width: 6px;
}

.client-map-panel::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(139, 197, 202, 0.3);
}

/* Mobiil */

@media (max-width: 768px) {
  .client-map-panel {
    position: fixed;
    top: auto;
    right: 10px;
    bottom: calc(10px + env(safe-area-inset-bottom));
    left: 10px;

    width: auto;
    max-height: min(
      78dvh,
      calc(100dvh - 90px)
    );

    padding: 15px;
    border-radius: 17px;
  }

  .map-panel-subtitle {
    display: none;
  }

  .map-panel-field-header {
    align-items: center;
  }

  .map-panel-footer {
    position: sticky;
    bottom: -15px;
    z-index: 3;

    margin-right: -15px;
    margin-bottom: -15px;
    margin-left: -15px;
    padding: 13px 15px 15px;

    border-radius: 0 0 17px 17px;

    background: rgba(22, 33, 46, 0.97);
    backdrop-filter: blur(15px);
  }
}

@media (max-width: 440px) {
  .map-panel-heading__icon {
    display: none;
  }

  .map-panel-title {
    font-size: 16px;
  }

  .map-panel-actions {
    gap: 4px;
  }

  .map-panel-icon-button {
    width: 32px;
    height: 32px;
  }

  .map-panel-footer {
    grid-template-columns: 1fr;
  }

  .map-panel-reset {
    order: 2;
  }
}












@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.waitMapLoading {
  display: none;
}

.custom-info {
  position: relative;
  background-color: grey;
  padding: 8px 12px;
  font-family: sans-serif;
}

#custom-close {
  position: absolute;
  top: 6px;
  right: 6px;
  background: #f44336;
  border: none;
  color: white;
  font-size: 18px;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
}



/* Infowindow */

/* 1) Kill Google's white bubble */
:deep(.gm-style .gm-style-iw-c) {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
  border-radius: 0 !important;
  overflow: visible !important;  /* allow your arrow */
}

/* 2) Remove the inner scroll wrapper background/clipping */
:deep(.gm-style .gm-style-iw-d) {
  background: transparent !important;
  overflow: hidden !important;
}

:deep(.gm-style-iw-tc,
.gm-style-iw-t::after,
.gm-style-iw-t::before) {
  display: none !important;
}

/* 3) Hide default close button */
:deep(.gm-ui-hover-effect) {
  display: none !important;
}

:deep(.gm-style .gm-style-iw-c) {
  padding: 0 !important;
  border-radius: 14px !important;
  overflow: visible !important;
}

:deep(.gm-style .gm-style-iw-d) {
  overflow: visible !important;
}

:deep(.gm-ui-hover-effect) {
  display: none !important;
}

:deep(.custom-info-window) {
  position: relative;
  width: min(320px, calc(100vw - 32px));
  max-width: 340px;
  max-height: 420px;
  overflow-y: auto;
  background: rgb(34, 80, 80);
  border-radius: 14px;
  box-shadow: 0 10px 25px rgba(0,0,0,.25);
  padding: 14px 14px 12px;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}
:deep(.custom-info-window.iw-open) {
  opacity: 1;
  transform: translateY(0) scale(1);
}

:deep(.custom-info-window.iw-close) {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}


/* Close button (bigger tap target for mobile) */
:deep(.close-btn) {
  position: absolute;
  top: 8px;
  right: 8px;

  width: 36px;
  height: 36px;
  border-radius: 10px;

  border: none;
  background: rgba(255, 255, 255, 0.55);
  cursor: pointer;

  font-size: 22px;
  line-height: 1;
  font-weight: 700;

  display: grid;
  place-items: center;
}

:deep(.close-btn:active) {
  transform: scale(0.98);
}

/* Header */
:deep(.header) {
  padding-right: 42px; /* leave room for close button */
  padding-bottom: 3px;
  display: flex;
  justify-content: space-between;
}

:deep(.header .stars) {
  margin-top: 0;
}
:deep(.header .raters-count) {
  margin-top: 7px;
}
:deep(.header h3) {
  margin: 6px 0 4px;
  font-size: 18px;
}
:deep(.header p) {
  margin: 0 0 10px;
  font-size: 14px;
}

/* Table */
:deep(.info-table) {
  width: 100%;
  
  border-collapse: collapse;
  font-size: 14px;
  margin: 8px 0 12px;
}

:deep(.info-table tr:nth-child(1)) {
  border-top: 2px solid #ccc;
}

:deep(.info-table th) {
  text-align: left;
  font-weight: 700;
  padding: 6px 0;
  width: 42%;
  vertical-align: top;
}

:deep(.info-table) td {
  padding: 6px 0;
  vertical-align: top;
}

:deep(.provider) {
  color: #d68d5c;
  font-weight: 600;
}

:deep(.info-link) {
  color: #bd6161;
  cursor: pointer;
  text-decoration: underline;
  font-weight: 600;
}

/* Bottom button */
:deep(.bottom-btn) {
  width: 100%;
  min-height: 44px; /* mobile tap target */
  padding: 10px 12px;
  margin-bottom: 7px;
  border: none;
  border-radius: 12px;

  background: #212d41;
  color: white;
  font-size: 15px;
  font-weight: 700;

  cursor: pointer;
}

:deep(.order-btn) {
  width: 50%;
  min-height: 44px; /* mobile tap target */
  padding: 10px 12px;
  margin-bottom: 7px;
  border: none;
  border-radius: 12px;

  background: #3c5c94;
  color: white;
  font-size: 15px;
  font-weight: 700;

  cursor: pointer;
}

:deep(.chat-btn) {
  min-height: 44px; /* mobile tap target */
  padding: 10px 12px;
  margin-bottom: 7px;
  border: none;
  border-radius: 12px;

  background: #5c7db8;
  color: white;
  font-size: 15px;
  font-weight: 700;

  cursor: pointer;
}

:deep(.reference-btn) {
  color: orange;
  cursor: pointer;
}

:deep(.bottom-btn:active) {
  transform: scale(0.99);
}

/* Mobile tweaks */
@media (max-width: 768px) {
  :deep(input),
  :deep(select),
  :deep(textarea),
  :deep(.form-control),
  :deep(.form-select),
  :deep(.p-select-label),
  :deep(.p-inputtext),
  :deep(.p-dropdown-label) {
    font-size: 16px !important;
  }

  .client-map-panel {
    width: calc(100vw - 32px);
    max-width: 100%;
    box-sizing: border-box;
    float: none;
    margin: 60px auto;
  }
}

@media (max-width: 420px) {

  :deep(.custom-info-window) { 
    position: relative;
    width: min(320px, calc(100vw - 80px));
    max-width: 340px;
    background: rgb(34, 80, 80);
    border-radius: 14px;
    box-shadow: 0 10px 25px rgba(0,0,0,.25);
    padding: 14px 14px 12px;
    box-sizing: border-box;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; 
    max-height: 450px;
    overflow-y: scroll;
    opacity: 1; 
    transform: translateY(0) 
    scale(1); 
    transition: 
    opacity 190ms ease, 
    transform 190ms ease; 
  }
  
  :deep(.custom-info-window::before,
  .custom-info-window::after) {
    left: 39% !important;  /* try 60%–75% */
  }
  :deep(.custom-info-window) {
    padding: 12px 12px 12px;
    border-radius: 16px;
  }
  :deep(.header h3) {
    font-size: 17px;
  }
  :deep(.info-table, .header p) {
    font-size: 13.5px;
  }
}





#map-container {
  position: fixed;
  top: 60px;
  right: 0;
  bottom: 50px;
  left: 0;
  width: 100%;
}

#map {
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.25s ease;
}

/* Preventing map from being hidden behind the panel on mobile */
#map.map-ready {
  opacity: 1;
}

.spinner-overlay {
  position: absolute;
  inset: 0;
  background: #0b1618;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #ccc;
  border-top-color: #4285f4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}



.location-error-box {
  color: white;
  background: rgba(255, 255, 255, 0.08);
  padding: 16px 20px;
  border-radius: 12px;
}

.locating-badge {
  position: absolute;
  right: 16px;
  bottom: 100px;
  z-index: 11;
  background: rgba(11, 22, 24, 0.85);
  color: white;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 13px;
}

/* .hideMainPanel {
  display: none;
} */

:deep(.provider-marker) {
  position: relative;
  width: 42px;
  height: 42px;
}

:deep(.provider-marker__avatar) {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 2px solid black;
  box-sizing: border-box;
  overflow: hidden;

  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #444;

  display: flex;
  align-items: center;
  justify-content: center;

  color: white;
  font-size: 18px;
  box-shadow: 0 2px 8px rgba(0,0,0,.25);
}

:deep(.provider-marker__avatar--fallback) {
  background-color: #4b5563;
  color: white;
}

:deep(.provider-marker__badge) {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid white;
  box-sizing: border-box;
}

:deep(.provider-marker__badge--available) {
  background: #00b14f;
}

:deep(.provider-marker__badge--negotiable) {
  background: orange;
}

.custom-info-window {
  max-width: 320px;
  font-family: Arial, sans-serif;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
}

.info-table th {
  text-align: left;
  vertical-align: top;
  padding: 6px 8px 6px 0;
  white-space: nowrap;
}

.info-table td {
  vertical-align: top;
  padding: 6px 0;
}

/* Feedback info window */

:deep(.feedback-section) {
  margin-top: 12px;
  border-top: 1px solid #e5e5e5;
  padding-top: 10px;
}

:deep(.feedback-title) {
  font-weight: 600;
  font-size: 12px;
  color: #ddd;
  margin-bottom: 8px;
}

:deep(.feedback-list) {
  max-height: 220px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 6px;
}

:deep(.feedback-item) {
  background: #f7f7f7;
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  padding: 8px 10px;
  margin-bottom: 8px;
}


:deep(.feedback-meta) {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

:deep(.feedback-sender) {
  color: blue;
  font-weight: 600;
  font-size: 13px;
}

:deep(.feedback-date) {
  font-size: 11px;
  color: #666;
  white-space: nowrap;
}

:deep(.feedback-text) {
  font-size: 13px;
  line-height: 1.35;
  color: #333;
  word-break: break-word;
}

:deep(.infowindow-footer) {
  display: flex;
  justify-content: space-between;
}

.order-btn-placeholder {
  width: 120px; /* same width as order button */
}

.info-table td:last-child {
  word-break: break-word;
}

</style>
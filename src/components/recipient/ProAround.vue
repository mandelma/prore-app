<template>
 
  <div>
    
    <div  style="position: relative; z-index: 1; opacity: 0.8; border-radius: 10px;">
      
      <div v-show="isMainPanel" class="client-map-panel">
        
        <div style="display: flex; justify-content: space-between;">
          <p style="cursor: pointer; color: burlywood;" @click="refreshMapState">Päivitä</p>
          <div style="display: flex; justify-content: right;">
            <MDBIcon size="lg" style="padding: 10px;" @click="isMainPanel = false">
              <i class="fas fa-expand-arrows-alt"></i>
            </MDBIcon>
            <div>
              <MDBBtnClose
                  white
                  style=" padding: 10px;"
                  size="sm"
                  @click="$router.go(-1)"
              />
            </div>

          </div>
        </div>
        
        <div :class="{hideClientInput: !address && isAddress}" style="width: 100%;" class="field-wrapper ">
          <div  class="input-group">
            <MDBInput
                size="sm"
                v-model="address"
                label="Anna osoite"
                id="client-input"
                placeholder=""
                wrapperClass="form-outline flex-grow-3"
                :inputClass="'ps-0'"
                aria-describedby="button-addon2"
            />
            <MDBBtn v-if="address" type="button" style="border:1px solid #ddd">
              <MDBIcon size="1x" @click="clearAddress()">
                <i :class="'fas fa-times'"></i>
              </MDBIcon>
            </MDBBtn>
          </div>
        </div>

        <div class="field-wrapper">
          <div>
            <Select
                style="width: 100%;"
                v-model="profession"
                @change="changedProfession"
                :options="professions"
                filter optionLabel="label"
                optionGroupLabel="label"
                optionGroupChildren="items"
                placeholder="Valitse ammattilainen *"
                showClear
                v-bind:style="isNoPro ? 'color: pink; border: 1px solid red;' : 'color: white;'"
                class="w-full md:w-[30rem]"

            >

              <template #value="slotProps">
                <div v-if="slotProps.value" >
                
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
            <p v-if="panelProError" style="color: red; margin: 0;">Ammatti on pakollinen!</p>
          </div>
        </div>

        <!--format: 'YYYY-MM-DD'-->
        <div  :class="{hideDistSelectPanel: !isDistSelection}">
          <p style="text-align: left; font-size: 14px;">Valitse kiinnostavaa ajankohta tai heti!</p>
          <div class="distSelectPanel">

            <div class="field-wrapper">
              <MDBDateTimepicker
                  size="sm"
                  label="Valitse tehtävän päivämäärä ja aika"
                  v-model="dt"
                  :toggleButton="false"
                  inputToggle

                  :datepicker="{
                  ...L,
                  
                }"
                  :timepicker="{
                  ...L,
                  hoursFormat: 24
                }"

                  :key="reInitKey"
                  disablePast
              />
              
            </div>

            <div style="margin-top: 0; color: white;">
              <MDBCheckbox
                label="Heti!"
                name="selection"
                v-model="isDateNow"
                value="true"
                @click="removeDateIfExist"
                wrapperClass="mb-4"
              />
            </div>

          </div>


        </div>
        
        <MDBSelect size="sm" v-model:selected="selectedRange" :options = rangeOptions label="Etsi alue" id="distance"/>
        <p v-if="panelRangeError" style="color: red; margin: 0;">Etäisyys on pakollinen valinta!</p>

        <div style="margin-top: 13px; display: flex; justify-content: space-between;">
          <p v-if="countOfSelectedProfessional === 0 && clickedPanelGet" class="text-muted">
            Ei ammattilaisia
          </p>
          <p v-else></p>
          <MDBBtn color="primary" size="sm" @click="onGetProviders">Etsi</MDBBtn>
        </div>
      </div>
      <!--Displaying when no main panel open-->
      <MDBBtn
        v-show="!isMainPanel"
        color="dark"
        style="position: absolute; opacity: 0.8; top: 60px; left: 10px; z-index: 2;"
        @click="isMainPanel = true"
      >
        Valinta
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
          <template #title>PROKEIKKATORI</template>
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
    <div v-if="!startPos && isLocating" class="spinner-overlay">
      <div class="spinner"></div>
    </div>

    <div v-else-if="!startPos && !isLocating" class="spinner-overlay">
      <div class="location-error-box">
        Sijaintia ei voitu hakea.
      </div>
    </div>

    <div v-show="!!startPos" id="map"></div>

    <div v-if="!!startPos && isLocating" class="locating-badge">
      Päivitetään sijaintia...
    </div>
  </div>
</template>

<script setup>
// const props = defineProps({
//   lat: { type: Number, required: true },
//   lng: { type: Number, required: true },
// });
import {MDBIcon, MDBBtnClose, MDBInput, MDBBtn, MDBCheckbox, MDBSelect, MDBSpinner, MDBDateTimepicker, MDBModal, MDBModalHeader, MDBModalBody, MDBModalFooter, MDBToast} from 'mdb-vue-ui-kit';
import { ref, onMounted, watch, computed, createApp, nextTick } from 'vue';
import Select from 'primevue/select';
import proList from '@/components/controllers/professions'
//import { Loader } from "@googlemaps/js-api-loader"; // official way
import axios from 'axios';
import { storeToRefs } from 'pinia';
import {loadGoogleMaps} from "@/components/controllers/loadGoogleMap.js";
import providerService from '@/service/providers'
import match from '@/components/controllers/compare_dt'
import { useMapStore } from '@/stores/mapStore';
import { useClientStore } from '@/stores/recipientStore';
import { useLoginStore } from '@/stores/login';
import { useProStore } from '@/stores/providerStore';
import ToastHandler from '../helpers/ToastHandler.vue';
import RequestForm from './RequestForm.vue';

import Stars from '../Stars.vue';
import ProReferencePublic from './ProReferencePublic.vue';
import socket from '@/socket';

//import { useMapStore } from '@/stores/mapStore';
//const location = useMapStore();
defineOptions({
  name: "pro-around"
})

const mapStore = useMapStore();

const { userPos, lastKnownPos, mapsReady, isLocating, locationError } = storeToRefs(mapStore);

const address = ref("");
const selectedPlaceId = ref(null)
const selectedAddressComponents = ref([])
const myLat = ref( null);
const myLng = ref(null);
const mapsError = ref(false);
const professions = proList;
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

const panelProError = ref(false);
const panelRangeError = ref(false);


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
  
  //showClientLocationOnTheMap(currentProfession.value, newVal);

})


const initMap = (lat, lng) => {
  if (map) return map

  const el = document.getElementById('map')
  if (!el) throw new Error('Map container not found')

  map = new google.maps.Map(el, {
    center: { lat, lng },
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapId: "DEMO_MAP_ID",
  })

  infoWindow = new google.maps.InfoWindow()
  isMapLoaded.value = true

  return map
}

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

/* watch(
  [mapsReady, selectedRange, profession, userPos],
  ([ready, range, prof, pos]) => {
    if (!ready) return
    if (!pos) return
    if (!map) return
    if (!range) return
    if (!prof?.label) return

    //showClientLocationOnTheMap(prof.label, range.value ?? range)
  }
) */

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


onMounted (async () => {
  try {
    const initPromise = mapStore.init()

    await nextTick()

    const pos = userPos.value || lastKnownPos.value
    if (pos) {
      myLat.value = pos.lat
      myLng.value = pos.lng

      if (address.value) {
        console.log("Address is set " + address.value);
      }
      initMap(pos.lat, pos.lng)
      showUserMarker(pos.lat, pos.lng)
      //getAddressFrom(pos.lat, pos,lng);
      await getAddressFromCoords(pos.lat, pos.lng);
      await initAutocomplete()
    }

    await initPromise

    const freshPos = userPos.value || lastKnownPos.value
    if (freshPos && !map) {
      myLat.value = freshPos.lat
      myLng.value = freshPos.lng

      initMap(freshPos.lat, freshPos.lng)
      showUserMarker(freshPos.lat, freshPos.lng);
      await getAddressFromCoords(freshPos.lat, freshPos.lng)
      await initAutocomplete()
    }
  } catch (err) {
    console.error('Map init failed:', err)
  }
})


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

const changedProfession = () => {
      console.log("Changed " + profession.value.label);
      //this.showClientLocationOnTheMap(this.prof.label, this.distBtw);
      currentProfession.value = profession.value.label;
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

const onGetProviders = () => {
  clickedPanelGet.value = false;
  panelProError.value = false;
  panelRangeError.value = false;
  let errors = false;
  if (!profession.value) {
    panelProError.value = true;
    errors = true;
    console.log("Get providers " + profession.value.label);
    console.log("Sel range " + selectedRange.value);
  };

  if (selectedRange.value === 0) {
    errors = true;
    panelRangeError.value = true;
    showClientLocationOnTheMap(profession.value?.label, selectedRange.value);
  }

  if (!errors) {
    clickedPanelGet.value = true;
    
    showClientLocationOnTheMap(profession.value.label, selectedRange.value);
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
      title: "Sinu asukoht",
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

const addProviderMarker = (provider) => {
  if (!map) return null;

  const lat = Number(provider.latitude);
  const lng = Number(provider.longitude);

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
    let currentMatching = false;
    let currentPos = null;

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
      if (mountRefEl && currentProvider) {
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

          //his.providers.push(providers[pos])
          console.log("Pro " + prof)
          //let providerLatLng = [providers[pos].latitude, providers[pos].longitude];
          //console.log("Distance btw " + distanceBtw(myLat.value, myLng.value, providers[pos].latitude, providers[pos].longitude));


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


            const orderButton = providers[pos].id !== providerId.value
            ? `<button class="bottom-btn" onclick="myGlobalFunction(${pos})">
                  TEE TILAUS
              </button>`
            : "";

            

            window.myGlobalFunction = this && this.openMarker
              ? this.openMarker.bind(this)
              : (idx) => handleSelectedPro(providers[idx])//console.log('openMarker fallback', idx);


            // ✅ marker click ONLY opens
            if (!marker) return;
            marker.addListener("click", () => {
            const p = pos;
            currentProvider = providers[p];
            currentMatching = matching;
            currentPos = p;

            const hasImage = !!providers[p]?.user?.avatar?.isImage;

            const avatarHtml = hasImage
              ? `<img
                  src="${providers[p].user.avatar.imageUrl}"
                  class="rounded-circle"
                  height="33"
                  width="33"
                  style="object-fit:cover;"
                  alt=""
                  loading="eager"
                /><div class="provider">${providers[p].pName}</div>`
              : `<i class="far fa-user icon"></i>`;

            const orderButton = providers[p].id !== providerId.value
              ? `<button class="bottom-btn" onclick="myGlobalFunction(${p})">
                    TEE TILAUS
                </button>`
              : "";

            infowindow.setContent(`
              <div class="custom-info-window" id="custom-iw">
                <button id="custom-close" class="close-btn" aria-label="Close">×</button>

                <div class="header">
                  <div class="stars" id="stars-mount"></div>
                  <div class="raters-count text-semibold small">
                    / ${providers[p].ratersCount} arvostelijaa
                  </div>
                </div>

                <table class="info-table" role="presentation">
                  <tr>
                    <td>${avatarHtml}</td>
                    <td>${providers[p].description}</td>
                  </tr>
                  <tr>
                    <th>Saatavuus</th>
                    <td>${currentMatching || providers[p].status === 'Saatavilla' ? "Saatavilla" : "Sovittaessa"}</td>
                  </tr>
                  <tr>
                    <th>Ammatti</th>
                    <td>${providers[p].profession.join(', ')}</td>
                  </tr>
                  <tr>
                    <th>Tiedot</th>
                    <td><span class="info-link">Kotisivu</span></td>
                  </tr>
                  <tr>
                    <th>${providers[p].priceByHour ? "Tuntihinta" : "Urakkahinta"}</th>
                    <td>${providers[p].priceByHour ? providers[p].priceByHour + " eur" : "Sovittaessa"}</td>
                  </tr>
                  <tr>
                    <th>Referenssit</th>
                  </tr>
                  <tr>
                    <td colspan="2">
                      <div id="reference-mount"></div>
                    </td>
                  </tr>
                </table>

                ${orderButton}
              </div>
            `);

            infowindow.open({ map, anchor: marker, shouldFocus: false });

            if (window.innerWidth <= 480 && marker.position) {
              map.panTo(marker.position);
              map.panBy(0, -140);
            }
          });

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

const handleSelectedPro = (pro) => {
  console.log("Ordered company: " + pro.pName);
  target.value = pro;
  onProvider.value = pro;
  displayProPanel.value = true;
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

  const dateObj = parseDmyTime(dt.value);
  let ms;
  if (dateObj) {
      //o.value = dateObj;
      ms = dateObj.getTime();
      console.log("Milliseconds:", ms);  // e.g. 1758976800000
  } else {
      console.log("Invalid date string");
  }

  const request = {
    author_id: userId,
    created: dateObj,
    created_ms: ms,
    dateStr: dt.value,
    header: _form.header,
    agreement: false,
    address: address.value,
    latitude: myLat.value,
    longitude: myLng.value,
    zone: 0,
    professional: profession.value.label,
    isIncludeOffers: false,
    description: _form.content,
    status: "active",
  }


  displayProPanel.value = false;
  //rs_success_msg.value = "Tilaus lähetetty onnistuneesti!"
  //isRequestSent.value = true;
  clientStore.onRequest(receiverId, userId, target.value, user.value, request);

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
html {

  overflow-y: scroll;
}
html, body { overflow-x: hidden; }

:deep(.modal-dialog) {
  margin-left: auto !important;
  margin-right: auto !important;
  max-width: min(500px, 95vw) !important;
}

:deep(body.modal-open) { padding-right: 0 !important; }
:deep(body.modal-open .fixed-top,
body.modal-open .sticky-top,
body.modal-open .navbar) { padding-right: 0 !important; }
.client-map-panel {
  background-color: #1B2330;
  border-radius: 10px;
  padding: 10px;
  margin: 60px 17px 0 0;
  width: 30%;
  float: right;
}

@media only screen and (max-width: 1000px) {
  #address-panel {
    display: none !important;
  }
  .client-map-panel {
    background-color: #1B2330;
    padding: 10px;
    margin: 60px auto;
    width: 80%;
    float: none;
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
  overflow: visible !important;
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
  background: rgb(34, 80, 80);
  border-radius: 14px;
  box-shadow: 0 10px 25px rgba(0,0,0,.25);
  padding: 14px 14px 12px;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; 

  opacity: 1; 
  transform: translateY(0) 
  scale(1); 
  transition: 
  opacity 190ms ease, 
  transform 190ms ease; }

:deep(.custom-info-window.iw-open) {
  opacity: 1;
  transform: translateY(0) scale(1);
}

:deep(.custom-info-window.iw-close) {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}

/* :deep(.custom-info-window::after) {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -14px;
  transform: translateX(-60%);
  width: 0; height: 0;
  border-left: 14px solid transparent;
  border-right: 14px solid transparent;
  border-top: 14px solid cyan;
} */





/* :deep(.custom-info-window::before) {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -10px;
  transform: translateX(-50%);
  width: 26px;
  height: 12px;
  background: cyan;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
} */

/* ...and the rest of classes the same way (close-btn, header, etc) */

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

:deep(.info-table tr:nth-child(2)) {
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
  border: none;
  border-radius: 12px;

  background: #0b63ff;
  color: white;
  font-size: 15px;
  font-weight: 700;

  cursor: pointer;
}

:deep(.bottom-btn:active) {
  transform: scale(0.99);
}

/* :deep(.custom-info-window) {
  opacity: 1;
  transform: translateY(0) scale(1);
  transition: opacity 190ms ease, transform 190ms ease;
} */



/* :deep(.modal-header .btn-close) {
  color: #fff;
  opacity: 1;
} */
/* :deep(.modal) {
  padding-right: 0 !important; 
} */


/* Mobile tweaks */
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

</style>
<template>
    
<!-- id="map-container" -->
<div >
  <div  style="position: relative; z-index: 1; opacity: 0.8; border-radius: 17px;">
    <div
    v-if="isMainPanel"
        class="pro-map-panel"
      >
        <!-- Päis -->
        <div class="pro-map-panel__header">
          <div class="pro-map-panel__heading">
            <div class="pro-map-panel__heading-icon">
              <i class="fas fa-user-friends" />
            </div>

            <div>
              <h2 class="pro-map-panel__title">
                {{ t("clientAround.searchTitle") }}
              </h2>

              <p class="pro-map-panel__subtitle">
                {{ t("clientAround.searchHelp") }}
              </p>
            </div>
          </div>

          <div class="pro-map-panel__actions">
            <button
              type="button"
              class="pro-map-panel__icon-button"
              :title="t('clientAround.refresh')"
              @click="refreshMapState"
            >
              <i class="fa-solid fa-rotate-right" />
            </button>

            <button
              type="button"
              class="pro-map-panel__icon-button"
              :title="t('clientAround.collapsePanel')"
              @click="isMainPanel = false"
            >
              <i class="fa-solid fa-expand" />
            </button>

            <button
              type="button"
              class="pro-map-panel__icon-button pro-map-panel__icon-button--close"
              :title="t('clientAround.close')"
              @click="$router.go(-1)"
            >
              <i class="fa-solid fa-xmark" />
            </button>
          </div>
        </div>

        <!-- Aadress -->
        <div class="pro-map-panel__field">
          <label class="pro-map-panel__label">
            {{ t("clientAround.address") }}

            <span class="pro-map-panel__required">*</span>
          </label>

          <AddressAutocomplete
            v-model="address"
            v-model:valid="addressValid"
            :label="t('clientAround.address')"
            :error="addressError"
            @typing="onAddressInput"
            @place="onPlaceSelected"
          />
        </div>

        <!-- Amet -->
        <div class="pro-map-panel__field">
          <label class="pro-map-panel__label">
            {{ t("clientAround.select_profession") }}

            <span class="pro-map-panel__required">*</span>
          </label>

          <SelectProfession
            v-model="profession"
            :label="t('clientAround.select_profession')"
            :errors="{}"
            @change="changedProfession"
          />
        </div>

        <!-- Kaugus -->
        <div
          v-show="hasProfession"
          class="pro-map-panel__field"
        >
          <label class="pro-map-panel__label">
            {{ t("clientAround.search_distance") }}

            <span class="pro-map-panel__required">*</span>
          </label>

          <MDBSelect
            id="client-dist"
            v-model:selected="selectedRange"
            :options="rangeOptions"
            :label="t('clientAround.search_distance')"
            size="md"
            class="pro-map-panel__range"
          />
        </div>

        <!-- Tulemus puudub -->
        <div
          v-if="
            hasProfession &&
            selectedRange !== null &&
            selectedClientsCount === 0
          "
          class="pro-map-result pro-map-result--empty"
        >
          <div class="pro-map-result__icon">
            <i class="fa-solid fa-user-slash" />
          </div>

          <div>
            <p class="pro-map-result__title">
              {{ t("clientAround.no_clients_found") }}
            </p>

            <p class="pro-map-result__text">
              {{ t("clientAround.try_adjust_filters") }}
            </p>
          </div>
        </div>

        <!-- Kliendid leitud -->
        <div
          v-else-if="
            hasProfession &&
            selectedRange !== null &&
            selectedClientsCount > 0
          "
          class="pro-map-result pro-map-result--success"
        >
          <div class="pro-map-result__icon">
            <i class="fa-solid fa-users" />
          </div>

          <div>
            <p>
              {{ t("clientAround.found_clients_count", {
                count: selectedClientsCount
              }) }}
            </p>
            
          </div>
        </div>

        <!-- Footer -->
        <div class="pro-map-panel__footer pro-map-panel__footer--single">
          <button
            type="button"
            class="pro-map-panel__reset"
            @click="refreshMapState"
          >
            <i class="fa-solid fa-arrow-rotate-left" />
            {{ t("clientAround.refresh") }}
          </button>
        </div>

        <!-- <div class="pro-map-panel__footer">
          <button
            type="button"
            class="pro-map-panel__reset"
            @click="refreshMapState"
          >
            <i class="fa-solid fa-arrow-rotate-left" />

            {{ t("clientAround.refresh") }}
          </button>

          <MDBBtn
            color="primary"
            class="pro-map-panel__search"
            :disabled="
              !addressValid ||
              !hasProfession ||
              selectedRange === null
            "
            @click="showClientsOnMap"
          >
            <i class="fa-solid fa-magnifying-glass-location" />

            {{ t("clientAround.search") }}
          </MDBBtn>
        </div> -->
      </div>


    
    <MDBBtn
      v-else
      color="primary"
      class="open-panel-btn"
      @click="isMainPanel = true"
    >
      {{ t('clientAround.panel') }}
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
  <!-- Map -->
   <div id="map-container">
    <div v-if="!startPos && isLocating" class="spinner-overlay">
      <div class="spinner"></div>
    </div>

    <div v-else-if="!startPos && !isLocating" class="spinner-overlay">
      <div class="location-error-box">
        {{ t('clientAround.location_error') }}
      </div>
    </div>

    <div v-show="!!startPos" id="map"></div>

    <div v-if="!!startPos && isLocating" class="locating-badge">
      {{ t('clientAround.updating_location') }}
    </div>
  </div>
  
</div>

</template>
<script setup>
import {MDBIcon, MDBBtnClose, MDBInput, MDBBtn, MDBCheckbox, MDBSelect, MDBSpinner, MDBDateTimepicker, MDBModal, MDBModalHeader, MDBModalBody, MDBModalFooter, MDBToast} from 'mdb-vue-ui-kit';
import {loadGoogleMaps} from "@/components/controllers/loadGoogleMap.js";
import { useI18n } from 'vue-i18n';
import { ref, onMounted, watch, computed, reactive, nextTick } from 'vue';
import Select from 'primevue/select';
import proList from '@/components/controllers/professions'
import axios from 'axios';
import { storeToRefs } from 'pinia';
import { useClientStore } from '@/stores/recipientStore';
import { useLoginStore } from '@/stores/login';
import { useProStore } from '@/stores/providerStore';
import spinnerWorld from '@/assets/map.gif'
import ToastHandler from '../helpers/ToastHandler.vue';
import recipientService from '../../service/recipients';
import { useMapStore } from '@/stores/mapStore';
import AddressAutocomplete from '@/components/AddressAutocomplete.vue';
import SelectProfession from '@/components/helpers/SelectProfession.vue';

defineOptions({
  name: "client-around"
})

const mapStore = useMapStore();
const {t} = useI18n();
const clientStore = useClientStore();
const auth = useLoginStore();
const providerStore = useProStore();
const spinner_world = spinnerWorld;
const address = ref(null);
const isAddress = ref(false);
const selectedPlaceId = ref(null)
const selectedAddressComponents = ref([])
const isMainPanel = ref(true);
const selectedRange = ref(null);
const myLat = ref( null);
const myLng = ref(null);
const mapsError = ref(false);
const professions = proList;
const profession = ref(null);
const currentProfession = ref("");
const isMapLoaded = ref(false);

const panelError = ref("");

const addressValid = ref(false);
const selectedPlace = ref(null)
const addressError = ref("");

const isClients = ref(false);
const selectedClientsCount = ref(0);

const isMapReady = ref(false);
const geocoder = ref(null)

let userMarker = null;
let clientMarkers = [];

const { userPos, lastKnownPos, mapsReady, isLocating, locationError } = storeToRefs(mapStore);

const startPos = computed(() => userPos.value || lastKnownPos.value)

const rangeOptions = reactive([
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

let map = 0;
let lastMapState = {
  zoom: null,
  center: null,
};

function setRange(val) {
  selectedRange.value = val;
  rangeOptions.forEach(o => (o.selected = o.value === val));
}

watch(
  () => profession.value,
  () => {
    setRange(selectedRange.value);
  }
);

const hasProfession = computed(() => {
  if (!profession.value) return false;
  console.log("Profession value:", profession.value);
  // PrimeVue object case
  if (typeof profession.value === "object")
    return !!profession.value;

  // string case
  if (typeof profession.value === "string")
    return profession.value.trim() !== "";

  return false;
});

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

watch([profession, selectedRange, isMapLoaded], ([pro, dist, ready]) => {
  if (!ready) return;
  if (!pro || dist == null) return;
  
  const km = typeof dist === "object" ? dist.value : dist;
  showClientLocationOnTheMap(pro, km);
});

watch(hasProfession, (ok) => {
  if (!ok) {
    selectedRange.value = null;
    profession.value = null;
    //showClientLocationOnTheMap(profession.value, selectedRange.value);
    selectedRange.value = 1;
    updateMapDistance(
      map,
      { lat: myLat.value, lng: myLng.value },
      selectedRange.value
    );
  }
});

watch(
  () => profession.value,
  (newLabel, oldLabel) => {
    if (newLabel !== oldLabel) {
      //selectedRange.value = 0;
      if (selectedRange.value > 0) {
        showClientLocationOnTheMap(profession.value, selectedRange.value);
      }
    }
  }
);

watch(
  () => selectedRange.value,
  (newRange, oldRange) => {
    if (newRange !== oldRange) {
      console.log("Selected range changed to:", newRange);
      if (hasProfession.value && newRange > 0) {
        showClientLocationOnTheMap(profession.value, newRange);
      }
    }
  }
);

watch(selectedRange, (range) => {
  if (!range) return;

  updateMapDistance(
    map,
    { lat: myLat.value, lng: myLng.value },
    range
  );
});

const validateAddress = () => {

  if (!address.value) return;

  if (myLat.value === null || myLng.value === null) {
    console.log("Address is not valid, lat/lng missing");
    //addressError.value = "Valitse osoite listasta (ei pelkkää kirjoitusta)";
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

const onPlaceSelected = (place) => {
  selectedPlace.value = place;
  console.log("Place selected:", place);
  address.value = place.address;
  myLat.value = place.lat;
  myLng.value = place.lng;

  profession.value = null;
  selectedRange.value = 1;

  /* updateMapDistance(
    map,
    { lat: myLat.value, lng: myLng.value },
    selectedRange.value
  ); */

  addressError.value = "";

}

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

const starMarker = (color) => ({
  path: "M 0,-30 L 8,-10 L 30,-10 L 12,5 L 18,25 L 0,12 L -18,25 L -12,5 L -30,-10 L -8,-10 Z",
  fillColor: color,
  fillOpacity: 1,
  strokeColor: "black",
  strokeWeight: 2,
  scale: 0.6
});

const circleMarker = (color) => ({
  path: google.maps.SymbolPath.CIRCLE,
  fillColor: color,
  fillOpacity: 1,
  strokeColor: "#000",
  strokeWeight: 1,
  scale: 8
});

const handleMaps = async() => {
  try {
    await loadGoogleMaps();


    console.log("Map is inited in client around! ✅");
    userCurrentLocation();

    const input = document.getElementById("pro-input");

    console.log("pro-input element:", input, input?.tagName);

    const center = { lat: 50.064192, lng: -130.605469 };
    const defaultBounds = {
      north: center.lat + 0.1,
      south: center.lat - 0.1,
      east: center.lng + 0.1,
      west: center.lng - 0.1,
    };
    const options = {
      bounds: defaultBounds,
      componentRestrictions: { country: "fi" },
      fields: ["address_components", "geometry", "icon", "name", "formatted_address"],
      strictBounds: false,
    };
    const autocomplete = new google.maps.places.Autocomplete(input, options);

    autocomplete.addListener("place_changed", () => {
      let place = autocomplete.getPlace()
      myLat.value = place.geometry.location.lat();
      myLng.value = place.geometry.location.lng();

      console.log("Address xxxx " + place.formatted_address)
      console.log("place-----lat------" + myLat.value)
    });

    try {
      new google.maps.Map(document.getElementById("map"), {
        zoom: 13,
        center: new google.maps.LatLng(myLat.value, myLng.value),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        accuracy: 50,

      });
    } catch(err) {
      console.log("Error to load map: " + err.message);
    }

  } catch (err) {
    console.error('Google Maps failed to load ❌', err);
    mapsError.value = true;
  }
}

const initMap = (lat, lng) => {
  if (map) return map

  const el = document.getElementById('map')
  if (!el) throw new Error('Map container not found')

  map = new google.maps.Map(el, {
    center: { lat, lng },
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
  })

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

  const input = document.getElementById("pro-input")
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
      title: "" /* t('clientAround.your_location') */,
      icon: circleMarker('orange')
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

const clearClientMarkers = () => {
  clientMarkers.forEach(m => m.setMap(null));
  clientMarkers = [];
};

const addClientMarker = (client, inner_color, outer_color) => {
  const marker = new google.maps.Marker({
    position: {
      lat: Number(client.latitude),
      lng: Number(client.longitude)
    },
    map,
    title: ""/* t('clientAround.client_marker_title') + client.professional[0] */,
    /* icon: pinSymbol(inner_color, outer_color) */
    icon: starMarker('#E23C89')
  });

  clientMarkers.push(marker);
  return marker;
};

const userCurrentLocation =  () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      // Show a map centered at latitude / longitude.
      myLat.value = latitude
      myLng.value = longitude
      console.log("myLat " + latitude)
      showUserLocationOnTheMap (latitude, longitude)
    });
  }

}

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

// Kasutaja sihtkoht, otsitakse automaatselt
const showUserLocationOnTheMap = (latitude, longitude) => {
  try {

    console.log("Map is loading...")
    
    const el = document.getElementById('map');
    if (!el) throw new Error('Map container #map not found');
    if (!(el instanceof HTMLElement)) throw new Error('Map container is not an HTMLElement');

    if (!map) {
      map = new google.maps.Map(document.getElementById("map"), {
        zoom: 13,
        center: { lat: latitude, lng: longitude },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      });

      google.maps.event.addListenerOnce(map, "tilesloaded", () => {
        isMapLoaded.value = true;
      });
    }

    /* const spinner = document.getElementById("spinner");

    google.maps.event.addListenerOnce(map, 'tilesloaded', () => {
      console.log('tiles loaded');
      spinner.style.opacity = "0";
      setTimeout(() => spinner.style.display = "none", 400);
        isMapLoaded.value = true;
      }); */
  } catch(err) {
    console.log("Error to load map: " + err.message);
  }

  getAddressFrom (latitude, longitude)
}
// Siis kui sisestada käsitsi aadress
const getAddressFrom = (lat, long) => {
  axios.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat +
      "," + long
      + "&key=" + import.meta.env.VITE_APP_MAP_KEY)
      .then(response => {
        if (response.data.error_message) {
          console.log(response.data.error_message)
        } else {
          map = new google.maps.Map(document.getElementById("map"), {
            zoom: 13,
            center: new google.maps.LatLng(lat, long),
            mapTypeId: google.maps.MapTypeId.ROADMAP
          });

          address.value = response.data.results[1].formatted_address
        }

      })
      .catch(error => {
        console.log(error.message)
      })
}

const clearAddress = () => {
  isAddress.value = false;
  address.value = '';
}
const showClientLocationOnTheMap = async(profession, dist) => {

  const recipients = await recipientService.getRecipients()
  const activeRecipients = recipients.filter(client => client.status !== 'archived');
  if (recipients !== null) {
    otherUserLocations(recipients, profession, dist);
  }
}

const otherUserLocations = (recipients, profession, dist) => {

  if (!window.google || !window.google.maps) return
  if (!map) return
  if (myLat.value == null || myLng.value == null) return
 
  clearClientMarkers()
  
  console.log("Users count: " + recipients.length);
  console.log("Current distance " + dist)


  const activeRecipients = recipients.filter(
    recipient => recipient.status === "active"
  );

  let count = 0;
  const recipientCount = [];

  for (const recipient of activeRecipients) {
    const matchesProfession =
      recipient.professional?.includes(profession);

    if (!matchesProfession) {
      continue;
    }

    const distance = distanceBtw(
      myLat.value,
      myLng.value,
      recipient.latitude,
      recipient.longitude
    );

    if (!recipientCount.includes(recipient.user)) {
      recipientCount.push(recipient.user);
    }

    if (distance <= dist) {
      count++;
      addClientMarker(recipient, "green", "green");
    }
  }

  isClients.value = count > 0;
  selectedClientsCount.value = count;

}

const changedProfession = () => {
      console.log("Changed in pro " + profession.value);
      currentProfession.value = profession.value;
}

const refreshMapState = async() => {
  saveMapState();
  await showClientLocationOnTheMap(currentProfession.value, selectedRange.value);

  restoreMapState();
}

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

const distanceBtw = (originLat, originLng, destLat, destLng) => {
  var origin = new google.maps.LatLng(originLat, originLng);
  var destination = new google.maps.LatLng(destLat, destLng);
  return (google.maps.geometry.spherical.computeDistanceBetween(origin, destination) / 1000).toFixed(2);
}
</script>
<style scoped>

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
  bottom: 50px;
  z-index: 11;
  background: rgba(11, 22, 24, 0.85);
  color: white;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 13px;
}

.pro-map-panel {
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

  scrollbar-width: thin;
  scrollbar-color:
    rgba(139, 197, 202, 0.32)
    transparent;
}

.pro-map-panel::-webkit-scrollbar {
  width: 6px;
}

.pro-map-panel::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(139, 197, 202, 0.3);
}

/* Päis */

.pro-map-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;

  padding-bottom: 15px;
  margin-bottom: 17px;

  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.pro-map-panel__heading {
  display: flex;
  align-items: flex-start;
  min-width: 0;
  gap: 11px;
}

.pro-map-panel__heading-icon {
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

.pro-map-panel__title {
  margin: 1px 0 0;

  color: #f4f7f8;
  font-size: 17px;
  font-weight: 650;
  line-height: 1.25;
}

.pro-map-panel__subtitle {
  margin: 4px 0 0;

  color: rgba(219, 229, 234, 0.58);
  font-size: 12px;
  line-height: 1.4;
}

.pro-map-panel__actions {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 6px;
}

.pro-map-panel__icon-button {
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

.pro-map-panel__icon-button:hover {
  color: #ffffff;
  border-color: rgba(139, 197, 202, 0.42);
  background: rgba(95, 158, 160, 0.16);
  transform: translateY(-1px);
}

.pro-map-panel__icon-button--close:hover {
  color: #ffb1bb;
  border-color: rgba(255, 116, 132, 0.38);
  background: rgba(255, 92, 112, 0.12);
}

/* Väljad */

.pro-map-panel__field {
  width: 100%;
  margin-bottom: 15px;
}

.pro-map-panel__label {
  display: block;
  margin-bottom: 7px;

  color: #dfe8eb;
  font-size: 12px;
  font-weight: 600;
}

.pro-map-panel__required {
  margin-left: 2px;
  color: #ff8e9d;
}

/* AddressAutocomplete */

.pro-map-panel :deep(.field-wrapper) {
  width: 100%;
  margin: 0;
}

.pro-map-panel :deep(.input-group) {
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
}

.pro-map-panel :deep(.booking-input-wrapper) {
  flex: 1 1 auto;
  min-width: 0;
}

.pro-map-panel :deep(.form-outline) {
  width: 100%;
}

.pro-map-panel :deep(.form-control) {
  min-height: 43px;

  color: #edf3f5;
  border-color: #39495d;
  background: #182332;
}

.pro-map-panel :deep(.form-control:focus) {
  border-color: #72aeb2;
  box-shadow: 0 0 0 3px rgba(95, 158, 160, 0.14);
}

/* AddressAutocomplete nupp */

.pro-map-panel :deep(.input-group > button) {
  width: 50px;
  min-width: 50px;
  padding: 0 !important;

  border: 1px solid #39495d !important;
  border-left: 0 !important;
  border-radius: 0 9px 9px 0 !important;

  color: #91c9cd !important;
  background: rgba(95, 158, 160, 0.09) !important;

  box-shadow: none !important;
}

/* SelectProfession */

.pro-map-panel :deep(.p-select) {
  width: 100%;
  min-height: 43px;

  color: #edf3f5;
  border: 1px solid #39495d;
  border-radius: 9px;
  background: #182332;

  box-shadow: none;
}

.pro-map-panel :deep(.p-select:hover) {
  border-color: rgba(139, 197, 202, 0.62);
}

.pro-map-panel :deep(.p-select.p-focus),
.pro-map-panel :deep(.p-select.p-inputwrapper-focus) {
  border-color: #72aeb2;
  box-shadow: 0 0 0 3px rgba(95, 158, 160, 0.14);
}

.pro-map-panel :deep(.p-select-label) {
  display: flex;
  align-items: center;

  min-height: 41px;
  padding: 9px 12px;

  color: #edf3f5;
  font-size: 13px;
}

.pro-map-panel :deep(.p-select-label.p-placeholder) {
  color: rgba(218, 227, 232, 0.42);
}

.pro-map-panel :deep(.p-select-dropdown) {
  color: #86bdc1;
}

/* MDB kauguse select */

.pro-map-panel__range {
  width: 100%;
}

.pro-map-panel :deep(.select-wrapper) {
  width: 100%;
}

.pro-map-panel :deep(.select-input) {
  min-height: 43px;

  color: #edf3f5;
  border-color: #39495d;
  background: #182332;
}

/* Tulemus */

.pro-map-result {
  display: flex;
  align-items: center;
  gap: 11px;

  padding: 12px 13px;
  margin: 3px 0 15px;

  border-radius: 11px;
}

.pro-map-result__icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 37px;
  height: 37px;
  flex: 0 0 37px;

  border-radius: 10px;

  font-size: 15px;
}

.pro-map-result__title {
  margin: 0;

  font-size: 13px;
  font-weight: 650;
}

.pro-map-result__text {
  margin: 3px 0 0;

  font-size: 11px;
  line-height: 1.4;
}

.pro-map-result__count {
  margin: 2px 0 0;

  font-size: 20px;
  font-weight: 700;
  line-height: 1;
}

/* Tulemust pole */

.pro-map-result--empty {
  border: 1px solid rgba(244, 174, 92, 0.24);
  color: #eec28d;
  background: rgba(226, 146, 53, 0.09);
}

.pro-map-result--empty .pro-map-result__icon {
  color: #efbd82;
  background: rgba(226, 146, 53, 0.14);
}

.pro-map-result--empty .pro-map-result__text {
  color: rgba(238, 194, 141, 0.72);
}

/* Kliendid leitud */

.pro-map-result--success {
  border: 1px solid rgba(76, 175, 125, 0.25);
  color: #a6dfbd;
  background: rgba(63, 151, 105, 0.1);
}

.pro-map-result--success .pro-map-result__icon {
  color: #a6dfbd;
  background: rgba(63, 151, 105, 0.16);
}

.pro-map-result--success .pro-map-result__count {
  color: #c0edcf;
}

/* Footer */

/* .pro-map-panel__footer {
  display: grid;
  grid-template-columns: auto minmax(160px, 1fr);
  align-items: center;
  gap: 11px;

  padding-top: 15px;
  margin-top: 4px;

  border-top: 1px solid rgba(255, 255, 255, 0.08);
} */

.pro-map-panel__footer--single {
  display: flex;
  justify-content: flex-end;
}

.pro-map-panel__reset {
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

.pro-map-panel__reset:hover {
  color: #ffffff;
  background: rgba(95, 158, 160, 0.13);
}

.pro-map-panel__search {
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

.pro-map-panel__search:disabled {
  opacity: 0.5;
  box-shadow: none;
}

/* Mobiil */

@media (max-width: 768px) {
  .pro-map-panel {
    position: fixed;
    top: auto;
    right: 10px;
    bottom: calc(120px + env(safe-area-inset-bottom));
    left: 10px;

    width: auto;
    max-height: min(
      78dvh,
      calc(100dvh - 90px)
    );

    padding: 15px;
    border-radius: 17px;
  }

  .pro-map-panel__subtitle {
    display: none;
  }

  .pro-map-panel__footer {
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
    -webkit-backdrop-filter: blur(15px);
  }
}

@media (max-width: 440px) {
  .pro-map-panel__heading-icon {
    display: none;
  }

  .pro-map-panel__title {
    font-size: 16px;
  }

  .pro-map-panel__actions {
    gap: 4px;
  }

  .pro-map-panel__icon-button {
    width: 32px;
    height: 32px;
  }

  .pro-map-panel__footer {
    grid-template-columns: 1fr;
  }

  .pro-map-panel__reset {
    order: 2;
  }
}





.hideSelect {
  display: none;
}
.spinner img{
  display:block;
  width:100%;
  height:auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
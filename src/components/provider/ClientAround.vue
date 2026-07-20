<template>
    
  
<div id="map-container">
  <div  style="position: relative; z-index: 1; opacity: 0.8; border-radius: 17px;">
    <div v-if="isMainPanel" class="pro-map-panel">
      
      <div style="display: flex; justify-content: space-between;">
        <p style="cursor: pointer; color: burlywood;" @click="refreshMapState">{{ t('clientAround.refresh') }}</p>
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
      
      <div  style="width: 100%;" class="field-wrapper ">
        <div  class="input-group">
          <MDBInput
              size="sm"
              v-model="address"
              :label="t('clientAround.address')"
              id="pro-input"
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

      <div class="proselect-wrapper">
        <div>
          <Select
              style="width: 100%;"
              v-model="profession"
              @change="changedProfession"
              :options="professions"
              filter optionLabel="label"
              optionGroupLabel="label"
              optionGroupChildren="items"
              :placeholder="t('clientAround.select_profession')"
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
        </div>
      </div>
      
      <div v-show="hasProfession" style="margin-top: 13px;">
        <MDBSelect size="md" v-model:selected="selectedRange" :options = rangeOptions :label="t('clientAround.search_distance')" id="client-dist"/>
      </div>
      
      <!-- <div v-if="isClients" style="display: flex; justify-content: center; margin: 13px 0 0 0;">
        <p class=" semibold"> {{ t('clientAround.found_clients') }} - {{ selectedClientsCount }}</p>
      </div>
      <div v-else-if="!isClients && selectedRange" style="display: flex; justify-content: center; margin: 13px 0 0 0;">
        <p>No clients</p>
      </div> -->

      <div
        v-if="hasProfession && selectedRange !== null && selectedClientsCount === 0"
        class="empty-clients"
      >
        <p class="empty-title">
          {{ t('clientAround.no_clients_found') }}
        </p>
        <p class="empty-text">
          {{ t('clientAround.try_adjust_filters') }}
        </p>
      </div>
      <div 
        v-else-if="hasProfession && selectedRange !== null && selectedClientsCount > 0"
        class="has-clients"
      >
        <p class="client-info"> {{ t('clientAround.found_clients') }} - {{ selectedClientsCount }}</p>
      </div>
      
        
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
  () => profession.value?.label,
  () => {
    setRange(0);          // reset to 0 km
  }
);

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
  if (!pro?.label || dist == null) return;
  
  const km = typeof dist === "object" ? dist.value : dist;
  showClientLocationOnTheMap(pro.label, km);
});

watch(hasProfession, (ok) => {
  if (!ok) {
    selectedRange.value = null;
    profession.value = null;
    showClientLocationOnTheMap(profession.value, selectedRange.value);
    updateMapDistance(
    map,
    { lat: myLat.value, lng: myLng.value },
    1
  );
  }
});

watch(
  () => profession.value?.label,
  (newLabel, oldLabel) => {
    if (newLabel !== oldLabel) {
      selectedRange.value = 0;   // default distance
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

    const spinner = document.getElementById("spinner");

    // Add listeners only on defined targets
    google.maps.event.addListenerOnce(map, 'tilesloaded', () => {
      console.log('tiles loaded');
      spinner.style.opacity = "0";
      setTimeout(() => spinner.style.display = "none", 400);
        isMapLoaded.value = true;
      });
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

  //let count = 0;
  /* if (recipients.filter(client => client.status === 'active').length > 0) {
    let recipientCount = [];
    for (let pos = 0; pos < recipients.filter(client => client.status === 'active').length; pos++) {
      console.log("Client professions - ", recipients[pos].professional)
      console.log("ZZZZZZZZZ " + profession + " -- " + recipients[pos].header)

      if (recipients[pos].professional[0] === profession) {
        console.log("YES ")
      }
      recipients[pos].professional.forEach(prof => {
        if (prof === profession) {
          console.log("Distance btw " + distanceBtw(myLat.value, myLng.value, recipients[pos].latitude, recipients[pos].longitude));
          console.log("---------")
          if (!recipientCount.includes(recipients[pos].user))
            recipientCount.push(recipients[pos].user);

          if (distanceBtw(myLat.value, myLng.value, recipients[pos].latitude, recipients[pos].longitude) <= dist) {
            count ++;
            console.log("XXXXXX")
            addClientMarker(recipients[pos], 'green', 'green');
            
          }
        }
      })

    }

    if (count > 0) {
      isClients.value = true;
      console.log("There are some recipients")
    } else {
      isClients.value = false;
      console.log("There are not any recipient")
    }
    selectedClientsCount.value = count;
  } */

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
      console.log("Changed in pro " + profession.value?.label);
      currentProfession.value = profession.value?.label;
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
  /* background-color: #1B2330; */
  background-color: #35322e;
  border-radius: 7px;
  padding: 10px;
  margin: 60px 27px 0 0;
  width: 30%;
  float: right;
}

.proselect-wrapper {
  margin-bottom: 11px;
}

.open-panel-btn {
  position: absolute; 
  opacity: 0.8; 
  top: 60px; 
  left: 80%; 
  z-index: 2;
}

/* Info about find clients */
.empty-clients {
  margin-top: 13px;
  padding: 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  color: #f3f4f6;
  text-align: left;
}

.empty-title {
  /* margin: 0 0 4px; */
  font-weight: 600;
}

.has-clients {
  margin-top: 13px;
  padding: 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  color: #f3f4f6;
  text-align: left;
}
.client-info {
  /* margin: 0 0 4px; */
  font-weight: 600;
}

.empty-text {
  margin: 0;
  font-size: 0.9rem;
  color: #d1d5db;
}

@media only screen and (max-width: 1000px) {
  .pro-map-panel {
    background-color: #1B2330;
    padding: 10px;
    margin: 60px auto;
    width: 80%;
    float: none;
  }
  .open-panel-btn {
  position: absolute; 
  opacity: 0.8; 
  top: 60px; 
  left: 65%; 
  z-index: 2;
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
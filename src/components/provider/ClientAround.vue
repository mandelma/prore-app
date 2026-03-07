<template>
    
  
<div id="map-container">
  <div  style="position: relative; z-index: 1; opacity: 0.8; border-radius: 17px;">
    <!-- v-if="isMainPanel" -->
    <div v-if="isMainPanel" class="pro-map-panel">
      
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
      
      <div  style="width: 100%;" class="field-wrapper ">
        <div  class="input-group">
          <MDBInput
              size="sm"
              v-model="address"
              label="Osoitteeni"
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
              placeholder="Valitse ammattisi *"
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

      
      <div v-show="hasProfession">
        <MDBSelect  size="md" v-model:selected="selectedRange" :options = rangeOptions label="Etsi etäisyys" id="client-dist"/>
      </div>
      
      <div v-if="isClients" style="display: flex; justify-content: center;">
        {{ selectedClientsCount }}
      </div>
      
        
    </div>
    
    <MDBBtn
      v-else
      color="primary"
      class="open-panel-btn"
      @click="isMainPanel = true"
    >
      Paneeli
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
  <div id="map"></div>
  <!-- Spinner -->
  <div id="spinner" class="spinner-overlay">
    <div class="spinner"><img :src="spinner_world" alt="from_map" /></div>
  </div>
</div>

</template>
<script setup>
import {MDBIcon, MDBBtnClose, MDBInput, MDBBtn, MDBCheckbox, MDBSelect, MDBSpinner, MDBDateTimepicker, MDBModal, MDBModalHeader, MDBModalBody, MDBModalFooter, MDBToast} from 'mdb-vue-ui-kit';
import {loadGoogleMaps} from "@/components/controllers/loadGoogleMap.js";
import { ref, onMounted, watch, computed, reactive } from 'vue';
import Select from 'primevue/select';
import proList from '@/components/controllers/professions'
import axios from 'axios';
import { useClientStore } from '@/stores/recipientStore';
import { useLoginStore } from '@/stores/login';
import { useProStore } from '@/stores/providerStore';
import spinnerWorld from '@/assets/map.gif'
import ToastHandler from '../helpers/ToastHandler.vue';
import recipientService from '../../service/recipients';

defineOptions({
  name: "client-around"
})

const clientStore = useClientStore();
const auth = useLoginStore();
const providerStore = useProStore();
const spinner_world = spinnerWorld;
const address = ref(null);
const isAddress = ref(false);
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

let map;
let lastMapState = {
  zoom: null,
  center: null,
};

//const hasProfession = computed(() => !!profession.value?.label);

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

/* watch(isMapLoaded, (ready) => {
  if (ready) {
    console.log("Ready? " + ready)
    watch(selectedRange, (newVal) => {
      console.log("Dist is changed ", newVal);
      showClientLocationOnTheMap(profession.value.label, newVal)
    }, { immediate: true })
  }
}) */

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

onMounted (async () => {
  await handleMaps();
})

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
      //types: ["establishment"],
    };
    const autocomplete = new google.maps.places.Autocomplete(input, options)
    //const autocomplete = client.places.Autocomplete(input, options);

    autocomplete.addListener("place_changed", () => {
      let place = autocomplete.getPlace()
      myLat.value = place.geometry.location.lat();
      myLng.value = place.geometry.location.lng();

      // getAddressFrom(place.geometry.location.lat(), place.geometry.location.lng())
      //address.value = place.formatted_address;
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
// Kasutaja sihtkoht, otsitakse automaatselt
const showUserLocationOnTheMap = (latitude, longitude) => {
  try {

    console.log("Map is loading...")
    
    const el = document.getElementById('map');
    if (!el) throw new Error('Map container #map not found');
    if (!(el instanceof HTMLElement)) throw new Error('Map container is not an HTMLElement');

    // 3) Create the map only once, then add listeners
    //const map = new google.maps.Map(el, { center: {lat: 60.17, lng: 24.94}, zoom: 12 });
    map = new google.maps.Map(document.getElementById("map"), {
      zoom: 13,
      center: new google.maps.LatLng(latitude, longitude),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      accuracy: 50,

    });

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

    // 4) Add listeners only on defined targets
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
  //const client = new Client({});
  axios.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat +
      "," + long
      + "&key=" + import.meta.env.VITE_APP_MAP_KEY)
      .then(response => {
        if (response.data.error_message) {
          //this.error = response.data.error_message;

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
        //this.error = error.message
        console.log(error.message)
      })
}

const clearAddress = () => {
  isAddress.value = false;
  address.value = '';
}
const showClientLocationOnTheMap = async(profession, dist) => {


  const recipients = await recipientService.getRecipients()
  if (recipients !== null) {
    otherUserLocations(recipients, profession, dist);
  }
}

const otherUserLocations = (recipients, profession, dist) => {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 9,
    center: new google.maps.LatLng(myLat.value, myLng.value),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });
  
  console.log("Users count: " + recipients.length);
  console.log("Current distance " + dist)
  // new google.maps.Marker({
  //   position: new google.maps.LatLng(this.myLat, this.myLng),
  //   accuracy: 50,
  //   map: map,
  //   icon: this.pinSymbol('yellow'),
  //   label: { color: '#00aaff', fontWeight: 'bold', fontSize: '14px', text: 'Olen tällä' }
  // })

  let count = 0;
  if (recipients.length > 0) {
    let recipientCount = [];
    for (let pos = 0; pos < recipients.length; pos++) {

      //console.log("Client latitude: " + recipient[pos].latitude)
      //console.log("Client longitude: " + recipient[pos].longitude)

      recipients[pos].professional.forEach(prof => {
        if (prof === profession) {
          //this.countOfSelectedClient++;0,2
          console.log("Distance btw " + distanceBtw(myLat.value, myLng.value, recipients[pos].latitude, recipients[pos].longitude));
          //this.isActiveClients = true;
          // Removing same user bookings with same profeccional to display only one user
          if (!recipientCount.includes(recipients[pos].user))
            recipientCount.push(recipients[pos].user);

          //count = recipientCount.length;



          if (distanceBtw(myLat.value, myLng.value, recipients[pos].latitude, recipients[pos].longitude) <= dist) {
            //count ++;
            count = recipientCount.length;
            /* new google.maps.Marker({
              position: new google.maps.LatLng(recipients[pos].latitude, recipients[pos].longitude),
              map: map
            }) */

            new google.maps.Marker({
              position: new google.maps.LatLng(recipients[pos].latitude, recipients[pos].longitude),
              accuracy: 50,
              map: map,
              title: "Tarvitaan " + recipients[pos].professional[0],
              //icon: pinSymbol('orange', 'darkorange'),
              label: { color: '#f79859',  fontWeight: 'bold', fontSize: '11px', text: "Tarvitaan " + recipients[pos].professional[0]}
            })
          }

        }
      })

    }

    if (count > 0) {
      //this.isActiveClients = true;
      isClients.value = true;
      console.log("There are some recipients")
    } else {
      //this.isActiveClients = false;
      isClients.value = false;
      console.log("There are not any recipient")
    }
    selectedClientsCount.value = count;
    //this.countOfSelectedClients = count;
    //this.identifyClientText();
    //console.log("Count " + this.countOfSelectedClients)

  }

}

const changedProfession = () => {
      console.log("Changed in pro " + profession.value.label);
      currentProfession.value = profession.value.label;
      //isDistSelection.value = true;
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

/* #map-container {
  width: 100%;
}

#map {
  position: absolute;
  top: 60px;
  right: 0;
  bottom: 50px;
  left: 0;
} */

#map-container{
  
  position: relative;     /* needed for overlay + absolute map */
  width: 100%;
  height: calc(100vh - 110px);  /* or any fixed height like 500px */
  overflow: hidden;
}

#map{
  position: absolute;
  inset: 0;               /* replaces top/right/bottom/left */
}

.pro-map-panel {
  background-color: #1B2330;
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

/* Overlay spinner */
/* .spinner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #0b1618;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
} */

/* .spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #ccc;
  border-top-color: #4285f4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
} */

/* .spinner {
  width: 37px;
} */

.spinner-overlay{
  position: absolute;
  inset: 0;
  background: #0b1618;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.spinner{
  width: 57px;
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
<template>
 
  <div>
    
    <div  style="position: relative; z-index: 1; opacity: 0.8; border-radius: 10px;">
      
      <div v-if="isMainPanel" class="client-map-panel">
        
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

        <!--format: 'YYYY-MM-DD'-->
        <div  :class="{hideDistSelectPanel: !isDistSelection}">
          <p style="text-align: left;">Valitse kiinnostavaa ajankohta tai heti!</p>
          <div class="distSelectPanel">

            <div class="field-wrapper">
              <MDBDateTimepicker
                  size="lg"
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

            isDateNow {{ isDateNow }}
            date {{ showDt }}

            <div style="margin-top: 15px;">
              <MDBCheckbox
                  label="Heti!"
                  name="selection"
                  v-model="isDateNow"
                  value="true"
                  @click="removeDateIfExist"
                  wrapperClass="mb-4"
              />
            </div>

            dt {{ dt }}

          </div>


        </div>
        
        <MDBSelect size="sm" white v-model:selected="selectedRange" :options = rangeOptions label="Etsi alue" id="distance"/>
          
      </div>
      <!--Displaying when no main panel open-->
      <MDBBtn
        v-else
        color="primary"
        style="position: absolute; opacity: 0.8; top: 60px; left: 80%; z-index: 2;"
        @click="isMainPanel = true"
      >
        Paneeli
      </MDBBtn>
      
    </div>

    /* <div style="position: relative; z-index: 1; opacity: 0.8; border-radius: 10px;">
      <HandleToast 
      v-model="toastModel"
      :toast-name="toastState"
      :icon-state="toastIcon"
      :text="toastContent"
    />
    </div> */
    

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
        <MDBModalHeader>
          <h2>{{ onProvider.pName }}</h2>
        </MDBModalHeader>
        <MDBModalBody>
          <p>Tällä - {{ onProvider.pName }} - tiedot...</p>
          <request-form  
            v-if="target.id !== providerId"
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
    
    <div id="map"></div>
    <div id="spinner" class="spinner-overlay">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script setup>
// const props = defineProps({
//   lat: { type: Number, required: true },
//   lng: { type: Number, required: true },
// });
import {MDBIcon, MDBBtnClose, MDBInput, MDBBtn, MDBCheckbox, MDBSelect, MDBSpinner, MDBDateTimepicker, MDBModal, MDBModalHeader, MDBModalBody, MDBModalFooter, MDBToast} from 'mdb-vue-ui-kit';
import { ref, onMounted, watch } from 'vue';
import Select from 'primevue/select';
import proList from '@/components/controllers/professions'
//import { Loader } from "@googlemaps/js-api-loader"; // official way
import axios from 'axios';
import {loadGoogleMaps} from "@/components/controllers/loadGoogleMap.js";
import providerService from '@/service/providers'
import match from '@/components/controllers/compare_dt'
import { useClientStore } from '@/stores/recipientStore';
import { useLoginStore } from '@/stores/login';
import { useProStore } from '@/stores/providerStore';
import ToastHandler from '../helpers/ToastHandler.vue';
import RequestForm from './RequestForm.vue';
import { storeToRefs } from 'pinia';

//import { useMapStore } from '@/stores/mapStore';
//const location = useMapStore();
defineOptions({
  name: "pro-around"
})

const address = ref(null);
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
const countOfSelectedProfessional = ref(null);
const reInitKey = ref(0);
const dt = ref(null);
const showDt = ref(null);
const target = ref(null);
const handleMatch = match;
const visibleProCount = ref(0);
const isDateNow = ref(false);
const displayProPanel = ref(false);

const onProvider = ref(null);
const isRequestSent = ref(false);
const rs_success_msg = ref("");


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

const getCurrentPosition = async() => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation not supported");
    }
    navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => reject(err)
    );
  });
}

/* watch(selectedRange, (newVal) => {
  console.log("Dist is changed ", newVal);
  
  showClientLocationOnTheMap(currentProfession.value, newVal);

}) */

watch(isMapLoaded, (ready) => {
  if (ready) {
    console.log("Ready? " + ready)
    watch(selectedRange, (newVal) => {
      console.log("Dist is changed ", newVal);
      showClientLocationOnTheMap(profession.value.label, newVal)
    }, { immediate: true })
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

const handleMaps = async() => {
  try {
    await loadGoogleMaps();


    console.log("Map is inited in pro around! ✅");
    userCurrentLocation();

    const input = document.getElementById("client-input");

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
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 13,
      center: new google.maps.LatLng(latitude, longitude),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      accuracy: 50,

    });

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


  // new google.maps.Marker({
  //   position: new google.maps.LatLng(latitude, longitude),
  //   accuracy: 50,
  //   map: map,
  //   icon: this.pinSymbol('yellow'),
  //   label: { color: '#00aaff', fontWeight: 'bold', fontSize: '14px', text: 'Olen tällä' }
  // })


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
          const map = new google.maps.Map(document.getElementById("map"), {
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
  let prev_infowindow = false;

  let map = new google.maps.Map(document.getElementById("map"), {
    zoom: 11,
    center: new google.maps.LatLng(myLat.value, myLng.value),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });
  console.log("Users count: " + providers.length)
  console.log("Current distance " + dist)
  let date;
  if (dt.value) {
    console.log("Booking date 2 " + new Date(dt.value));
    date = new Date(dt.value);
  }

  let count = 0;

  if (providers.length > 0) {
    //this.target = {};

    for (let pos = 0; pos < providers.length; pos++) {
      console.log("-----Firma------- " + providers[pos].pName);
      
      let myLatLong = [myLat.value, myLng.value];

      providers[pos].profession.forEach(prof => {
        if (prof === profession) {



          //his.providers.push(providers[pos])
          console.log("Pro " + prof)
          let providerLatLng = [providers[pos].latitude, providers[pos].longitude];
          console.log("Distance btw " + distanceBtw(myLat.value, myLng.value, providers[pos].latitude, providers[pos].longitude));

          //distance.theDist()

          //this.countOfSelectedClient++;
          //this.isActiveProffs = true;

          if (distanceBtw(myLat.value, myLng.value, providers[pos].latitude, providers[pos].longitude) <= dist) {
            count ++;

            let marker;
            
            // text: "Saatavilla!"
            if (providers[pos].isAvailable24_7) {
              marker = new google.maps.Marker({
                position: new google.maps.LatLng(providers[pos].latitude, providers[pos].longitude),
                accuracy: 50,
                map: map,
                title: providers[pos].yritys,
                icon: this.pinSymbol('seagreen', 'darkgreen'),
                label: { color: 'green',  fontWeight: 'bold', fontSize: '14px', }
              })
            } else {
              if (providers[pos].timetable.length > 0) {
                providers[pos].timetable.map(time => {
                  console.log("Date: " + time.start)
                  console.log("Fitting datetime: " +
                      handleMatch.providerMatchingForClient(
                          date,
                          time.start,
                          time.end
                      )

                  )


                  if (handleMatch.providerMatchingForClient(
                      date,
                      time.start,
                      time.end
                  ) || providers[pos].isAvailable24_7) {

                    marker = new google.maps.Marker({
                      position: new google.maps.LatLng(providers[pos].latitude, providers[pos].longitude),
                      accuracy: 50,
                      map: map,
                      title: providers[pos].pName,
                      icon: pinSymbol('seagreen', 'darkgreen'),
                      //label: { color: '#79f759',  fontWeight: 'bold', fontSize: '14px', text: "Saatavilla!"}
                    })
                  } else {

                    marker = new google.maps.Marker({
                      position: new google.maps.LatLng(providers[pos].latitude, providers[pos].longitude),
                      accuracy: 50,
                      map: map,
                      title: providers[pos].pName,
                      icon: pinSymbol('orange', 'darkorange'),
                      //label: { color: '#f79859',  fontWeight: 'bold', fontSize: '14px', text: "Sovitaessa!"}
                    })

                  }
                })
              } else {
                marker = new google.maps.Marker({
                  position: new google.maps.LatLng(providers[pos].latitude, providers[pos].longitude),
                  accuracy: 50,
                  map: map,
                  title: providers[pos].pName,
                  icon: pinSymbol('orange', 'darkorange'),
                  //label: { color: '#f79859',  fontWeight: 'bold', fontSize: '14px', text: "Sovitaessa!"}
                })
              }
            }

            window.myGlobalFunction = this && this.openMarker
              ? this.openMarker.bind(this)
              : (idx) => handleSelectedPro(providers[idx])//console.log('openMarker fallback', idx);

            const infowindow = new google.maps.InfoWindow();

            /* const infowindow = new google.maps.InfoWindow({
              content: `
                <div class="custom-info">
                  <div style="display: flex; justify-content: right;">
                    <button id="custom-close">×</button>
                  </div>
                  
                  <h3>My Place</h3>
                  <p>Hello world!</p>
                  
                </div>
                `
            }); */

            // hide Google’s built-in close button when ready
            infowindow.addListener("domready", () => {
              const closeBtn = document.querySelector(".gm-ui-hover-effect");
              if (closeBtn) closeBtn.style.display = "none";

              document
                .getElementById("custom-close")
                ?.addEventListener("click", () => infowindow.close());
            });

            marker.addListener('click', () => {
              console.log('POOOOS', pos);
              const p = pos; // snapshot if this is inside a loop

              if (prev_infowindow) prev_infowindow.close();
              prev_infowindow = infowindow;

              infowindow.setContent(
                
                `
                <div class="custom-info">
                  <div style="display: flex; justify-content: right;">
                    <button id="custom-close">×</button>
                  </div>
                  
                  <h3>My Place</h3>
                  <p>Hello world!</p>
                  <div>
                  <p style="color: green;">${providers[p].pName}</p>
                  <p style="color: red;" onclick="myGlobalFunction(${p})">Tiedot</p>
                </div>
                </div>
                `
              );

              // Newer signature is safe and avoids oddities
              infowindow.open({
                anchor: marker,
                map,
                shouldFocus: false
              });
            });

          }

        }
      })

    }

    visibleProCount.value = count;

    if (count > 0) {
      console.log("Pro count existing...");
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

const showClientLocationOnTheMap = async(profession, range) => {

  console.log("Current distance herexx  ")
  const providers = await providerService.getProviders()
  if (providers) {
    otherUserLocations(providers, profession, range);
    /* if (!window.google) {
      this.otherUserLocations(providers, profession, range);
    } else {
      this.otherUserLocations(providers, profession, range);
    } */

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
    status: "pending",
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

onMounted (async () => {
  //await displayPosition();
  await handleMaps();

})

const showAddress = () => {
  isAddress.value = true;
  //userCurrentLocation();
  //getAddressFrom (myLat.value, myLng.value);
}
const clearAddress = () => {
  isAddress.value = false;
  address.value = '';
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

</script>

<style scoped>
.client-map-panel {
  background-color: #1B2330;
  border-radius: 10px;
  padding: 10px;
  margin: 60px auto;
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


#map-container {
  /* position: relative; */
  width: 100%;
  /* height: 500px; */
}

#map {
  /* width: 100%;
  height: 100%; */

  position: absolute;

  top: 60px;
  right: 0;
  bottom: 50px;
  left: 0;
}

/* Overlay spinner */
.spinner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #0b1618; /* your background color while map loads */
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

/* .hideMainPanel {
  display: none;
} */

</style>
<template>
  <div>
    <div style="position: relative; z-index: 1; opacity: 0.8; border-radius: 10px;">
      <div :class="{hideMainPanel: !isMainPanel}" class="client-map-panel">
        <div style="display: flex; justify-content: right;">
          <MDBIcon size="lg" style="padding: 10px;" @click="closeMainPanel">
            <i class="fas fa-expand-arrows-alt"></i>
          </MDBIcon>
          <div>
            <MDBBtnClose
                white
                style=" padding: 10px;"
                size="lg"
                @click="$router.go(-1)"
            />
          </div>

        </div>
        <p v-if="!isNoAddressGiven" style="color: red;">Anna osoittesi!</p>

        <div :class="{hideClientInput: !address && isAddress}" style="width: 100%;" class="field-wrapper ">
          <div  class="input-group">
            <MDBInput
                size="lg"
                v-model="address"
                label="Anna osoite"
                id="client-input"
                placeholder=""
                wrapperClass="form-outline flex-grow-3"
                :inputClass="'ps-0'"
                aria-describedby="button-addon2"
            />
            <MDBBtn type="button" style="border:1px solid #ddd">
              <MDBIcon size="2x" @click="address ? clearAddress() : showAddress()">
                <i :class="address ? 'fas fa-times' : 'fas fa-search-location'"></i>
              </MDBIcon>
            </MDBBtn>
          </div>
        </div>
        <!-- overlay spinner, not removing input -->
        <div v-show="!address && isAddress"
             style="text-align: center; "

        >
          <MDBSpinner grow color="info" />
        </div>

<!--        <div id="address-panel">-->

<!--          <MDBInput-->
<!--              white-->
<!--              inputGroup-->
<!--              label="Anna toinen osoitteesi kun ei täsmää"-->
<!--              v-model="address"-->
<!--              id="autocomplete"-->
<!--              size="lg"-->
<!--              wrapperClass="mb-4"-->
<!--          >-->
<!--            <MDBBtnClose v-if="address" white style="float: right; margin-right: 7px; margin-top: 5px;" @click="clearOrderAddress"/>-->
<!--          </MDBInput>-->

<!--        </div>-->

        <div class="field-wrapper">
          <div>
            <Select
                style="width: 100%;"
                v-model="profession"
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
                  <!--              <img :alt="slotProps.value.label" src="https://primefaces.org/cdn/primevue/images/flag/flag_placeholder.png" :class="`mr-2 flag flag-${slotProps.value.code.toLowerCase()}`" style="width: 18px" />-->

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


        <div  :class="{hideDistSelectPanel: !isDistSelection}">
          <p style="text-align: left;">Valitse kiinnostavaa ajankohta tai heti!</p>
          <div class="distSelectPanel">


<!--            <VueDatePicker-->
<!--                style="margin-bottom: 20px; width: 70%; padding: 7px;"-->
<!--                v-model="bookingDate"-->
<!--                dark-->
<!--                :min-date="new Date()"-->
<!--                teleport-center-->
<!--                @internal-model-change="handleInternalDate"-->
<!--                @update:model-value="handleDate"-->
<!--                :state="isNoDate ? false : null"-->
<!--            >-->

<!--            </VueDatePicker>-->
            <div style="margin-top: 15px;">
              <MDBCheckbox
                  label="Heti!"
                  name="selection"
                  v-model="isSelectNotNow"
                  value="true"
                  @click="removeDateIfExist"
                  wrapperClass="mb-4"
              />
            </div>

          </div>


        </div>

        <MDBSelect white v-model:options = rangeOptions label="Etsi alue"/>


        <p
            v-if="prof && isPressedFindBtn"
            :class="{noClients: isActiveProffs}"
            style="color: palevioletred;"
        >
          Ei ammattilaisia vielä!
        </p>

      </div>
    </div>
    <div id="map"></div>
  </div>
</template>

<script setup>
// const props = defineProps({
//   lat: { type: Number, required: true },
//   lng: { type: Number, required: true },
// });
import {MDBIcon, MDBBtnClose, MDBInput, MDBBtn, MDBCheckbox, MDBSelect, MDBSpinner} from 'mdb-vue-ui-kit';
import { ref, onMounted } from 'vue';
import Select from 'primevue/select';
import proList from '@/components/controllers/professions'
//import { Loader } from "@googlemaps/js-api-loader"; // official way
import axios from 'axios';
import {loadGoogleMaps} from "@/components/controllers/loadGoogleMap.js";
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

const handleMaps = async() => {
  try {
    await loadGoogleMaps();
    console.log("Map is inited in pro around! ✅");
    userCurrentLocation();


    // const selectDistance = document.getElementById
    // ("distance");



    // selectDistance.addEventListener("change", (event) => {
    //   this.distBtw = parseFloat(event.target.value);
    //   this.stateActive = true;
    //   const data = {
    //     profession: this.currentProfession,
    //     distance: parseFloat(event.target.value)
    //   }
    //
    // })

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
    new google.maps.Map(document.getElementById("map"), {
      zoom: 13,
      center: new google.maps.LatLng(latitude, longitude),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      accuracy: 50,

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

          // AIzaSyBDA2EBoGezJx51wQtxoW3Ecq5Ql8CCAiE

          address.value = response.data.results[1].formatted_address
        }

      })
      .catch(error => {
        //this.error = error.message
        console.log(error.message)
      })
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
  background-color: #2b2a2a;
  padding: 10px;
  margin: auto;
  width: 30%;
  float: right;
}

@media only screen and (max-width: 1000px) {
  #address-panel {
    display: none !important;
  }
  .client-map-panel {
    background-color: #2b2a2a;
    padding: 10px;
    margin: auto;
    width: 80%;
    float: none;
  }
}
.hideClientInput {
  display: none;
}
#map {
  background:  url(/src/assets/map.gif)  no-repeat center center;

}

#map {
  position: absolute;

  top: 60px;
  right: 0;
  bottom: 50px;
  left: 0;
}
</style>
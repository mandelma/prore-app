<template>
  <div>
    <div id="map"></div>
  </div>
</template>

<script setup>
// const props = defineProps({
//   lat: { type: Number, required: true },
//   lng: { type: Number, required: true },
// });
import { ref, onMounted } from 'vue';
import { Loader } from "@googlemaps/js-api-loader"; // official way
import axios from 'axios';
//import { useMapStore } from '@/stores/mapStore';
//const location = useMapStore();
const address = ref(null);
const myLat = ref(location.lat || null);
const myLng = ref(null);

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

const displayPosition = async() => {
  try {
    // 1. Get user’s location first
    const coords = await getCurrentPosition();

    // 2. Load Google Maps
    const loader = new Loader({
      apiKey: import.meta.env.VITE_APP_MAP_KEY,
      version: "weekly",
    });
    await loader.load();

    // 3. Initialize map with user’s location
    const map = new google.maps.Map(document.getElementById("map"), {
      center: coords,
      zoom: 15,
    });

    // 4. Add marker
    new google.maps.Marker({
      position: coords,
      map,
      title: "You are here",
    });
  } catch (err) {
    console.error("Geolocation error:", err);
    // fallback if location not available
    await new Loader({ apiKey: import.meta.env.VITE_APP_MAP_KEY });
    const google = await loader.load();
    new google.maps.Map(document.getElementById("map"), {
      center: { lat: 0, lng: 0 }, // fallback center
      zoom: 2,
    });
  }
}

// function initMap() {
//   // 1. Create the map
//   map = new google.maps.Map(document.getElementById("map"), {
//     center: { lat: 40.748817, lng: -73.985428 },
//     zoom: 13,
//   });
//
//   // 2. Create a marker
//   new google.maps.Marker({
//     position: { lat: 40.748817, lng: -73.985428 },
//     map: map, // pass the map instance
//     title: "My Marker",
//   });
// }
//
// // Load Google Maps script dynamically
// function loadGoogleMaps(apiKey) {
//   return new Promise((resolve) => {
//     if (window.google && window.google.maps) {
//       resolve();
//       return;
//     }
//     const script = document.createElement("script");
//     script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
//     script.async = true;
//     script.defer = true;
//     script.onload = resolve;
//     // window.initMap = () => {
//     //   resolve();
//     // };
//     document.head.appendChild(script);
//   });
// }

// async function getLocation() {
//   if (!navigator.geolocation) {
//     alert("Geolocation is not supported by your browser");
//     return;
//   }
//
//   navigator.geolocation.getCurrentPosition(async (pos) => {
//     const lat = pos.coords.latitude;
//     const lng = pos.coords.longitude;
//
//     // Update map center
//     map.setCenter({ lat, lng });
//     map.setZoom(15);
//
//     // Place marker
//     new google.maps.Marker({
//       position: { lat, lng },
//       map,
//       title: "You are here",
//     });
//
//     // Reverse geocode
//     const geocoder = new google.maps.Geocoder();
//     geocoder.geocode({ location: { lat, lng } }, (results, status) => {
//       if (status === "OK" && results[0]) {
//         console.log("ADDRESS NEW - " + results[0].formatted_address,)
//         location.value = {
//           lat,
//           lng,
//           address: results[0].formatted_address,
//         };
//       } else {
//         location.value = { lat, lng, address: "Address not found" };
//       }
//     });
//   });
// }

onMounted (async () => {
  await displayPosition();

})

// const userCurrentLocation = () => {
//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(position => {
//       const { latitude, longitude } = position.coords;
//       // Show a map centered at latitude / longitude.
//       myLat.value = latitude
//       myLng.value = longitude
//       console.log("myLat " + latitude)
//       showUserLocationOnMap (latitude, longitude)
//     });
//   }
// }

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

// const showUserLocationOnMap = (latitude, longitude) => {
//   try {
//     new google.maps.Map(document.getElementById("map"), {
//       zoom: 13,
//       center: new google.maps.LatLng(latitude, longitude),
//       mapTypeId: google.maps.MapTypeId.ROADMAP,
//       accuracy: 50,
//
//     });
//
//     new google.maps.Marker({
//       position: new google.maps.LatLng(latitude, longitude),
//       accuracy: 50,
//       map: map,
//       icon: pinSymbol('yellow'),
//       label: { color: '#00aaff', fontWeight: 'bold', fontSize: '14px', text: 'Olen tällä' }
//     })
//   } catch(err) {
//     console.log("Error to load map: " + err.message);
//   }
//
//
//
//   getAddressFrom (latitude, longitude)
// }

const getAddressFrom = (lat, long) => {
  axios.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat +
      "," + long
      + "&key=" + import.meta.env.VITE_APP_MAP_KEY)
      .then(response => {
        if (response.data.error_message) {
          //this.error = response.data.error_message;

          console.log("Response error message - " + response.data.error_message)
        } else {
          // const map = new google.maps.Map(document.getElementById("map"), {
          //   zoom: 13,
          //   center: new google.maps.LatLng(lat, long),
          //   mapTypeId: google.maps.MapTypeId.ROADMAP
          // });

          address.value = response.data.results[1].formatted_address
        }

      })
      .catch(error => {
        //this.error = error.message
        console.log("Error message - " + error.message)
      })
}
defineOptions({
  name: "pro-around"
})
</script>

<style scoped>
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
<template>
  <div>
    <div class="controls">
      <label>
        <input type="checkbox" v-model="follow" />
        Follow my location
      </label>
      <button @click="stopWatch" v-if="watchId !== null">Stop</button>
      <span v-if="error" class="error">{{ error }}</span>
    </div>
    <div id="map" class="map"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { Loader } from "@googlemaps/js-api-loader";
const API_KEY = import.meta.env.VITE_APP_MAP_KEY;
defineOptions({
  name: "follow-user-position"
})
const follow = ref(true);
const watchId = ref(null);
const error = ref("");
let map, marker, path; // google maps objects
let firstFix = false;

const onPositionUpdate = (pos) => {
  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;
  //const latLng = { lat, lng };
  const latLng = new google.maps.LatLng(lat, lng);

  // init map once
  if (!map) {
    map = new google.maps.Map(document.getElementById("map"), {
      center: latLng,
      zoom: 16,
      mapTypeControl: false,
      streetViewControl: false,
    });
    marker = new google.maps.Marker({
      position: latLng,
      map,
      title: "You are here",
    });

    // (optional) draw a breadcrumb trail of movement
    path = new google.maps.Polyline({
      map,
      path: [latLng],
      strokeOpacity: 0.9,
      strokeWeight: 3,
    });

    firstFix = true;
    return;
  }

  // update marker + trail
  marker.setPosition(latLng);
  const p = path.getPath();
  p.push(latLng);

  // follow mode keeps camera centered
  if (follow.value) {
    // For the first fix after map exists, a gentle pan. Later updates: smooth pan.
    if (firstFix) {
      map.setCenter(latLng);
      firstFix = false;
    } else {
      map.panTo(latLng);
    }
  }
}
const onPositionError = () => {
  error.value = err.message || "Geolocation error";
  // If map not created yet, fall back to a neutral view
  if (!map) {
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 0, lng: 0 },
      zoom: 2,
    });
  }
}
const startWatch = () => {
  if (!("geolocation" in navigator)) {
    onPositionError({ message: "Geolocation not supported by this browser." });
    return;
  }
  // High-accuracy with throttling via maximumAge
  watchId.value = navigator.geolocation.watchPosition(
      onPositionUpdate,
      onPositionError,
      {
        enableHighAccuracy: true,
        maximumAge: 5000, // reuse a fix up to 5s old
        timeout: 10000,
      }
  );
}
const stopWatch = () => {
  if (watchId.value !== null) {
    navigator.geolocation.clearWatch(watchId.value);
    watchId.value = null;
  }
}

onMounted(async () => {
  await new Loader({ apiKey: API_KEY, version: "weekly" }).load(); // loads Maps
  startWatch();
});

onBeforeUnmount(() => {
  stopWatch();
  if (marker) marker.setMap(null);
  if (path) path.setMap(null);
  map = null;
  marker = null;
  path = null;
});
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
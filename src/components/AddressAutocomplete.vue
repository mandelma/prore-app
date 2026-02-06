<template>

    <!-- <p style="color:cornflowerblue;">{{ provider?.address }}</p> -->
    <MDBInput
        size="md"
        id="el"
        placeholder=""
        label="Anna uusi osoitteesi..."
        v-model="localValue"
    />

    <small v-if="error" class="text-danger">{{ error }}</small>
</template>

<script setup>
    import { MDBInput } from 'mdb-vue-ui-kit'
    import { ref, watch, nextTick, onMounted, onBeforeUnmount } from "vue"
    import { loadGoogleMaps } from "./controllers/loadGoogleMap"

    const props = defineProps({ modelValue: String, label: String })
    const emit = defineEmits(["update:modelValue", "place"])

    const localValue = ref(props.modelValue ?? "")
    const mapError = ref(false);

    watch(() => props.modelValue, v => (localValue.value = v ?? ""))

    onMounted(() => {
        initMap();
    });

    const initMap = async() => {
      mapError.value = false;
      try {
        await loadGoogleMaps();
        console.log("Map is inited in proMain! ✅");
        const center = { lat: 50.064192, lng: -130.605469 };
        // Create a bounding box with sides ~10km away from the center point
        const defaultBounds = {
          north: center.lat + 0.1,
          south: center.lat - 0.1,
          east: center.lng + 0.1,
          west: center.lng - 0.1,
        };

        const input = document.getElementById("el");

        const options = {
          bounds: defaultBounds,
          componentRestrictions: { country: "fi" },
          fields: ["address_components", "geometry", "icon", "name", "formatted_address"],
          strictBounds: false,
          //types: ["establishment"],
        };
        const autocomplete = new google.maps.places.Autocomplete(input, options);
        // const autocomplete = client.places.autocomplete(input, options);

        autocomplete.addListener("place_changed", () => {
          let place = autocomplete.getPlace()
          

          if (!place.geometry) {
            selectedPlace.value = null;
            return;
          }

        const payload = {
            address: place.formatted_address,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
        }

        emit("update:modelValue", payload.address)
        emit("place", payload)

          console.log(place)
        })
      } catch (err) {
        console.error('Google Maps failed to load ❌', err);
        mapError.value = true;
        /* mapToastModel.value = true;
        mapToastState.value = 'danger';
        mapToastIcon.value = 'fas fa-check fa-lg me-2';
        mapToastContent = 'Internet yhteys puuttuu!'; */
      }
    }


    /* onBeforeUnmount(() => {
    if (placeListener) placeListener.remove()
    placeListener = null
    autocomplete = null
    }) */
</script>

<style scoped>
/* if the dropdown hides behind your UI */
:global(.pac-container) {
  z-index: 99999 !important;
}
</style>

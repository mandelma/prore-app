<template>
  <!-- <MDBInput
    size="md"
    id="el"
    placeholder=""
    :label="label"
    v-model="localValue"
    @input="onUserInput"
  /> -->
  <div div :class="{hideInput: !localValue && isDisplayAddress}" style="width: 100%;" class="field-wrapper ">
    
    <div  class="input-group">
      <div class="booking-input-wrapper">
        <MDBInput
          size="md"
          id="el"

          v-model="localValue"
          :label="label"
          placeholder=""
          wrapperClass="form-outline flex-grow-3"
          :inputClass="'ps-0'"
          aria-describedby="button-addon2"
          @input="onUserInput"
        />
        <span class="booking-required-corner">*</span>
      </div>
      
      <MDBBtn type="button" style="border:1px solid #ddd">
        <MDBIcon size="2x" @click="localValue ? clearAddress() : showAddress()">
          <i :class="localValue ? 'fas fa-times' : 'fas fa-search-location'"></i>
        </MDBIcon>
      </MDBBtn>
      
    
    
    </div>
    
    <small
      v-if="error"
      class="field__error"
    >
      <i class="fa-solid fa-circle-exclamation" />
      {{ error }}
    </small>
  </div>
  <div 
    v-show="!localValue && isDisplayAddress"
    style="text-align: center; padding-bottom: 27px;"
  >
    <MDBSpinner grow color="info" />
  </div>
  
</template>

<script setup>
import { MDBInput, MDBIcon, MDBBtn, MDBSpinner } from "mdb-vue-ui-kit";
import {
  ref,
  watch,
  nextTick,
  onMounted
} from "vue";
import { loadGoogleMaps } from "./controllers/loadGoogleMap";
import axios from "axios";

const props = defineProps({
  modelValue: {
    type: String,
    default: ""
  },
  label: {
    type: String,
    default: ""
  },
  error: {
    type: String,
    default: ""
  }
});

const emit = defineEmits([
  "update:modelValue",
  "update:valid",
  "update:error",
  "typing",
  "place"
]);

const isDisplayAddress = ref(false);
const localValue = ref(props.modelValue);
const mapToastError = ref("");
const mapError = ref(false);

const latLocal = ref(null);
const lngLocal = ref(null);

/*
 * Tõene siis, kui väärtus muutub Google'i valiku tõttu,
 * mitte kasutaja käsitsi kirjutamise tõttu.
 */
const selectingGooglePlace = ref(false);

watch(
  () => props.modelValue,
  value => {
    if (value === localValue.value) {
      return;
    }

    localValue.value = value ?? "";
  }
);


function onUserInput(event) {
  const value = event?.target?.value ?? localValue.value;

  emit("update:modelValue", value);
  emit("update:valid", false);
  emit("typing", value);
}



const myCurrentLocation = () => {
  if (!navigator.geolocation) {
    console.error("Geolocation ei ole selles brauseris toetatud.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      latLocal.value = coords.latitude;
      lngLocal.value = coords.longitude;

      showClientLocationData(coords.latitude, coords.longitude);
    },
    (error) => {
      console.error("Asukoha lugemine ebaõnnestus:", error.message);
    }
  );
};

const showClientLocationData = async (lat, lng) => {
  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          latlng: `${lat},${lng}`,
          key: import.meta.env.VITE_APP_MAP_KEY,
        },
      }
    );

    if (response.data.error_message) {
      console.error(response.data.error_message);
      return;
    }

    const result = response.data.results?.[0];

    if (!result) {
      console.error("Aadressi ei leitud");
      return;
    }

    const place = {
      address: result.formatted_address,
      lat,
      lng,
      googlePlace: result,
    };

    localValue.value = place.address;

    emit("update:modelValue", place.address);
    emit("update:valid", true);
    emit("place", place);
  } catch (error) {
    console.error(error);
  }
};


const showAddress = () => {
  isDisplayAddress.value = true;
  myCurrentLocation();
  emit("update:valid", false);
};

const clearAddress = () => {
  localValue.value = "";
  isDisplayAddress.value = false;
  emit("update:modelValue", "");
  emit("update:valid", false);
  emit("update:error", "");
};

onMounted(() => {
  initMap();
});

const initMap = async () => {
  mapError.value = false;

  try {
    await loadGoogleMaps();

    const center = {
      lat: 60.1699,
      lng: 24.9384
    };

    const defaultBounds = {
      north: center.lat + 0.1,
      south: center.lat - 0.1,
      east: center.lng + 0.1,
      west: center.lng - 0.1
    };

    const input = document.getElementById("el");

    if (!input) {
      console.error("Address input was not found.");
      return;
    }

    const options = {
      bounds: defaultBounds,
      componentRestrictions: {
        country: ["fi", "se"]
      },
      fields: [
        "address_components",
        "geometry",
        "name",
        "formatted_address"
      ],
      strictBounds: false
    };

    const autocomplete =
      new google.maps.places.Autocomplete(
        input,
        options
      );

    autocomplete.addListener(
      "place_changed",
      async () => {
        const place = autocomplete.getPlace();

        if (
          !place.geometry ||
          !place.formatted_address
        ) {
          emit("update:valid", false);
          return;
        }

        const payload = {
          address: place.formatted_address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };

        /*
         * Blokeeri typing-event enne localValue muutmist.
         */
        selectingGooglePlace.value = true;

        localValue.value = payload.address;
        latLocal.value = payload.lat;
        lngLocal.value = payload.lng;

        emit("update:valid", true);
        emit("place", payload);

        /*
         * Oota, kuni Vue on modelValue muudatuse ära töödelnud.
         */
        await nextTick();

        selectingGooglePlace.value = false;
      }
    );
  } catch (error) {
    console.error(
      "Google Maps failed to load:",
      error
    );

    mapError.value = true;
    mapToastError.value =
      "Internet-yhteys puuttuu.";
  }
};
</script>

<style scoped>
/* if the dropdown hides behind UI */
:global(.pac-container) {
  z-index: 99999 !important;
}
.hideInput {
  display: none;
}

.input-group {
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
}

.booking-input-wrapper {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
}

.booking-input-wrapper :deep(.form-outline) {
  width: 100%;
  height: 100%;
}

.booking-required-corner {
  position: absolute;
  top: 5px;
  right: 10px;
  z-index: 20;

  color: #ff5d6c;
  font-size: 17px;
  font-weight: 700;
  line-height: 1;

  pointer-events: none;
}
</style>

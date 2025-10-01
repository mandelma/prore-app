import { defineStore } from 'pinia';
import { ref, onMounted, computed } from 'vue';
import axios from "axios";

export const useMapStore = defineStore('g_map', () => {
    const lat = ref(0);
    const lng = ref(null);
    const address = ref("");
    const input = document.getElementById("location");

    /* Getters */
    const location = computed(() => !!lat.value);

    onMounted(() => {
        getLocation()
    })
    const getLocation = (MAP_KEY) => {
        clientCurrentLocation(MAP_KEY);
        const center = { lat: 50.064192, lng: -130.605469 };
        // Create a bounding box with sides ~10km away from the center point
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
        const autocomplete = new google.maps.places.Autocomplete(input, options);
        // const autocomplete = client.places.autocomplete(input, options);

        autocomplete.addListener("place_changed", () => {
            let place = autocomplete.getPlace()
            lat.value = place.geometry.location.lat()
            lng.value = place.geometry.location.lng()

            address.value = place.formatted_address
            console.log(place)
        })
    }

    const clientCurrentLocation = async (MAP_KEY) => {
        if (navigator.geolocation) {
            await navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                // Show a map centered at latitude / longitude.
                lat.value = latitude
                lng.value = longitude
                console.log("Latitude is: " + lat.value);
                showClientLocationData (latitude, longitude, MAP_KEY);
            });
        }
    }
    const showClientLocationData = (lat, long, MAP_KEY) => {
        axios.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat +
            "," + long
            + "&key=" + MAP_KEY)
            .then(response => {
                if (response.data.error_message) {
                    //this.error = response.data.error_message;

                    console.log(response.data.error_message)
                } else {
                    address.value = response.data.results[1].formatted_address;
                    console.log("Address now " + address.value);
                }

            })
            .catch(error => {
                //this.error = error.message
                console.log(error.message)
            })
    }
    return { lat, lng, address, location, getLocation }
})
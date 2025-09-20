import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useMapStore = defineStore('g_map', () => {
    const lat = ref(0);
    const lng = ref(0);
    const myAddress = ref("");

    const setLocation = (latitude, longitude, address) => {
        lat.value = latitude;
        lng.value = longitude;
        myAddress.value = address;
    }

    return { lat, lng, myAddress, setLocation };
})
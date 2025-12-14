import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const useCalendarStore = defineStore('message', () => {
    const user = ref(null);

    return { user };
});


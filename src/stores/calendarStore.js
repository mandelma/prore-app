import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const useCalendarStore = defineStore('calendar', () => {
    const user = ref(null);

    return { user };
});


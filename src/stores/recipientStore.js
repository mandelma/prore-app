import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useLoginStore} from "@/stores/login.js";
import clientService from '../service/recipients.js'

export const useClientStore = defineStore('client', () => {
    const clientAuth = useLoginStore();
    const bookings = ref([])
    const count = ref(null)
    const isLoading = ref(false)
    const error = ref("" || null)

    const isBookings = computed(() => !!count.value)
    const orderList = async(id) => {
        isLoading.value = true;
        error.value = null;
        try {
            const orders = await clientService.getOwnBookings(id);
            const list = orders ? orders : [];
            bookings.value = list
            count.value = list.length;
            return list;
        } catch (error) {
            error.value = error.message;
            bookings.value = [];
            count.value = 0;
            throw error;
        } finally {
            isLoading.value = false;
        }
    }

    return { bookings, isBookings, count, isLoading, error, orderList };
})
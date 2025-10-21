import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useLoginStore} from "@/stores/login.js";
import clientService from '../service/recipients.js'

export const useClientStore = defineStore('client', () => {
    //const clientAuth = useLoginStore();
    const bookings = ref([])
    const count = ref(null)
    const isLoading = ref(false)
    const clientError = ref("" || null)

    const isBookings = computed(() => !!count.value)

    const createBooking = (booking) => {
        bookings.value.push(booking);
        count.value = bookings.value.length;
    }
    // const addBookingVisitor = (bId, visitor) => {
    //     const index = bookings.value.findIndex(inx => inx.id === bId);
    //     bookings.value[index].visitor.push(visitor);
    // }
    const orderList = async(id) => {
        isLoading.value = true;
        clientError.value = null;
        try {
            const orders = await clientService.getOwnBookings(id);
            const list = orders ? orders : [];
            bookings.value = list
            count.value = list.length;
            return list;
        } catch (error) {
            clientError.value = error.message;
            bookings.value = [];
            count.value = 0;
            throw error;
        } finally {
            isLoading.value = false;
        }
    }
    const addOffer = async(bId, offer) => {
        console.log("Added order to booking id - " + bId);
        //await clientService.createOffer(offer);
        const index = bookings.value.findIndex(inx => inx.id === bId);
        const offeredBooking = bookings.value[index];
        
        const editedBookings = bookings.value.map(booking => booking.id);
        
    }

    return { createBooking, addOffer, bookings, isBookings, count, isLoading, clientError, orderList };
})
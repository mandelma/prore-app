import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useLoginStore} from "@/stores/login.js";
import clientService from '../service/recipients.js';
import providerService from '../service/providers.js';
import noteService from '../service/notifications.js';
import offerService from '../service/offers.js';
import socket from '@/socket';
import { useRouter } from 'vue-router';

export const useClientStore = defineStore('client', () => {
    //const clientAuth = useLoginStore();
    const bookings = ref([])
    const count = ref(null)
    const bookingsWithOffers = ref(null);
    const clientOffers = ref([]);
    const clientNewOffers = ref([]);
    const isLoading = ref(false)
    const clientError = ref("" || null);
    const router = useRouter();

    const isBookings = computed(() => !!count.value)
    const clientNewOffersAmount = computed(() => clientNewOffers.value.length);
    const clientConfirmed = computed(() => bookings.value.filter(order => order.status === 'confirmed') || []);
    
    const confirmedOffer = 0
    const getBookingById = (id) => {
        const booking = bookings.value.find(b => b.id === id);

        return booking;
    }
    const getOfferById = (offerId) => {
        return clientOffers.value.find(co => co.id === offerId);
    }

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

            //const bookingsIncludeOffers = list.filter(bl => bl.offers.length > 0);
            //const offers = bookingsIncludeOffers.map(b => b.offers.filter(item => item.isNewOffer));
            //clientNewOffers.value = offers;

            const bookingOffers = list.reduce((acc, booking) => {
                const offerList = booking.offers;
                return acc.concat(offerList);
            }, [])

            clientOffers.value = bookingOffers;

            const newOffers = list.reduce((acc, booking) => {
                const newOfferList = booking.offers.filter(o => o.isNewOffer);
                return acc.concat(newOfferList);
            }, []);

            clientNewOffers.value = newOffers;
            
            bookings.value = list;
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
    const getProviderOffer = async(bId, offer) => {
        console.log("Added order to booking id - " + bId);
        //await clientService.createOffer(offer);
        const index = bookings.value.findIndex(inx => inx.id === bId);
        const offeredBooking = bookings.value[index];
        offeredBooking.offers.push(offer);
        offeredBooking.offer = offer;
        const editedBookings = bookings.value.map(booking => booking.id === bId ? offeredBooking : booking);
        bookings.value = editedBookings;
        upsertClientOffers(offer);
    }
    const upsertClientOffers = (offer) => {
        //const booking = bookings.value.find(b => b.id === offer.bookingID);
        //booking.offers.push(offer);
        //const updatedBookingsList = bookings.value.map(item => item.id === offer.bookingID ? booking : item);
        clientOffers.value = [...clientOffers.value, offer];
        clientNewOffers.value = [...clientNewOffers.value, offer];
    }
    const readOffer = async(offer) => {
        await offerService.editStatus(offer.id, {isNewOffer: false});
        const handleStatus = clientNewOffers.value.filter(cno => cno.id !== offer.id);
        clientNewOffers.value = handleStatus;

        const updatedBookings = bookings.value.map(b => ({
            ...b,
            offers: b.offers.map(o => 
                o.id === offer.id ? {...o, isNewOffer: false} : o
            )
        }))

        bookings.value = updatedBookings;
    }

    const confirmOffer = async (offer) => {
        await clientService.updateRecipientStatus(offer.bookingID, {status: 'confirmed'});
        await clientService.addConfirmedOffer(offer.bookingID, offer);
        const changedStatus = bookings.value.map(order => order.id === offer.bookingID ? {...order, status: 'confirmed'} : order);
        bookings.value = changedStatus;
        socket.emit('client-handle-offer', offer.sender, offer.bookingID, offer.id);
    }

    const handleConfirmedOffer = async (bookingId, _offer) => {
       // const _Offer = await offerService.addOffer(newContent);
        const bookingsEdited = bookings.value.map(booking => booking.id === bookingId ? {...booking, status: 'confirmed', offer: _offer} : booking);
        bookings.value = bookingsEdited;
        
    }

    const removeConfirmedMapOffer = async (booking) => {
        //await clientService.removeBooking(bookingId);
        
        // Add remove booking accessories like pictures etc.
        bookings.value = bookings.value.filter(item => item.id !== booking.id);
        if (bookings.value.length < 1) router.push('/');

    }

    // Client sending request to the provider via map
    const onRequest = async(receiver, userId, proId, request) => {
        console.log("Data in rec store " + receiver)
        const newRequest = await clientService.addRecipient(userId, request);

        if (!newRequest) return;
        
        const bookingId = newRequest.id;
        const handleClient = await clientService.addProviderData(bookingId, proId);
        const handlePro = await providerService.addProviderBooking(proId, bookingId);

        if (!handleClient || !handlePro) return;
        
        console.log("Created request id: " + bookingId);

        socket.emit("client made request", receiver, bookingId);

        bookings.value.push(newRequest);
        count.value = bookings.value.length;

        router.push('client-panel');
    }

    const testOffers = () =>{
        // Just a sample array.
        const bookings = [
            {
                id: '123',
                name: "One",
                offers: [
                    {
                        id: 'aaa',
                        name: "Offer1",
                        isNew: true
                    }
                ]
            },
            {
                id: '1234',
                name: "Two",
                offers: [
                    {
                        id: 'bbb',
                        name: "Offer2",
                        isNew: false
                    }
                ]
            },
            {
                id: '123456',
                name: "Four",
                offers: []
            },
            {
                id: '12345',
                name: "Three",
                offers: [
                    {
                        id: 'ccc',
                        name: "Offer3",
                        isNew: true
                    },
                    {
                        id: 'abc',
                        name: "Offer4",
                        isNew: false
                    }
                ]
            },
        ]
    }

    return { createBooking, 
        getProviderOffer, 
        readOffer, 
        getOfferById, 
        bookings, 
        getBookingById, 
        confirmOffer, 
        onRequest,
        handleConfirmedOffer,
        removeConfirmedMapOffer,
        clientOffers, 
        clientNewOffers, 
        clientNewOffersAmount, 
        clientConfirmed,
        isBookings, 
        count, 
        isLoading, 
        clientError, 
        orderList };
})
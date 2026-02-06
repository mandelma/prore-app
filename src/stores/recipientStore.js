import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useLoginStore} from "@/stores/login.js";
import { storeToRefs } from 'pinia';

import providerService from '../service/providers.js';
import noteService from '../service/notifications.js';
import { useNotificationStore } from './notificationStore.js';
import offerService from '../service/offers.js';
import clientService from '../service/recipients.js';
import uploadService from '../service/awsUploads.js'
import socket from '@/socket';
import { useRouter } from 'vue-router';

export const useClientStore = defineStore('client', () => {
    
    const clientAuth = useLoginStore();
    const { user } = storeToRefs(clientAuth);
    const notificationStore = useNotificationStore();
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
    const liveBookings = computed(() => bookings.value.filter(booking => booking.status !== 'confirmed') || []);
    
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
        await clientService.removeBooking(booking.id);
        
        // Add -- remove booking accessories like pictures, offers etc.
        bookings.value = bookings.value.filter(item => item.id !== booking.id);
        //socket.emit("client remove map booking", booking.id);
        if (bookings.value.length < 1) router.push('/');

    }

    const removeProRejectedMapOffer_ls = async (offerId) => {
        bookings.value = bookings.value.filter(item => item.id !== offerId);
        await clientService.removeBooking(offerId);
        //socket.emit("client remove map booking", booking.id);
        //if (bookings.value.length < 1) router.push('/');
    }

    const onRemovePublicBooking = async (bookingId) => {
        //TODO all including contents neet to have removed with booking
        const booking = bookings.value.find(b => b.id === bookingId);
        const bOffers = booking.offers;
        const bGetters = booking.ordered;
        const notification = {
            bookingId: bookingId,
            isNewMsg: true,
            isLink: false,
            title: 'Tilaus on poistettu!',
            content: `Käyttäjä ${user.value.firstName} on peruuttanut tilauksen "${booking.header}".`,
            reason: '',
            sender: "xxx",
        }
        if (bOffers.length) {
            
            for (let offer of bOffers) {
                const receiver = offer.sender;
                const created = await noteService.createMessage(receiver, notification);
                if (created) notification.id = created.id;
                await notificationStore.clientPublicBookingDelNotification(receiver, bookingId, notification);
            }
            await offerService.deleteBookingOffers(bookingId);
        } else {
            for (let pro of bGetters) {
                // notification currently not send id no offer done.
                console.log("Pro user id -- " + pro.user.id);
                const addressaat = pro.user.id;
                socket.emit('on-client-del-public-booking', addressaat, bookingId);
            }
        }
        
        bookings.value = bookings.value.filter(item => item.id !== bookingId);
        count.value = bookings.value.length;
        await clientService.removeBooking(bookingId);
    }

    const localRemovePublicBooking = async (id) => {
        bookings.value = bookings.value.filter(item => item.id !== id);
    }

    // Client sending request to the provider via map
    const onRequest = async(receiver, userId, pro, user, request) => {
        console.log("Data in rec store " + receiver)
        const newRequest = await clientService.addRecipient(userId, request);

        if (!newRequest) return;
        
        const bookingId = newRequest.id;
        const handleClient = await clientService.addProviderData(bookingId, pro.id);
        const handlePro = await providerService.addProviderBooking(pro.id, bookingId);

        console.log("USER -- " + user.username);

        newRequest.ordered.push(pro);
        newRequest.user = user;

        if (!handleClient || !handlePro) return;
        
        console.log("Created request id: " + bookingId);
        

        socket.emit("client made request", receiver, bookingId);

        bookings.value.push(newRequest);
        count.value = bookings.value.length;

        router.push('client-panel');
    }

    const updateMain = async (bookingId, payload) => {
        console.log("Booking id " + bookingId);
        //const photoIds = (payload?.photos || []).map(ph => ph.id).filter(Boolean);
        await clientService.updateMain(bookingId, payload);
        
        /* for (const id of photoIds) {
            await clientService.addImage(bookingId, id);
        } */
        
        /* const main = bookings.value.find(b => b.id === bookingId);
        if (main) {
            main.photos = payload.photos;        // [{id, imageUrl}]
            main.description = payload.description;
            main.date = payload.date;
        }

        console.log("Removed photo ids - ", payload.removedPhotoIds); */

        //await uploadService.deleteImages(payload.removedPhotoIds);

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
        liveBookings,
        getBookingById, 
        confirmOffer, 
        removeProRejectedMapOffer_ls,
        onRequest,
        handleConfirmedOffer,
        removeConfirmedMapOffer,
        onRemovePublicBooking,
        localRemovePublicBooking,
        updateMain,
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
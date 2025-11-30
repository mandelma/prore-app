import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import providerService from '../service/providers.js';
import offerService from '../service/offers.js';
import timetableService from '../service/timetable.js';
import socket from '@/socket'
import clientService from "@/service/recipients.js";
import { useRouter } from 'vue-router';

export const useProStore = defineStore("pro", () => {
    const router = useRouter();
    const loading = ref(false);
    const provider = ref(null);
    const providerId = ref(null);
    //const isIncomingOffers = ref(null);
    const incomingOffers = ref([]);
    //const isNewIncomingOffers = ref();
    //const newOffersAmount = ref(0);
    const incomingOffersCount = ref(incomingOffers.value.length)
    const proCalendarEvents = ref([]);
    const proTimetable = ref([]);
    const isProStateLoading = ref(false)
    const proCredit = ref(0)
    const proError = ref("" || null)
    const addOfferError = ref("" || null);

    const isUserPro = computed(() => !!provider.value);
    const isIncomingOffers = computed(() => incomingOffersCount.value > 0);
    const newOffersAmount = computed(() => incomingOffers.value.filter(io => !io.visitors.includes(providerId.value)).length)
    //const proTimetable = computed(() => provider.timetable);

    const getIncomOfferById = (id) => {
        return incomingOffers.value.find(o => o.id === id);;
    }


    //const newOffersAmount = computed(() => incomingOffers.value.filter(io => io.visitors.includes(providerId.value))).length
    const createPro = (created) => {
        provider.value = created;
    }
    const addVisitorForBooking = (bId, offer) => {
        const index = incomingOffers.value.findIndex(inx => inx.id === bId);
        incomingOffers.value[index].visitors.push(offer.visitor);
    }
    const getProState = async(id) => {
        isProStateLoading.value = true;
        proError.value = null;
        try {
            const proObj = await providerService.getProvider(id);
            const pro = proObj ? proObj : null;
            if (pro) {
                providerId.value = pro.id;
                const incoming_offers_list = pro.proposal ? pro.proposal : [];
                provider.value = pro;
                proCredit.value = ((pro.proTime - new Date().getTime()) / 86400000).toFixed() <= 0 ? 0 : ((pro.proTime - new Date().getTime()) / 86400000).toFixed();

                proCalendarEvents.value = incoming_offers_list.filter(e => e.status === 'confirmed');

                const offersToDisplay = incoming_offers_list.filter(ol => ol.status !== 'confirmed');

                incomingOffers.value = offersToDisplay.sort((a, b) => b.created_ms - a.created_ms);

                incomingOffersCount.value = incomingOffers.value.length;

                
                //newOffersAmount.value = incomingOffers.value.filter(io => !io.visitors.includes(providerId.value)).length;

                proTimetable.value = provider.value.timetable;
                // Set calendar upcoming tasks
                
                
            }
                

            return pro;
        } catch (error) {
            proError.value = error.message;
            provider.value = {};
            incomingOffersCount.value = null;
            incomingOffers.value = [];
            throw error;
        } finally {
            isProStateLoading.value = false;
        }
    }
    const upsertBooking = (booking) => {
        incomingOffers.value.push(booking);
        newOffersAmount.value = incomingOffers.value.filter(io => !io.visitors.includes(providerId.value)).length;
        incomingOffers.value = incomingOffers.value.sort((a, b) => b.created_ms - a.created_ms);;
        // keep the counter in sync
        incomingOffersCount.value = incomingOffers.value.length
    }
    const addProviderOffer = async(id, addressee, newContent) => {
        if (loading.value) return;
        loading.value = true;
        try {
            const createdOffer = await offerService.addOffer(newContent);
            if (createdOffer) {
                const offerDbClient = await clientService.createOffer(id, createdOffer.id);
                newContent.id = createdOffer.id;
                const index = incomingOffers.value.findIndex(iov => iov.id === id);
                const updatedOffer = incomingOffers.value[index];
                updatedOffer.offers.push(newContent);
                const updatedOffers = incomingOffers.value.map(item => item.id === id ? updatedOffer : item);
                incomingOffers.value = updatedOffers.sort((a, b) => b.created_ms - a.created_ms);
                socket.emit('client get offer', addressee, id, newContent);
            } else {
                
            }
        } catch (e) {
            console.log("Error to add offer - " + e.message);
            addOfferError.value = "Occured internet problem, try again!";
        } finally {
            loading.value = false;
        }
         
    }
    const removeBookingOffer = async(id) => {

        console.log("Does proStore remove works?" + id);
        await providerService.removeProviderBooking(providerId.value, id);
        
        //incomingOffers.value = incomingOffers.value.filter(iov => iov.id !== id);
        //incomingOffersCount.value = incomingOffers.value.length;
        const targetId = String(id);
        const getId = (b) => String(b?.id ?? b?._id);
        const next = incomingOffers.value.filter(b => getId(b) !== targetId);
        incomingOffers.value = next;
        incomingOffersCount.value = next.length;
    }
    const handleConfirmed = (bookingId) => {
        const pendingOffers = incomingOffers.value.filter(item => item.id !== bookingId);
        incomingOffers.value = pendingOffers;
        incomingOffersCount.value = incomingOffers.value.length;
    }
    // Confirming client offer sended from map
    const onConfirmClientBooking = async(bookingId, offer) => {
        console.log("Booking id is " + bookingId)
        await clientService.updateRecipientStatus(bookingId, {status: 'confirmed'});
        
        //const _offerMade = await offerService.addOffer(offer);
        
        const offerId = Date.now().toString(36) + Math.random().toString(36).slice(2);
        offer.id = offerId;
        // siin teha...
        //await clientService.createOffer(bookingId, offerId);
        await clientService.addConfirmedOffer(bookingId, offer);
        const confirmed = incomingOffers.value.find(item => item.id === bookingId);
        const currentList = incomingOffers.value.filter(confirmed => confirmed.id !== bookingId);
        incomingOffers.value = currentList;
        incomingOffersCount.value = incomingOffers.value.length;

        proCalendarEvents.value = proCalendarEvents.value.concat(confirmed);
        
        if (incomingOffersCount.value < 1) {
            router.push('/');
        }
    }
    const updateCredit = async(creditDaysCovered, credit_ms) => {
        console.log("Updated credit now: " + creditDaysCovered + " credit ms " + credit_ms);
        // protime past - 1761058143482
        await providerService.updateTimeCredit(providerId.value, {proTime: credit_ms});
        proCredit.value += creditDaysCovered;
    }

    // Calendar data

    const addAvailableTimeEvent = async(dateContent) => {
        const dateEvent = timetableService.addAdditionalTimeOffer(providerId.value, {
            state: dateContent.state,
            allDay: dateContent.allDay,
            title: dateContent.title,
            content: dateContent.content,
            start: dateContent.start,
            end: dateContent.end
        });
        if (dateEvent) {
            console.log("dEvent - " + dateEvent);

            provider.value.timetable.push({
                    id: dateEvent.id,
                    state: dateEvent.state,
                    allDay: dateEvent.allDay,
                    title: dateEvent.title,
                    content: dateEvent.content,
                    start: dateEvent.start,
                    end: dateEvent.end,
                    extendedProps: {
                        type: dateEvent.state
                    }
                })

            proTimetable.value = provider.value.timetable;
        }

        
    }

    const onEdit = async (id, edited) => {
        //console.log("Edited event id in store - " + id);

        
        await timetableService.updateTimetableEvent(id, edited)

       /*  await timetableService.updateTimetableEvent(id, {
            id: id,
            state: edited.state,
            allDay: edited.allDay,
            title: edited.title,
            content: edited.content,
            start: edited.start,
            end: edited.end
        }) */
    }

    

    const onDelete = async (eventId) => {
        console.log("Del event id is: " + eventId);
        console.log("Pro id is " + providerId.value);
        await timetableService.removeTimeOffer(providerId.value, eventId);
    }

    return {
        createPro,
        getProState,
        upsertBooking,
        addProviderOffer,
        removeBookingOffer,
        updateCredit,
        addVisitorForBooking,
        getIncomOfferById,
        addAvailableTimeEvent,
        onEdit,
        onDelete,
        handleConfirmed,
        onConfirmClientBooking,
        providerId,
        isUserPro,
        provider,
        proCredit,
        isIncomingOffers,
        newOffersAmount,
        incomingOffers,
        incomingOffersCount,
        proCalendarEvents,
        proTimetable,
        isProStateLoading,
        proError }
})
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import providerService from '../service/providers.js';
import offerService from '../service/offers.js';
import timetableService from '../service/timetable.js';
import socket from '@/socket'
import clientService from "@/service/recipients.js";
import notificationService from '../service/notifications.js';
import { useNotificationStore } from './notificationStore.js';
import { useRouter } from 'vue-router';
//import { aW } from '@fullcalendar/core/internal-common.js';

export const useProStore = defineStore("pro", () => {
    const router = useRouter();
    const notificationStore = useNotificationStore();
    const loading = ref(false);
    const provider = ref(null);
    const providers = ref([]);
    const providerId = ref(null);

    const incomingOffers = ref([]);

    const proCalendarEvents = ref([]);
    const proTimetable = ref([]);
    const isProStateLoading = ref(false)
    const proCredit = ref(0)
    
    const proError = ref("" || null)
    const addOfferError = ref("" || null);
    const referenceNavImages = ref([]);

    const isUserPro = computed(() => !!provider.value);
    const incomingOffersCount = computed(() => incomingOffers.value.length)
    const isIncomingOffers = computed(() => incomingOffers.value.length > 0);
    const newOffersAmount = computed(() => incomingOffers.value.filter(io => !io.visitors.includes(providerId.value)).length);
    const reference = computed(() => provider.value?.reference || []);
    //const proTimetable = computed(() => provider.timetable);

    const getIncomOfferById = (id) => {
        console.log("INCOMINGOFFERS ID - " + id)
        return incomingOffers.value.find(o => o.id === id);;
    }


    //const newOffersAmount = computed(() => incomingOffers.value.filter(io => io.visitors.includes(providerId.value))).length
    const createPro = (created) => {
        console.log("Created ", created);
        console.log("Pro id in prostore created is " + created.id);
        provider.value = created;
        proCredit.value = ((created.proTime - new Date().getTime()) / 86400000).toFixed() <= 0 ? 0 : ((created.proTime - new Date().getTime()) / 86400000).toFixed();
        providerId.value = created.id;
    }
    const addVisitorForBooking = (bId, offer) => {
        const index = incomingOffers.value.findIndex(inx => inx.id === bId);
        incomingOffers.value[index].visitors.push(offer.visitor);
    }

    const getAllProviders = async() => {
        try {
            const all = await providerService.getProviders();
            //return all.length ? all : [];
            providers.value = Array.isArray(all) ? all : [];
            return providers.value;
        } catch (e) {
            console.log("Error to get all providers - " + e.message);
            throw e;
        }
    }

    const providerCount = computed(() => providers.value.length);
    const professionCount = computed(() => {
        const allProfessions = providers.value.flatMap(p => p.profession || []);
        const uniqueProfessions = new Set(allProfessions);
        return uniqueProfessions.size;
    });

    const isOfferValid = (offer) => {
        //const now = Date.now();
        const now = new Date().getTime();
        const offerTime = new Date(offer.created_ms).getTime();
        //const offerValidityDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds      
        //return now - offerTime < offerValidityDuration;
        return offerTime < now;
    };

    const removeExpiredOffers = (offers) => {
        const ms_now = new Date().getTime();
        return offers.filter(offer => offer.created_ms > ms_now);       
    };

    const getProState = async (id) => {
        isProStateLoading.value = true;
        proError.value = null;

        try {
            const pro = await providerService.getProvider(id);


            if (!pro) {
                providerId.value = null;
                provider.value = null;
                incomingOffers.value = [];
                proCalendarEvents.value = [];
                proTimetable.value = [];
                proCredit.value = 0;
                return null;
            }

            providerId.value = pro.id ?? null;
            provider.value = pro;

            let incomingOffersList = pro.proposal || [];

            console.log(incomingOffersList.map(item => isOfferValid(item) ? item.header + "-expired-" : item.header + "-valid-"));

            incomingOffersList = incomingOffersList.map(p => !isOfferValid(p) ? { ...p, valid: true } : { ...p, valid: false });

            //incomingOffersList = incomingOffersList.filter(p => !isOfferValid(p));

            incomingOffersList = removeExpiredOffers(incomingOffersList);

            proCredit.value = ((pro.proTime - new Date().getTime()) / 86400000).toFixed() <= 0 ? 0 : ((pro.proTime - new Date().getTime()) / 86400000).toFixed();

            proCalendarEvents.value = incomingOffersList.filter(
                e => e.status === "confirmed"
            );

            incomingOffers.value = incomingOffersList
                .filter(ol => ol.status === "active")
                .sort((a, b) => b.created_ms - a.created_ms);

            proTimetable.value = pro.timetable || [];

            return pro;
        } catch (error) {
            // missing provider should not be treated as fatal
            if (error.response?.status === 404) {
                providerId.value = null;
                provider.value = null;
                incomingOffers.value = [];
                proCalendarEvents.value = [];
                proTimetable.value = [];
                proCredit.value = 0;
                proError.value = null;
                return null;
            }

            proError.value = error.message;
            providerId.value = null;
            provider.value = null;
            incomingOffers.value = [];
            proCalendarEvents.value = [];
            proTimetable.value = [];
            proCredit.value = 0;

            throw error;
        } finally {
            isProStateLoading.value = false;
        }
    };
    const upsertBooking = (booking) => {
        incomingOffers.value.push(booking);
        //newOffersAmount.value = incomingOffers.value.filter(io => !io.visitors.includes(providerId.value)).length;
        incomingOffers.value = incomingOffers.value.sort((a, b) => b.created_ms - a.created_ms);;
        // keep the counter in sync

        
    }
    
    const addProviderOffer = async (
        id,
        newContent
    ) => {
        if (loading.value) {
            throw new Error("Offer request is already in progress.");
        }

        loading.value = true;
        addOfferError.value = "";

        try {
            const response =
                await offerService.addOffer(newContent);

            if (!response?.success || !response?.offer) {
                throw new Error("Invalid offer response.");
            }

            const createdOffer = response.offer;

            if (provider.value) {
                createdOffer.provider = provider.value;
            }

            const index = incomingOffers.value.findIndex(
                booking => booking.id === id
            );

            if (index !== -1) {
                const updatedBooking = {
                    ...incomingOffers.value[index],
                    offers: [
                        ...(incomingOffers.value[index].offers || []),
                        createdOffer
                    ]
                };

                incomingOffers.value = incomingOffers.value
                    .map(booking =>
                        booking.id === id ? updatedBooking : booking
                    )
                    .sort(
                        (a, b) =>
                            Number(b.created_ms || 0) -
                            Number(a.created_ms || 0)
                    );
            }

            return response;
        } catch (error) {
            console.error("Error adding offer:", error);

            addOfferError.value =
                error.response?.data?.message ||
                "An internet error occurred. Please try again.";

            // Väga oluline: komponent peab vea kätte saama
            throw error;
        } finally {
            loading.value = false;
        }
    };

    const removeBookingMapOffer = async (id) => {
        await removeLocalBooking(id);
    }
    

    const handleRemoveDisabledBooking = (id) => {
        const renewed = incomingOffers.value.filter(iov => iov.id !== id);
        incomingOffers.value = renewed;
    }


    const removeLocalBooking = async (id) => {
        console.log("Pro id " + providerId.value);
        console.log("Booking id " + id);
        const removed = await providerService.removeProviderBooking(providerId.value, id);
        // Here probably local state to delete booking??
        let removeResult;
        if (!removed) {
            removeResult = false;
            return;
        }
        removeResult = true;
        const targetId = String(id);
        const getId = (b) => String(b?.id ?? b?._id);
        const next = incomingOffers.value.filter(b => getId(b) !== targetId);
        incomingOffers.value = next;
        //incomingOffersCount.value = next.length;

        return removeResult
    }

    const disableLocalBooking = async (id) => {
        console.log("Disabled booking id " + id);
        const targetId = String(id);
        const getId = (b) => String(b?.id ?? b?._id);
        //const next = incomingOffers.value.filter(b => getId(b) !== targetId);
        //incomingOffers.value = next;

        const result = await providerService.removeProviderBooking(providerId.value, id);

        if (!result) {
            return false;
        }
        const next = incomingOffers.value.map(item => getId(item) === targetId ? {...item, disabled: true} : {...item, disabled: false});
        incomingOffers.value = next;
        //incomingOffersCount.value = next.length;

        return true;
        
    }


    // Provider side form nulty booking removing
    const removeBookingPublicOffer = async (id, receiver) => {

        console.log("Does proStore remove works?" + id);
        //await providerService.removeProviderBooking(providerId.value, id);

        //await clientService.removeBooking(id);

        await removeLocalBooking(id);
        

        console.log("Receiver ID - " + receiver);
        socket.emit('on-pro-remove-public-offer', id, receiver);

        if (incomingOffersCount.value < 1) {
            router.push('/');
        }
    }

    // In provider side
    const removeMapOffer = async (id, addressaat) => {
        console.log("REM " + id)
        //await clientService.removeBooking(id);
        console.log("IS DEL???")
        const isRemoved = await removeLocalBooking(id);

        if (!isRemoved) return;

        //socket.emit('del pro-side map booking', addressaat, id);
         
        if (!incomingOffers.value.length) router.push('/');

        return isRemoved;
        
    }
    // Confirmed by client multi offer
    const handleConfirmed = (bookingId) => {
        console.log("Prostore --confirmed--")
        const confirmedOffer = incomingOffers.value.find(i => i.id === bookingId);
        const pendingOffers = incomingOffers.value.filter(item => item.id !== bookingId);
        incomingOffers.value = pendingOffers;
        confirmedOffer.status = 'confirmed';
        proCalendarEvents.value = proCalendarEvents.value.concat(confirmedOffer);
        //incomingOffersCount.value = incomingOffers.value.length;
    }
    // Confirming client offer sended from map
    const onClientBooking = async(bookingId, offer, myself, clientId, providerId, notes) => {
        console.log("CLIENT id is " + bookingId)
        console.log("Offer is ", offer);
        console.log("Myself is ", myself);
        console.log("Client id is ", clientId);
        console.log("Provider id is ", providerId);
        console.log("Notes are ", notes);

        const offerId = Date.now().toString(36) + Math.random().toString(36).slice(2);
        offer.id = offerId;
        
        const confirmed = incomingOffers.value.find(item => item.id === bookingId);
        const currentList = incomingOffers.value.filter(confirmed => confirmed.id !== bookingId);
        incomingOffers.value = currentList;

        confirmed.confirmed_provider_user_id = myself;
        confirmed.status = 'confirmed';

        proCalendarEvents.value = proCalendarEvents.value.concat(confirmed);

        return true;
    }


    const updateStatus = async (payload) => {
        if (provider.value) {
            const edited = await providerService.setAvailability(provider.value.id, payload);
            if (edited) {
                console.log("E - " + edited);
                provider.value.status = payload.status;
            }
        }
    }

    // Offer done or timeout
    const handleOfferDone = async (id) => {
        try {
            const handled = await providerService.removeProviderBooking(providerId.value, id);
            if (handled) {
                proCalendarEvents.value = proCalendarEvents.value.filter(event => event.id !== id);
                incomingOffers.value = incomingOffers.value.filter(offer => offer.id !== id);
            }

        } catch (err) {
            console.log("Handled err - " + err.message);
        }
    }
    const updateAddress = async (payload) => {
        if (provider.value) {
            const proWithNewAddress = await providerService.editAddress(provider.value.id, payload);
            provider.value.address = payload.address;
            return proWithNewAddress;
        }
    }
    const updateCredit = async(credit_ms) => {
        console.log(" credit ms " + credit_ms);
        // protime past - 1761058143482
        await providerService.updateTimeCredit(providerId.value, {proTime: credit_ms});
        //proCredit.value = Number(creditDaysCovered);
        provider.value.proTime = credit_ms;
        proCredit.value = ((credit_ms - new Date().getTime()) / 86400000).toFixed() <= 0 ? 0 : ((credit_ms - new Date().getTime()) / 86400000).toFixed();

    }

    const updateProviderPanel = async (id, payload) => {
        console.log("Provider id - " + id);
        console.log("Well, will update, ", payload);

        const proMain = await providerService.updateProMain(id, payload);
        console.log("PRO UPP -- ", proMain);

        provider.value = proMain;

        return proMain;
    }

    // Calendar data

    const addAvailableTimeEvent = async(dateContent) => {
        const dateEvent = await timetableService.addAdditionalTimeOffer(providerId.value, {
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

            //proTimetable.value = provider.value.timetable;
        }

        
    }

    // Edit local availability timetable
    const onEdit_prev = async (id, edited) => {
        const done = await timetableService.updateTimetableEvent(id, edited);
        console.log("Editing edits - ", edited);

        if (!done) return;

        const existing = proTimetable.value.find(time => time.id === id);
        
        proTimetable.value = proTimetable.value.map(time =>
            time.id === id
                ? {
                    ...time,
                    ...edited,
                    extendedProps: {
                        type: edited.state
                    }
                }
                : time
        );
    }

    const onEdit = async (id, edited) => {
        const eventId = String(id);

        const done =
            await timetableService.updateTimetableEvent(
                eventId,
                edited
            );

        if (!done) {
            return false;
        }

        let found = false;

        proTimetable.value = proTimetable.value.map(time => {
            if (String(time.id) !== eventId) {
                return time;
            }

            found = true;

            return {
                ...time,

                state:
                    edited.state ??
                    time.state,

                title:
                    edited.title ??
                    time.title,

                content:
                    edited.content ??
                    time.content,

                start:
                    edited.start ??
                    time.start,

                end:
                    edited.end ??
                    time.end,

                isAllDay:
                    edited.isAllDay ??
                    edited.allDay ??
                    time.isAllDay
            };
        });

        if (!found) {
            console.warn(
                "Timetable event not found in store:",
                eventId
            );
        }

        return true;
    };

    const onEditOrderDuration = async (id, result) => {
        console.log("Id - " + id);
        console.log("Edited - ", result);

        const toEnd = new Date(result.end);

        const changedOrderDuration = await clientService.orderDuration(id, { finish: toEnd});

        console.log("End updated result: ", changedOrderDuration);

        if (!changedOrderDuration.ok) return;

        proCalendarEvents.value = proCalendarEvents.value.map(pce => 
            pce.id === id
            ? {...pce, estimatedFinish: new Date(result.end)}
            : pce
        )

    }

    const onDelete = async (eventId) => {
        console.log("Del event id is: " + eventId);
        console.log("Pro id is " + providerId.value);
        await timetableService.removeTimeOffer(providerId.value, eventId);

        proTimetable.value = proTimetable.value.filter(ptt => ptt.id !== eventId);
    }

    const updateReference = async (payload) => {
        const proId = providerId?.value;
        console.log("Provider id value here: " + proId);
        console.log("Reference payload: ", payload);

        const referenceHandled = await providerService.handleReference(proId, payload);

        
        return referenceHandled;
    }


    

    return {
        createPro,
        getAllProviders,
        getProState,
        upsertBooking,
        addProviderOffer,
        removeBookingMapOffer,
        removeBookingPublicOffer,
        removeLocalBooking,
        disableLocalBooking,
        removeMapOffer,
        updateAddress,
        updateStatus,
        updateCredit,
        updateProviderPanel,
        addVisitorForBooking,
        getIncomOfferById,
        addAvailableTimeEvent,
        onEdit,
        onEditOrderDuration,
        onDelete,
        handleConfirmed,
        onClientBooking,
        handleRemoveDisabledBooking,
        updateReference,
        handleOfferDone,
        providerId,
        isUserPro,
        provider,
        providers,
        providerCount,
        professionCount,
        proCredit,
        reference,
        referenceNavImages,
        isIncomingOffers,
        newOffersAmount,
        incomingOffers,
        incomingOffersCount,
        proCalendarEvents,
        proTimetable,
        isProStateLoading,
        proError 
    }
})
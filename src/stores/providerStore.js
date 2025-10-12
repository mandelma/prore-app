import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import providerService from '../service/providers.js'
//import clientService from "@/service/recipients.js";

export const useProStore = defineStore("pro", () => {
    const provider = ref(null);
    const providerId = ref(null);
    //const isIncomingOffers = ref(null);
    const incomingOffers = ref([]);
    //const isNewIncomingOffers = ref();
    const newOffersAmount = ref(0);
    const incomingOffersCount = ref(incomingOffers.value.length)
    const isProStateLoading = ref(false)
    const proCredit = ref(0)
    const proError = ref("" || null)

    const isUserPro = computed(() => !!provider.value);
    const isIncomingOffers = computed(() => !!incomingOffersCount.value > 0);
    //const newOffersAmount = computed(() => incomingOffers.value.filter(io => io.visitors.includes(providerId.value))).length
    const createPro = (created) => {
        provider.value = created;
    }
    const addVisitorForBooking = (bId, visitor) => {
        const index = incomingOffers.value.findIndex(inx => inx.id === bId);
        incomingOffers.value[index].visitors.push(visitor.visitor);
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
                proCredit.value = ((pro.proTime - new Date().getTime()) / 86400000).toFixed() < 0 ? 0 : ((pro.proTime - new Date().getTime()) / 86400000).toFixed();
                incomingOffers.value = incoming_offers_list;
                newOffersAmount.value = incomingOffers.value.filter(io => !io.visitors.includes(providerId.value)).length;
                //isNewIncomingOffers.value = incoming_offers_list.some(io => io.visitors.includes(providerId))
                incomingOffersCount.value = incoming_offers_list.length;
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

        // keep the counter in sync
        incomingOffersCount.value = incomingOffers.value.length
    }
    const updateCredit = (creditDaysCovered) => {
        console.log("Updated credit now: " + creditDaysCovered);
        proCredit.value += creditDaysCovered;
    }
    return {
        createPro,
        getProState,
        upsertBooking,
        updateCredit,
        addVisitorForBooking,
        providerId,
        isUserPro,
        provider,
        proCredit,
        isIncomingOffers,
        newOffersAmount,
        incomingOffers,
        incomingOffersCount,
        isProStateLoading,
        proError }
})
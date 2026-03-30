import { defineStore } from "pinia";
import { ref, computed } from 'vue'
import providerArchiveService  from '../service/provider_history';

export const useProArchiveStore = defineStore('pHistory', () => {
    const providerHistory = ref([]);

    const initProviderArchive = async () => {
        const pArchive = await providerArchiveService.getProHistory();
        if (pArchive) {
            const pList = pArchive ? pArchive : [];
            providerHistory.value = pList;
            console.log("pList - ", providerHistory.value);
        }
    }

    const archiveProviderLocal = (pArchived) => {
        console.log("Archived in store ", pArchived);
        providerHistory.value = [...providerHistory.value, pArchived];
    }

    const upsertArchive = (id) => {
        const newArchive = providerHistory.value.filter(ph => ph.id !== id);
        providerHistory.value = newArchive;
    }

    return {
        providerHistory,
        initProviderArchive,
        archiveProviderLocal,
        upsertArchive
    }
})
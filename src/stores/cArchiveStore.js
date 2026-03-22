import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import clientHistoryService from '../service/client_history';

export const useClientArchiveStore = defineStore('cHistory', () => {
    const clientHistory = ref([]);

    const initClientArchive = async () => {
        const cArchive = await clientHistoryService.getClientHistory();
        if (cArchive) {
            const cList = cArchive ? cArchive : [];
            clientHistory.value = cList;
            console.log("ARCIVE - ", clientHistory.value);
        }
    }

    const addArchievedClientLocal = (archived) => {
        console.log("Archived in store ", archived);
        clientHistory.value = [...clientHistory.value, archived];
    }

    return {
        clientHistory,
        initClientArchive,
        addArchievedClientLocal
    }
}) 
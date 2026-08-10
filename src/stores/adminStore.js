import { defineStore } from "pinia";
import { ref } from 'vue';
import providerService from '../service/providers'

export const useAdminStore = defineStore('admin', () => {
    const _providers = ref([]);
    const _clients = ref([]);

    const fetchAdminData = async () => {
        await all_providers();
    }
    
    const all_providers = async () => {
        const providerList = await providerService.getProviders();
        if (!providerList) return;
        _providers.value = providerList || [];
    }


    return {
        _providers,
        fetchAdminData
    }
})
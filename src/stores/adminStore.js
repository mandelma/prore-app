import { defineStore } from "pinia";
import { ref } from 'vue';
import adminService from "../service/admin";
import providerService from '../service/providers'

export const useAdminStore = defineStore('admin', () => {
    const _providers = ref([]);
    const _clients = ref([]);

    const fetchAdminData = async (role, token) => {
        console.log("Admin store fetchAdminData called with role:", role);
        if (role !== 'admin') return; // Only fetch if the user is an admin
        const dashboardData = await adminService.getDashboard(token);
        //await all_providers();
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
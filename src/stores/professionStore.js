import { defineStore } from "pinia";
import { ref, computed } from "vue";
import professionService from '@/service/professions';

export const useProfessionStore = defineStore('profession', () => {
    const professions = ref([]);
    const professionCategories = ref([]);
    const customField = ref(null);

    const initProfessions = async () => {
        const {professionList, categoryList} = await professionService.getProfessions();
        
        console.log("PPPROF ", professionList);
        console.log("GGGA ", categoryList);

        professions.value = professionList || [];
        professionCategories.value = categoryList || [];
        
    }

    const professionByCode = async (code) => {
        const result = await professionService.findProfession(code);
        return Array.isArray(result)
            ? result[0] ?? null
            : result
    }

    const professionCustomField = (code) => {
        const profession = professions.value.find(p => p.code === code);

        if (!profession) return;

        return profession.customFields;
    }


    return {
        professions,
        professionCategories,
        initProfessions,
        professionByCode,
        professionCustomField
    }
})
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useProfessionStore } from "@/stores/professionStore";
import { storeToRefs } from "pinia";

export const useLocalProfession = () => {

    const { locale } = useI18n();
    const professionStore = useProfessionStore();

    const { professions } = storeToRefs(professionStore);

    const getLocalizedValue = translations => {
        if (!translations) {
            return "";
        }

        return (
            translations[locale.value] ||
            translations.en ||
            translations.fi ||
            Object.values(translations).find(Boolean) ||
            ""
        );
    };
    
    const localProfession = (code) => {
        const professionObj = professions.value.find(
            profession => profession.code === code
        );
        return getLocalizedValue(professionObj?.name) || code;
    };

    return {
        localProfession
    };
}
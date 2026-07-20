import { createI18n } from 'vue-i18n';
import fi from '../../components/lang/fin.json';
import en from '../../components/lang/en.json';
import et from '../../components/lang/est.json';
import sv from '../../components/lang/swe.json';
import ru from '../../components/lang/ru.json';

const numberFormats = {
    fi: {
        currency: {
            style: "currency",
            currency: "EUR"
        }
    },
    en: {
        currency: {
            style: "currency",
            currency: "EUR"
        }
    },
    sv: {
        currency: {
            style: "currency",
            currency: "EUR"
        }
    },
    et: {
        currency: {
            style: "currency",
            currency: "EUR"
        }
    },
    ru: {
        currency: {
            style: "currency",
            currency: "EUR"
        }
    }
};


const i18n = createI18n({
    legacy: false,
    //globalInjection: true,
    locale: localStorage.getItem('lang') || 'fi',
    fallbackLocale: 'fi',
    messages: {
        en,
        fi,
        et,
        sv,
        ru
    },
    numberFormats
});


export default i18n;
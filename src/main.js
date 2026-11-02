import { createApp } from 'vue'
import App from './App.vue'

import { initPwaInstall } from "@/composables/usePwaInstall.js"

import 'mdb-vue-ui-kit/css/mdb.min.css';

import i18n from './components/controllers/i18n.js'
import PrimeVue from 'primevue/config'
import 'primeicons/primeicons.css'   // icons, if you use them

import Aura from '@primevue/themes/aura'


//import '@/styles/date-timepicker.css'
import { createPinia } from 'pinia'
import router from './router'

/* console.log(
    'DUUNHUB DOCUMENT START',
    window.location.href,
    performance.getEntriesByType('navigation')[0]?.type
); */

const pinia = createPinia();

initPwaInstall();

createApp(App)
    .use(pinia)
    .use(router)
    .use(i18n)
    .use(PrimeVue, {
        zIndex: {
            overlay: 3000
        },
        theme: {
            preset: Aura,
            options: {
                darkModeSelector: '.select-dark'
            }
        }
    })
    .mount('#app');

import '@/styles/pro-select.css'
import '@/styles/theme.css'
import '@/styles/form.css'
import 'flag-icons/css/flag-icons.min.css'
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

const pinia = createPinia();

initPwaInstall();

createApp(App).use(router).use(pinia).use(i18n).use(PrimeVue, {
    zIndex: {
        overlay: 3000 // make sure it's higher than your navbar
    },
    theme: {preset: Aura, options: {
            // pick a css class you’ll toggle to enable dark mode:
            darkModeSelector: '.select-dark'
        }}}).mount('#app')

import '@/styles/pro-select.css'
import '@/styles/theme.css'
import '@/styles/form.css'
import 'flag-icons/css/flag-icons.min.css'
import { createApp } from 'vue'
import App from './App.vue'
//import 'mdb-vue-ui-kit/css/mdb.min.css'


import 'mdb-vue-ui-kit/css/mdb.min.css';

import i18n from './components/controllers/i18n.js'
import PrimeVue from 'primevue/config'
import 'primeicons/primeicons.css'   // icons, if you use them

import Aura from '@primevue/themes/aura'

//import Select from 'primevue/dropdown'

//import '@/styles/pro-select.styles'







//import '@/styles/date-timepicker.css'
import { createPinia } from 'pinia'
import router from './router'

const pinia = createPinia();

//console.log('Aura preset:', Aura);

//createApp(App).use(PrimeVue);
//createApp(App).component('Dropdown', Select);
//, {theme: {preset: Aura}}
createApp(App).use(router).use(pinia).use(i18n).use(PrimeVue, {theme: {preset: Aura, options: {
            // pick a css class you’ll toggle to enable dark mode:
            darkModeSelector: '.select-dark'
        }}}).mount('#app')

import '@/styles/pro-select.css'
import '@/styles/theme.css'
import '@/styles/form.css'
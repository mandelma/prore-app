<template>
  <MDBDropdown style="" v-model="dropdownLang" >
    <MDBDropdownToggle
        tag="a"
        @click="dropdownLang = !dropdownLang"

    >




      <span v-if="currentLanguage === 'fi' || currentLanguage === null">
        <img style="width: 20px;" :src="fin" alt="fin" />
      </span>
      <span v-else-if="currentLanguage === 'et'" >
        <img style="width: 20px;" :src="est" alt="est"/>
      </span>
      <span v-else-if="currentLanguage === 'en'">
        <img style="width: 20px;" :src="en" alt="en"/>
      </span>
      <span v-else>
        <img style="width: 20px;" :src="swe" alt="sv"/>
      </span>

      &nbsp;

    </MDBDropdownToggle>
    <MDBDropdownMenu dark aria-labelledby="dropdownMenuLinkx">
      <MDBDropdownItem ><MDBBtn color="dark" block @click="setLanguage('fi')"><img style="width: 20px;" :src="fin" alt="fin" > &nbsp;fin</MDBBtn></MDBDropdownItem>
      <MDBDropdownItem ><MDBBtn color="dark" block @click="setLanguage('en')"><img  style="width: 20px;" :src="en" alt="en" > &nbsp;en</MDBBtn></MDBDropdownItem>
      <MDBDropdownItem><MDBBtn color="dark" block @click="setLanguage('et')"><img style="width: 20px;" :src="est" alt="est" /> &nbsp;est</MDBBtn></MDBDropdownItem>
      <MDBDropdownItem><MDBBtn color="dark" block @click="setLanguage('sv')"><img style="width: 20px;" :src="swe" alt="swe" /> &nbsp;swe</MDBBtn></MDBDropdownItem>
    </MDBDropdownMenu>
  </MDBDropdown>
</template>

<script setup>
import { MDBDropdown, MDBDropdownToggle, MDBDropdownMenu, MDBDropdownItem, MDBBtn } from "mdb-vue-ui-kit";
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import est_flag from '../assets/flags/est.png';
import fin_flag from '../assets/flags/fin.png';
import en_flag from '../assets/flags/en.png';
import swe_flag from '../assets/flags/swe.png';
import i18n from '.././components/controllers/i18n.js'
defineOptions({
  name: 'LanguageContents'
  // you can also set other options here if needed
})
const dropdownLang = ref(false);
const locale = useI18n();
const currentLanguage = ref(localStorage.getItem('lang') || null);
const est = est_flag;
const fin = fin_flag;
const en = en_flag;
const swe = swe_flag;

onMounted(() => {
  locale.value = currentLanguage.value;       // initialize on load
});

const setLanguage = (newLang) => {
  dropdownLang.value = false;
  locale.value = newLang;
  localStorage.setItem('lang', newLang);
  currentLanguage.value = newLang;
  i18n.global.locale.value = newLang;
}

</script>

<style scoped>

</style>
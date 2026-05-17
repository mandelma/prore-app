<template>
  <MDBDropdown style="" v-model="dropdownLang" >
    <MDBDropdownToggle
        tag="a"
        @click="dropdownLang = !dropdownLang"

    >




      <span v-if="currentLanguage === 'fi' || currentLanguage === null">
        <!-- <img style="width: 20px;" :src="fin" alt="fin" /> -->
        <span class="fi fi-fi me-2"></span>
      </span>
      <span v-else-if="currentLanguage === 'et'" >
        <img style="width: 20px;" :src="est" alt="est"/>
      </span>
      <span v-else-if="currentLanguage === 'en'">
        <!-- <img style="width: 20px;" :src="en" alt="en"/> -->
         <spanc class="fi fi-gb me-2"></spanc>
      </span>
      <span v-else-if="currentLanguage === 'ru'">
        <span class="fi fi-ru me-2"></span>
      </span>  
      <span v-else>
        <!-- <img style="width: 20px;" :src="swe" alt="swe"/> -->
        <span class="fi fi-se me-2"></span>
      </span>

      &nbsp;

    </MDBDropdownToggle>
    <MDBDropdownMenu dark aria-labelledby="dropdownMenuLinkx">
      <MDBDropdownItem>
        <button type="button" class="dropdown-lang-btn" @click.stop="setLanguage('fi')">
          <span class="fi fi-fi me-2"></span> Suomi
        </button>
      </MDBDropdownItem>

      <MDBDropdownItem>
        <button type="button" class="dropdown-lang-btn" @click.stop="setLanguage('en')">
          <span class="fi fi-gb me-2"></span> English
        </button>
      </MDBDropdownItem>

      <MDBDropdownItem>
        <button type="button" class="dropdown-lang-btn" @click.stop="setLanguage('et')">
          <span class="fi fi-ee me-2"></span> Eesti
        </button>
      </MDBDropdownItem>

      <MDBDropdownItem>
        <button type="button" class="dropdown-lang-btn" @click.stop="setLanguage('sv')">
          <span class="fi fi-se me-2"></span> Svenska
        </button>
      </MDBDropdownItem>

      <MDBDropdownItem>
        <button type="button" class="dropdown-lang-btn" @click.stop="setLanguage('ru')">
          <span class="fi fi-ru me-2"></span> Русский
        </button>
      </MDBDropdownItem>
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
.dropdown-lang-btn {
  width: 100%;
  background: transparent;
  border: 0;
  color: inherit;
  text-align: left;
  padding: 0;
  cursor: pointer;
}
</style>
<template>
 <div style="text-align: center;">
   <MDBContainer>
     <div>
       <img :src="logo" class="main-logo" style="" alt="App logo" />
     </div>
<!--     #dd7052-->
     <h1 style="color: #B45309;text-shadow: 2px 2px 5px #0E7490; font-family: fantasy, Papyrus;">PROKEIKKATORI</h1>
     <h2 style="" class="title">{{t('home_title')}}</h2>
     <div style="" class="action-panel">
       <MDBBtn color="primary" rounded size="lg" class="action-button" style="" @click="clientInitial"><MDBIcon icon="search" class="icon"/>&nbsp; &nbsp; {{t('home_client_btn')}}</MDBBtn>
       <MDBBtn color="primary" rounded size="lg" class="action-button"><MDBIcon icon="plus" class="icon"/>&nbsp; &nbsp;{{t('home_pro_btn')}}</MDBBtn>
     </div>

   </MDBContainer>

<!--   <MDBBtn color="success" @click="counter.increment">Suurenda +</MDBBtn>-->
<!--   ++{{counter.count}}-->
 </div>
</template>

<script setup>
import { MDBContainer, MDBBtn, MDBIcon } from 'mdb-vue-ui-kit'
import { ref } from 'vue'
import { useCounterStore } from '@/stores/counter'
import { mapStores, mapActions } from 'pinia'
import { useLoginStore } from '@/stores/login'
import loginService from "@/service/login.js";
import '@/styles/theme.css'
import logo from '@/assets/logo_trans_main-edited.png';
import { useRouter } from 'vue-router';
import {useI18n} from "vue-i18n/dist/vue-i18n";
defineOptions({
  name: 'home'
  // you can also set other options here if needed
})

const counter = useCounterStore();
const router = useRouter();
const { t } = useI18n();

const clientInitial = () => {
  console.log("Recipient form.");
  router.push('/client-form');
}

</script>

<style>
.main-logo {
  width: 70%;
  margin: auto;
  padding-top: 0;
}
.title {
  /*color:#7F8A9A;*/
  color: #ddd;
  font-family: "Lucida Console", "Courier New", monospace;
  text-shadow: 2px 2px 5px #35bbc7;
  padding-top: 13px;
  padding-bottom: 13px;
}

.action-panel {
  display: flex;
  justify-content: center;
  gap: 20px;
}
.action-button {
  width: 330px;
  /*border-radius: 3%;*/
  margin-top: 17px;
  padding: 20px 20px;
}
@media (max-width: 480px) {
  .main-logo {
    width: 100%;
    margin: auto;
    padding-top: 30px;
    padding-bottom: 50px;
  }
  .action-panel {
    display: block;
    justify-content: center;
    gap: 0;
  }
  .action-button {
    width: 220px;
    /*border-radius: 3%;*/
    margin-top: 17px;
    padding: 20px 20px;
  }
}
</style>
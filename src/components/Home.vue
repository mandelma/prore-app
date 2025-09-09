<template>
 <div style="text-align: center;">
   <MDBContainer>
     <div>
       <img :src="logo" class="main-logo" style="" alt="App logo" />
     </div>
<!--     #dd7052-->
     <h1 style="color: #B45309;text-shadow: 2px 2px 5px #0E7490; font-family: fantasy, Papyrus;">PROKEIKKATORI</h1>
     <h2 style="" class="title">Nopeus on tärkein!</h2>
     <div style="" class="action-panel">
       <MDBBtn color="primary" size="md" class="action-button" style=" "><MDBIcon icon="search" class="icon"/>&nbsp; &nbsp; Etsin palvelua</MDBBtn>
       <MDBBtn color="primary" size="md" class="action-button"><MDBIcon icon="plus" class="icon"/>&nbsp; &nbsp;Tarjoan palvelua</MDBBtn>
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
import '@/css/theme.css'
import logo from '@/assets/logo_trans_main-edited.png';
defineOptions({
  name: 'home'
  // you can also set other options here if needed
})

const counter = useCounterStore();

</script>

<style>
.main-logo {
  width: 70%;
  margin: auto;
  padding-top: 0;
}
.title {
  /*color:#7F8A9A;*/
  color:orange;
  text-shadow: 2px 2px 7px #b99c79;
  padding-top: 13px;
  padding-bottom: 13px;
}
.action-panel {
  display: flex;
  justify-content: center;
  gap: 20px;
}
.action-button {
  width: 190px;
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
    width: 190px;
    margin-top: 17px;
    padding: 20px 20px;
  }
}
</style>
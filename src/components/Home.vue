<template>
 <div style="text-align: center;">
   <MDBContainer>
     <div>
       <img :src="logo" class="main-logo" style="" alt="App logo" />
     </div>
<!--     #dd7052-->
<!--     <h1 style="color: #B45309;text-shadow: 2px 2px 5px #0E7490; font-family: fantasy, Papyrus;">PROKEIKKATORI</h1>-->
     <h1 class="app-title">
       <span class="app-title__word" data-text="PROKEIKKATORI">PROKEIKKATORI</span>
     </h1>
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

:root{
  --c-cyan:  #49d2ff;   /* sobib ikoonide ja nuppude tooniga */
  --c-cyan2: #8eeaff;
  --c-teal:  #00b4c8;
  --c-orange:#ff8a3d;   /* sinu aktsent */
}

/* konteiner – hoiab pealkirja keskel */
.app-title{ display:flex; justify-content:center; margin: 28px 0 6px; }

/* sõna ise – futuristlik, glowl, õrn oranž kontuur */
.app-title__word{
  font: 900 clamp(28px,6vw,56px)/1 "Orbitron", system-ui, sans-serif;
  letter-spacing: .14em;
  text-transform: uppercase;

  /* tsüaansinine gradienttekst */
  background: linear-gradient(180deg, #eafcff 0%,
  var(--c-cyan2) 55%, var(--c-cyan) 100%);
  -webkit-background-clip: text;
  color: transparent;

  /* neon-glow, mis sobitub esilehe stiiliga */
  text-shadow:
      0 1px 0 rgba(255,255,255,.35),
      0 0 10px rgba(73,210,255,.55),
      0 0 28px rgba(0,180,200,.35),
      0 0 54px rgba(0,160,180,.25);

  position: relative;
}

/* diskreetne oranž aktsent all – järgib nuppude “helenduse” tunnet */
.app-title__word::after{
  content:"";
  position:absolute; left:0; right:0; bottom:-10px;
  height:4px; border-radius:999px;
  background: radial-gradient(60% 140% at 50% 50%,
  var(--c-orange) 0%, rgba(255,138,61,.65) 35%, transparent 70%);
  filter: blur(1px);
  opacity:.9;
}

/* kui brauser toetab, lisa õrn oranž “stroke” (hoiab tumedal taustal loetavuse tipptasemel) */
@supports(-webkit-text-stroke:1px transparent){
  .app-title__word{ -webkit-text-stroke:1px rgba(255,138,61,.55); }
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
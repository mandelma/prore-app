<template>
 <div style="text-align: center;">
   <MDBContainer>

     <div class="center-page">
       <main class="page">
<!--         class="logo-hero"-->
         <div class="logo-hero">
           <img class="logo-hero__img"
                style="border-radius: 100%;"
                :src="logo"
                alt="Prokeikkatori logo" width="1024" height="549" />
         </div>
         <h1 class="app-title"><span class="app-title__word">PROKEIKKATORI</span></h1>
         <p class="tagline">Nopeus on tärkeintä!</p>

         <div class="action-panel">
           <button class="btn-hero btn-hero--primary" @click="clientInitial">
             <span class="btn-hero__icon">🔍</span> ETSIN PALVELUA
           </button>
           <button class="btn-hero btn-hero--accent" @click="proInitial">
             <span class="btn-hero__icon btn-hero__icon--accent">＋</span>
             <MDBIcon></MDBIcon>
             TARJOAN PALVELUA
           </button>

         </div>
       </main>
     </div>

<!--     <div>-->
<!--       <img :src="logo" class="main-logo" style="" alt="App logo" />-->
<!--     </div>-->





<!--     <div>-->
<!--       <div class="home-vert-fit">-->
<!--         <div class="logo-hero">-->
<!--           <img class="logo-hero__img"-->
<!--                :src="logo"-->
<!--                alt="Prokeikkatori logo" width="1024" height="549" />-->
<!--         </div>-->
<!--       </div>-->







       <!--     <div class="logo-mask" style="&#45;&#45;logo: url('src/assets/logo_trans_main-edited.png')"></div>-->



       <!--     #dd7052-->
       <!--     <h1 style="color: #B45309;text-shadow: 2px 2px 5px #0E7490; font-family: fantasy, Papyrus;">PROKEIKKATORI</h1>-->







<!--     <div>-->
<!--         <h1 class="app-title">-->
<!--           <span class="app-title__word" data-text="PROKEIKKATORI">PROKEIKKATORI</span>-->
<!--         </h1>-->
<!--       </div>-->







<!--       <div class="home-vert-fit">-->
<!--         <p class="tagline">Nopeus on tärkein!</p>-->
<!--       </div>-->








       <!--     <div class="hero-actions">-->
<!--              <button class="btn-hero btn-hero&#45;&#45;primary">-->
<!--                <span class="btn-hero__icon">🔍</span> ETSIN PALVELUA-->
<!--              </button>-->

       <!--       <button class="btn-hero btn-hero&#45;&#45;accent">-->
       <!--         <span class="btn-hero__icon btn-hero__icon&#45;&#45;accent">＋</span> TARJOAN PALVELUA-->
       <!--       </button>-->
       <!--     </div>-->









       <!--     <h2 style="" class="title">{{t('home_title')}}</h2>-->
<!--       <div>-->
<!--         <div style="" class="action-panel">-->

<!--           <button class="btn-hero btn-hero&#45;&#45;primary">-->
<!--             <span class="btn-hero__icon">🔍</span> ETSIN PALVELUA-->
<!--           </button>-->

<!--           <button class="btn-hero btn-hero&#45;&#45;accent">-->
<!--             <span class="btn-hero__icon btn-hero__icon&#45;&#45;accent">＋</span> TARJOAN PALVELUA-->
<!--           </button>-->

<!--           &lt;!&ndash;       <MDBBtn color="primary" rounded size="lg" class="action-button" style="" @click="clientInitial">&ndash;&gt;-->
<!--           &lt;!&ndash;         <MDBIcon icon="search" class="icon" style="color: #8eeaff;"/>&nbsp; &nbsp; {{t('home_client_btn')}}</MDBBtn>&ndash;&gt;-->
<!--           &lt;!&ndash;       <MDBBtn color="primary" rounded size="lg" class="action-button" @click="proInitial">&ndash;&gt;-->
<!--           &lt;!&ndash;         <MDBIcon icon="plus" class="icon" size="lg" style="color: #ff8a3d;"/>&nbsp; &nbsp;{{t('home_pro_btn')}}</MDBBtn>&ndash;&gt;-->
<!--         </div>-->
<!--       </div>-->

<!--     </div>-->



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
import {useProStore} from "@/stores/providerStore.js";
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
const proStore = useProStore();

const clientInitial = () => {
  console.log("Recipient form.");
  router.push('/client-form');
}
const proInitial = () => {
  console.log("Pro form");
  if (proStore.isUserPro) {
    router.push('/pro-panel');
  } else {
    router.push('/pro-form');
  }

}

</script>

<style>
.main-logo {
  width: 70%;
  margin: auto;
  padding-top: 0;
}

.home-vert-fit {
  display: flex;
  justify-content: space-around;
}




:root{
  --header-h: 0px;   /* set if you have a fixed header, e.g. 56px */
  --footer-h: 0px;
}

html, body, #app { height: 100%; }

.center-page{
  margin: 0;
  /*min-block-size: calc(100svh - var(--header-h) - var(--footer-h));*/
  display: grid;
  place-items: center;                       /* centers horizontally + vertically */
  padding: clamp(12px, 2vh, 24px);
}

.page{
  /*width: min(92vw, 900px);*/
  display: grid;
  gap: 16px;
  justify-items: center;
  text-align: center;

  /* allow scroll if content taller than viewport */
  max-block-size: calc(100dvh - var(--header-h) - var(--footer-h) - 2 * clamp(12px, 2vh, 24px));
  overflow: hidden;
}

/* optional: responsive horizontal buttons on wide screens */
.hero-actions{ display:flex; flex-direction:column; gap:14px; width:100%; }
.hero-actions > *{ width:100%; }
@media (min-width:768px){
  .hero-actions{ flex-direction:row; justify-content:center; }
  .hero-actions > *{ width:auto; min-inline-size:260px; }
}






/*.logo-mask{*/
/*  --logo-color:#49d2ff;           !* change tint here *!*/
/*  width: min(70vw, 760px);*/
/*  aspect-ratio: 1024 / 549;       !* keep the PNG’s ratio *!*/
/*  margin: 18px auto 8px;*/
/*  background:*/
/*      radial-gradient(60% 60% at 50% 45%, rgba(73,210,255,.20), transparent 70%),*/
/*      var(--logo-color);*/
/*  !* use the PNG as an alpha mask *!*/
/*  -webkit-mask: var(--logo) center / contain no-repeat;*/
/*  mask: var(--logo) center / contain no-repeat;*/
/*  filter:*/
/*      drop-shadow(0 0 10px rgba(73,210,255,.45))*/
/*      drop-shadow(0 0 28px rgba(0,180,200,.25));*/
/*  position: relative;*/
/*}*/
/*.logo-mask::after{*/
/*  content:""; position:absolute; inset:-10%;*/
/*  background: radial-gradient(60% 50% at 50% 45%, rgba(0,0,0,.25), transparent 70%);*/
/*  z-index:-1;*/
/*}*/


/*@keyframes neonPulse {*/
/*  0%, 100% { filter: drop-shadow(0 0 8px rgba(73,210,255,.35)) drop-shadow(0 0 22px rgba(0,180,200,.20)); }*/
/*  50%      { filter: drop-shadow(0 0 12px rgba(73,210,255,.55)) drop-shadow(0 0 28px rgba(0,180,200,.35)); }*/
/*}*/
/*.logo-hero__img,*/
/*.logo-mask { animation: neonPulse 3.6s ease-in-out infinite; }*/
/*@media (prefers-reduced-motion: reduce){*/
/*  .logo-hero__img, .logo-mask { animation: none; }*/
/*}*/









:root{
  --bg:#0c1117;
  --cyan:#49d2ff;
  --cyan-2:#00b4c8;
  --orange:#ff8a3d;
}

/* responsive container + subtle vignette & glow behind the logo */
.logo-hero{
  position: relative;
  max-width: clamp(280px, 70vw, 760px);
  margin: 18px auto 8px;
}
.logo-hero::before{
  /* cyan glow halo */
  content:"";
  position:absolute; inset: -6% -8% -2%;
  background:
      radial-gradient(60% 60% at 50% 45%, rgba(255, 112, 73, 0.2), transparent 50%),
      radial-gradient(30% 20% at 52% 18%, rgba(73,210,255,.25), transparent 50%);
  filter: blur(4px);
  pointer-events:none;
}
.logo-hero::after{
  /* dark vignette so the logo pops on any section */
  content:"";
  position:absolute; inset:-12% -14%;
  background: radial-gradient(60% 50% at 50% 45%, rgba(0,0,0,.25), transparent 70%);
  z-index:-1;
}

/* the PNG itself: crisp + neon drop-shadow */
.logo-hero__img{
  display:block; width:100%; height:auto;
  /*image-rendering: -webkit-optimize-contrast;*/
  /*filter:*/
  /*    drop-shadow(0 0 10px rgba(73,210,255,.45))*/
  /*    drop-shadow(0 0 28px rgba(0,180,200,.25));*/
}
@media (min-width:768px){
  .logo-hero{ margin-top: 22px; }
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
  /*text-shadow:*/
  /*    0 1px 0 rgba(255,255,255,.35),*/
  /*    0 0 10px rgba(73,210,255,.55),*/
  /*    0 0 28px rgba(0,180,200,.35),*/
  /*    0 0 54px rgba(0,160,180,.25);*/

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
  width: 100%;
  justify-content: center;
  gap: 20px;
}
.action-button {
  width: 330px;
  /*border-radius: 3%;*/
  margin-top: 17px;
  padding: 20px 20px;
}





:root{
  --bg:#0c1117;
  --cyan:#49d2ff;
  --cyan-2:#00b4c8;
  --cyan-3:#8eeaff;
  --cyan-deep:#0a3340;
  --orange:#ff8a3d;
  --text:#e8f6ff;
}

/* Tagline under PROKEIKKATORI */
.tagline{
  margin: 6px auto 18px;
  font: 700 clamp(18px, 3.8vw, 28px)/1.2 "Inter", system-ui, sans-serif;
  letter-spacing:.04em;
  color: transparent;
  background: linear-gradient(180deg, #dff7ff 0%, var(--cyan-3) 65%, var(--cyan) 100%);
  -webkit-background-clip:text;
  text-shadow:
      0 0 8px rgba(73,210,255,.35),
      0 0 22px rgba(0,180,200,.25);
  text-align:center;
}

/* Actions container */
.hero-actions{
  display:grid;
  gap:14px;
  /*max-width: 320px;*/

  margin-inline:auto;
}

/* Neon pill buttons */
.btn-hero{
  --btn-glow: rgba(73,210,255,.35);
  display:flex; align-items:center; justify-content:center;
  gap:.6rem;
  /*width:100%;*/
  width: 290px;
  /*padding:.95rem 1.2rem;*/
  padding: 33px 13px;
  border-radius:999px;
  font: 800 14px/1 "Inter", system-ui, sans-serif;
  letter-spacing:.08em;
  text-transform:uppercase;
  color:var(--text);
  background:
      radial-gradient(140% 200% at -10% -30%, rgba(255,255,255,.18) 0%, transparent 50%),
      linear-gradient(180deg, #177da2 0%, #0f5a73 100%);
  border:1px solid rgba(142,234,255,.35);
  box-shadow:
      0 8px 18px rgba(0,0,0,.35),
      0 0 0 1px rgba(73,210,255,.18) inset,
      0 0 16px var(--btn-glow);
  transition: transform .12s ease, box-shadow .15s ease, filter .15s ease, border-color .15s ease;
}

/* Primary (Find a service) – cool cyan */
.btn-hero--primary{
  background:
      radial-gradient(140% 200% at -10% -30%, rgba(255,255,255,.18) 0%, transparent 50%),
      linear-gradient(180deg, #1d8cb2 0%, #126b86 100%);
}

/* Accent (Provide a service) – subtle orange edge */
.btn-hero--accent{
  border-color: rgba(255,138,61,.55);
  box-shadow:
      0 8px 18px rgba(0,0,0,.35),
      0 0 0 1px rgba(255,138,61,.35) inset,
      0 0 16px rgba(255,138,61,.28),
      0 0 16px rgba(73,210,255,.25);
}

/* Icons */
.btn-hero__icon{ font-size: 2rem; filter: drop-shadow(0 0 6px rgba(73,210,255,.55));  }
.btn-hero__icon--accent{ color:var(--orange); filter: drop-shadow(0 0 6px rgba(255,138,61,.6)); }

/* Hover / active / focus */
.btn-hero:hover{
  transform: translateY(-1px);
  box-shadow:
      0 12px 24px rgba(0,0,0,.38),
      0 0 0 1px rgba(73,210,255,.28) inset,
      0 0 22px rgba(73,210,255,.55);
}
.btn-hero:active{ transform: translateY(0); filter: brightness(.96); }
.btn-hero:focus-visible{
  outline: none;
  box-shadow:
      0 0 0 2px rgba(12,17,23,1),
      0 0 0 4px rgba(73,210,255,.85),
      0 8px 18px rgba(0,0,0,.35);
}


@media (max-width: 630px) {
  .main-logo {

    margin: auto;
    padding-top: 30px;
    padding-bottom: 50px;
  }
  .action-panel {
    display: block;
    width: 80%;
    flex-direction: column;

    justify-content: center;
    margin-inline:auto;
    gap: 14px;
  }
  .btn-hero{
    --btn-glow: rgba(73,210,255,.35);
    display:flex; align-items:center; justify-content:center;
    /*gap:.6rem;*/
    width:100%;
    /*padding:.95rem 1.2rem;*/
    padding: 23px 13px;
    margin-top: 17px;
    border-radius:999px;
    font: 800 14px/1 "Inter", system-ui, sans-serif;
    letter-spacing:.08em;
    text-transform:uppercase;
    color:var(--text);
    background:
        radial-gradient(140% 200% at -10% -30%, rgba(255,255,255,.18) 0%, transparent 50%),
        linear-gradient(180deg, #177da2 0%, #0f5a73 100%);
    border:1px solid rgba(142,234,255,.35);
    box-shadow:
        0 8px 18px rgba(0,0,0,.35),
        0 0 0 1px rgba(73,210,255,.18) inset,
        0 0 16px var(--btn-glow);
    transition: transform .12s ease, box-shadow .15s ease, filter .15s ease, border-color .15s ease;
  }

  .btn-hero--accent{
    border-color: rgba(255,138,61,.55);
    box-shadow:
        0 8px 18px rgba(0,0,0,.35),
        0 0 0 1px rgba(255,138,61,.35) inset,
        0 0 16px rgba(255,138,61,.28),
        0 0 16px rgba(73,210,255,.25);
  }
  /*.action-button {*/
  /*  width: 220px;*/
  /*  !*border-radius: 3%;*!*/
  /*  margin-top: 17px;*/
  /*  padding: 20px 20px;*/
  /*}*/
}

/* Keep everything tight on very small screens */
@media (max-width:360px){
  .btn-hero{ padding:.9rem 1rem; font-weight: 800; }
}

/* Optional: tiny orange underline under title if you want to mirror PROKEIKKATORI */
.app-title__word::after{
  content:""; display:block; height:4px; border-radius:999px; margin-top:6px;
  background: radial-gradient(60% 140% at 50% 50%, var(--orange) 0%, rgba(255,138,61,.55) 40%, transparent 70%);
  filter: blur(1px);
}
</style>
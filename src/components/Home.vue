<template>
  <div class="home-wrap">
    <MDBContainer fluid class="home-container">
      <MDBRow class="home-row align-items-stretch">
        <!-- Vasak infopaneel: suurel ekraanil vasakul, väiksemal hero all. -->
        <MDBCol col="12" xl="5" class="info-col order-2 order-xl-1">
          <section class="info-panel">
            <article class="info-card client-card">
              <div class="info-label">{{ t('home.clientLabel') }}</div>
              <h2>{{ t('home.clientTitle') }}</h2>

              <p>
                {{ t('home.clientTextBeforeMap') }}
                <button class="text-link text-link--client" type="button" @click="router.push('/pro-around')">
                  {{ t('home.map') }}
                </button>.
                {{ t('home.clientTextAfterMap') }}
              </p>

              <div class="stats-row">
                <div class="stat-box">
                  <strong>{{ providerCount }}+</strong>
                  <span>{{ t('home.professionals') }}</span>
                </div>
                <div class="stat-box">
                  <strong>{{ professionCount }}+</strong>
                  <span>{{ t('home.professionFields') }}</span>
                </div>
                <div class="stat-box">
                  <strong>{{ t('home.fast') }}</strong>
                  <span>{{ t('home.contact') }}</span>
                </div>
              </div>

              <button class="info-btn info-btn--client" type="button" @click="clientInitial">
                {{ t('home.clientButton') }}
              </button>
            </article>

            <article class="info-card provider-card">
              <div class="info-label">{{ t('home.providerLabel') }}</div>
              <h2>{{ t('home.providerTitle') }}</h2>

              <p>
                {{ t('home.providerTextBeforeClients') }}
                <button class="text-link text-link--provider" type="button" @click="router.push('/client-around')">
                  {{ t('home.clients') }}
                </button>
                {{ t('home.providerTextAfterClients') }}
              </p>

              <div class="stats-row">
                <div class="stat-box">
                  <strong>{{ t('home.mapTitle') }}</strong>
                  <span>{{ t('home.visibility') }}</span>
                </div>
                <div class="stat-box">
                  <strong>{{ t('home.offers') }}</strong>
                  <span>{{ t('home.directly') }}</span>
                </div>
                <div class="stat-box">
                  <strong>{{ t('home.calendar') }}</strong>
                  <span>{{ t('home.management') }}</span>
                </div>
              </div>

              <button class="info-btn info-btn--provider" type="button" @click="proInitial">
                {{ t('home.providerButton') }}
              </button>
            </article>
          </section>
        </MDBCol>

        <!-- Parempoolne hero: kaheveeruline paigutus algab alles xl breakpoint'ist. -->
        <MDBCol col="12" xl="7" class="hero-col order-1 order-xl-2">
          <div class="center-page">
            <main class="hero-frame">
              <div class="logo-hero">
                <img
                  class="logo-hero__img img-box"
                  :src="logo"
                  :alt="t('home.logoAlt')"
                  width="1024"
                  height="549"
                />
              </div>
              <!-- class="app-title__word" -->
              <h1 class="app-title">
                <span class="tagline app-title__word">{{ t('home.title') }}</span>
              </h1>

              <!-- <p class="tagline">{{ t('home.title') }}</p> -->

              <div class="action-panel">
                <button class="btn-hero btn-hero--primary" type="button" @click="clientInitial">
                  {{ t('home.clientButton') }}
                </button>

                <button class="btn-hero btn-hero--accent" type="button" @click="proInitial">
                  {{ t('home.providerButton') }}
                </button>
              </div>
            </main>
          </div>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  </div>
</template>

<script setup>
import { MDBContainer, MDBRow, MDBCol } from 'mdb-vue-ui-kit'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n/dist/vue-i18n'
import { useProStore } from '@/stores/providerStore.js'
import '@/styles/theme.css'
import logo from '@/assets/duun_hub_hero.png'

defineOptions({
  name: 'Home'
})

const router = useRouter()
const { t } = useI18n()
const proStore = useProStore()
const { providerCount, professionCount } = storeToRefs(proStore)

const clientInitial = () => {
  router.push('/client-form')
}

const proInitial = async () => {
  const savedUser = localStorage.getItem('loggedAppUser')

  if (!savedUser) {
    router.push({
      path: '/login-panel',
      query: { redirect: '/provider-form' }
    })
    return
  }

  let user

  try {
    user = JSON.parse(savedUser)
  } catch (error) {
    localStorage.removeItem('loggedAppUser')
    router.push({
      path: '/login-panel',
      query: { redirect: '/provider-form' }
    })
    return
  }

  await proStore.getProState(user.id)

  if (proStore.isUserPro) {
    router.push({ name: 'providerAdmin' })
    return
  }

  router.push({ name: 'ProviderForm' })
}
</script>

<style>
:root {
  --home-header-height: 46px;
  --home-max-width: 1480px;
  --home-card-width: 500px;
  --home-gap: clamp(18px, 2vw, 34px);

  /* Backgrounds */
  --home-bg: #090f18;
  --home-panel-start: rgba(24, 36, 49, 0.98);
  --home-panel-end: rgba(9, 15, 24, 0.99);

  /* Client: blue / cyan */
  --home-blue: #08b8dc;
  --home-blue-light: #68e5fb;
  --home-blue-dark: #06677d;

  /* Provider: orange */
  --home-orange: #ef8627;
  --home-orange-light: #ffc078;
  --home-orange-dark: #9c3d0d;

  /* Text */
  --home-cyan: #35d5f4;
  --home-cyan-light: #a3f1ff;
  --home-text: #f4f8fc;
  --home-muted: #a8b6c7;
  --home-muted-dark: #8392a5;
}

html,
body,
#app {
  min-height: 100%;
}

.home-wrap,
.home-container,
.home-row,
.info-col,
.hero-col,
.info-panel,
.center-page,
.hero-frame,
.logo-hero,
.action-panel {
  min-width: 0;
  box-sizing: border-box;
}

.home-wrap {
  min-height: calc(100dvh - var(--home-header-height));
  display: flex;
  align-items: center;
  padding-block: clamp(18px, 3vh, 36px);

  background:
    radial-gradient(
      circle at 70% 35%,
      rgba(8, 184, 220, 0.055),
      transparent 34%
    ),
    radial-gradient(
      circle at 28% 78%,
      rgba(239, 134, 39, 0.035),
      transparent 30%
    ),
    var(--home-bg);
}

.home-container {
  width: 100%;
  max-width: var(--home-max-width);
  margin-inline: auto;
  padding-inline: clamp(12px, 2vw, 28px);
}

.home-row {
  width: 100%;
  margin-inline: 0;
  row-gap: 24px;
}

.info-col,
.hero-col {
  display: flex;
  align-items: stretch;
}

.info-col {
  justify-content: center;
}

.hero-col {
  justify-content: stretch;
}

/* LEFT COLUMN */

.info-panel {
  width: 100%;
  max-width: var(--home-card-width);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: clamp(22px, 4vh, 64px);
  padding: 0;
}

.info-card {
  width: 100%;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  text-align: left;
  padding: clamp(18px, 1.7vw, 24px);
  border-radius: 20px;

  background:
    linear-gradient(
      145deg,
      rgba(25, 37, 51, 0.98),
      rgba(10, 16, 25, 0.99)
    );

  border: 1px solid rgba(125, 166, 195, 0.2);

  box-shadow:
    0 15px 38px rgba(0, 0, 0, 0.38),
    inset 0 1px 0 rgba(255, 255, 255, 0.025);
}

.client-card {
  border-color: rgba(8, 184, 220, 0.58);

  box-shadow:
    0 15px 38px rgba(0, 0, 0, 0.38),
    0 0 24px rgba(8, 184, 220, 0.05);
}

.provider-card {
  border-color: rgba(239, 134, 39, 0.56);

  box-shadow:
    0 15px 38px rgba(0, 0, 0, 0.38),
    0 0 24px rgba(239, 134, 39, 0.045);
}

.info-label {
  display: inline-block;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.client-card .info-label {
  color: var(--home-blue-light);
}

.provider-card .info-label {
  color: var(--home-orange-light);
}

.info-card h2 {
  margin: 0 0 10px;
  color: var(--home-text);
  font-size: clamp(19px, 1.6vw, 23px);
  line-height: 1.2;
}

.info-card p {
  margin: 0 0 18px;
  color: var(--home-muted);
  font-size: 14px;
  line-height: 1.6;
}

.text-link {
  appearance: none;
  display: inline;
  border: 0;
  padding: 0;
  background: transparent;
  font: inherit;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;

  transition:
    color 0.15s ease,
    filter 0.15s ease;
}

.text-link--client {
  color: var(--home-blue-light);
}

.text-link--provider {
  color: var(--home-orange-light);
}

.text-link:hover {
  filter: brightness(1.18);
}

/* STATS */

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.stat-box {
  min-width: 0;
  padding: 12px 8px;
  border-radius: 13px;

  background:
    linear-gradient(
      145deg,
      rgba(39, 53, 70, 0.56),
      rgba(20, 29, 41, 0.65)
    );

  border: 1px solid rgba(145, 180, 205, 0.07);
  text-align: center;

  transition:
    border-color 0.15s ease,
    transform 0.15s ease;
}

.client-card .stat-box:hover {
  border-color: rgba(8, 184, 220, 0.28);
}

.provider-card .stat-box:hover {
  border-color: rgba(239, 134, 39, 0.28);
}

.stat-box:hover {
  transform: translateY(-1px);
}

.stat-box strong,
.stat-box span {
  display: block;
}

.stat-box strong {
  color: #f7fbff;
  font-size: 15px;
}

.stat-box span {
  margin-top: 4px;
  color: var(--home-muted-dark);
  font-size: 11px;
  line-height: 1.25;
}

/* LEFT BUTTONS */

.info-btn {
  width: 100%;
  margin-top: 0;
  border-radius: 11px;
  padding: 14px 16px;

  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  cursor: pointer;

  transition:
    transform 0.15s ease,
    filter 0.15s ease,
    box-shadow 0.15s ease;
}

.info-btn--client {
  color: #031a21;
  border: 1px solid rgba(104, 229, 251, 0.72);

  background:
    radial-gradient(
      140% 180% at -10% -30%,
      rgba(255, 255, 255, 0.23),
      transparent 48%
    ),
    linear-gradient(
      180deg,
      #6ce9fc 0%,
      #10b8d6 48%,
      #06677d 100%
    );

  box-shadow:
    0 8px 18px rgba(0, 0, 0, 0.3),
    0 0 16px rgba(8, 184, 220, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.38);
}

.info-btn--provider {
  color: #2a1003;
  border: 1px solid rgba(255, 192, 120, 0.72);

  background:
    radial-gradient(
      140% 180% at -10% -30%,
      rgba(255, 255, 255, 0.21),
      transparent 48%
    ),
    linear-gradient(
      180deg,
      #ffc27e 0%,
      #ef8627 48%,
      #9c3d0d 100%
    );

  box-shadow:
    0 8px 18px rgba(0, 0, 0, 0.3),
    0 0 16px rgba(239, 134, 39, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.32);
}

/* HERO COLUMN */

.center-page {
  width: 100%;
  height: 100%;
  display: flex;
  padding-left: var(--home-gap);
}

.hero-frame {
  position: relative;
  isolation: isolate;
  overflow: hidden;

  width: 100%;
  height: 100%;
  min-height: clamp(680px, calc(100dvh - 115px), 800px);
  margin: 0;
  padding: clamp(22px, 2.4vw, 38px);
  border-radius: 24px;

  display: flex;
  flex-direction: column;
  align-items: center;

  background:
    linear-gradient(
      150deg,
      rgba(28, 42, 56, 0.98),
      rgba(10, 16, 25, 0.99) 72%
    );

  border: 1px solid transparent;

  box-shadow:
    0 18px 45px rgba(0, 0, 0, 0.45),
    -8px -5px 28px rgba(8, 184, 220, 0.055),
    8px 6px 28px rgba(239, 134, 39, 0.055);
}

.hero-frame::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  padding: 1px;
  border-radius: inherit;
  pointer-events: none;

  background:
    linear-gradient(
      135deg,
      rgba(53, 213, 244, 0.92),
      rgba(53, 213, 244, 0.15) 42%,
      rgba(239, 134, 39, 0.14) 60%,
      rgba(239, 134, 39, 0.88)
    );

  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.hero-frame::after {
  content: "";
  position: absolute;
  inset: 1px;
  z-index: -1;
  border-radius: inherit;
  pointer-events: none;

  background:
    radial-gradient(
      circle at 12% 8%,
      rgba(8, 184, 220, 0.1),
      transparent 38%
    ),
    radial-gradient(
      circle at 90% 92%,
      rgba(239, 134, 39, 0.085),
      transparent 42%
    );
}

/* LOGO */

.logo-hero {
  position: relative;
  width: min(100%, 760px);
  margin: 0 auto;
  padding: clamp(2px, 0.8vw, 10px);
}

.logo-hero::before {
  content: "";
  position: absolute;
  inset: -6% -8% -2%;
  pointer-events: none;

  background:
    radial-gradient(
      55% 55% at 36% 42%,
      rgba(8, 184, 220, 0.18),
      transparent 66%
    ),
    radial-gradient(
      46% 50% at 72% 45%,
      rgba(239, 134, 39, 0.15),
      transparent 68%
    );
}

.logo-hero__img {
  position: relative;
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  box-sizing: border-box;
}

/* Logo's round circle */
/* .img-box {
  padding: clamp(10px, 1.4vw, 20px);
  border: 3px solid;
  border-radius: 50%;

  border-top-color: var(--home-blue);
  border-left-color: var(--home-blue);
  border-right-color: var(--home-orange);
  border-bottom-color: var(--home-orange);

  background:
    radial-gradient(
      circle at 50% 40%,
      #253544 0%,
      #1b2733 58%,
      #151e28 100%
    );

  box-shadow:
    -10px -6px 25px rgba(8, 184, 220, 0.13),
    10px 8px 26px rgba(239, 134, 39, 0.16),
    0 18px 38px rgba(0, 0, 0, 0.4);
} */

/* TITLE */

.app-title {
  width: 100%;
  margin: auto 0 ;
  display: flex;
  justify-content: center;
  text-align: center;
}

.app-title__word {
  position: relative;
  max-width: 100%;

  text-transform: uppercase;
  white-space: nowrap;

  color: transparent;

  background:
    linear-gradient(
      180deg,
      #f1fdff 0%,
      #9ceeff 46%,
      #32c9e8 100%
    );

  -webkit-background-clip: text;
  background-clip: text;

  filter:
    drop-shadow(0 3px 7px rgba(0, 0, 0, 0.52));
}

.app-title__word::after {
  content: "";
  position: absolute;
  left: 8%;
  right: 8%;
  bottom: -11px;
  height: 3px;
  border-radius: 999px;

  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(239, 134, 39, 0.86),
      transparent
    );

  box-shadow:
    0 0 10px rgba(239, 134, 39, 0.35);
}

@supports (-webkit-text-stroke: 1px transparent) {
  .app-title__word {
    -webkit-text-stroke:
      1px rgba(5, 103, 128, 0.66);
  }
}

.tagline {
  margin: 16px auto 24px;
  text-align: center;

  font:
    700 clamp(19px, 2.2vw, 29px) / 1.2
    "Inter",
    system-ui,
    sans-serif;

  letter-spacing: 0.045em;

  color: transparent;

  background:
    linear-gradient(
      180deg,
      #effdff 0%,
      #99ecfb 55%,
      #35c9e6 100%
    );

  -webkit-background-clip: text;
  background-clip: text;

  text-shadow:
    0 0 7px rgba(53, 213, 244, 0.3),
    0 0 18px rgba(8, 184, 220, 0.16);
}

/* HERO BUTTONS */

.action-panel {
  width: min(100%, 760px);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(12px, 1.4vw, 18px);
}

.btn-hero {
  width: 100%;
  min-width: 0;
  padding: clamp(20px, 2vw, 28px) 12px;
  border-radius: 9px;
  box-sizing: border-box;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  font:
    800 clamp(13px, 1.2vw, 17px) / 1
    "Inter",
    system-ui,
    sans-serif;

  letter-spacing: 0.09em;
  text-transform: uppercase;

  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    filter 0.15s ease;
}

.btn-hero--primary {
  color: #031a22;
  border: 1px solid rgba(108, 232, 255, 0.72);

  background:
    radial-gradient(
      140% 180% at -10% -30%,
      rgba(255, 255, 255, 0.23),
      transparent 48%
    ),
    linear-gradient(
      180deg,
      #6be7fb 0%,
      #10b9d8 48%,
      #06667c 100%
    );

  box-shadow:
    0 9px 22px rgba(0, 0, 0, 0.36),
    0 0 18px rgba(8, 184, 220, 0.21),
    inset 0 1px 0 rgba(255, 255, 255, 0.38);
}

.btn-hero--accent {
  color: #2a1003;
  border: 1px solid rgba(255, 185, 111, 0.72);

  background:
    radial-gradient(
      140% 180% at -10% -30%,
      rgba(255, 255, 255, 0.21),
      transparent 48%
    ),
    linear-gradient(
      180deg,
      #ffc17d 0%,
      #ef8627 48%,
      #9c3c0c 100%
    );

  box-shadow:
    0 9px 22px rgba(0, 0, 0, 0.36),
    0 0 18px rgba(239, 134, 39, 0.19),
    inset 0 1px 0 rgba(255, 255, 255, 0.32);
}

/* INTERACTIONS */

.btn-hero:hover,
.info-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.07);
}

.btn-hero--primary:hover,
.info-btn--client:hover {
  box-shadow:
    0 12px 26px rgba(0, 0, 0, 0.4),
    0 0 24px rgba(8, 184, 220, 0.3);
}

.btn-hero--accent:hover,
.info-btn--provider:hover {
  box-shadow:
    0 12px 26px rgba(0, 0, 0, 0.4),
    0 0 24px rgba(239, 134, 39, 0.27);
}

.btn-hero:active,
.info-btn:active {
  transform: translateY(0);
  filter: brightness(0.96);
}

.btn-hero:focus-visible,
.info-btn:focus-visible,
.text-link:focus-visible {
  outline: 2px solid var(--home-cyan-light);
  outline-offset: 3px;
}

/* TABLET */

@media (max-width: 1199.98px) {
  .home-wrap {
    align-items: flex-start;
  }

  .info-col,
  .hero-col {
    justify-content: center;
  }

  .center-page {
    max-width: 920px;
    height: auto;
    padding-left: 0;
  }

  .hero-frame {
    height: auto;
    min-height: 680px;
  }

  .info-panel {
    max-width: 920px;
    height: auto;
    justify-content: flex-start;
    gap: 22px;
  }
}

/* MOBILE */

@media (max-width: 720px) {
  .home-container {
    padding-inline: 10px;
  }

  .hero-frame {
    min-height: auto;
    padding: 18px 14px 22px;
    border-radius: 19px;
  }

  .logo-hero {
    padding: 0;
  }

  /* .app-title {
    margin-top: 28px;
  } */

  .tagline {
    margin-bottom: 18px;
  }

  .action-panel {
    grid-template-columns: 1fr;
  }

  .info-card {
    padding: 18px;
    border-radius: 18px;
  }
}

@media (max-width: 480px) {
  .stats-row {
    grid-template-columns: 1fr;
  }

  .app-title__word {
    white-space: normal;
    overflow-wrap: anywhere;
  }
}
</style>
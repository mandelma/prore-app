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

              <h1 class="app-title">
                <span class="app-title__word">{{ t('home.brandName') }}</span>
              </h1>

              <p class="tagline">{{ t('home.title') }}</p>

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
import logo from '@/assets/logo_trans_main-edited.png'

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

  --home-bg: #0c1117;
  --home-panel-start: rgba(24, 31, 43, 0.97);
  --home-panel-end: rgba(10, 15, 23, 0.98);

  --home-green: #59b898;
  --home-green-light: #6ee4aa;
  --home-green-dark: #116b4d;

  --home-orange: #c9824b;
  --home-orange-light: #e4b088;
  --home-orange-dark: #8c4218;

  --home-cyan: #49d2ff;
  --home-cyan-light: #8eeaff;
  --home-text: #f4f4f4;
  --home-muted: #aeb7c5;
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

/*
 * Võrdse kõrguse võti:
 * - hero määrab rea loomuliku kõrguse;
 * - mõlemad Bootstrap-veerud venivad rea kõrguseks;
 * - info-panel täidab selle kõrguse;
 * - justify-content: space-between venitab kaartide VAHET, mitte kaarte.
 */
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
  border-radius: 22px;
  background: linear-gradient(145deg, var(--home-panel-start), var(--home-panel-end));
  border: 1px solid rgba(105, 210, 220, 0.25);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.35);
}

.client-card {
  border-color: rgba(81, 220, 170, 0.52);
}

.provider-card {
  border-color: rgba(230, 150, 75, 0.55);
}

.info-label {
  display: inline-block;
  margin-bottom: 8px;
  color: #39d7f2;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
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
}

.text-link--client {
  color: var(--home-green);
}

.text-link--provider {
  color: var(--home-orange-light);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.stat-box {
  min-width: 0;
  padding: 11px 8px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.045);
  text-align: center;
}

.stat-box strong,
.stat-box span {
  display: block;
}

.stat-box strong {
  color: #fff;
  font-size: 15px;
}

.stat-box span {
  margin-top: 3px;
  color: #8f9aaa;
  font-size: 11px;
  line-height: 1.25;
}

.info-btn {
  width: 100%;
  margin-top: 0;
  border: 0;
  border-radius: 12px;
  padding: 14px 16px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
}

.info-btn--client {
  color: #061514;
  background: linear-gradient(180deg, var(--home-green-light), var(--home-green-dark));
}

.info-btn--provider {
  color: #160b04;
  background: linear-gradient(180deg, var(--home-orange-light), var(--home-orange-dark));
}

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

  background: linear-gradient(145deg, var(--home-panel-start), var(--home-panel-end));
  border: 1px solid transparent;
  box-shadow:
    0 14px 38px rgba(0, 0, 0, 0.38),
    -5px -4px 24px rgba(81, 220, 170, 0.07),
    5px 4px 24px rgba(230, 150, 75, 0.08);
}

.hero-frame::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  padding: 1px;
  border-radius: inherit;
  pointer-events: none;

  background: linear-gradient(
    135deg,
    rgba(81, 220, 170, 0.88),
    rgba(81, 220, 170, 0.24) 42%,
    rgba(230, 150, 75, 0.24) 58%,
    rgba(230, 150, 75, 0.9)
  );

  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.hero-frame::after {
  content: '';
  position: absolute;
  inset: 1px;
  z-index: -1;
  border-radius: inherit;
  pointer-events: none;
  background:
    radial-gradient(circle at 12% 8%, rgba(81, 220, 170, 0.07), transparent 38%),
    radial-gradient(circle at 90% 92%, rgba(230, 150, 75, 0.07), transparent 42%);
}

.logo-hero {
  position: relative;
  width: min(100%, 760px);
  margin: 0 auto;
  padding: clamp(2px, 0.8vw, 10px);
}

.logo-hero::before {
  content: '';
  position: absolute;
  inset: -6% -8% -2%;
  pointer-events: none;
  background:
    radial-gradient(60% 60% at 50% 45%, rgba(231, 141, 99, 0.18), transparent 60%),
    radial-gradient(30% 20% at 52% 18%, rgba(58, 190, 140, 0.22), transparent 60%);
}

.logo-hero__img {
  position: relative;
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  box-sizing: border-box;
}

.img-box {
  padding: clamp(10px, 1.4vw, 20px);
  border: 3px solid;
  border-radius: 50%;
  border-top-color: var(--home-green);
  border-left-color: var(--home-green);
  border-right-color: #c48c58;
  border-bottom-color: #c48c58;
  background: #1e2731;
  box-shadow: 0.3em 0.3em 1em rgba(244, 163, 110, 0.35);
}

/* margin-top:auto loob logo ja pealkirja vahele pildil nähtava paindliku ruumi. */
.app-title {
  width: 100%;
  margin: auto 0 8px;
  display: flex;
  justify-content: center;
  text-align: center;
}

.app-title__word {
  position: relative;
  max-width: 100%;
  font: 900 clamp(30px, 4.1vw, 58px) / 1 'Orbitron', system-ui, sans-serif;
  letter-spacing: clamp(0.06em, 0.72vw, 0.14em);
  text-transform: uppercase;
  white-space: nowrap;

  color: transparent;
  background: linear-gradient(180deg, #eafcff 0%, var(--home-cyan-light) 55%, var(--home-cyan) 100%);
  -webkit-background-clip: text;
}

.app-title__word::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -11px;
  height: 4px;
  border-radius: 999px;
  opacity: 0.9;
  filter: blur(1px);
  background: radial-gradient(60% 140% at 50% 50%, #ff8a3d 0%, rgba(255, 138, 61, 0.65) 35%, transparent 70%);
}

@supports (-webkit-text-stroke: 1px transparent) {
  .app-title__word {
    -webkit-text-stroke: 1px rgba(255, 138, 61, 0.55);
  }
}

.tagline {
  margin: 16px auto 24px;
  text-align: center;
  font: 700 clamp(19px, 2.2vw, 29px) / 1.2 'Inter', system-ui, sans-serif;
  letter-spacing: 0.04em;

  color: transparent;
  background: linear-gradient(180deg, #dff7ff 0%, var(--home-cyan-light) 65%, var(--home-cyan) 100%);
  -webkit-background-clip: text;
  text-shadow:
    0 0 8px rgba(73, 210, 255, 0.35),
    0 0 22px rgba(0, 180, 200, 0.25);
}

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
  border: 1px solid rgba(142, 234, 255, 0.35);
  border-radius: 8px;
  box-sizing: border-box;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  color: rgb(83, 31, 12);
  font: 800 clamp(13px, 1.2vw, 17px) / 1 'Inter', system-ui, sans-serif;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  background:
    radial-gradient(140% 200% at -10% -30%, rgba(255, 255, 255, 0.18), transparent 50%),
    linear-gradient(180deg, #e2b895 0%, #773419 100%);

  box-shadow:
    0 8px 18px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(255, 155, 73, 0.18) inset,
    0 0 16px rgba(73, 210, 255, 0.35);

  transition: transform 0.12s ease, box-shadow 0.15s ease, filter 0.15s ease;
}

.btn-hero--primary {
  color: rgb(4, 48, 4);
  background:
    radial-gradient(140% 200% at -10% -30%, rgba(255, 255, 255, 0.18), transparent 50%),
    linear-gradient(180deg, #5ad396 0%, #0c4b3b 100%);
}

.btn-hero--accent {
  border-color: rgba(255, 138, 61, 0.55);
}

.btn-hero:hover,
.info-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.04);
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

/*
 * Alla 1200 px lähevad plokid üksteise alla. See väldib varasemat
 * umbes 1000 px laiuse probleemi, kus logo ja pealkiri suruti 7/12 veergu.
 */
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

  .app-title__word {
    font-size: clamp(29px, 6vw, 54px);
  }
}

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

  .app-title {
    margin-top: 28px;
  }

  .app-title__word {
    font-size: clamp(23px, 7.6vw, 42px);
    letter-spacing: clamp(0.035em, 0.7vw, 0.08em);
  }

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

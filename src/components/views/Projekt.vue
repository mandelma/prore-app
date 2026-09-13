<template>
  <main class="portfolio">
    <!-- HERO -->
    <section class="portfolio-hero">
      <div class="portfolio-container">
        <div class="portfolio-hero__content">
          <span class="portfolio-eyebrow">
            Full Stack SaaS projekt
          </span>

          <h1 class="portfolio-title" id="home">
            DuunHub
          </h1>

          <p class="portfolio-lead">
            DuunHub on teenuste vahendusplatvorm, mille eesmärk on viia
            kliendid kohalike väikeettevõtete ja iseseisvate teenusepakkujatega
            kokku võimalikult kiiresti ja lihtsalt.
            Klient saab sobiva teenusepakkuja leida kahel erineval viisil:

            <span class="portfolio-lead-chapter">Küsi pakkumisi</span>

            Klient loob teenuse tellimuse, kirjeldades tööd, asukohta,
            soovitud aega ja muid vajalikke üksikasju. Sobivad teenusepakkujad
            saavad seejärel saata oma pakkumised, mis võimaldab kliendil
            erinevaid variante võrrelda ja valida neist sobivaima.

            <span class="portfolio-lead-chapter">Leia ja broneeri teenusepakkuja otse</span>

            Klient saab otsida teenusepakkujaid otse kaardilt ameti ja
            kauguse järgi. Teenusepakkuja saadavus on kohe nähtav —
            rohelised markerid tähistavad hetkel vabu teenusepakkujaid,
            oranžid markerid aga neid, kellega tuleb aeg eraldi kokku leppida.
            Klient saab avada teenusepakkuja profiili ja saata
            broneerimistaotluse otse valitud teenusepakkujale.

            Mõlema lahenduse eesmärk on sama: muuta kohalike spetsialistide
            leidmine kliendi jaoks võimalikult lihtsaks ning aidata väikestel
            teenuseettevõtetel leida sobivaid tööpakkumisi.
          </p>

          <div class="portfolio-stack">
            <span>Vue 3</span>
            <span>Node.js</span>
            <span>Express</span>
            <span>MongoDB</span>
            <span>Socket.IO</span>
            <span>AWS S3</span>
            <span>Google Maps</span>
          </div>

          <div class="portfolio-actions">
            <a
              href="/"
              class="portfolio-btn portfolio-btn--primary"
            >
              Ava rakendus
            </a>

            <a
              href="#technical"
              class="portfolio-btn portfolio-btn--secondary"
            >
              Tehniline ülevaade
            </a>
          </div>
        </div>

        <div class="portfolio-hero__visual">
          <div class="portfolio-browser">
            <div class="portfolio-browser__bar">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div class="portfolio-browser__content">
              <div class="hero-screenshots">

                <!-- HOME -->
                <figure class="hero-screenshot">
                  <img
                    src="@/assets/portfolio/duunhub-home.png"
                    alt="DuunHub avaleht"
                  />

                  <figcaption>
                    <strong>Avaleht</strong>
                    <span>
                      Lähtepunkt kohalike teenuste leidmiseks ja
                      teenuse tellimuse loomiseks.
                    </span>
                  </figcaption>
                </figure>

                <!-- PROVIDER -->
                <figure class="hero-screenshot">
                  <img
                    src="@/assets/portfolio/duunhub-provider-chat.png"
                    alt="DuunHub teenusepakkuja töölaud"
                  />

                  <figcaption>
                    <strong>Teenusepakkuja töölaud</strong>
                    <span>
                      Teenusepakkujad saavad hallata tellimusi, pakkumisi,
                      saadavust ja tulevasi töid.
                    </span>
                  </figcaption>
                </figure>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- INTRO -->
    <section class="portfolio-section">
      <div class="portfolio-container portfolio-container--narrow">
        <span class="portfolio-section__label">
          Projekt
        </span>

        <h2>
          Terviklik teenuste vahendusplatvorm
        </h2>

        <p class="portfolio-section__intro">
          DuunHub on loodud kohalikke teenuseid otsivatele klientidele
          ning uusi töid otsivatele väikestele teenusepakkujatele.
          Kliendid saavad luua teenuse tellimusi ning teenusepakkujad
          saavad leida sobivaid töid ja esitada neile oma pakkumisi.
        </p>

        <p class="portfolio-section__intro">
          Projekteerisin ja arendasin rakenduse tervikliku full-stack
          projektina, hõlmates kasutajaliidest, backend API-t,
          andmebaasimudeleid, autentimist, reaalajas suhtlust,
          geolokatsioonifunktsioone ja rakenduse juurutamise arhitektuuri.
        </p>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="portfolio-section portfolio-section--soft">
      <div class="portfolio-container">
        <span class="portfolio-section__label">
          Kasutaja teekond
        </span>

        <h2>
          Kuidas DuunHub töötab?
        </h2>

        <div class="workflow-grid">
          <article
            v-for="step in workflow"
            :key="step.number"
            class="workflow-card"
          >
            <div class="workflow-card__number">
              {{ step.number }}
            </div>

            <h3>
              {{ step.title }}
            </h3>

            <p>
              {{ step.text }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- TWO DIFFERENT WAYS TO FIND PROVIDERS -->
    <section class="portfolio-section portfolio-section--soft">
      <div class="portfolio-container">
        <span class="portfolio-section__label">
          Kliendi teekond
        </span>

        <h2>
          Kaks võimalust sobiva teenusepakkuja leidmiseks
        </h2>

        <p class="portfolio-section__intro">
          DuunHub pakub teenusepakkuja leidmiseks kahte erinevat võimalust,
          sõltuvalt sellest, kas klient soovib võrrelda mitut pakkumist
          või võtta sobiva teenusepakkujaga kohe ühendust.
        </p>

        <div class="discovery-grid">
          <article class="discovery-card">
            <span class="discovery-card__number">01</span>

            <h3>Küsi pakkumisi</h3>

            <p>
              Loo teenuse tellimus ja võimalda läheduses asuvatel
              sobivatel teenusepakkujatel esitada konkureerivaid pakkumisi.
            </p>

            <div class="discovery-flow">
              <span>Loo tellimus</span>
              <i class="fas fa-arrow-down"></i>

              <span>Teenusepakkujad saavad tellimuse</span>
              <i class="fas fa-arrow-down"></i>

              <span>Võrdle pakkumisi</span>
              <i class="fas fa-arrow-down"></i>

              <span>Vali teenusepakkuja</span>
            </div>
          </article>

          <article class="discovery-card">
            <span class="discovery-card__number">02</span>

            <h3>Leia ja broneeri otse</h3>

            <p>
              Otsi kaardilt teenusepakkujaid ameti ja kauguse järgi,
              kontrolli nende saadavust ning saada broneerimistaotlus
              otse valitud teenusepakkujale.
            </p>

            <div class="discovery-flow">
              <span>Otsi kaardilt</span>
              <i class="fas fa-arrow-down"></i>

              <span>
                🟢 Vaba &nbsp;&nbsp; 🟠 Kokkuleppel
              </span>

              <i class="fas fa-arrow-down"></i>

              <span>Vaata teenusepakkujat</span>
              <i class="fas fa-arrow-down"></i>

              <span>Saada otsebroneering</span>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- SCREENSHOTS -->
    <section class="portfolio-section">
      <div class="portfolio-container">
        <span class="portfolio-section__label">
          Rakendus
        </span>

        <h2>
          Rakenduse põhifunktsioonid
        </h2>

        <div class="feature-list">
          <article
            v-for="(feature, index) in features"
            :key="feature.title"
            class="feature-row"
            :class="{
              'feature-row--reverse': index % 2 !== 0
            }"
          >
            <div class="feature-row__image">
              <img
                :src="feature.image"
                :alt="feature.title"
              />
            </div>

            <div class="feature-row__content">
              <span class="feature-row__number">
                0{{ index + 1 }}
              </span>

              <h3>
                {{ feature.title }}
              </h3>

              <p>
                {{ feature.text }}
              </p>

              <div class="feature-tags">
                <span
                  v-for="tag in feature.tags"
                  :key="tag"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- MOBILE / PWA -->
    <section class="portfolio-section portfolio-section--mobile">
      <div class="portfolio-container">
        <div class="mobile-showcase">

          <div class="mobile-showcase__content">
            <span class="portfolio-section__label">
              Mobiilikogemus
            </span>

            <h2>
              Progressive Web App
            </h2>

            <p class="mobile-showcase__intro">
              DuunHub on loodud responsiivse Progressive Web App rakendusena,
              pakkudes rakendusesarnast kasutuskogemust nii arvutis
              kui ka mobiilseadmetes.
            </p>

            <p class="mobile-showcase__text">
              Mobiilne kasutajaliides kohandab samad kliendi ja teenusepakkuja
              töövood väiksematele ekraanidele, pakkudes puutetundlikule
              kasutusele sobivat navigeerimist, reaalajas uuendusi ja
              push-teavitusi.
            </p>

            <div class="mobile-showcase__features">
              <div>
                <i class="fas fa-mobile-alt"></i>
                <span>Paigaldatav PWA</span>
              </div>

              <div>
                <i class="fas fa-bell"></i>
                <span>Push-teavitused</span>
              </div>

              <div>
                <i class="fas fa-bars"></i>
                <span>Mobiilinavigatsioon</span>
              </div>

              <div>
                <i class="fas fa-sync-alt"></i>
                <span>Reaalajas uuendused</span>
              </div>
            </div>
          </div>

          <div class="mobile-showcase__screens">

            <figure class="mobile-screen">
              <div class="mobile-screen__device">
                <img
                  src="@/assets/portfolio/pwa-client.png"
                  alt="DuunHub mobiilne kliendivaade"
                />
              </div>

              <figcaption>
                Kliendi kasutuskogemus
              </figcaption>
            </figure>

            <figure class="mobile-screen mobile-screen--offset">
              <div class="mobile-screen__device">
                <img
                  src="@/assets/portfolio/pwa-provider.png"
                  alt="DuunHub mobiilne teenusepakkuja vaade"
                />
              </div>

              <figcaption>
                Teenusepakkuja töölaud
              </figcaption>
            </figure>

          </div>
        </div>
      </div>
    </section>

    <!-- TECHNICAL -->
    <section
      id="technical"
      class="portfolio-section portfolio-section--dark"
    >
      <div class="portfolio-container">
        <span class="portfolio-section__label">
          Arendus
        </span>

        <h2>
          Tehnilised lahendused
        </h2>

        <div class="technical-grid">
          <article
            v-for="item in technicalHighlights"
            :key="item.title"
            class="technical-card"
          >
            <div class="technical-card__icon">
              <i :class="item.icon"></i>
            </div>

            <h3>
              {{ item.title }}
            </h3>

            <p>
              {{ item.text }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- ARCHITECTURE -->
    <section class="portfolio-section">
      <div class="portfolio-container">
        <span class="portfolio-section__label">
          Süsteemi ülesehitus
        </span>

        <h2>
          Rakenduse arhitektuur
        </h2>

        <div class="architecture">
          <div class="architecture-node">
            <strong>Vue 3</strong>
            <span>Frontend / PWA</span>
          </div>

          <div class="architecture-arrow">
            →
          </div>

          <div class="architecture-node">
            <strong>Node.js + Express</strong>
            <span>REST API / Socket.IO</span>
          </div>

          <div class="architecture-arrow">
            →
          </div>

          <div class="architecture-services">
            <div class="architecture-node">
              <strong>MongoDB</strong>
              <span>Rakenduse andmed</span>
            </div>

            <div class="architecture-node">
              <strong>AWS S3</strong>
              <span>Piltide salvestamine</span>
            </div>

            <div class="architecture-node">
              <strong>Google Maps</strong>
              <span>Kaardid / asukoht</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CHALLENGES -->
    <section class="portfolio-section portfolio-section--soft">
      <div class="portfolio-container">
        <span class="portfolio-section__label">
          Probleemide lahendamine
        </span>

        <h2>
          Tehnilised väljakutsed
        </h2>

        <div class="challenge-grid">
          <article
            v-for="challenge in challenges"
            :key="challenge.title"
            class="challenge-card"
          >
            <h3>
              {{ challenge.title }}
            </h3>

            <p>
              {{ challenge.text }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="portfolio-cta">
      <div class="portfolio-container portfolio-container--narrow">
        <span class="portfolio-section__label">
          Töötav projekt
        </span>

        <h2>
          Tutvu DuunHubiga
        </h2>

        <p>
          Rakendus on juurutatud ja kasutatav töötava veebirakendusena.
        </p>

        <div class="portfolio-actions portfolio-actions--center">
          <a
            href="/"
            class="portfolio-btn portfolio-btn--primary"
          >
            Ava DuunHub
          </a>
        </div>
      </div>
    </section>

    <a
      href="#top"
      class="back-to-top"
      aria-label="Tagasi üles"
    >
      <i class="fas fa-arrow-up"></i>
    </a>

  </main>
</template>

<script setup>
import { ref } from "vue";
import provider_map from "@/assets/portfolio/provider-map-search.png";
import offers from "@/assets/portfolio/offers.png";
import calendar from "@/assets/portfolio/calendar.png";
import chat from "@/assets/portfolio/chat.png";

const workflow = [
  {
    number: "01",
    title: "Klient loob tellimuse",
    text:
      "Klient valib ameti, asukoha ja soovitud aja ning lisab töö teostamiseks vajalikud üksikasjad."
  },
  {
    number: "02",
    title: "Leitakse sobivad teenusepakkujad",
    text:
      "Teenusepakkujad filtreeritakse ameti, asukoha ja geograafilise kauguse alusel."
  },
  {
    number: "03",
    title: "Teenusepakkujad esitavad pakkumised",
    text:
      "Teenusepakkujad saavad vastata hinnapakkumise, sobiva aja ja täiendava informatsiooniga."
  },
  {
    number: "04",
    title: "Klient valib teenusepakkuja",
    text:
      "Klient võrdleb saadud pakkumisi ja kinnitab endale sobiva teenusepakkuja."
  },
  {
    number: "05",
    title: "Töö lisatakse kalendrisse",
    text:
      "Kinnitatud töö lisatakse teenusepakkuja töövoogu ja kalendrisse."
  },
  {
    number: "06",
    title: "Kasutajad suhtlevad",
    text:
      "Reaalajas sõnumid ja teavitused hoiavad mõlemad osapooled toimuvaga kursis."
  }
];

const features = [
  {
    title: "Asukohapõhine teenusepakkujate otsing",
    text:
      "Kliendid saavad leida sobivaid teenusepakkujaid ameti, kliendi määratud otsinguraadiuse ja geograafilise kauguse alusel.",
    image: provider_map,
    tags: [
      "Google Maps",
      "Geolokatsioon",
      "Raadiusotsing"
    ]
  },
  {
    title: "Tellimuste ja pakkumiste töövoog",
    text:
      "Kliendid loovad teenuse tellimusi ning teenusepakkujad saavad vastata pakkumistega, mis sisaldavad hinda, saadavust ja teenuse üksikasju.",
    image: offers,
    tags: [
      "Vue 3",
      "REST API",
      "MongoDB"
    ]
  },
  {
    title: "Teenusepakkuja kalender",
    text:
      "Kinnitatud töid ja saadavust hallatakse interaktiivse kalendri kaudu, mis on üles ehitatud teenusepakkuja töövoo ümber.",
    image: calendar,
    tags: [
      "FullCalendar",
      "Ajaplaneerimine",
      "Broneeringud"
    ]
  },
  {
    title: "Reaalajas suhtlus",
    text:
      "Kliendid ja teenusepakkujad saavad suhelda rakendusesisese vestluse kaudu, mida toetavad Socket.IO reaalajas sündmused.",
    image: chat,
    tags: [
      "Socket.IO",
      "Teavitused",
      "Vestlus"
    ]
  }
];

const technicalHighlights = [
  {
    title: "Frontendi arhitektuur",
    text:
      "Vue 3 Composition API koos Pinia olekuhalduse, Vue Routeri ja korduvkasutatavate composable-funktsioonidega.",
    icon: "fab fa-vuejs"
  },
  {
    title: "Backend API",
    text:
      "Node.js ja Express REST API koos struktureeritud rakendusteenuste ning Mongoose'i mudelitega.",
    icon: "fab fa-node-js"
  },
  {
    title: "Autentimine",
    text:
      "JWT-põhine autentimine koos kaitstud marsruutide ja kasutajarollidel põhinevate rakenduse töövoogudega.",
    icon: "fas fa-shield-alt"
  },
  {
    title: "Reaalajas sündmused",
    text:
      "Socket.IO-d kasutatakse vestlussõnumite, teavituste ja rakenduse reaalajas uuenduste edastamiseks.",
    icon: "fas fa-bolt"
  },
  {
    title: "Pilvesalvestus",
    text:
      "Kasutajate üleslaaditud pildid ja rakenduse meedia salvestatakse AWS S3 abil.",
    icon: "fas fa-cloud"
  },
  {
    title: "Progressive Web App",
    text:
      "Paigaldatav PWA-arhitektuur koos service worker'ite, veebipõhiste push-teavituste ja mobiilseadmetele kohandatud navigeerimisega.",
    icon: "fas fa-mobile-alt"
  }
];

const challenges = [
  {
    title: "Kaugusel põhinev sobitamine",
    text:
      "Teenusepakkujate leidmiseks tuli ühendada ameti filtrid, teenusepakkuja tegevusraadius ja kliendi asukoht."
  },
  {
    title: "Erinevate kasutajarollide töövood",
    text:
      "Kliendi ja teenusepakkuja kasutajaliidesed vajavad erinevaid olekuid, õigusi ja töövooge, kasutades samal ajal ühist broneerimissüsteemi."
  },
  {
    title: "Reaalajas sünkroniseerimine",
    text:
      "Sõnumid, pakkumised ja teavitused peavad püsima sünkroonis mitme samaaegselt ühendatud kasutaja vahel."
  },
  {
    title: "Keerukas tellimuse olekuhaldus",
    text:
      "Tellimus läbib mitu etappi alates esialgsest tellimusest ja pakkumistest kuni kinnitamise, kalendrisse lisamise ja töö lõpetamiseni."
  }
];
</script>
<style scoped>
.portfolio {
  min-height: 100vh;
  background: #0b1220;
  color: #e5e7eb;
}

.portfolio-container {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
}

.portfolio-container--narrow {
  max-width: 820px;
}

.portfolio-hero {
  padding: 110px 0 90px;
  background:
    radial-gradient(
      circle at 80% 20%,
      rgba(59, 130, 246, 0.16),
      transparent 35%
    ),
    #0b1220;
}

.portfolio-hero .portfolio-container {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 70px;
  align-items: center;
}

.portfolio-eyebrow,
.portfolio-section__label {
  display: inline-block;
  margin-bottom: 14px;
  color: #60a5fa;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.portfolio-title {
  margin: 0 0 20px;
  font-size: clamp(3.5rem, 8vw, 6.5rem);
  line-height: 0.95;
  letter-spacing: -0.06em;
}

.portfolio-lead {
  max-width: 610px;
  margin-bottom: 28px;
  color: #aeb9c8;
  font-size: 1.15rem;
  line-height: 1.75;
}

.portfolio-lead-chapter {
  display: block;
  margin: 18px 0 6px;
  color: #f8fafc;
  font-weight: 700;
}

.portfolio-stack,
.feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.portfolio-stack span,
.feature-tags span {
  padding: 6px 10px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.035);
  color: #cbd5e1;
  font-size: 0.77rem;
}

.portfolio-actions {
  display: flex;
  gap: 12px;
  margin-top: 34px;
}

.portfolio-actions--center {
  justify-content: center;
}

.portfolio-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 20px;
  border-radius: 10px;
  font-weight: 700;
  text-decoration: none;
}

.portfolio-btn--primary {
  background: #2563eb;
  color: white;
}

.portfolio-btn--secondary {
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #e5e7eb;
}

.portfolio-browser {
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 18px;
  background: #111827;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
}

.portfolio-browser__bar {
  display: flex;
  gap: 7px;
  padding: 13px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.portfolio-browser__bar span {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.portfolio-browser img,
.feature-row img {
  display: block;
  width: 100%;
}

.portfolio-section {
  padding: 100px 0;
}

.portfolio-section--soft {
  background: #111827;
}

.portfolio-section--dark {
  background: #080d17;
}

.portfolio-section h2,
.portfolio-cta h2 {
  margin: 0 0 22px;
  color: #f8fafc;
  font-size: clamp(2rem, 5vw, 3.2rem);
  letter-spacing: -0.04em;
}

.portfolio-section__intro {
  color: #aeb9c8;
  font-size: 1.05rem;
  line-height: 1.8;
}

.workflow-grid,
.technical-grid,
.challenge-grid {
  display: grid;
  gap: 16px;
  margin-top: 48px;
}

.workflow-grid {
  grid-template-columns: repeat(3, 1fr);
}

.technical-grid {
  grid-template-columns: repeat(3, 1fr);
}

.challenge-grid {
  grid-template-columns: repeat(2, 1fr);
}

.workflow-card,
.technical-card,
.challenge-card {
  padding: 26px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.025);
}

.workflow-card__number,
.feature-row__number {
  color: #60a5fa;
  font-weight: 800;
}

.workflow-card h3,
.technical-card h3,
.challenge-card h3,
.feature-row h3 {
  margin: 14px 0 10px;
  color: #f8fafc;
}

.workflow-card p,
.technical-card p,
.challenge-card p,
.feature-row p {
  margin: 0;
  color: #94a3b8;
  line-height: 1.7;
}

.feature-list {
  margin-top: 55px;
}

.feature-row {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 70px;
  align-items: center;
  margin-bottom: 110px;
}

.feature-row--reverse {
  grid-template-columns: 0.8fr 1.2fr;
}

.feature-row--reverse .feature-row__image {
  order: 2;
}

.feature-row__image {
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 22px 55px rgba(0, 0, 0, 0.25);
}

.feature-tags {
  margin-top: 20px;
}

.technical-card__icon {
  margin-bottom: 16px;
  color: #60a5fa;
  font-size: 1.55rem;
}

.architecture {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 22px;
  margin-top: 55px;
}

.architecture-node {
  min-width: 180px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  background: #111827;
  text-align: center;
}

.architecture-node strong,
.architecture-node span {
  display: block;
}

.architecture-node span {
  margin-top: 5px;
  color: #94a3b8;
  font-size: 0.8rem;
}

.architecture-arrow {
  color: #64748b;
  font-size: 1.7rem;
}

.architecture-services {
  display: grid;
  gap: 10px;
}

.portfolio-cta {
  padding: 110px 0;
  background:
    radial-gradient(
      circle at center,
      rgba(37, 99, 235, 0.18),
      transparent 45%
    ),
    #080d17;
  text-align: center;
}

.portfolio-cta p {
  color: #94a3b8;
}



.discovery-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 22px;
  margin-top: 48px;
}

.discovery-card {
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.025);
}

.discovery-card__number {
  color: #60a5fa;
  font-size: 0.8rem;
  font-weight: 800;
}

.discovery-card h3 {
  margin: 12px 0;
  color: #f8fafc;
  font-size: 1.35rem;
}

.discovery-card > p {
  color: #94a3b8;
  line-height: 1.7;
}

.discovery-flow {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  margin-top: 26px;
}

.discovery-flow span {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.03);
  color: #cbd5e1;
}

.discovery-flow i {
  align-self: center;
  color: #64748b;
  font-size: 0.75rem;
}

@media (max-width: 700px) {
  .discovery-grid {
    grid-template-columns: 1fr;
  }
}





@media (max-width: 900px) {
  .portfolio-hero .portfolio-container,
  .feature-row,
  .feature-row--reverse {
    grid-template-columns: 1fr;
  }

  .feature-row--reverse .feature-row__image {
    order: 0;
  }

  .workflow-grid,
  .technical-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .architecture {
    flex-direction: column;
  }

  .architecture-arrow {
    transform: rotate(90deg);
  }
}

/* =========================
   MOBILE / PWA SHOWCASE
   ========================= */

.portfolio-section--mobile {
  position: relative;
  overflow: hidden;
  background: #0b1220;
}

/* Subtle background glow */
.portfolio-section--mobile::before {
  content: "";
  position: absolute;
  top: 50%;
  right: 5%;
  width: 500px;
  height: 500px;

  background: radial-gradient(
    circle,
    rgba(37, 99, 235, 0.14),
    transparent 65%
  );

  transform: translateY(-50%);
  pointer-events: none;
}

.mobile-showcase {
  position: relative;

  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 90px;

  align-items: center;
}


/* =========================
   CONTENT
   ========================= */

.mobile-showcase__content {
  max-width: 520px;
}

.mobile-showcase__intro {
  margin: 0 0 18px;

  color: #cbd5e1;
  font-size: 1.05rem;
  line-height: 1.8;
}

.mobile-showcase__text {
  margin: 0;

  color: #94a3b8;
  line-height: 1.75;
}


/* =========================
   FEATURE LIST
   ========================= */

.mobile-showcase__features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  margin-top: 32px;
}

.mobile-showcase__features > div {
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 12px 14px;

  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;

  background: rgba(255, 255, 255, 0.025);

  color: #cbd5e1;
  font-size: 0.82rem;
}

.mobile-showcase__features i {
  width: 18px;

  color: #60a5fa;
  text-align: center;
}


/* =========================
   MOBILE SCREENSHOTS
   ========================= */

.mobile-showcase__screens {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 32px;
}

.mobile-screen {
  width: min(230px, 42%);
  margin: 0;
}

.mobile-screen--offset {
  margin-top: 65px;
}


/* PHONE FRAME */

.mobile-screen__device {
  position: relative;

  overflow: hidden;

  padding: 7px;

  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 28px;

  background: #080d17;

  box-shadow:
    0 30px 70px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.02);
}


/* Small speaker / dynamic island style detail */

.mobile-screen__device::before {
  content: "";

  position: absolute;
  top: 13px;
  left: 50%;

  width: 52px;
  height: 13px;

  border-radius: 999px;

  background: #080d17;

  transform: translateX(-50%);

  z-index: 2;
}


/* SCREENSHOT */

.mobile-screen__device img {
  display: block;

  width: 100%;
  height: auto;

  border-radius: 22px;
}


/* CAPTION */

.mobile-screen figcaption {
  margin-top: 14px;

  color: #94a3b8;
  font-size: 0.78rem;
  font-weight: 600;
  text-align: center;
}

@media (max-width: 600px) {
  .portfolio-container {
    width: min(100% - 28px, 1180px);
  }

  .portfolio-hero {
    padding-top: 70px;
  }

  .workflow-grid,
  .technical-grid,
  .challenge-grid {
    grid-template-columns: 1fr;
  }

  .portfolio-actions {
    flex-direction: column;
  }

  .portfolio-btn {
    width: 100%;
  }

  .portfolio-section {
    padding: 72px 0;
  }

  .feature-row {
    gap: 28px;
    margin-bottom: 75px;
  }

  .mobile-showcase__features {
    grid-template-columns: 1fr;
  }

  .mobile-showcase__screens {
    gap: 16px;
  }

  .mobile-screen {
    width: min(190px, 47%);
  }

  .mobile-screen--offset {
    margin-top: 35px;
  }

  .mobile-screen__device {
    padding: 5px;
    border-radius: 22px;
  }

  .mobile-screen__device img {
    border-radius: 18px;
  }
}

/* Arrow to top */
.back-to-top {
  position: fixed;
  right: 24px;
  bottom: 24px;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 44px;
  height: 44px;

  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;

  background: #111827;
  color: #fff;

  text-decoration: none;

  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);

  z-index: 100;
}

.hero-screenshots {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.hero-screenshot {
  margin: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.hero-screenshot:last-child {
  border-bottom: 0;
}

.hero-screenshot img {
  display: block;
  width: 100%;
  height: auto;
}

/* .hero-screenshot img {
  display: block;
  width: 100%;
  max-height: 320px;
  object-fit: cover;
  object-position: top;
} */

.hero-screenshot figcaption {
  display: flex;
  flex-direction: column;
  gap: 4px;

  padding: 14px 18px 18px;

  background: rgba(255, 255, 255, 0.025);
}

.hero-screenshot figcaption strong {
  color: #f8fafc;
  font-size: 0.9rem;
}

.hero-screenshot figcaption span {
  color: #94a3b8;
  font-size: 0.78rem;
  line-height: 1.5;
}

.back-to-top:hover {
  transform: translateY(-2px);
}
</style>

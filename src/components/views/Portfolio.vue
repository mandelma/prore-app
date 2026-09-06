<template>
  <main class="portfolio">
    <!-- HERO -->
    <section class="portfolio-hero">
      <div class="portfolio-container">
        <div class="portfolio-hero__content">
          <span class="portfolio-eyebrow">
            Full Stack SaaS Project
          </span>

          <h1 class="portfolio-title" id="home">
            DuunHub
          </h1>

          <p class="portfolio-lead">
            DuunHub is a service marketplace designed to connect 
            customers with local small businesses and independent 
            service providers as quickly and easily as possible.
            Customers can find a suitable provider in two different 
            ways:

            <span class="portfolio-lead-chapter">Request offers</span>

            The customer creates a service request describing the work, 
            location, preferred time and other details. Relevant providers 
            can then respond with their offers, allowing the customer to 
            compare alternatives and choose the most suitable one.

            <span class="portfolio-lead-chapter">Find and book a provider directly</span>

            The customer can search for providers directly on the map by 
            profession and distance. Provider availability is visible 
            immediately — green markers indicate providers who are currently 
            available, while orange markers indicate providers whose 
            availability can be agreed separately. The customer can open 
            a provider profile and send a booking request directly to the 
            selected provider.
            Both workflows are built around the same goal: reducing the 
            effort required for customers to find local professionals while 
            helping small service businesses receive relevant work opportunities.
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
              Open live application
            </a>

            <a
              href="#technical"
              class="portfolio-btn portfolio-btn--secondary"
            >
              Technical overview
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
                            Home screenshot
                            <img
                                src="@/assets/portfolio/duunhub-home.png"
                                alt="DuunHub home page"
                            />

                            <figcaption>
                                <strong>Home page</strong>
                                <span>
                                Entry point for discovering local services and starting
                                a service request.
                                </span>
                            </figcaption>
                        </figure>

                        <!-- PROVIDER -->
                        <figure class="hero-screenshot">
                            <img
                                src="@/assets/portfolio/duunhub-provider-chat.png"
                                alt="DuunHub provider dashboard"
                            />

                            <figcaption>
                                <strong>Provider workspace</strong>
                                <span>
                                Service providers can manage requests, offers,
                                availability and upcoming work.
                                </span>
                            </figcaption>
                        </figure>

                        <!-- CLIENT -->
                        <!-- <figure class="hero-screenshot">
                            Client page screenshot  
                            <img
                                src="@/assets/portfolio/duunhub-client.png"
                                alt="DuunHub customer dashboard"
                            />

                            <figcaption>
                                <strong>Customer workspace</strong>
                                <span>
                                Customers can manage service requests, compare offers
                                and follow confirmed bookings.
                                </span>
                            </figcaption>
                        </figure> -->

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
          The project
        </span>

        <h2>
          A complete marketplace workflow
        </h2>

        <p class="portfolio-section__intro">
          DuunHub is designed for customers looking for local
          services and small service providers looking for new work.
          Customers can create service requests while providers can
          discover relevant jobs and submit offers.
        </p>

        <p class="portfolio-section__intro">
          I designed and developed the application as a full-stack
          project, including the frontend, backend API, database
          models, authentication, real-time communication,
          geolocation features and deployment architecture.
        </p>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="portfolio-section portfolio-section--soft">
      <div class="portfolio-container">
        <span class="portfolio-section__label">
          User flow
        </span>

        <h2>
          How DuunHub works
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

    <!-- Two different way to find providers -->
    <section class="portfolio-section portfolio-section--soft">
    <div class="portfolio-container">
        <span class="portfolio-section__label">
        Customer journey
        </span>

        <h2>
        Two ways to find the right provider
        </h2>

        <p class="portfolio-section__intro">
        DuunHub supports two different service discovery workflows,
        depending on whether the customer wants to compare offers
        or contact a suitable provider immediately.
        </p>

        <div class="discovery-grid">
        <article class="discovery-card">
            <span class="discovery-card__number">01</span>

            <h3>Request offers</h3>

            <p>
            Create a service request and allow relevant nearby
            providers to submit competing offers.
            </p>

            <div class="discovery-flow">
            <span>Create request</span>
            <i class="fas fa-arrow-down"></i>

            <span>Providers receive request</span>
            <i class="fas fa-arrow-down"></i>

            <span>Compare offers</span>
            <i class="fas fa-arrow-down"></i>

            <span>Choose provider</span>
            </div>
        </article>

        <article class="discovery-card">
            <span class="discovery-card__number">02</span>

            <h3>Find and book directly</h3>

            <p>
            Search providers on the map by profession and distance,
            check their availability and send a booking request
            directly.
            </p>

            <div class="discovery-flow">
            <span>Search map</span>
            <i class="fas fa-arrow-down"></i>

            <span>
                🟢 Available &nbsp;&nbsp; 🟠 By agreement
            </span>

            <i class="fas fa-arrow-down"></i>

            <span>View provider</span>
            <i class="fas fa-arrow-down"></i>

            <span>Send direct booking</span>
            </div>
        </article>
        </div>
    </div>
    </section>

    <!-- SCREENSHOTS -->
    <section class="portfolio-section">
      <div class="portfolio-container">
        <span class="portfolio-section__label">
          Product
        </span>

        <h2>
          Key application features
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

                <!-- CONTENT -->
                <div class="mobile-showcase__content">
                    <span class="portfolio-section__label">
                        Mobile experience
                    </span>

                    <h2>
                        Progressive Web App
                    </h2>

                    <p class="mobile-showcase__intro">
                        DuunHub is designed as a responsive Progressive Web App,
                        providing an application-like experience across desktop
                        and mobile devices.
                    </p>

                    <p class="mobile-showcase__text">
                        The mobile interface adapts the same customer and provider
                        workflows for smaller screens with touch-friendly navigation,
                        real-time updates and push notifications.
                    </p>

                    <div class="mobile-showcase__features">
                    <div>
                        <i class="fas fa-mobile-alt"></i>
                        <span>Installable PWA</span>
                    </div>

                    <div>
                        <i class="fas fa-bell"></i>
                        <span>Push notifications</span>
                    </div>

                    <div>
                        <i class="fas fa-bars"></i>
                        <span>Mobile navigation</span>
                    </div>

                    <div>
                        <i class="fas fa-sync-alt"></i>
                        <span>Real-time updates</span>
                    </div>
                </div>
            </div>

            <!-- SCREENSHOTS -->
            <div class="mobile-showcase__screens">

                <figure class="mobile-screen">
                <div class="mobile-screen__device">
                    <img
                        src="@/assets/portfolio/pwa-client.png"
                        alt="DuunHub mobile home view"
                    />
                </div>

                <figcaption>
                    Customer experience
                </figcaption>
                </figure>

                <figure class="mobile-screen mobile-screen--offset">
                <div class="mobile-screen__device">
                    <img
                    src="@/assets/portfolio/pwa-provider.png"
                    alt="DuunHub mobile provider view"
                    />
                </div>

                <figcaption>
                    Provider workspace
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
          Engineering
        </span>

        <h2>
          Technical highlights
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
          System design
        </span>

        <h2>
          Application architecture
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
              <span>Application data</span>
            </div>

            <div class="architecture-node">
              <strong>AWS S3</strong>
              <span>Image storage</span>
            </div>

            <div class="architecture-node">
              <strong>Google Maps</strong>
              <span>Maps / location</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CHALLENGES -->
    <section class="portfolio-section portfolio-section--soft">
      <div class="portfolio-container">
        <span class="portfolio-section__label">
          Problem solving
        </span>

        <h2>
          Engineering challenges
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
          Live project
        </span>

        <h2>
          Explore DuunHub
        </h2>

        <p>
          The application is deployed and available as a live
          web application.
        </p>

        <div class="portfolio-actions portfolio-actions--center">
          <a
            href="/"
            class="portfolio-btn portfolio-btn--primary"
          >
            Open DuunHub
          </a>
        </div>
        
      </div>
    </section>

    <a
        href="#top"
        class="back-to-top"
        aria-label="Back to top"
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
    title: "Customer creates a request",
    text:
      "The customer selects a profession, location, preferred time and provides the details required for the job."
  },
  {
    number: "02",
    title: "Relevant providers are found",
    text:
      "Providers are filtered using profession, location and geographical distance."
  },
  {
    number: "03",
    title: "Providers submit offers",
    text:
      "Service providers can respond with their price, schedule and additional information."
  },
  {
    number: "04",
    title: "Customer chooses a provider",
    text:
      "The customer compares received offers and confirms the preferred provider."
  },
  {
    number: "05",
    title: "Booking is scheduled",
    text:
      "Confirmed work is added to the provider workflow and calendar."
  },
  {
    number: "06",
    title: "Users communicate",
    text:
      "Real-time messaging and notifications keep both sides updated."
  }
];

const features = [
  {
    title: "Location-based provider discovery",
    text:
      "Customers can find relevant providers based on service profession, customer search radius and geographical distance.",
    image:
      provider_map,
    tags: [
      "Google Maps",
      "Geolocation",
      "Radius search"
    ]
  },
  {
    title: "Booking and offer workflow",
    text:
      "Customers create service requests and providers can respond with offers containing pricing, availability and service details.",
    image:
      offers,
    tags: [
      "Vue 3",
      "REST API",
      "MongoDB"
    ]
  },
  {
    title: "Provider calendar",
    text:
      "Confirmed work and availability are managed through an interactive calendar built around the provider workflow.",
    image:
      calendar,
    tags: [
      "FullCalendar",
      "Scheduling",
      "Booking"
    ]
  },
  {
    title: "Real-time communication",
    text:
      "Customers and providers can communicate through application messaging supported by real-time Socket.IO events.",
    image:
      chat,
    tags: [
      "Socket.IO",
      "Notifications",
      "Chat"
    ]
  }
];

const technicalHighlights = [
  {
    title: "Frontend architecture",
    text:
      "Vue 3 Composition API with Pinia state management, Vue Router and reusable composables.",
    icon: "fab fa-vuejs"
  },
  {
    title: "Backend API",
    text:
      "Node.js and Express REST API with structured application services and Mongoose models.",
    icon: "fab fa-node-js"
  },
  {
    title: "Authentication",
    text:
      "JWT based authentication with protected routes and role-aware application workflows.",
    icon: "fas fa-shield-alt"
  },
  {
    title: "Real-time events",
    text:
      "Socket.IO is used for chat messages, notifications and live application updates.",
    icon: "fas fa-bolt"
  },
  {
    title: "Cloud storage",
    text:
      "User-uploaded images and application media are stored using AWS S3.",
    icon: "fas fa-cloud"
  },
  {
    title: "Progressive Web App",
    text:
      "Installable PWA architecture with service workers, web push and mobile-oriented navigation.",
    icon: "fas fa-mobile-alt"
  }
];

const challenges = [
  {
    title: "Distance-based matching",
    text:
      "Implementing provider discovery required combining profession filters, provider service radius and customer location."
  },
  {
    title: "Multi-role workflows",
    text:
      "Customer and provider interfaces require different states, permissions and application flows while sharing the same booking system."
  },
  {
    title: "Real-time synchronization",
    text:
      "Messaging, offers and notifications need to stay synchronized between multiple connected users."
  },
  {
    title: "Complex booking state",
    text:
      "A booking moves through multiple stages from initial request to offers, confirmation, calendar scheduling and completion."
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

<template>
  <MDBContainer class="recipient-page">
    <MDBToast
      v-model="isConfirmed"
      :stacking="false"
      autohide
      :delay="3000"
      toast="success"
      icon="fas fa-check fa-lg me-2"
    >
      <button
        type="button"
        class="btn-close ms-auto visually-hidden"
        :aria-label="t('recipientPage.close')"
        @click="hideError"
      />

      <template #title>
        PROKEIKKATORI
      </template>

      {{ confirmedMessage }}
    </MDBToast>

    <!-- Compact statistics -->
    <section
      class="stats-grid"
      :aria-label="t('recipientPage.orderSummary')"
    >
      <article class="stat-card">
        <div class="stat-card__icon stat-card__icon--active">
          <MDBIcon icon="clipboard-list" />
        </div>

        <div class="stat-card__content">
          <span class="stat-card__label">
            {{ t("recipientPage.activeOrders") }}
          </span>

          <strong class="stat-card__value">
            {{
              bookings.filter(
                booking => booking.status === "active"
              ).length
            }}
          </strong>
        </div>
      </article>

      <button
        type="button"
        class="stat-card stat-card--interactive"
        @click="router.push('/calendar')"
      >
        <div class="stat-card__icon stat-card__icon--confirmed">
          <MDBIcon icon="calendar-check" />
        </div>

        <div class="stat-card__content">
          <span class="stat-card__label">
            {{ t("recipientPage.confirmedOrders") }}
          </span>

          <strong class="stat-card__value">
            {{ clientConfirmed.length }}
          </strong>
        </div>

        <MDBIcon
          icon="chevron-right"
          class="stat-card__arrow"
        />
      </button>

      <button
        type="button"
        class="stat-card stat-card--interactive"
        :disabled="!clientHistory.length"
        @click="clientHistory.length && callHistory()"
      >
        <div class="stat-card__icon stat-card__icon--archive">
          <MDBIcon icon="box-archive" />
        </div>

        <div class="stat-card__content">
          <span class="stat-card__label">
            {{ t("recipientPage.archivedOrders") }}
          </span>

          <strong class="stat-card__value">
            {{ clientHistory.length }}
          </strong>
        </div>

        <MDBIcon
          v-if="clientHistory.length"
          icon="chevron-right"
          class="stat-card__arrow"
        />
      </button>

      <button
        type="button"
        class="stat-card stat-card--interactive"
        @click="router.push('/pro-around')"
      >
        <div class="stat-card__icon stat-card__icon--providers">
          <MDBIcon icon="users-cog" />
        </div>

        <div class="stat-card__content">
          <span class="stat-card__label">
            {{ t("recipientPage.serviceProviders") }}
          </span>

          <strong class="stat-card__action-label">
            {{ t("recipientPage.view") }}
          </strong>
        </div>

        <MDBIcon
          icon="chevron-right"
          class="stat-card__arrow"
        />
      </button>
    </section>

    <!-- Selected booking -->
    <section
      v-if="isRecipientContent"
      class="content-card"
    >
      <recipient-content
        :booking="selectedBooking"
        @open-chat="emit('open-chat', $event)"
        @updateOfferState="handleUpdateOfferState"
        @cancelRecipientContent="handleCancelRecipientContent"
        @out-here="handleOutHere"
        @canselRecipientContentConfirmed="
          handleCanselRecipientContentConfirmed
        "
      />
    </section>

    <div v-else class="orders-layout">
      <!-- Collected orders -->
      <section class="orders-section">
        <header class="section-header">
          <div>
            <span class="section-header__eyebrow">
              {{ sortedBookings.length }}
            </span>

            <h2 class="section-header__title">
              {{ t("recipientPage.collectedOrders") }}
            </h2>
          </div>
        </header>

        <div
          v-if="sortedBookings.length"
          class="orders-list"
        >
          <article
            v-for="booking in sortedBookings"
            :key="booking.id"
            class="order-card"
          >
            <header class="order-card__header">
              <!-- <div class="order-card__heading">
                <span
                  class="order-card__type"
                  :class="{
                    'order-card__type--direct':
                      !booking.isIncludeOffers
                  }"
                >
                  <template v-if="booking.isIncludeOffers">
                    {{ t("recipientPage.sentForOffers") }}
                  </template>

                  <template v-else>
                    {{
                      t("recipientPage.sentToProvider", {
                        provider:
                          booking.ordered?.[0]?.pName || "—"
                      })
                    }}
                  </template>
                </span>

                <time class="order-card__time">
                  {{ formatDateTime(booking.created) }}
                </time>
              </div> -->

              <div class="order-card__heading">
                <span
                  class="order-card__type"
                  :class="{
                    'order-card__type--direct': !booking.isIncludeOffers
                  }"
                >
                  <template v-if="booking.isIncludeOffers">
                    {{ t("recipientPage.sentForOffers") }}
                  </template>

                  <template v-else>
                    {{
                      t("recipientPage.sentToProvider", {
                        provider: booking.ordered?.[0]?.pName || "—"
                      })
                    }}
                  </template>
                </span>

                <div class="order-card__times">
                  <div class="order-card__execution">
                    <i class="far fa-calendar-alt" />
                    {{ t("recipientPage.executionTime") }}:
                    <strong>{{ formatDateTime(booking.created) }}</strong>
                  </div>

                  <div class="order-card__created">
                    {{ t("recipientPage.created") }}:
                    {{ formatDateTime(booking.started) }}
                  </div>
                </div>
              </div>

              <div class="order-card__status">
                <template v-if="booking.isIncludeOffers">
                  {{
                    booking.offers.length > 0
                      ? t("recipientPage.offersCount", {
                          count: booking.offers.length
                        })
                      : t("recipientPage.noOffersYet")
                  }}
                </template>

                <template v-else>
                  {{ t("recipientPage.waitingForContact") }}
                </template>
              </div>
            </header>

            <div class="order-card__body">
              <h3 class="order-card__title">
                {{ booking.header }}
              </h3>

              <div
                v-if="
                  !booking.isIncludeOffers &&
                  booking.photos?.length
                "
                class="order-card__photos"
              >
                <p class="order-card__photos-title">
                  {{ t("recipientPage.attachedPhotos") }}
                </p>

                <BookingPhotos
                  :photos="booking.photos"
                  :editable="false"
                />
              </div>

              <!-- Booking sent for offers -->
              <div
                v-if="booking.isIncludeOffers"
                class="order-card__actions"
              >
                <button
                  type="button"
                  class="primary-action"
                  @click="
                    handleRecipientResult(
                      booking.id,
                      booking
                    )
                  "
                >
                  <span>
                    {{ t("recipientPage.order") }}
                  </span>

                  <span
                    v-if="
                      booking.offers.filter(
                        offer => offer.isNewOffer
                      ).length > 0
                    "
                    class="action-badge"
                  >
                    {{
                      booking.offers.filter(
                        offer => offer.isNewOffer
                      ).length
                    }}
                  </span>
                </button>
              </div>

              <!-- Direct booking -->
              <div v-else class="order-card__actions">
                <div
                  v-if="
                    selBookingId === booking.id &&
                    isQuitBooking
                  "
                  class="quit-box"
                >
                  <MDBTextarea
                    v-model="clientQuitBookingReason"
                    white
                    :label="
                      t('recipientPage.reasonPlaceholder')
                    "
                    rows="3"
                  />

                  <div class="quit-box__actions">
                    <button
                      type="button"
                      class="text-action"
                      @click="canselQuitSelectedBooking"
                    >
                      {{ t("recipientPage.cancel") }}
                    </button>

                    <button
                      v-if="
                        clientQuitBookingReason.length > 1
                      "
                      type="button"
                      class="danger-action"
                      @click="
                        clientRejectMapBooking(booking)
                      "
                    >
                      {{ t("recipientPage.deleteOrder") }}
                    </button>
                  </div>
                </div>

                <button
                  v-else
                  type="button"
                  class="delete-link"
                  @click="
                    handleQuitSelectedBooking(booking.id)
                  "
                >
                  <MDBIcon icon="trash-alt" />

                  {{ t("recipientPage.deleteOrder") }}
                </button>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <div class="empty-state__icon">
            <MDBIcon icon="clipboard" />
          </div>

          <p class="empty-state__title">
            {{ t("recipientPage.noCollectedOrders") }}
          </p>
        </div>
      </section>

      <!-- Confirmed orders -->
      <section class="orders-section">
        <header class="section-header">
          <div>
            <span class="section-header__eyebrow">
              {{ clientConfirmed.length }}
            </span>

            <h2 class="section-header__title">
              {{ t("recipientPage.confirmedOrders") }}
            </h2>
          </div>

          <button
            v-if="clientConfirmed.length"
            type="button"
            class="section-header__link"
            @click="router.push('/calendar')"
          >
            {{ t("recipientPage.calendar") }}

            <MDBIcon icon="arrow-right" />
          </button>
        </header>

        <div
          v-if="clientConfirmed.length"
          class="confirmed-list"
        >
          <article
            v-for="item in clientConfirmed.slice(0, 5)"
            :key="item.id"
            class="confirmed-card"
          >
            <div class="confirmed-card__main">
              <h3 class="confirmed-card__title">
                {{ item.header }}
              </h3>

              <time class="confirmed-card__time">
                {{ formatDateTime(item.created) }}
              </time>

              <button
                v-if="item.status === 'done'"
                type="button"
                class="feedback-action"
                @click="
                  handleFeedback(
                    item.offer?.name,
                    item.offer?.sender,
                    item.offer?.bookingID
                  )
                "
              >
                <MDBIcon icon="star" />

                {{ t("recipientPage.giveFeedback") }}
              </button>
            </div>

            <span
              class="status-pill"
              :class="{
                'status-pill--confirmed':
                  item.status === 'confirmed',
                'status-pill--processed':
                  item.status !== 'confirmed'
              }"
            >
              {{
                item.status === "confirmed"
                  ? t("recipientPage.confirmed")
                  : t("recipientPage.processed")
              }}
            </span>
          </article>
        </div>

        <div v-else class="empty-state">
          <div class="empty-state__icon">
            <MDBIcon icon="calendar-check" />
          </div>

          <p class="empty-state__title">
            {{ t("recipientPage.noConfirmedOrders") }}
          </p>
        </div>
      </section>
    </div>

    <div class="page-actions">
      <button
        type="button"
        class="new-order-button"
        @click="router.push('/client-form')"
      >
        <MDBIcon icon="plus" />

        {{ t("recipientPage.newOrder") }}
      </button>
    </div>

    <MDBModal
      v-model="handleFeedbackModal"
      tabindex="-1"
      centered
      remove-backdrop
      :keyboard="false"
      :focus="false"
    >
      <MDBModalHeader class="modal-header-custom">
        <MDBModalTitle>
          <h6 class="feedback-company">
            {{ company }}
          </h6>
        </MDBModalTitle>
      </MDBModalHeader>

      <MDBModalBody>
        <p class="text-muted">
          {{ t("recipientPage.feedbackIntro") }}
        </p>

        <GiveFeedback
          :target="personalId"
          :booking_id="bookingId"
          @rating-done="handleRatingDone"
          @no-rating="handleNoRating"
        />
      </MDBModalBody>

      <MDBModalFooter>
        <MDBBtn
          color="danger"
          @click="handleFeedbackModal = false"
        >
          {{ t("recipientPage.cancel") }}
        </MDBBtn>
      </MDBModalFooter>
    </MDBModal>

    <ConfirmModal
      v-model="showDeleteModal"
      :title="cTitle"
      :message="cMessage"
      :confirm-text="t('recipientPage.delete')"
      :cancel-text="t('recipientPage.keep')"
      :danger="true"
      @confirm="deleteMapBooking"
      @cancel="handleCancelDeleting"
    />

    <ToastHandler
      v-model="toastModel"
      :toast-name="toastState"
      :icon-state="toastIcon"
      :text="toastContent"
    />

    <div
      v-if="loading"
      class="on-overlay"
      role="status"
    >
      <div class="on-spinner" />
    </div>
  </MDBContainer>
</template>

<script setup>
import { MDBContainer, MDBRow, MDBCol, MDBBtn, MDBTextarea, MDBCard,
  MDBCardBody, MDBBadge, MDBToast, MDBIcon, MDBModal, MDBModalHeader, MDBModalBody, MDBModalFooter } from 'mdb-vue-ui-kit';
import { useI18n } from 'vue-i18n';
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import world from '@/assets/map.gif'
import RecipientContent from "../recipient/RecipientContent.vue";
import ConfirmModal from '../helpers/ConfirmModal.vue';
import { useClientStore } from '@/stores/recipientStore';
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore';
import { useClientArchiveStore } from '@/stores/cArchiveStore';
import ToastHandler from '../helpers/ToastHandler.vue';
import ClientHistory from './ClientHistory.vue';
import BookingPhotos from './BookingPhotos.vue';
import { storeToRefs } from 'pinia'
import socket from '@/socket';

import GiveFeedback from '@/components/recipient/GiveFeedback.vue';

defineOptions({
  name: "recipient-page"
})
defineProps({
  //bookings: {type: Array}
})

const emit = defineEmits(['open-chat']);

const { t, locale } = useI18n();
const router = useRouter();
const selectedIndex = ref(null);
const isRecipientContent = ref(false);
const selectedBooking = ref(null);
const clientStore = useClientStore();
const notificationStore = useNotificationStore();
const cArchiveStore = useClientArchiveStore();


const _world = world
const isConfirmed = ref(false);
const confirmedMessage = ref("TEST")

const selectedBookingId = ref("");

const isQuitBooking = ref(false);
const selBookingId = ref(null);
const clientQuitBookingReason = ref("");

const isDone = ref(false);

const { bookings, clientConfirmed } = storeToRefs(clientStore);
const { userId } = storeToRefs(notificationStore);

const { clientHistory } = storeToRefs(cArchiveStore);



//const singleBookings = computed(() => bookings.value.filter(sb => sb.status !== 'confirmed' && !sb.isIncludeOffers));
//const multiBookings = computed(() => bookings.value.filter(mp => mp.status !== 'confirmed' && mp.isIncludeOffers));

const handleFeedbackModal = ref(false);
const company = ref("");
const proId = ref("");
const personalId = ref("");
const bookingId = ref("");
const myBooking = ref(null);

const loading = ref(false);

//const c_archive = computed( async() => await cArchiveStore.initClientArchive());

const showDeleteModal = ref(false);
const cTitle = ref("");
const cMessage = ref("");

const toastModel = ref(false)
const toastState = ref('')
const toastIcon = ref('')
const toastContent = ref('')


watch(loading, (val) => {
  document.body.style.overflow = val ? 'hidden' : '';
  document.documentElement.style.overflow = val ? 'hidden' : '';
});

const confirmedBookingsExpiration = () => {
  const now = new Date();
  clientConfirmed.value.forEach(async cca => {
    console.log("Header - ", cca.header)
    if (cca.created_ms < now && cca.status !== 'done') {
      console.log("Need to act with " + cca?.offer?.bookingID + " - " + cca?.offer?.sender);
      const booking_id = cca?.offer?.bookingID;
      const target = cca?.offer?.sender; 
      await handleDone(booking_id, target);
    }
  })
}

onMounted(() => {
  // Check confirmed bookings expiration date and send to feedback status if expired
  confirmedBookingsExpiration();
})

onUnmounted(() => {
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
});

const clientRejectMapBooking = async (booking) => {
  myBooking.value = booking;
  showDeleteModal.value = true;
  cTitle.value = t('recipientPage.deleteConfirmTitle');
  cMessage.value = t('recipientPage.deleteConfirmMessage');
}

const deleteMapBooking = async () => {
  console.log('Booking deleted');
  loading.value = true;

  const booking = myBooking.value;
  console.log("Quit bbb " + booking.header);
  console.log("Selected booking pro user - " + booking.ordered[0].user.id);
  const addressaat = booking.ordered[0].user.id;
  const reason = clientQuitBookingReason.value;
  const sender = booking.user.username;
  try {
    await clientStore.removeMapOffer(booking);

    const noteText = t(
      "recipientPage.bookingCancelledNotification",
      {
        client: booking.user.username,
        booking: booking.header,
        reason
      }
    );
    //onRpToast("fas fa-check fa-lg me-2", `Jaa, tiedot ovat päivitetty onnistuneesti!`, "success");
  } catch (err) {
    console.log("Error status:", err.response?.status);
    console.log("Backend error:", err.response?.data);
    console.log("Error to delete map booking - " + err.message);
  } finally {
    loading.value = false;
  }
}

const onRpToast = (icon, content, color) => {
  console.log("Toast works?")
  toastState.value = color;
  toastIcon.value = icon;
  toastContent.value = content;
  toastModel.value = true;
}

function handleCancelDeleting() {
  console.log('Delete cancelled');
  canselQuitSelectedBooking();
}

const sortedBookings = computed(() => {
  return [...bookings.value]
    .filter(b => b.status === 'active')
    .sort((a, b) => (b.created_ms ?? Date.parse(b.created)) - (a.created_ms ?? Date.parse(a.created)))
})

/* const unitedBookings = computed(() => {
  const base = [...bookings.value]
    .filter(b => b.status !== 'confirmed')
    .sort((a, b) => (b.created_ms ?? Date.parse(a.created)) - (a.created_ms ?? Date.parse(b.created)))

  return {
    single: base.filter(b => !b.isIncludeOffers),
    multi: base.filter(b => b.isIncludeOffers),
  }
}) */

const toastTest = () => {
  onRpToast("fas fa-check fa-lg me-2", `Jaa, tiedot ovat päivitetty onnistuneesti!`, "success");
}

// Acting if confirmed booking is overtime
const handleDone = async (bookingId, target) => {
  isDone.value = true;
  selectedBookingId.value = bookingId;
  await clientStore.handleEditStatus(bookingId, 'done');

  socket.emit("booking-done", bookingId, target);

  console.log("DONE")
}


const handleRecipientResult = (id, booking) => {
  console.log("Booking id - " + id); 
  console.log("Booking title: ")
  isRecipientContent.value = true;
  
  selectedBooking.value = clientStore.getBookingById(id);
}

const handleRatingDone = () => {
  console.log("Rating is done ");
  handleFeedbackModal.value = false;
}

const handleNoRating = () => {
  console.log("No rating handled");
  handleFeedbackModal.value = false;
}

const localeMap = {
  fi: "fi-FI",
  en: "en-GB",
  sv: "sv-SE",
  et: "et-EE",
  ru: "ru-RU"
};

function formatDateTime(iso) {
  if (!iso) return "—";

  const date = new Date(iso);

  return date.toLocaleString(
    localeMap[locale.value] || "fi-FI",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }
  );
}

const handleUpdateOfferState = (bookingId, offerId) => {
  console.log("Booking id is " +bookingId);
  console.log("Offer id is " + offerId);
  selectedBooking.value = clientStore.getBookingById(bookingId);
}

const handleCancelRecipientContent = () => {
  console.log("CANCEL")
  isRecipientContent.value = false;
}

/* const handleOutHere = () => {
  console.log("OUT")
  isRecipientContent.value = false;
} */

const handleCanselRecipientContentConfirmed = (pro) => {
  isRecipientContent.value = false;
  console.log("Pro - " + pro)
  // Show success toast after confirmation
  isConfirmed.value = true;
  confirmedMessage.value = t(
    "recipientPage.providerConfirmed",
    {
      provider: pro
    }
  );
}

const handleQuitSelectedBooking = (id) => {
  console.log("Index, quit booking: " + id);
  selBookingId.value = id;
  isQuitBooking.value = true;
}

const canselQuitSelectedBooking = () => {
  isQuitBooking.value = false;
  clientQuitBookingReason.value = "";
}



const handleFeedback = (name, pId, bId) => {
  console.log("Provider personal id - " + pId);

  company.value = name;
  //proId.value = id;
  personalId.value = pId;
  bookingId.value = bId;
  handleFeedbackModal.value = true;
}

const callHistory = () => {
  console.log("Pressed to button.");
  router.push("/c-history")
}


</script>

<style scoped>
.recipient-page {
  --page-bg: #111827;
  --surface: #1a2332;
  --surface-light: rgba(255, 255, 255, 0.045);
  --surface-hover: rgba(255, 255, 255, 0.07);
  --border: rgba(255, 255, 255, 0.09);
  --border-strong: rgba(255, 255, 255, 0.15);
  --text-primary: #f1f5f9;
  --text-secondary: #a9b4c5;
  --text-muted: #768397;
  --accent: #38bdf8;
  --accent-soft: rgba(56, 189, 248, 0.12);
  --success: #34d399;
  --warning: #fbbf24;
  --danger: #fb7185;

  width: 100%;
  max-width: 1240px;
  margin-top: 20px;
  padding-bottom: 48px;
  color: var(--text-primary);
}

/* Statistics */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 86px;
  align-items: center;
  gap: 13px;
  padding: 15px;
  border: 1px solid var(--border);
  border-radius: 15px;
  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.025),
      transparent
    ),
    var(--surface);
  box-shadow: 0 9px 26px rgba(0, 0, 0, 0.14);
  color: inherit;
  text-align: left;
}

button.stat-card {
  width: 100%;
  font: inherit;
}

.stat-card--interactive {
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.stat-card--interactive:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: rgba(56, 189, 248, 0.32);
  background-color: #202b3c;
  box-shadow: 0 13px 30px rgba(0, 0, 0, 0.19);
}

.stat-card--interactive:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.stat-card--interactive:disabled {
  cursor: default;
  opacity: 0.65;
}

.stat-card__icon {
  display: inline-flex;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 1rem;
}

.stat-card__icon--active {
  background: rgba(56, 189, 248, 0.12);
  color: #7dd3fc;
}

.stat-card__icon--confirmed {
  background: rgba(52, 211, 153, 0.12);
  color: #6ee7b7;
}

.stat-card__icon--archive {
  background: rgba(167, 139, 250, 0.12);
  color: #c4b5fd;
}

.stat-card__icon--providers {
  background: rgba(251, 191, 36, 0.12);
  color: #fcd34d;
}

.stat-card__content {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 4px;
}

.stat-card__label {
  color: var(--text-secondary);
  font-size: 0.73rem;
  line-height: 1.3;
}

.stat-card__value {
  color: var(--text-primary);
  font-size: 1.35rem;
  font-weight: 750;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.stat-card__action-label {
  color: var(--accent);
  font-size: 0.82rem;
  font-weight: 700;
}

.stat-card__arrow {
  flex: 0 0 auto;
  color: var(--text-muted);
  font-size: 0.7rem;
}

/* Main layout */

.content-card,
.orders-section {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: var(--surface);
  box-shadow: 0 15px 38px rgba(0, 0, 0, 0.16);
}

.content-card {
  padding: 18px;
}

.orders-layout {
  display: grid;
  grid-template-columns:
    minmax(0, 1.15fr)
    minmax(320px, 0.85fr);
  gap: 18px;
}

.orders-section {
  min-width: 0;
  padding: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.section-header__eyebrow {
  display: inline-flex;
  min-width: 25px;
  height: 25px;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
  padding: 0 7px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.72rem;
  font-weight: 750;
}

.section-header__title {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.35;
}

.section-header__link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 9px;
  border: 0;
  background: transparent;
  color: var(--accent);
  font: inherit;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
}

.section-header__link:hover {
  color: #7dd3fc;
}

/* Collected orders */

.orders-list {
  display: grid;
  gap: 14px;
}

.order-card {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.025);
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.order-card:hover {
  border-color: rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.038);
}

.order-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.018);
}

.order-card__heading {
  display: grid;
  min-width: 0;
  gap: 6px;
}

.order-card__type {
  color: #7dd3fc;
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.4;
}

.order-card__type--direct {
  color: #c4b5fd;
}

.order-card__time {
  color: var(--text-muted);
  font-size: 0.7rem;
}

.order-card__times {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.15rem;
}

.order-card__execution {
  display: flex;
  align-items: center;
  gap: 0.4rem;

  font-size: 0.95rem;
  font-weight: 600;
  color: var(--mdb-primary);
}

.order-card__execution strong {
  color: inherit;
}

.order-card__created {
  font-size: 0.75rem;
  color: #7b8794;
}

.order-card__status {
  flex: 0 0 auto;
  max-width: 45%;
  padding: 6px 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.055);
  color: var(--text-secondary);
  font-size: 0.68rem;
  line-height: 1.3;
  text-align: center;
}

.order-card__body {
  padding: 16px;
}

.order-card__title {
  margin: 0;
  color: var(--text-primary);
  font-size: 0.96rem;
  font-weight: 650;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.order-card__photos {
  margin-top: 16px;
}

.order-card__photos-title {
  margin: 0 0 9px;
  color: #67c1ce;
  font-size: 0.75rem;
  font-weight: 650;
}

.order-card__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* Actions */

.primary-action,
.new-order-button,
.danger-action,
.text-action,
.delete-link,
.feedback-action {
  font: inherit;
}

.primary-action {
  display: inline-flex;
  width: 100%;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 10px 14px;
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 11px;
  background: rgba(56, 189, 248, 0.13);
  color: #7dd3fc;
  font-size: 0.82rem;
  font-weight: 750;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.primary-action:hover {
  transform: translateY(-1px);
  border-color: rgba(56, 189, 248, 0.5);
  background: rgba(56, 189, 248, 0.2);
}

.action-badge {
  display: inline-flex;
  min-width: 21px;
  height: 21px;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  border-radius: 999px;
  background: #e11d48;
  color: #fff;
  font-size: 0.67rem;
  font-weight: 750;
}

.delete-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 4px;
  border: 0;
  background: transparent;
  color: #fda4af;
  font-size: 0.75rem;
  font-weight: 650;
  cursor: pointer;
  font: inherit;
}

.delete-link:hover {
  color: var(--danger);
}

.quit-box {
  display: grid;
  width: 100%;
  gap: 13px;
  padding: 14px;
  border: 1px dashed rgba(251, 113, 133, 0.28);
  border-radius: 13px;
  background: rgba(251, 113, 133, 0.045);
}

.quit-box__actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
}

.text-action,
.danger-action {
  min-height: 38px;
  padding: 8px 13px;
  border-radius: 9px;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
}

.text-action {
  border: 1px solid var(--border-strong);
  background: transparent;
  color: var(--text-secondary);
}

.danger-action {
  border: 1px solid rgba(251, 113, 133, 0.32);
  background: rgba(251, 113, 133, 0.13);
  color: #fda4af;
}

/* Confirmed orders */

.confirmed-list {
  display: grid;
  gap: 10px;
}

.confirmed-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 13px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.025);
}

.confirmed-card__main {
  display: grid;
  min-width: 0;
  gap: 5px;
}

.confirmed-card__title {
  margin: 0;
  color: var(--text-primary);
  font-size: 0.86rem;
  font-weight: 650;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.confirmed-card__time {
  color: var(--text-muted);
  font-size: 0.7rem;
}

.status-pill {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  min-height: 25px;
  padding: 5px 8px;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 700;
  white-space: nowrap;
}

.status-pill--confirmed {
  background: rgba(52, 211, 153, 0.13);
  color: #6ee7b7;
}

.status-pill--processed {
  background: rgba(251, 191, 36, 0.13);
  color: #fcd34d;
}

.feedback-action {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 7px;
  margin-top: 5px;
  padding: 7px 9px;
  border: 1px solid rgba(251, 191, 36, 0.25);
  border-radius: 8px;
  background: rgba(251, 191, 36, 0.08);
  color: #fcd34d;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
}

/* Empty states */

.empty-state {
  display: flex;
  min-height: 150px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 11px;
  padding: 22px;
  border: 1px dashed var(--border-strong);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.018);
  text-align: center;
}

.empty-state__icon {
  display: inline-flex;
  width: 43px;
  height: 43px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--surface-light);
  color: var(--text-muted);
}

.empty-state__title {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.78rem;
}

/* Bottom action */

.page-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.new-order-button {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 11px 18px;
  border: 1px solid rgba(56, 189, 248, 0.32);
  border-radius: 12px;
  background: #0e7490;
  box-shadow: 0 10px 24px rgba(14, 116, 144, 0.22);
  color: #fff;
  font-size: 0.84rem;
  font-weight: 750;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.new-order-button:hover {
  transform: translateY(-1px);
  background: #0891b2;
  box-shadow: 0 13px 28px rgba(14, 116, 144, 0.3);
}

.feedback-company {
  margin: 0;
  color: #fb923c;
}

/* Loading */

.on-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: grid;
  place-items: center;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(3px);
}

.on-spinner {
  width: 42px;
  height: 42px;
  border: 4px solid rgba(255, 255, 255, 0.18);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: recipient-spin 0.75s linear infinite;
}

@keyframes recipient-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 991px) {
  .orders-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .recipient-page {
    margin-top: 12px;
    padding-right: 10px;
    padding-left: 10px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin-bottom: 14px;
  }

  .stat-card {
    min-height: 68px;
    gap: 9px;
    padding: 10px;
    border-radius: 12px;
  }

  .stat-card__icon {
    width: 34px;
    height: 34px;
    flex-basis: 34px;
    border-radius: 9px;
    font-size: 0.82rem;
  }

  .stat-card__label {
    font-size: 0.65rem;
  }

  .stat-card__value {
    font-size: 1.08rem;
  }

  .stat-card__action-label {
    font-size: 0.7rem;
  }

  .orders-section {
    padding: 15px;
    border-radius: 14px;
  }

  .section-header {
    margin-bottom: 14px;
  }

  .order-card__header {
    gap: 9px;
    padding: 12px;
  }

  .order-card__status {
    max-width: 42%;
    font-size: 0.61rem;
  }

  .order-card__body {
    padding: 13px;
  }

  .page-actions {
    position: sticky;
    bottom: 10px;
    z-index: 20;
  }

  .new-order-button {
    width: 100%;
    box-shadow: 0 10px 28px rgba(14, 116, 144, 0.4);
  }
}

@media (max-width: 420px) {
  .stat-card__arrow {
    display: none;
  }

  .stat-card {
    min-height: 64px;
  }

  .confirmed-card {
    flex-direction: column;
  }

  .status-pill {
    align-self: flex-start;
  }

  .order-card__header {
    flex-direction: column;
  }

  .order-card__status {
    max-width: 100%;
    text-align: left;
  }

  .quit-box__actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
</style>
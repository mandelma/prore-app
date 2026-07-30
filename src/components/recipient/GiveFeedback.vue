<template>
  <div class="feedback-modal">
    <div class="feedback-card">
      <div class="feedback-card__header">
        <div class="feedback-card__icon">
          <i class="fas fa-star" />
        </div>

        <div>
          <h4 class="feedback-card__title">
            {{ t('giveFeedback.title') }}
          </h4>

          <p class="feedback-card__subtitle">
            {{ t('giveFeedback.subtitle') }}
          </p>
        </div>
      </div>

      <div class="feedback-card__body">
        <div
          class="rating-stars"
          role="radiogroup"
          :aria-label="t('giveFeedback.rating_label')"
        >
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            class="rating-star"
            :class="{ 'rating-star--active': star <= rating }"
            :aria-label="`${star} / 5`"
            :aria-checked="rating === star"
            role="radio"
            @click="rating = star"
          >
            ★
          </button>
        </div>

        <p class="rating-description">
          {{
            rating > 0
              ? t(`giveFeedback.rating_${rating}`)
              : t('giveFeedback.select_rating')
          }}
        </p>

        <Transition name="feedback-field">
          <div
            v-if="rating > 0"
            class="feedback-comment"
          >
            <MDBTextarea
              v-model="feedbackContent"
              type="textarea"
              :label="t('giveFeedback.comment_label')"
              rows="4"
              class="feedback-textarea"
            />

            <span class="feedback-comment__hint">
              {{ t('giveFeedback.comment_optional') }}
            </span>
          </div>
        </Transition>
      </div>

      <div class="feedback-card__actions">
        <MDBBtn
          color="secondary"
          outline
          rounded
          class="feedback-btn feedback-btn--skip"
          @click="handleNoRating"
        >
          {{ t('giveFeedback.skip') }}
        </MDBBtn>

        <MDBBtn
          color="primary"
          rounded
          class="feedback-btn feedback-btn--submit"
          :disabled="rating === 0"
          @click="handleConfirmRating"
        >
          <i class="fas fa-paper-plane me-2" />
          {{ t('giveFeedback.submit') }}
        </MDBBtn>
      </div>
    </div>
  </div>
</template>
<script setup>
import { MDBContainer, MDBCardBody, MDBCard, MDBTextarea, MDBBtn } from 'mdb-vue-ui-kit';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useProStore } from '@/stores/providerStore';
import { useClientStore } from '@/stores/recipientStore';
import { useUserStore } from '@/stores/userStore';
import { useClientArchiveStore } from '@/stores/cArchiveStore';
import { useProArchiveStore } from '@/stores/pArchiveStore';
import providerService from '../../service/providers';
import clientHistoryService from '../../service/client_history';
import providerHistoryService from '../../service/provider_history';

const props = defineProps({
  //providerId: {type: String},
  target: {type: String},
  booking_id: {type: String}
})
const emit = defineEmits(['no-rating', 'rating-done'])
const userStore = useUserStore();
const providerStore = useProStore();
const clientStore = useClientStore();
const cArchiveStore = useClientArchiveStore();
const pArchiveStore = useProArchiveStore();
const rating = ref(0);
const feedbackContent = ref("");

const archivedClient = ref(null);

const { profile } = storeToRefs(userStore);

const handleNoRating = async () => {
  //await clientStore.handleGivenFeedback(props.booking_id, props.target, 'archieved');
  emit('no-rating');
  await handleArchiveClient();
}

const { t } = useI18n();

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);

  return d.toLocaleString("fi-FI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}


const handleArchiveClient = async (booking, provider) => {
  

  const clientName = profile.value.firstName + " " + profile.value.lastName;

  //if (booking && provider) {
  const providerHistory = {
    name: clientName,
    header: booking.header,
    content: booking.description,
    address: booking.address,
    distance: booking.confirmedOffer.distance,
    date: booking.created,
    //userID: provider.user.id
    userID: props.target
  }

  const clientHistory = {
      status: "",
      header: booking.header,
      proID: provider.id,
      company:  provider.pName,
      id_number:  provider.ide,
      rating: provider.rating,
      address:  provider.address,
      date:  booking.created,
      professional:  provider.profession,
      deal: booking.confirmedOffer,
      bookerId: profile.value.id
    }

    const complitedClientBooking = await clientHistoryService.updateClientHistory(clientHistory);
    const complitedBooking = await providerHistoryService.updateProHistory(providerHistory);

    if (complitedClientBooking) cArchiveStore.addArchievedClientLocal(complitedClientBooking);
    if (complitedBooking) {
      pArchiveStore.archiveProviderLocal(complitedBooking);
      console.log("ID " + complitedBooking.id);
      providerHistory.id = complitedBooking.id;
      await clientStore.handleGivenFeedback(props.booking_id, props.target, providerHistory, 'archived');
    } 

    console.log("Client archive - ", complitedClientBooking);

  //}
  
}

const handleConfirmRating = async () => {
  const booking = clientStore.getBookingById(props.booking_id);

  if (!booking) return;
  //const provider = await providerService.getProvByProvId(props.providerId);
  const provider = await providerService.getProvider(props.target);

  console.log("TARGET " + props.target)
  console.log("Booking id in feedback page " + props.booking_id);

  if (!booking && !provider) return;

  console.log("Confirm feedback PROVIDER - ", provider.id);

  try {
    const rated = await providerService.setRating(provider.id, {
      star: Number(rating.value.toFixed(1)),
      content: {
        date: new Date().toISOString(),
        sender: profile.value?.firstName,
        text: feedbackContent.value
      }
    });

    if (rated) {
      await handleArchiveClient(booking, provider);
      
      emit('rating-done');
    }
  } catch (err) {
    console.log("Error to handle rating " + err.message);
  }

  
}
</script>
<style scoped>
.feedback-modal {
  width: 100%;
  padding: 8px;
}

.feedback-card {
  width: 100%;
  max-width: 540px;
  margin: 0 auto;
  overflow: hidden;

  background:
    linear-gradient(
      145deg,
      rgba(35, 40, 52, 0.98),
      rgba(25, 29, 39, 0.98)
    );

  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 22px;

  box-shadow:
    0 18px 50px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.feedback-card__header {
  display: flex;
  align-items: center;
  gap: 15px;

  padding: 24px 24px 18px;

  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.feedback-card__icon {
  display: grid;
  flex: 0 0 52px;
  width: 52px;
  height: 52px;
  place-items: center;

  font-size: 21px;
  color: #ffc857;

  background: rgba(255, 193, 7, 0.12);
  border: 1px solid rgba(255, 193, 7, 0.25);
  border-radius: 16px;
}

.feedback-card__title {
  margin: 0 0 5px;

  font-size: 20px;
  font-weight: 700;
  line-height: 1.25;
  color: #f7f8fb;
}

.feedback-card__subtitle {
  margin: 0;

  font-size: 14px;
  line-height: 1.5;
  color: rgba(235, 238, 245, 0.67);
}

.feedback-card__body {
  padding: 24px;
}

.rating-stars {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(8px, 3vw, 16px);

  padding: 18px 12px;

  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 18px;
}

.rating-star {
  appearance: none;

  min-width: 44px;
  padding: 0;

  font-family: inherit;
  font-size: clamp(35px, 8vw, 44px);
  line-height: 1;

  color: rgba(255, 255, 255, 0.18);
  text-shadow: none;

  background: transparent;
  border: 0;

  cursor: pointer;

  transition:
    color 0.18s ease,
    transform 0.18s ease,
    filter 0.18s ease;
}

.rating-star:hover {
  color: rgba(255, 200, 87, 0.72);
  transform: translateY(-2px) scale(1.08);
}

.rating-star--active {
  color: #ffc857;

  filter: drop-shadow(0 4px 8px rgba(255, 193, 7, 0.25));
}

.rating-star:focus-visible {
  outline: 2px solid rgba(255, 200, 87, 0.9);
  outline-offset: 4px;
  border-radius: 5px;
}

.rating-description {
  min-height: 22px;
  margin: 13px 0 0;

  font-size: 14px;
  font-weight: 600;
  text-align: center;
  color: rgba(255, 255, 255, 0.72);
}

.feedback-comment {
  margin-top: 21px;
}

.feedback-textarea {
  width: 100%;
}

.feedback-comment__hint {
  display: block;
  margin-top: 7px;

  font-size: 12px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.46);
}

.feedback-card__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  padding: 18px 24px 24px;

  background: rgba(0, 0, 0, 0.08);
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.feedback-btn {
  min-width: 132px;
  min-height: 43px;

  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.01em;
  text-transform: none;
}

.feedback-btn--submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.feedback-field-enter-active,
.feedback-field-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.feedback-field-enter-from,
.feedback-field-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 576px) {
  .feedback-modal {
    padding: 0;
  }

  .feedback-card {
    border-radius: 18px;
  }

  .feedback-card__header {
    align-items: flex-start;
    padding: 20px 18px 16px;
  }

  .feedback-card__icon {
    flex-basis: 46px;
    width: 46px;
    height: 46px;
  }

  .feedback-card__body {
    padding: 20px 18px;
  }

  .rating-stars {
    gap: 5px;
    padding: 16px 8px;
  }

  .rating-star {
    min-width: 40px;
  }

  .feedback-card__actions {
    flex-direction: column-reverse;
    padding: 16px 18px 20px;
  }

  .feedback-btn {
    width: 100%;
  }
}
</style>
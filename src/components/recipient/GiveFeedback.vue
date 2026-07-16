<template>
    <MDBContainer>
    
    <div class="container mt-5">
      <MDBCard  text="white"  class="p-4" style="border: 1px solid orange;">
        <MDBCardBody >
          <div class="starContainer">
            <span
                v-for="star in 5"
                :key="star"
                @click="rating = star"
                style="font-size: 33px; cursor: pointer;"
                :class="star <= rating ? 'text-yellow' : 'text-gray'"
            >★</span>
          </div>

          <!-- Comment Box -->
          <MDBTextarea
              white
              v-if="rating > 0"
              v-model="feedbackContent"
              type="textarea"
              :label="t('giveFeedback.comment_label')"
              rows="3"
              class="mb-3"
          />

          <!-- Submit Button -->

          <MDBBtn 
          color="secondary"
          rounded
          size="lg"
          @click="handleConfirmRating"
          :disabled="feedbackContent === '' && rating === 0"
          >
            {{ t('giveFeedback.submit') }}
          </MDBBtn>

        </MDBCardBody>

      </MDBCard>
      <p style="float: right; color: #e4548e; cursor: pointer; margin-top: 13px;" @click="handleNoRating">{{ t('giveFeedback.skip') }}</p><br><br>
    </div>

  </MDBContainer>
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
    distance: booking.offer.distance,
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
      deal: booking.offer,
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
.starContainer {
  display: flex;
  justify-content: space-around;

  margin-bottom: 13px;
}
.text-yellow {
  color: yellow;
}
.text-gray {
  color: gray;
}

.rating {
  padding: 20px;
}
</style>
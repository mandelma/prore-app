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
              label="Anna haluttaessa arvostelua!"
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
            Lähettää palaute
          </MDBBtn>

          <!-- <button
              class="mt-4 w-full bg-blue-500 text-white py-2 rounded-md disabled:opacity-50"
              @click="handleConfirmRating"
              :disabled="feedbackContent === '' && rating === 0"
          >
            Lähettää palaute
          </button> -->


        </MDBCardBody>

      </MDBCard>
      <p style="float: right; color: #e4548e; cursor: pointer; margin-top: 13px;" @click="handleNoRating">En halua antaa palautetta</p><br><br>
    </div>

  </MDBContainer>
</template>
<script setup>
import { MDBContainer, MDBCardBody, MDBCard, MDBTextarea, MDBBtn } from 'mdb-vue-ui-kit';
import { ref } from 'vue';
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
  providerId: {type: String},
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
  await clientStore.handleGivenFeedback(props.booking_id, props.target, 'archieved');
  emit('no-rating');
  await handleArchiveClient();
}

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


const handleArchiveClient = async () => {
  const booking = clientStore.getBookingById(props.booking_id);
  const provider = await providerService.getProvByProvId(props.providerId);
  const clientName = profile.value.firstName + " " + profile.value.lastName;
  if (booking && provider) {
    const providerHistory = {
      name: clientName,
      header: booking.header,
      content: booking.description,
      address: booking.address,
      distance: booking.offer.distance,
      date: booking.created,
      userID: provider.user.id
    }

    const clientHistory = {
        status: "",
        header: booking.header,
        proID: props.providerId,
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
      if (complitedBooking) pArchiveStore.archiveProviderLocal(complitedBooking);

      console.log("Client archieve - ", complitedClientBooking);

      //archivedClient.value = complitedClientBooking;
  }
  
}




const handleConfirmRating = async () => {
  console.log("Confirm feedback PROVIDER - ", props.providerId);
  const id = '698b67142f5ca2a9e1413dd6';
  console.log("TARGET " + props.target)
  console.log("Booking id in feedback page " + props.booking_id);

  const rated = await providerService.setRating(props.providerId, {
    star: Number(rating.value.toFixed(1)),
    content: {
      date: new Date().toISOString(),
      sender: profile.value?.firstName,
      text: feedbackContent.value
    }
  });

  //console.log("Rated, ", rated)
  //await clientStore.handleGivenFeedback(props.booking_id, props.target, 'archieved');
  if (rated) {
    
    await clientStore.handleGivenFeedback(props.booking_id, props.target, 'archieved');
    await handleArchiveClient();
    

    //console.log("Archieved client value - ", archivedClient);
    
    emit('rating-done');
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
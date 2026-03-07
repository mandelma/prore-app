<template>
  <MDBContainer style="margin-top: 17px;">
    <MDBToast
      :stacking="false"
      autohide
      :delay="3000"
      v-model="isConfirmed"
      toast="success"
      icon="fas fa-check fa-lg me-2"
    >
      <button type="button" style="visibility: hidden;" class="btn-close ms-auto" aria-label="Close" @click="hideError"></button>
      <template #title> PROKEIKKATORI </template>
      <!-- <template #small> 11 mins ago </template> -->
      {{ confirmedMessage }}
    </MDBToast>
    
    <div>
      
      <div>

        <!-- Quick stats -->
        <MDBRow class="g-2 mb-3">
          
          <MDBCol col="12" md="6">
            <MDBCard class="h-100">
              <MDBCardBody class="py-3">
                <div class="text-muted small">Vahvistetut tilaukset</div>
                <div class="fs-5 fw-semibold">{{ clientConfirmed.length }}</div>
                <MDBBtn v-if="archievedBookings.length" color="dark" block @click="callHistory"><span>{{archievedBookings.length}}</span>&nbsp;&nbsp;tilausta arkistoitu</MDBBtn>
                
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
          <MDBCol col="6" md="3">
            <MDBCard class="h-100">
              <MDBCardBody class="py-3">
                <div class="text-muted small">Aktiiviset tilaukset</div>
                <div class="fs-5 fw-semibold">{{ bookings.filter(b => b.status === 'active').length }}</div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
          <MDBCol col="6" md="3">
            <MDBCard class="h-100">
              <MDBCardBody class="py-3">
                <div class="text-muted small">Palveluntarjoajaat</div>
                <div 
                  class="fs-5 fw-semibold" 
                  style="display: flex; justify-content: space-between;"
                >
                  <span style="color: green;">---</span> 
                  <span>
                    <div style="width: 100%;" @click="router.push('/pro-around')">
                      <img class="mapGif" :src="world" alt="from_map" />
                    </div>
                  </span>
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>

        <div v-if="isRecipientContent">
          <MDBCard>
            <MDBCardBody>
              <recipient-content
                :booking="selectedBooking"
                @updateOfferState="handleUpdateOfferState"
                @cancelRecipientContent="handleCancelRecipientContent"
                @out-here="handleOutHere"
                @canselRecipientContentConfirmed="handleCanselRecipientContentConfirmed"
              />
            </MDBCardBody>
          </MDBCard>
          
        </div>
        <div v-else>
          <MDBRow class="g-3">
            <MDBCol lg="6">
              <MDBCard class="h-100">


                
                <MDBCardBody style="text-align: left;">
                  <h6>Kootut tilaukset</h6>
                  <div v-for="booking in sortedBookings" :key="booking.id" class="bookings">

                    <h6  v-if="booking.isIncludeOffers" class="text-muted fw-semibold">Tilaus on lähetetty hintatarjousten pyytämistä varten</h6>
                    <h6 v-else >Tilaus on lähetetty palveluntarjoajalle <span style="color:aquamarine;">{{ booking.ordered[0].pName }}</span></h6>
                    
                    <fieldset class="fs-box">
                      <legend class="fs-legend">
                        <template v-if="booking.isIncludeOffers">
                          {{ booking.offers.length > 0 ? booking.offers.length + " " + t('offerCountNotification') : t('recipient_panel_no_offers')}}
                        </template>
                        <template v-else>
                          Odottaa yhtenottoa...
                        </template>
                      </legend>

                      <!-- common UI -->
                      <div class="text-muted">{{ formatDateTime(booking.created) }}</div>
                      <div class="title">{{ booking.header }}</div>

                      <!-- branch actions -->
                      <div v-if="booking.isIncludeOffers" style="margin-top: 13px;">

                        <!-- multi buttons/badge -->
                        <div style="margin-top: 13px;">
                            <MDBBtn class="action" block color="primary" @click="handleRecipientResult(booking.id, booking)">
                            Tilaus
                          </MDBBtn>
                          
                          <MDBBadge
                            v-if="booking.offers.filter(offer => offer.isNewOffer).length > 0"
                            color="danger"
                            class="translate-middle p-1"
                            pill
                            notification
                            >
                              
                              <span style="padding: 5px;">{{booking.offers.filter(offer => offer.isNewOffer).length}}</span>
                            </MDBBadge
                          >
                          </div>
                      </div>
                      <div v-else style="margin-top: 13px;">

                        <!-- single buttons -->
                        <div class="main">
                          <div v-if="selBookingId === booking.id && isQuitBooking" class="quit-box">
                            <MDBTextarea
                              white
                              v-model="clientQuitBookingReason"
                              :label="t('recipient_panel_give_reason')"
                              rows="3"
                            />
                            <MDBBtn v-if="clientQuitBookingReason.length > 1" color="info" class="send-btn" @click="clientRejectMapBooking(booking)">
                              Poista tilaus
                            </MDBBtn>
                          </div>

                          
                        </div>

                        <div class="actions" style="margin-top: 13px;">
                          <MDBBtn
                            v-if="selBookingId === booking.id && isQuitBooking"
                            color="danger"
                            outline
                            class="action-btn"
                            @click="canselQuitSelectedBooking"
                          >
                            Peruuta
                          </MDBBtn>

                          <MDBBtn
                            v-else
                            color="danger"
                            block
                            class="action-btn"
                            @click="handleQuitSelectedBooking(booking.id)"
                          >
                            Poista tilaus
                          </MDBBtn>
                        </div>
                      </div>
                    </fieldset>
                  </div>
                  <div v-if="!sortedBookings.length" class="text-muted small">Koostettuja tilauksia ei ole.</div>
                  
                </MDBCardBody>
              </MDBCard>
            </MDBCol>

            <!-- Confirmed bookings -->
            <MDBCol lg="6">
              <MDBCard class="h-100">
                <MDBCardBody style="text-align: left;">
                  <MDBCardTitle>Vahvistetut tilaukset</MDBCardTitle>
                  <div v-if="clientConfirmed.length" class="vstack gap-2 ">
                    <div
                      v-for="a in clientConfirmed.slice(0, 5)"
                      :key="a.id"
                      class="p-2 rounded border d-flex justify-content-between align-items-start gap-2"
                    >
                      
                      <div class="min-w-0">
                        <div class="fw-semibold">{{ a.header }}</div>
                        
                        <div class="small text-muted text-truncate">
                          {{ formatDateTime(a.created) }},
                        </div>
                        
                        <MDBBtn v-if="!isDone"  color="info" block @click="handleDone(a.offer?.bookingID, a.offer?.provider?.user?.id)">Aeg läbi, töö tehtud</MDBBtn>
                        <div v-else>
                          <MDBBtn 
                            style="margin-top: 7px;"  
                            outline="warning" ,
                            block 
                            @click="handleFeedback(a.offer?.name, a.offer?.provider?.id, a.offer?.provider?.user?.id, a.offer?.bookingID)">
                            Anna palautetta
                            </MDBBtn>
                          <!-- <p style="font-size: 12px; color: red;">{{a.offer?.name ||""}} </p> -->
                        </div>
                        
                      </div>

                      <MDBBadge v-if="a.status ==='confirmed'" :color="'success'">
                        Vahvistettu
                      </MDBBadge>
                      <MDBBadge v-else :color="'warning'">
                          Käsitelty
                      </MDBBadge>
                      
                    </div>
                    
                  </div>

                  <div v-else class="text-muted small">
                    Tilauksia ei ole vielä vahvistettu.
                  </div>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </MDBRow>
        </div>

        

        
        
        <div style="margin-top: 23px; display: flex; justify-content: right;">
          <MDBBtn color="primary" size="lg" @click="router.push('/client-form')">{{t('recipient_panel_new_order')}}</MDBBtn>
        </div>

      </div>

    </div>

    

    <MDBModal
      tabindex="-1"
      centered
      v-model="handleFeedbackModal"
      removeBackdrop
      :keyboard="false"
      :focus="false"
    >
      <MDBModalHeader class="modal-header-custom">
        <MDBModalTitle><h6 style="color: orange;">{{ company }}</h6></MDBModalTitle>
      </MDBModalHeader>
      <MDBModalBody>
        <p class="text-muted">Antaa palveluntarjoajalle palautetta saamastaan ​palvelusta.</p>
        <GiveFeedback :providerId="proId" :target="personalId" :booking_id="bookingId" @rating-done="handleRatingDone" @no-rating="handleNoRating"/>
      </MDBModalBody>
      <MDBModalFooter>
        <MDBBtn color="danger" @click="handleFeedbackModal = false"> Peruuta </MDBBtn>
        <!-- <MDBBtn color="primary"> Save changes </MDBBtn> -->
      </MDBModalFooter>
    </MDBModal>
    
  </MDBContainer>


</template>

<script setup>
import { MDBContainer, MDBRow, MDBCol, MDBBtn, MDBTextarea, MDBCard,
  MDBCardBody, MDBBadge, MDBToast, MDBIcon, MDBModal, MDBModalHeader, MDBModalBody, MDBModalFooter } from 'mdb-vue-ui-kit';
import { useI18n } from 'vue-i18n';
import { ref, computed } from 'vue';
import world from '@/assets/map.gif'
import RecipientContent from "../recipient/RecipientContent.vue";
import { useClientStore } from '@/stores/recipientStore';
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore';
import { storeToRefs } from 'pinia'
import socket from '@/socket';

import GiveFeedback from '@/components/recipient/GiveFeedback.vue';

defineOptions({
  name: "recipient-page"
})
defineProps({
  //bookings: {type: Array}
})

const { t } = useI18n();
const router = useRouter();
const selectedIndex = ref(null);
const isRecipientContent = ref(false);
const selectedBooking = ref(null);
const clientStore = useClientStore();
const notificationStore = useNotificationStore();

const _world = world
const isConfirmed = ref(false);
const confirmedMessage = ref("TEST")

const isQuitBooking = ref(false);
const selBookingId = ref(null);
const clientQuitBookingReason = ref("");

const isDone = ref(false);

const { bookings, clientConfirmed, archievedBookings } = storeToRefs(clientStore);
const { userId } = storeToRefs(notificationStore);

//const singleBookings = computed(() => bookings.value.filter(sb => sb.status !== 'confirmed' && !sb.isIncludeOffers));
//const multiBookings = computed(() => bookings.value.filter(mp => mp.status !== 'confirmed' && mp.isIncludeOffers));

const handleFeedbackModal = ref(false);
const company = ref("");
const proId = ref("");
const personalId = ref("");
const bookingId = ref("");

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

// Test
const handleDone = async (bookingId, target) => {
  isDone.value = true;
  await clientStore.handleEditStatus(bookingId, 'done');

  socket.emit("booking-done", bookingId, target);

}


const handleRecipientResult = (id, booking) => {
  console.log("Booking id - " + id); 
  console.log("Booking title: ")
  isRecipientContent.value = true;
  
  selectedBooking.value = clientStore.getBookingById(id);
}

const handleRatingDone = () => {
  console.log("Ratingis done ");
  handleFeedbackModal.value = false;
}

const handleNoRating = () => {
  console.log("No rating handled");
  handleFeedbackModal.value = false;
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

const handleUpdateOfferState = (bookingId, offerId) => {
  console.log("Booking id is " +bookingId);
  console.log("Offer id is " + offerId);
  selectedBooking.value = clientStore.getBookingById(bookingId);
}

const handleCancelRecipientContent = () => {
  console.log("CANCEL")
  isRecipientContent.value = false;
}

const handleOutHere = () => {
  console.log("OUT")
  isRecipientContent.value = false;
}

const handleCanselRecipientContentConfirmed = (pro) => {
  isRecipientContent.value = false;
  console.log("Pro - " + pro)
  // Show success toast after confirmation
  isConfirmed.value = true;
  confirmedMessage.value = `${pro} vahvistettu`;
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

const clientRejectMapBooking = async (booking) => {
  console.log("Quit bbb " + booking.header);
  console.log("Selected booking pro user - " + booking.ordered[0].user.id);
  const addressaat = booking.ordered[0].user.id;
  const reason = clientQuitBookingReason.value;
  const sender = booking.user.username;
  await clientStore.removeConfirmedMapOffer(booking);

  const noteText = `${booking.user.username} peruutti tilauksen "${booking.header}". Syyksi ilmoitettu: ${reason}!`
  await notificationStore.addNotification(booking.id, sender, noteText, addressaat);
}

const handleFeedback = (name, id, pId, bId) => {
  console.log("Provider id - " + id);

  company.value = name;
  proId.value = id;
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
.mapGif {
  width: 40px;
  cursor: pointer;
}
.client-orders {
  background-color: #1a222e;
  border: 1px solid #0e131a;
  border-radius: 5px;
  padding: 17px;
  margin-bottom: 5px;
}
.bookings {
  font-size: 16px;
  text-align: left;
  margin-bottom: 13px;
  /*padding: 5px;*/
}
.booking_time {
  width: 100px;
  color: #817d7d;
}

/* Multi order row */

.item{
  display: grid;
  grid-template-columns: auto 1fr auto;  /* date | content | button */
  gap: 12px;
  align-items: start;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.08);
}

.date{
  white-space: nowrap;
  font-size: 14px;
  /* color: rgb(103, 103, 204); */
  /* background-color: rgb(34, 65, 100);
  border: 1px solid rgba(255,255,255,.08); */
  background-color: rgb(92, 102, 114);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 17px;
  padding: 9px;
  opacity: .75;
}

.main{ min-width: 0; }

.title{
  padding: 13px 0 0 7px;
  font-weight: 600;
  line-height: 1.25;
  word-break: break-word;
}

.actions{
  display: flex;
  align-items: center;
}

.action-btn{
  white-space: nowrap;
  min-width: 110px;
}

/* Delete mode: make the middle look like a “card inside card” */
.quit-box{
  display: grid;
  width: 100%;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  border: 1px dashed rgba(255,255,255,.16);
  background: rgba(255,255,255,.04);
}

.send-btn{
  justify-self: end;
}

/* Mobile: stack cleanly + full-width buttons */
@media (max-width: 576px){
  .item{
    grid-template-columns: 1fr;      /* stack */
  }

  .actions{
    justify-content: stretch;
  }

  .action-btn{
    width: 100%;
    min-width: 0;
  }

  .send-btn{
    width: 100%;
    justify-self: stretch;
  }
}


/* Mobile: keep date top-left, title next line, button full width */
/* @media (max-width: 520px){
  .item{
    grid-template-columns: 1fr;
    grid-template-areas:
      "date"
      "title"
      "action";
  }
  .action{
    justify-self:stretch;
  }
} */


#info-block section {
  border: 1px solid #939696;
  
  margin-bottom: 20px;
}

#info-block-confirmed section {
  border: 1px solid #23334d;
  border-radius: 20px;
  margin-bottom: 20px;
}

.file-marker > div {
  padding: 0 3px;
  /*height: 130px;*/
  /*margin-top: -0.8em;*/
  margin-top: -1em;
}

.fs-box {
  border: 1px solid #888;
  border-radius: 6px;
  padding: 1rem;
  min-inline-size: 0; /* important for flex layouts */
}

.fs-legend {
  padding: 0 8px;
  font-size: 0.8rem;
  margin-left: 100px;
  color: #ccc;

  /* 🔑 reset fixes */
  float: unset;
  width: auto;
}

.box-title {
  background: #808687 none repeat scroll 0 0;
  
  color: black;
  display: inline-block;
  /*padding: 0 2px;*/
  font-size: 16px;
  padding: 0 10px;

  margin-left: 8em;
}
.box-title-confirmed {
  /*background: #141414 none repeat scroll 0 0;*/
  background: #1a222e none repeat scroll 0 0;
  display: inline-block;
  color: #66aab1;
  /*padding: 0 2px;*/
  font-size: 16px;
  padding: 0 10px;

  /*margin-left: 8em;*/
  margin-left: 10%;
}
.box-contents {
  /*border: solid red;*/

  padding: 20px;
  overflow-y: auto;
}
.box-contents-confirmed {

  padding: 10px;
}
.date_expired {
  color: #c76868;
}
.order_expired {
  border: 1px solid #eb5454;
}
</style>
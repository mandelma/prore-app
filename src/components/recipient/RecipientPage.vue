<template>
  <MDBContainer>
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
          <!-- <MDBCol col="6" md="3">
            <MDBCard class="h-100">
              <MDBCardBody class="py-3">
                <div class="text-muted small">Aktiiviset tilaukset</div>
                <div class="fs-5 fw-semibold">{{ bookings.filter(b => b.status !== 'confirmed').length }}</div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol> -->
          <MDBCol col="12" md="6">
            <MDBCard class="h-100">
              <MDBCardBody class="py-3">
                <div class="text-muted small">Mingi info siia?</div>
                <div class="fs-5 fw-semibold">---</div>
                
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
          <MDBCol col="6" md="3">
            <MDBCard class="h-100">
              <MDBCardBody class="py-3">
                <div class="text-muted small">Aktiiviset tilaukset</div>
                <div class="fs-5 fw-semibold">{{ bookings.filter(b => b.status !== 'confirmed').length }}</div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
          <MDBCol col="6" md="3">
            <MDBCard class="h-100">
              <MDBCardBody class="py-3">
                <div class="text-muted small">Palveluntarjoajaat - 10 km</div>
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
                  <MDBCardTitle >Tilaukset</MDBCardTitle>
                  <div v-for="(booking, index) in multiBookings" :key="index" class="bookings">
                    <fieldset class="fs-box">
                      <legend class="fs-legend">
                        {{booking.offers.length > 0 ? booking.offers.length + " " + t('offerCountNotification') : t('recipient_panel_no_offers')}}
                      </legend>
                      <div class="item">
                        <div class="date text-muted">{{ formatDateTime(booking.created) }}</div>
                        <div class="title">{{ booking.header }}</div>
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
                            <!-- <span style="padding: 5px;">{{booking.offers.filter(offer => offer.isNewOffer).length}}</span> -->
                            <span style="padding: 5px;">{{booking.offers.filter(offer => offer.isNewOffer).length}}</span>
                          </MDBBadge
                        >
                        </div>
                        
                      </div>
                      <!-- <div>
                        <MDBRow class="g-3">
                          <MDBCol sm="3" lg="2">
                            <p  style="width: 70px; margin-top: -30px; color: aqua; font-size: 12px;; text-align: left;">{{ formatDateTime(booking.created) }}</p>
                          </MDBCol>
                          <MDBCol sm="6" lg="7">
                            <p class="text-muted text-truncate">{{ booking.header }}</p>
                          </MDBCol>
                          <MDBCol sm="3" lg="3">
                            <MDBBtn color="primary" @click="handleRecipientResult(booking.id, booking)">
                              <span :class="{date_expired: booking.created_ms - new Date().getTime() <= 0}" >{{t('recipient_panel_order')}}</span>
                              <MDBBadge v-if="booking.offers.filter(offer => offer.isNewOffer).length > 0" color="danger"  class="ms-2" >
                                {{booking.offers.filter(offer => offer.isNewOffer).length}}
                              </MDBBadge>
                            </MDBBtn>
                          </MDBCol>
                        </MDBRow>
                        
                      </div> -->
                    </fieldset>
                  </div>
                  <div v-if="!multiBookings.length" class="text-muted" style="text-align: center;">Ei tilauksia</div>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
            <MDBCol lg="6">
              <MDBCard class="h-100">
                <MDBCardBody style="text-align: left;">
                  <MDBCardTitle>Kartalta tilaukset</MDBCardTitle>
                  <div v-for="(booking, index) in singleBookings" :key="index" class="bookings">
                    <fieldset class="fs-box">
                      <legend class="fs-legend">Odottaa yhtenottoa...</legend>
                      <div>

                        <div class="item" :class="{ 'is-quit': selBookingId === booking.id && isQuitBooking }">
                          <div class="date text-muted" >{{ formatDateTime(booking.created) }}</div>

                          <div class="main">
                            <div v-if="selBookingId === booking.id && isQuitBooking" class="quit-box">
                              <MDBTextarea
                                white
                                v-model="clientQuitBookingReason"
                                :label="t('recipient_panel_give_reason')"
                                rows="3"
                              />
                              <MDBBtn color="info" class="send-btn" @click="sendQuitReason(booking.id)">
                                Send
                              </MDBBtn>
                            </div>

                            <div v-else class="title">
                              {{ booking.header }}
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
                              Back
                            </MDBBtn>

                            <MDBBtn
                              v-else
                              color="danger"
                              class="action-btn"
                              @click="handleQuitSelectedBooking(booking.id)"
                            >
                              POISTA
                            </MDBBtn>
                          </div>
                        </div>


                        <!-- <MDBRow class="g-3">
                          <MDBCol col="3">
                            <p  style="width: 70px; margin-top: -30px; color: aqua; font-size: 12px;; text-align: left;">{{ formatDateTime(booking.created) }}</p>
                          </MDBCol>
                          <MDBCol col="7">
                            <p class=" title">{{ booking.header }} very, very long header and so more ...</p>
                          </MDBCol>
                          <MDBCol col="2">
                            <MDBBtn color="danger">Poista</MDBBtn>
                            <MDBBtn v-if="isQuitBooking && clientQuitBookingReason.length > 3" block color="success" size="lg>" style="margin-top: 10px;" @click="clientRejectMapBooking(booking)">{{t('recipient_panel_confirm_quit')}}</MDBBtn>
                          </MDBCol>
                        </MDBRow> -->
                        
                      </div>
                    </fieldset>
                  </div>

                  <div v-if="!singleBookings.length" class="text-muted" style="text-align: center;">Ei tilauksia Kartalta</div>
                  
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </MDBRow>
        </div>
        





        
        <!--          v-if="confirmedBookingsByClient.some(ccb => ccb.id === booking.id)"-->
        <!-- <MDBRow v-for="(booking, index) in bookings" :key="index" class="bookings">
          <div v-if="booking.status !== 'confirmed'" class="client-orders">
            <aside  id="info-block-confirmed" >
              <section class="file-marker">
                <div>
                  <div class="box-title-confirmed">
                    {{!booking.isIncludeOffers ? t('recipient_panel_order_is_pending') : (booking.offers.length > 0 ? booking.offers.length + " " + t('offerCountNotification') : t('recipient_panel_no_offers'))}}
                  </div>
                  <div class="box-contents-confirmed">

                    <MDBRow>
                      <MDBCol>
                        

                        <p class="booking_time">
                          {{booking.date}}
                        </p>
                      </MDBCol>
                      <MDBCol>
                        {{booking.header}}
                      </MDBCol>

                      <MDBCol lg="4">
                        <div v-if="!booking.isIncludeOffers">
                          <MDBBtn
                              v-if="selBookingId === booking.id && isQuitBooking"
                              style="margin-bottom: 13px;"
                              outline="danger" block size="lg"
                              @click="canselQuitSelectedBooking"
                          >
                            Poistu
                          </MDBBtn>
                          <MDBBtn v-else color="danger" rounded @click="handleQuitSelectedBooking(booking.id)" >{{t('recipient_panel_quit_order')}}</MDBBtn>
                        </div>

                        <MDBBtn v-else rounded  color="primary" size="lg" @click="handleRecipientResult(booking.id, booking)" style="">
                          <span :class="{date_expired: booking.created_ms - new Date().getTime() <= 0}" >{{t('recipient_panel_order')}}</span>
                          <MDBBadge v-if="booking.offers.filter(offer => offer.isNewOffer).length > 0" color="danger"  class="ms-2" >
                            {{booking.offers.filter(offer => offer.isNewOffer).length}}
                          </MDBBadge>
                        </MDBBtn>

                      </MDBCol>
                    </MDBRow>

                    <MDBRow v-if="selBookingId === booking.id && !booking.isIncludeOffers">

                      <MDBCol lg="8" style="text-align: center;">
                        <MDBTextarea
                            v-if="isQuitBooking"
                            white
                            style=""
                            v-model="clientQuitBookingReason"
                            :label="t('recipient_panel_give_reason')"
                            rows="3"
                        >

                        </MDBTextarea>

                      </MDBCol>
                      <MDBCol lg="4">
                        <MDBBtn v-if="isQuitBooking && clientQuitBookingReason.length > 3" block color="success" size="lg>" style="margin-top: 10px;" @click="clientRejectMapBooking(booking)">{{t('recipient_panel_confirm_quit')}}</MDBBtn>
                      </MDBCol>

                    </MDBRow>

                  </div>
                </div>
              </section>
            </aside>

          </div>

        </MDBRow> -->
        <div style="margin-top: 23px;">
          <MDBBtn outline="info" block size="lg" @click="router.push('/client-form')">{{t('recipient_panel_new_order')}}</MDBBtn>
        </div>

      </div>

    </div>
  </MDBContainer>


</template>

<script setup>
import { MDBContainer, MDBRow, MDBCol, MDBBtn, MDBTextarea, MDBCard,
  MDBCardBody, MDBBadge, MDBToast, MDBIcon } from 'mdb-vue-ui-kit';
import { useI18n } from 'vue-i18n';
import { ref, computed } from 'vue';
import world from '@/assets/map.gif'
import RecipientContent from "../recipient/RecipientContent.vue";
import { useClientStore } from '@/stores/recipientStore';
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore';
import { storeToRefs } from 'pinia'

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


const { bookings } = storeToRefs(clientStore);
const { userId } = storeToRefs(notificationStore);

const singleBookings = computed(() => bookings.value.filter(sb => sb.status !== 'confirmed' && !sb.isIncludeOffers));
const multiBookings = computed(() => bookings.value.filter(mp => mp.status !== 'confirmed' & mp.isIncludeOffers));

const handleRecipientResult = (id, booking) => {
  console.log("Booking id - " + id); 
  console.log("Booking title: ")
  isRecipientContent.value = true;
  
  selectedBooking.value = clientStore.getBookingById(id);
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
  font-size: 12px;
  /* color: rgb(103, 103, 204); */
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
<template>
  <div class="page">
    <header class="page-header">
      <h5 class="page-title">{{t('recipient_result_need_a_pro')}} - {{booking.professional[0]}}</h5>
      <div class="page-actions">
        <MDBBtnClose white @click="handleQuitContent" />
      </div>
    </header>

    <div class="layout">
      <!-- Left: Order -->
      <section class="panel panel--order">
        <!-- your description + date edit content here -->
        <booking-content :booking="booking"/>
      </section>

      <!-- Offers -->
      <section class="panel panel--offers">
        <!-- your offers list here -->
         <div class="offers-list">
          <div style="padding: 7px 0 7px 0;">
            <h5>Tarjoukset</h5>
          </div>
          
          <div
            v-for="offer in booking.offers"
            :key="offer.id"
            class="offer-item"
            :class="{ 'is-new': offer.isNewOffer }"
            @click="getProviderInfo(offer.provider, offer)"
          >
            <div class="offer-main">
              <p class="offer-name">{{offer.name}}</p>
              
              <p class="offer-sub">{{ t('recipient_result_distance') }} {{offer.distance}}</p>
            </div>

            <div class="offer-price">
              {{offer.price}} eur
            </div>
            <span v-if="offer.isNewOffer" class="new-dot" aria-label="New offer"></span>
            
          </div>
          

        </div>
        <div v-if="!booking.offers.length">No offers yet</div>
        
      </section>

    </div>
  </div>
  <MDBModal
    tabindex="-1"
    class="modal-fade"
    v-model="openProModal"
    removeBackdrop
    :keyboard="false"
    :focus="false"
    scrollable
  >
    <MDBModalHeader class="modal-header-custom">
      <MDBModalTitle >{{ selectedProvider.name }}</MDBModalTitle>
    </MDBModalHeader>
    <MDBModalBody>
      <div class="modal-pro-first">
        <img
          src="https://mdbootstrap.com/img/Photos/Avatars/img (31).jpg"
          class="rounded-circle"
          height="53"
          alt=""
          loading="lazy"
        />

        <div>
          <stars :rating="3.5" />
        </div>
      </div>
      
      <offer-content :offerId="offerId" />
    </MDBModalBody>
    <MDBModalFooter>
      <MDBBtn color="danger" @click="openProModal = false"> Close </MDBBtn>
      <MDBBtn color="primary" @click="orderProvider"> Tilaa  </MDBBtn>
    </MDBModalFooter>
  </MDBModal>
</template>

<script setup>
import {
  MDBContainer, 
  MDBRow,
  MDBCol, 
  MDBBtnClose, 
  MDBBtn, 
  MDBTable, 
  MDBBadge, 
  MDBSelect, 
  MDBPopconfirm, 
  MDBCard, 
  MDBModal, 
  MDBModalHeader, 
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter
} from 'mdb-vue-ui-kit';
import { useI18n } from 'vue-i18n';
import { ref, toRefs} from 'vue';
import { useClientStore } from '@/stores/recipientStore';
import OfferContent from './OfferContent.vue';
import { storeToRefs } from 'pinia';
import load_offers from '@/assets/load-pro-offers.gif';
import Stars from '../Stars.vue';
import BookingContent from './BookingContent.vue';
import { useLoginStore } from '@/stores/login';
import { useNotificationStore } from '@/stores/notificationStore';
import '@/styles/theme.css';
//import '@/styles/form.css';
defineOptions({
  name: "recipient-content"
});
const props = defineProps({
  booking: {type: Object},
  bIndex: {type: Number}
})

/* const _props = defineProps({
  booking: {type: Object}
})

const { booking } = toRefs(_props) */

const emit = defineEmits(['cancelRecipientContent', 'canselRecipientContentConfirmed', 'out-here', 'updateOfferState'])

const {t} = useI18n();
const auth = useLoginStore();
const clientStore = useClientStore();
const booking_offers = ref([])
const offerId = ref("");
const isOfferContent = ref(false);
const selectedProvider = ref(null);
const loadOffers = load_offers;
const filterOptions = ref([
  {text: "Distance", value: 25 }
])
const openProModal = ref(false);

const isEditDate = ref(false);

const { user } = storeToRefs(auth);
const { bookings } = storeToRefs(clientStore);
const notificationStore = useNotificationStore();

//const offerContent = clientStore.getOfferById(offerId);

const getProviderInfo = async (proID, offer) => {
  console.log("Provider info" + proID);
  console.log("booking id - " + offer.bookingID);

  selectedProvider.value = offer;

  openProModal.value = true;

  //isOfferContent.value = true;
  offerId.value = offer.id;
  await clientStore.readOffer(offer);
  emit('updateOfferState', offer.bookingID, offer.id);
}



const orderProvider = async() => {
  //const offerContent = clientStore.getOfferById(offerId);
  console.log("Ordering the provider to the booking - " + selectedProvider.value.bookingID);

  const receiver = selectedProvider.value.sender;
  const myId = user.value.id;
  const bookingId = selectedProvider.value.bookingID;
  const header = "Sopimus tehty!";
  const proContent = `${user.value.firstName} on vahvistanut tilauksen - "${bookings.value.find(b => b.id === selectedProvider.value.bookingID).header}". Tarkemmat tiedot kalenterissa!`;
  const clientContent = `Tilaus on vahvistettu. Tiedot kalenterissa!`;

  openProModal.value = false;
  selectedProvider.value = false;

  emit('canselRecipientContentConfirmed', selectedProvider.value.name);

  /* const confirmed = await clientService.updateRecipientStatus(offerContent.bookingID, {status: 'confirmed'});
  const includeOffer = await clientService.addConfirmedOffer(offerContent.bookingID, offerContent);

  if (!includeOffer) return;

  const notification = {
      bookingId: bookingId,
      isNewMsg: true,
      isLink: true,
      title: header,
      content: proContent,
      reason: '',
      sender: user.value.firstName,
  }

  await clientStore.confirmOffer(offerContent);
  
  await notificationStore.clientConfirmDealNotification(bookingId, offerContent.sender, notification); */
  handleQuitContent();
  emit('quit-content-confirmed', selectedProvider.value.name);
}

const handleQuitContent = () => {
  emit ('cancelRecipientContent');
}

const handleQuitOfferContentConfirmed = (pro) => {
  console.log("Quitting content! " + pro)
  //isOfferContent.value = false;
  openProModal.value = false;
  selectedProvider.value = false;
  
  emit('canselRecipientContentConfirmed', pro);
}


const removePublicBooking = async () => {
  console.log("BOOKING ID " + props.booking.id)
  
  await clientStore.onRemovePublicBooking(props.booking.id);
  emit('out-here');
}

</script>

<style scoped>

.page{
  padding: 16px;
}

/* .page-header{
  display: flex;
  align-items: flex-start; 
  gap: 12px;
} */

.page-header{
  display: flex;
  padding-bottom: 17px;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
}

.page-title{
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
}

.page-actions{
  margin-left: auto;   /* <-- always pushes to the right */
  flex: 0 0 auto;
}

/* Main layout */
.layout{
  display: grid;
  grid-template-columns: minmax(320px, 520px) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.panel{ min-width: 0; }

/* .panel{
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 16px;
  background: rgba(0,0,0,.15);
  padding: 16px;
} */

/* make left/right feel like “sidebars” */
.panel--order{
  position: sticky;
  
  top: 16px;
  max-height: calc(100vh - 32px);
  overflow: auto;
}

/* center stays scrollable naturally */
.panel--offers{
  min-width: 0;

  position: relative;
  z-index: 0;
}


/* the row that contains input + button(s) */
:deep(.field-row){
  display: flex;
  gap: 10px;
  flex-wrap: wrap;   /* KEY */
  align-items: center;
}

/* allow the input to shrink */
:deep(.field-row > *){
  min-width: 0;      /* KEY (flex children default min-width:auto) */
}

/* make the input take full remaining width */
:deep(.field-row .input),
:deep(.field-row input),
:deep(.field-row .form-control){
  flex: 1 1 220px;   /* grows, but can shrink */
}

/* buttons shouldn't force the row wider */
:deep(.field-row .btn){
  flex: 0 0 auto;
  white-space: nowrap;
}

/* Responsive */
@media (max-width: 1100px){
  .layout{
    grid-template-columns: minmax(300px, 380px) minmax(0, 1fr);
  }
}

@media (max-width: 860px){
  .layout{
    grid-template-columns: 1fr;
  }
  .panel--order{
    position: static;
    margin: 0 -20px 0 -20px;
    max-height: none;
    overflow: visible;

    /* max-height: calc(100vh - 24px);
    display: flex;
    flex-direction: column; */
  }
}



.offer-item{
  position: relative;
  display:flex;
  align-items:center;
  text-align: left;
  justify-content:space-between;
  margin-bottom: 12px;
  gap:12px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,.08);
  cursor:pointer;
}

.new-dot{
  position:absolute;
  top:8px;
  right:8px;
  width:10px;
  height:10px;
  border-radius:999px;
  background:#ff3b30;           /* red */
  box-shadow:0 0 0 2px rgba(0,0,0,.25); /* ring so it pops on dark bg */
}



/* optional: make the whole card slightly highlighted if new */
.offer-item.is-new{
  border-color: rgba(255,59,48,.45);
}

.offer-main{
  min-width:0;
}

.offer-name{
  font-weight: 600;
  margin: 0;
}
.offer-sub{
  margin: 4px 0 0;
  opacity: .75;
  font-size: 12px;
}

.offer-price{
  white-space:nowrap;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,.12);
  font-size: 12px;
}

.offer-item:hover{
  border-color: rgba(255,255,255,.18);
}
.offer-item.is-active{
  border-color: rgba(13,202,240,.6); /* “info” vibe */
}



.modal-pro-first {
  display: flex;
  justify-content: space-between;
}








.provider-selection {
  margin-top: 0;
}

:deep(.select-option) { color: #fff !important; }
:deep(.select-option:hover),
:deep(.select-option.active) {
  background-color: #102226 !important;
  color: #fff !important;
}
.booking-content {
  background-color: #102226;
  border: 1px solid #153036;
  padding: 13px;
}
.offer-list {
  background-color: blue;
  padding: 13px;
}

/* Popconfirm button color */
:deep(.pc-trigger-danger.btn-primary),
:deep(.pc-trigger-danger.btn-primary:hover),
:deep(.pc-trigger-danger.btn-primary:focus),
:deep(.pc-trigger-danger.btn-primary:active) {
background-color: #e05b69 !important;
border-color: #dc3545 !important;
box-shadow: 0 4px 9px -4px rgba(220, 53, 69, 0.55) !important;
}



</style>
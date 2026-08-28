<template>
  <div>
    <div class="page">
      <header class="page-header">
        
        <h6 class="page-title">{{ booking.header}}</h6>
        <div class="page-actions">
          <MDBBtnClose white @click="handleQuitContent" />
        </div>
      </header>

    </div>

    <MDBRow>
      <MDBCol lg="8">
        <booking-content :booking="booking"/>
        <div style="cursor: pointer; display: flex; justify-content: right;">
          <button
                  
            type="button"
            class="delete-link"
            @click="
              removePublicBooking()
            "
          >
            <MDBIcon icon="trash-alt" />

            {{ tr("cancelOrder") }}
          </button>
          <!-- {{ tr('cancelOrder') }} -->
        </div>
      </MDBCol>
      <MDBCol>
        <section class="panel panel--offers">
          <!-- offers list -->
          <div class="offers-list">
            <div style="padding: 7px 0 7px 0;">
              <h5>{{ tr('offers') }}</h5>
            </div>
            
            <div
              v-for="offer in offers"
              :key="offer.id"
              class="offer-item"
              :class="{
                'offer-item--new': offer.isNewOffer,
                'offer-item--opened': !offer.isNewOffer
              }"
              @click="getProviderInfo(offer.provider, offer)"
            >
              <div class="offer-main">
                <p class="offer-name">
                  {{ offer.name }}
                </p>

                <p class="offer-sub">
                  {{ tr('distance', { distance: offer.distance }) }}
                </p>
              </div>

              <div class="offer-price">
                {{ tr('priceEur', { price: offer.price }) }}
              </div>

              <span
                v-if="offer.isNewOffer"
                class="new-dot"
                :aria-label="tr('newOffer')"
              />
            </div>
            

          </div>
          <div v-if="!booking.offers.length" class="text-muted small">{{ tr('noOffersYet') }}</div>
          
        </section>
        
      </MDBCol>
    </MDBRow>


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
        <MDBModalTitle >{{ activeOffer.name }}</MDBModalTitle>
      </MDBModalHeader>
      <MDBModalBody>

        <div class="modal-pro-first">
          <MDBIcon v-if="!activeOffer?.provider?.user?.avatar?.isImage"  icon="user" class="icon" />
          <img
          v-else
            :src="activeOffer?.provider?.user?.avatar?.imageUrl"
            class="rounded-circle"
            height="53"
            alt=""
            loading="lazy"
          />

          <div>
            <stars :rating="activeOffer?.provider?.rating" />
            <p class="text-muted small" style="text-align: center;">
              {{
                tr("raters", {
                  count: activeOffer?.provider?.ratersCount || 0
                })
              }}
            </p>
          </div>
        </div>
        
        <offer-content 
          :offerId="offerId"
          :providerId="activeProvider.id"
          @open-chat="emit('open-chat', $event)"
        />
      </MDBModalBody>
      <MDBModalFooter>
        <div style="display: flex; justify-content: right;">
          <div style="display: flex; gap: 7px;">
            <MDBBtn color="danger" @click="openProModal = false"> <i class="fas fa-undo"></i> </MDBBtn>
            <MDBBtn color="primary" @click="orderProvider"> {{ tr('order') }} </MDBBtn>
          </div>
        </div>
        
      </MDBModalFooter>
    </MDBModal>

    <ConfirmModal
      v-model="showDeleteModal"
      :title="cTitle"
      :message="cMessage"
      :confirm-text="tr('delete')"
      :cancel-text="tr('keep')"
      :danger="true"
      @confirm="handleRemovePublicBooking"
      @cancel="handleCancelRemoving"
    />

    <ConfirmDealModal
      v-model="showDealConfirm"
      :title="tr('dealTitle')"
      :message="dealMessage"
      :confirm-text="tr('great')"
      :cancel-text="tr('cancel')"
      :show-icon="true"
      @confirm= "confirmProvider"
      @cancel="cancelProvider" 
    />

    <toast-handler 
      v-model="toastModel"
      :toast-name="toastState"
      :icon-state="toastIcon"
      :text="toastContent"
    />
  </div>
  
</template>

<script setup>
import {
  MDBContainer, 
  MDBRow,
  MDBCol, 
  MDBBtnClose, 
  MDBBtn, 
  MDBIcon,
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
import { ref, computed, toRefs} from 'vue';
import { useClientStore } from '@/stores/recipientStore';
import OfferContent from './OfferContent.vue';
import { storeToRefs } from 'pinia';
import load_offers from '@/assets/load-pro-offers.gif';
import Stars from '../Stars.vue';
import BookingContent from './BookingContent.vue';
import { useLoginStore } from '@/stores/login';
import { useNotificationStore } from '@/stores/notificationStore';
import clientService from '../../service/recipients'
import ConfirmModal from '../helpers/ConfirmModal.vue';
import ToastHandler from '../helpers/ToastHandler.vue';
import ConfirmDealModal from '../helpers/ConfirmDealModal.vue';
import '@/styles/theme.css';
//import '@/styles/form.css';
defineOptions({
  name: "recipient-content"
});
const props = defineProps({
  booking: {type: Object},
  bIndex: {type: Number}
})

const emit = defineEmits(['cancelRecipientContent', 'canselRecipientContentConfirmed', 'out-here', 'updateOfferState', 'open-chat'])

const {t} = useI18n({
  useScope: 'global'
});
const tr = (key, params = {}) =>
  t(`recipientContent.${key}`, params);

const auth = useLoginStore();
const clientStore = useClientStore();
const booking_offers = ref([])
const offerId = ref("");
const isOfferContent = ref(false);
const activeOffer = ref(null);
const activeProvider = ref(null);
const loadOffers = load_offers;

// No active filter by default
const filterOptions = ref([
  {text: "Distance", value: 25 }
])
const openProModal = ref(false);

const isEditDate = ref(false);

const { user } = storeToRefs(auth);
const { bookings } = storeToRefs(clientStore);
const notificationStore = useNotificationStore();

const showDeleteModal = ref(false);
const cTitle = ref("");
const cMessage = ref("");

const toastModel = ref(false)
const toastState = ref('')
const toastIcon = ref('')
const toastContent = ref('')

const showDealConfirm = ref(false);
const dealMessage = computed(() => {
  return tr("dealMessage", {
    provider:
      activeOffer.value?.provider?.pName ||
      activeOffer.value?.name ||
      ""
  });
})

const offers = computed(() => {
  return [...props.booking.offers || []]
    .sort((a, b) => Number(a.price) - Number(b.price))
    .slice(0, 10);
})

//const offerContent = clientStore.getOfferById(offerId);

const getProviderInfo = async (pro, offer) => {
  console.log("Provider info", pro);
  console.log("booking id - " + offer.bookingID);

  activeOffer.value = offer;
  activeProvider.value = pro;

  openProModal.value = true;

  //isOfferContent.value = true;
  offerId.value = offer.id;
  await clientStore.readOffer(offer);
  emit('updateOfferState', offer.bookingID, offer.id);
}

const onToast = (icon, content, color) => {
  console.log("Toast work?")
  toastState.value = color;
  toastIcon.value = icon;
  toastContent.value = content;
  toastModel.value = true;
}

const orderProvider = async() => {
  showDealConfirm.value = true;
}

const confirmProvider = async () => {
  console.log("-- Confirming provider --");

  const _offer = activeOffer.value;

  console.log("Offer id " + offerId.value)
  const offerContent = clientStore.getOfferById(offerId.value);
  const clientBooking = clientStore.getBookingById(offerContent.bookingID);
  

  console.log("Ordering the provider to the booking - " + activeOffer.value.bookingID);
  console.log("OfferContent booking id ", offerContent.bookingID);

  const offer = {
    bookingID: _offer.bookingID,
    sender: _offer.sender,
    isNewOffer: _offer.isNewOffer,
    name: _offer.name,
    placeOrGo: _offer.placeOrGo,
    cAddress: clientBooking.address,
    pAddress: activeProvider.value.address,
    area: _offer.area,
    distance: _offer.distance,
    duration: _offer.duration,
    price: _offer.price,
    description: _offer.description,
    place: _offer.place,
    provider: activeProvider.value.id
  };




  try {
    const confirmation =
      await clientService.confirmOffer(_offer.bookingID, {
        offer,
        confirmed_provider_user_id: _offer.sender
      });

    if (!confirmation?.success) {
      return;
    }

    console.log("Confirmation - ", confirmation)

    const booking = bookings.value.find(b => b.id === activeOffer.value.bookingID);
    if (!booking) {
      console.error("No booking found for bookingID:", activeOffer.value.bookingID, bookings.value);
      return;
    }

    emit("handle-user-action");

    onToast("fas fa-check fa-lg me-2", "Tellimus kinnitatud!", "success");

    emit("toast", {
      state: "success",
      message: t(
        "clientOffer.notifications.order_confirmed"
      ),
      icon: "fas fa-check fa-lg me-2",
      color: "success"
    });

    const proContent = tr("providerNotification", {
      client: user.value.firstName,
      booking: booking.header
    });
    const clientContent = tr("clientNotification");

    console.log("OFFERCONTENT*** ", offerContent);

    const receiver = activeOffer.value.sender;
    const myId = user.value.id;
    const bookingId = activeOffer.value.bookingID;
    const header = tr("dealCreatedTitle");;


    



    const notification = {
      bookingId: bookingId,
      isNewMsg: true,
      isLink: true,
      title: header,
      content: proContent,
      reason: '',
      sender: user.value.firstName,
    }

    await clientStore.confirmOffer(offer);
    
    await notificationStore.clientConfirmDealNotification(bookingId, offerContent.sender, notification);
    emit('canselRecipientContentConfirmed', activeOffer.value.name);

    

    //openProModal.value = false;

    //showDealConfirm.value = false;

    /* await proStore.onClientBooking(
      client.value.id,
      offer,
      myself,
      client.value.author_id,
      providerId.value,
      notes
    ); */

    /* socket.emit(
      "pro-confirm-client",
      receiver,
      providerId.value
    ); */
  } catch (error) {
    const status = error.response?.status;
    const code = error.response?.data?.code;

    if (
      status === 409 &&
      code === "BOOKING_ALREADY_CONFIRMED"
    ) {
      /* emit("toast", {
        state: "warning",
        message: t(
          "clientOffer.notifications.already_confirmed"
        ),
        icon: "fas fa-exclamation-triangle fa-lg me-2",
        color: "warning"
      }); */

      //emit("handle-user-action");
      return;
    }

    console.error("API error in child:", error);

    onToast("fas fa-times fa-lg me-2", "Tilause kinnitamine ei õnnestunud!", "danger");

    /* emit("toast", {
      state: "danger",
      message: t(
        "clientOffer.notifications.confirmation_failed"
      ),
      icon: "fas fa-times fa-lg me-2",
      color: "danger"
    }); */
  } finally {
    //loading.value = false;
    openProModal.value = false;

    showDealConfirm.value = false;
  }





  /* const receiver = selectedProvider.value.sender;
  const myId = user.value.id;
  const bookingId = selectedProvider.value.bookingID;
  const header = tr("dealCreatedTitle");;


  const booking = bookings.value.find(b => b.id === selectedProvider.value.bookingID);
  if (!booking) {
    console.error("No booking found for bookingID:", selectedProvider.value.bookingID, bookings.value);
    return;
  } */

  /* const proContent = tr("providerNotification", {
    client: user.value.firstName,
    booking: booking.header
  });
  const clientContent = tr("clientNotification");

  console.log("OFFERCONTENT*** ", offerContent); */

  //const confirmed = await clientService.updateRecipientStatus(offerContent.bookingID, {status: 'confirmed'});
  //console.log("Confirmed --- ", confirmed)

  //const includeOffer = await clientService.confirmOffer(offerContent.bookingID, offer);

  //if (!includeOffer) return;

  /* const notification = {
      bookingId: bookingId,
      isNewMsg: true,
      isLink: true,
      title: header,
      content: proContent,
      reason: '',
      sender: user.value.firstName,
  }

  await clientStore.confirmOffer(offer);
  
  await notificationStore.clientConfirmDealNotification(bookingId, offerContent.sender, notification);
  emit('canselRecipientContentConfirmed', selectedProvider.value.name);

  

  openProModal.value = false;

  showDealConfirm.value = false; */
}

const cancelProvider = () => {
  console.log("Provider order cancelled");
  showDealConfirm.value = false;
}

const handleQuitContent = () => {
  emit ('cancelRecipientContent');
}

const handleQuitOfferContentConfirmed = (pro) => {
  console.log("Quitting content! " + pro)
  //isOfferContent.value = false;
  openProModal.value = false;
  //selectedProvider.value = false;
  
  emit('canselRecipientContentConfirmed', pro);
}


const removePublicBooking = async () => {
  console.log("BOOKING ID " + props.booking.id);

  showDeleteModal.value = true;
  cTitle.value = tr('deleteTitle');
  cMessage.value = tr('deleteMessage');
  
}

const handleRemovePublicBooking = async () => {
  try {
    await clientStore.onRemovePublicBooking(props.booking.id);

    handleQuitContent();
    
    //emit('out-here');
  } catch (err) {
    console.log("Error to remove client multy booking");
  }
}
const handleCancelRemoving = () => {
  console.log('Remove cancelled');
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
  /* grid-template-columns: minmax(320px, 520px) minmax(0, 1fr); */
  grid-template-columns: minmax(700px, 350px) minmax(0, 1fr);
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
}

.delete-link:hover {
  color: #fb7185;
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
@media (max-width: 1200px){
  .layout{
    grid-template-columns: minmax(550px, 380px) minmax(0, 1fr);
  }
}

@media (max-width: 1000px){
  .layout{
    grid-template-columns: 1fr;
  }
  .panel--order{
    position: static;
    
    margin: 0 -20px 0 -20px;
    max-height: none;
    overflow: visible;

  }
}



/* .offer-item{
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
} */

.offer-item {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 16px;

  padding: 14px 18px;
  margin-bottom: 12px;

  border-radius: 14px;

  background: rgb(28, 35, 48);
  border: 1px solid rgba(255, 255, 255, 0.08);

  cursor: pointer;

  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}

.offer-item:hover {
  transform: translateY(-2px);

  box-shadow:
    0 8px 22px rgba(0, 0, 0, 0.35);

  border-color: rgba(255, 255, 255, 0.2);
}

.offer-item--new {
  background:
    linear-gradient(
      135deg,
      rgba(15, 55, 85, 0.95),
      rgba(25, 38, 56, 0.95)
    );

  border: 1px solid rgba(73, 210, 255, 0.45);

  box-shadow:
    0 0 18px rgba(73, 210, 255, 0.15);
}

.offer-item--opened {
  background:
    linear-gradient(
      135deg,
      rgba(36, 42, 55, 0.95),
      rgba(24, 30, 40, 0.95)
    );

  border: 1px solid rgba(255, 255, 255, 0.08);
}

.offer-name {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #f5f7fa;
}

.offer-sub {
  margin: 4px 0 0;
  font-size: 13px;
  color: #aeb7c5;
}

.offer-price {
  font-size: 18px;
  font-weight: 800;
  color: #ffb96d;
  white-space: nowrap;
}

.new-dot {
  position: absolute;
  top: 10px;
  right: 10px;

  width: 10px;
  height: 10px;

  border-radius: 50%;

  background: #ff9b49;

  box-shadow:
    0 0 8px #ff9b49,
    0 0 16px #ff9b49;

  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.4);
    opacity: 0.6;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* .new-dot{
  position:absolute;
  top:8px;
  right:8px;
  width:10px;
  height:10px;
  border-radius:999px;
  background:#d34954;
  box-shadow:0 0 0 2px rgba(0,0,0,.25);
} */



/* optional: make the whole card slightly highlighted if new */
/* .offer-item.is-new{
  border-color: rgba(241, 134, 33, 0.45);
  background-color: rgba(241, 134, 33, 0.1);
  background-color: #083b4b
} */

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

/* .offer-item:hover{
  border-color: rgba(255,255,255,.18);
} */
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